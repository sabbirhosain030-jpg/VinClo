-- ============================================
-- VinClo Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  customer_address text,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  source text DEFAULT 'store',   -- 'store' | 'pos'
  status text DEFAULT 'pending', -- 'pending' | 'completed' | 'cancelled'
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: public read, authenticated write
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage products" ON products;
CREATE POLICY "Auth manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders: anyone can insert (store checkout), only authenticated can read all
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Auth read orders" ON orders;
CREATE POLICY "Auth read orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth update orders" ON orders;
CREATE POLICY "Auth update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');
