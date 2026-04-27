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

// 创建订单 - 修正版本（只使用存在的字段）
app.post('/orders', async (req, res) => {
  try {
    const { 
      merchant_id, 
      user_id, 
      total_price, 
      items
    } = req.body;
    
    // 验证必填字段
    if (!merchant_id || !user_id || !total_price || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        details: 'Missing required fields: merchant_id, user_id, total_price, and items are required' 
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
      
      // 生成订单号 (格式: SN + 时间戳 + 随机数)
      const generateOrderNo = () => {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SN${timestamp}${random}`;
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
      
      const orderNo = generateOrderNo();
      
      // 插入订单到 orders 表（只使用存在的字段）
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_no,
          merchant_id, 
          user_id, 
          total_price, 
          status, 
          pickup_code
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          orderNo,
          merchant_id,
          user_id,
          total_price,
          'PENDING',
          pickupCode
        ]
      );
      
      const order = orderResult.rows[0];
      
      // 插入商品项到 order_items 表
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.price) {
          throw new Error('Invalid item: product_id, quantity, and price are required');
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

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});