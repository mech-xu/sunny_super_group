-- SunnyOrder Database Schema

-- 1. 商户表 (Merchants)
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    commission_rate DECIMAL(3, 2) DEFAULT 0.10, -- 默认 10%
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 群组表 (Groups)
CREATE TABLE groups (
    group_id VARCHAR(100) PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id),
    group_name VARCHAR(100),
    bot_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 原始消息流 (Messages) - 审计与重溯
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(100) REFERENCES groups(group_id),
    user_id VARCHAR(100),
    username VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 结构化订单 (Orders)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id_ref SERIAL, -- 用于生成简短订单号
    group_id VARCHAR(100) REFERENCES groups(group_id),
    merchant_id UUID REFERENCES merchants(id),
    customer_id VARCHAR(100),
    customer_name VARCHAR(100),
    items JSONB NOT NULL, -- [{item: '草莓', qty: 2, price: 15}]
    total_amount DECIMAL(10, 2),
    pickup_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    raw_message_id INTEGER REFERENCES messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 佣金账单 (Commissions)
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    order_ids UUID[] NOT NULL, -- 关联的订单组
    total_sales DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 索引优化
CREATE INDEX idx_messages_group ON messages(group_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
