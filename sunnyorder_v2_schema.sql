-- SunnyOrder V2 Schema (Based on SPEC_V1 + Multi-Merchant Support)

-- 1. 角色与用户 (Users/Admins/Customers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    nickname TEXT,
    role VARCHAR(20) DEFAULT 'customer', -- 'super_admin', 'merchant', 'customer'
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 商户信息 (Merchants)
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    shop_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- 'food', 'nursery'
    commission_rate DECIMAL(3, 2) DEFAULT 0.10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 商品表 (Products)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    status BOOLEAN DEFAULT true,
    sort INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 订单表 (Orders)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no TEXT UNIQUE NOT NULL,
    merchant_id UUID REFERENCES merchants(id),
    user_id UUID REFERENCES users(id),
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'CANCELLED'
    pickup_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 订单项 (Order Items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    price NUMERIC NOT NULL
);

-- 6. 全局/商户设置 (Settings)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id), -- NULL means global setting
    cutoff_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 原始通知记录 (Raw Notifications)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id),
    sender_id VARCHAR(100),
    sender_nickname VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 佣金结算 (Settlements)
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 索引优化
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_pickup_code ON orders(pickup_code);
CREATE INDEX idx_orders_status ON orders(status);
