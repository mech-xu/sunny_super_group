const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

// 数据库连接配置
const pool = new Pool({
  user: 'sunny',
  host: 'sunnynow-db',
  database: 'sunnynow',
  password: 'your_password_here', // 实际部署时应使用环境变量
  port: 5432,
});

// 连接测试
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制

// 静态文件服务
app.use(express.static('public'));

// 根路径
app.get('/', (req, res) => {
  res.json({ message: 'SunnyNow API Server' });
});

// 获取商品列表
app.get('/products', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    
    if (status !== undefined) {
      query += ' WHERE status = $1';
      params.push(status === 'true');
    }
    
    query += ' ORDER BY sort ASC, name ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 创建商品
app.post('/products', async (req, res) => {
  try {
    const { name, price, merchant_id, status = true, sort = 0 } = req.body;
    
    // 验证必填字段
    if (!name || !price || !merchant_id) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Missing required fields: name, price, and merchant_id are required' 
      });
    }
    
    // 验证价格为正数
    if (parseFloat(price) <= 0) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Price must be a positive number' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, price, merchant_id, status, sort) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, parseFloat(price), merchant_id, status, sort]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 更新商品
app.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, status, sort } = req.body;
    
    // 构建动态更新查询
    const fields = [];
    const values = [];
    let index = 1;
    
    if (name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (price !== undefined) {
      fields.push(`price = $${index++}`);
      values.push(parseFloat(price));
    }
    if (status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
    if (sort !== undefined) {
      fields.push(`sort = $${index++}`);
      values.push(sort);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Bad Request', details: 'No fields to update' });
    }
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', details: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 删除商品
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', details: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 获取用户信息
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', details: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 创建订单 - 修复版本
app.post('/orders', async (req, res) => {
  try {
    const { 
      merchant_id, 
      user_id, 
      total_price, 
      customer_nickname, 
      phone, 
      pickup_point, 
      pickup_address, 
      pickup_time, 
      notes, 
      items,
      order_type = 'group_buying'
    } = req.body;
    
    // 验证必填字段
    if (!merchant_id || !user_id || !total_price || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Missing required fields: merchant_id, user_id, total_price, and items are required' 
      });
    }
    
    // 验证商家和用户是否存在
    const merchantCheck = await pool.query('SELECT id FROM merchants WHERE id = $1', [merchant_id]);
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    
    if (merchantCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Invalid merchant_id: Merchant not found' 
      });
    }
    
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Invalid user_id: User not found' 
      });
    }
    
    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 生成唯一的取货码
      const generatePickupCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };
      
      let pickupCode = generatePickupCode();
      let codeExists = true;
      
      // 确保取货码唯一
      while (codeExists) {
        const checkResult = await client.query('SELECT id FROM orders WHERE pickup_code = $1', [pickupCode]);
        if (checkResult.rows.length === 0) {
          codeExists = false;
        } else {
          pickupCode = generatePickupCode();
        }
      }
      
      // 插入订单到 orders 表
      const orderResult = await client.query(
        `INSERT INTO orders (
          merchant_id, 
          user_id, 
          total_price, 
          status, 
          pickup_code,
          customer_nickname,
          phone,
          pickup_point,
          pickup_address,
          pickup_time,
          notes,
          order_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          merchant_id,
          user_id,
          total_price,
          'PENDING',
          pickupCode,
          customer_nickname || '',
          phone || '',
          pickup_point || '',
          pickup_address || '',
          pickup_time || '',
          notes || '',
          order_type
        ]
      );
      
      const order = orderResult.rows[0];
      
      // 插入商品项到 order_items 表
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.price) {
          throw new Error('Invalid item: product_id, quantity, and price are required');
        }
        
        // 验证商品是否存在
        const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [item.product_id]);
        if (productCheck.rows.length === 0) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.product_id, item.quantity, item.price]
        );
      }
      
      await client.query('COMMIT');
      client.release();
      
      res.status(201).json(order);
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      throw err;
    }
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 获取用户订单
app.get('/orders', async (req, res) => {
  try {
    const { user_id, order_type } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    let index = 1;
    
    if (user_id) {
      query += ` AND user_id = $${index++}`;
      params.push(user_id);
    }
    
    if (order_type) {
      query += ` AND order_type = $${index++}`;
      params.push(order_type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 获取订单详情（包含商品项）
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取订单基本信息
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', details: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // 获取订单商品项
    const itemsResult = await pool.query(
      'SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',
      [id]
    );
    
    order.items = itemsResult.rows;
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 更新订单状态
app.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Bad Request', details: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Bad Request', details: 'Invalid status value' });
    }
    
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', details: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 商家相关接口
app.get('/merchants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM merchants ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

app.post('/merchants', async (req, res) => {
  try {
    const { name, contact_person, phone, address, business_license } = req.body;
    
    if (!name || !contact_person || !phone) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Missing required fields: name, contact_person, and phone are required' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO merchants (name, contact_person, phone, address, business_license) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, contact_person, phone, address, business_license]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 用户认证相关接口
app.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Phone and password are required' 
      });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized', details: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // 简单密码验证（实际应用中应该使用哈希）
    if (user.password !== password) {
      return res.status(401).json({ error: 'Unauthorized', details: 'Invalid credentials' });
    }
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { nickname, phone, password, role = 'customer' } = req.body;
    
    if (!nickname || !phone || !password) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Nickname, phone, and password are required' 
      });
    }
    
    // 检查手机号是否已存在
    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Phone number already exists' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO users (nickname, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [nickname, phone, password, role]
    );
    
    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});