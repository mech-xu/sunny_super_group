const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL连接池
const pool = new Pool({
  user: 'sunny',
  host: 'sunnynow-db', // 使用Docker网络中的容器名
  database: 'sunnynow',
  password: '225522Xxn$',  // 这里是数据库密码
  port: 5432,
  ssl: false, // 明确设置不需要SSL
});

app.use(express.json());

// 允许跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// 获取产品列表
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

// 获取单个产品
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 创建产品
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
    
    // 验证数据类型和范围
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Name must be a non-empty string with maximum 100 characters' 
      });
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 999999) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Price must be a positive number between 0.01 and 999999' 
      });
    }
    
    // 验证 merchant_id 格式 (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(merchant_id)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Invalid merchant_id format, must be a valid UUID' 
      });
    }
    
    // 验证 merchant_id 是否存在
    const merchantCheck = await pool.query('SELECT id FROM merchants WHERE id = $1', [merchant_id]);
    if (merchantCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found', 
        details: 'Merchant not found' 
      });
    }
    
    // 验证 status 和 sort
    const finalStatus = typeof status === 'boolean' ? status : true;
    const finalSort = Number.isInteger(sort) ? parseInt(sort) : 0;
    
    // 插入产品
    const result = await pool.query(
      'INSERT INTO products (name, price, merchant_id, status, sort) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name.trim(), priceNum, merchant_id, finalStatus, finalSort]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 更新产品
app.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, merchant_id, status, sort } = req.body;
    
    // 验证产品是否存在
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // 构建更新查询
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        return res.status(400).json({ 
          error: 'Bad Request', 
          details: 'Name must be a non-empty string with maximum 100 characters' 
        });
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }
    
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0 || priceNum > 999999) {
        return res.status(400).json({ 
          error: 'Bad Request', 
          details: 'Price must be a positive number between 0.01 and 999999' 
        });
      }
      updates.push(`price = $${paramIndex++}`);
      values.push(priceNum);
    }
    
    if (merchant_id !== undefined) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(merchant_id)) {
        return res.status(400).json({ 
          error: 'Bad Request', 
          details: 'Invalid merchant_id format, must be a valid UUID' 
        });
      }
      // 验证 merchant_id 是否存在
      const merchantCheck = await pool.query('SELECT id FROM merchants WHERE id = $1', [merchant_id]);
      if (merchantCheck.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Not Found', 
          details: 'Merchant not found' 
        });
      }
      updates.push(`merchant_id = $${paramIndex++}`);
      values.push(merchant_id);
    }
    
    if (status !== undefined) {
      if (typeof status !== 'boolean') {
        return res.status(400).json({ 
          error: 'Bad Request', 
          details: 'Status must be a boolean value' 
        });
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    
    if (sort !== undefined) {
      if (!Number.isInteger(sort)) {
        return res.status(400).json({ 
          error: 'Bad Request', 
          details: 'Sort must be an integer' 
        });
      }
      updates.push(`sort = $${paramIndex++}`);
      values.push(parseInt(sort));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Bad Request', details: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 删除产品
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证产品是否存在
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 获取商家信息
app.get('/merchants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM merchants');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 获取订单
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// 创建订单
app.post('/orders', async (req, res) => {
  try {
    const { user_id, items, total_amount, pickup_code, status } = req.body;
    const result = await pool.query(
      'INSERT INTO orders (user_id, items, total_amount, pickup_code, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, items, total_amount, pickup_code, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});