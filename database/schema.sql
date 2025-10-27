-- ============================================
-- Flylink Tracking Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: orders
-- Main table for storing order information
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Order Information (from Google Sheets)
  order_id TEXT UNIQUE NOT NULL,                    -- FLY25100384811164
  datetime_of_purchase TIMESTAMPTZ NOT NULL,        -- Purchase date/time
  logistics_no TEXT,                                 -- JYDIL5000144726YQ (tracking number)
  logistics_provider TEXT,                           -- Courier name
  
  -- Cached Tracking Data (updated by API)
  cached_courier_name TEXT,                          -- JYTD 捷易通达 (from 17Track)
  cached_courier_code INTEGER,                       -- 191169 (from 17Track)
  cached_latest_status TEXT,                         -- "Final delivery"
  cached_last_location TEXT,                         -- "Lenny ()"
  cached_last_updated_at TIMESTAMPTZ,               -- Last event timestamp from courier
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ,                      -- Last time we queried 17Track API
  api_check_count INTEGER DEFAULT 0,                -- How many times we checked API
  
  -- Notes
  notes TEXT                                         -- Any additional notes
);

-- ============================================
-- TABLE: tracking_history
-- Store full tracking event history for each order
-- ============================================
CREATE TABLE IF NOT EXISTS tracking_history (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key to orders
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  
  -- Event Data
  event_time TIMESTAMPTZ NOT NULL,                  -- 2025-10-17T08:00:48Z
  status TEXT NOT NULL,                              -- "Final delivery"
  location TEXT,                                     -- "Lenny ()"
  stage TEXT,                                        -- "Delivered"
  description TEXT,                                  -- Full description
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for fast queries
-- ============================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_logistics_no ON orders(logistics_no);
CREATE INDEX IF NOT EXISTS idx_orders_datetime ON orders(datetime_of_purchase);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- Tracking history indexes
CREATE INDEX IF NOT EXISTS idx_history_order_id ON tracking_history(order_id);
CREATE INDEX IF NOT EXISTS idx_history_event_time ON tracking_history(event_time);

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- For now, disable RLS for API access
-- You can enable it later for admin panel
-- ============================================
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_history DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
-- Uncomment to insert sample data:
/*
INSERT INTO orders (order_id, datetime_of_purchase, logistics_no, logistics_provider)
VALUES 
  ('FLY25100384811164', '2025-10-03 14:30:00+00', 'JYDIL5000144726YQ', 'JYTD'),
  ('FLY25092700523918', '2025-09-27 10:15:00+00', 'JYDIL5000146377YQ', 'JYTD'),
  ('FLY25091367537039', '2025-09-13 09:20:00+00', 'XLT976880692', 'Yuansheng Ancheng');
*/

-- ============================================
-- HELPFUL QUERIES
-- ============================================

-- View all orders with cached data
-- SELECT order_id, datetime_of_purchase, logistics_no, cached_latest_status, cached_last_updated_at 
-- FROM orders 
-- ORDER BY datetime_of_purchase DESC;

-- View tracking history for a specific order
-- SELECT * FROM tracking_history 
-- WHERE order_id = 'FLY25100384811164' 
-- ORDER BY event_time DESC;

-- Count total orders
-- SELECT COUNT(*) FROM orders;

-- Count orders by status
-- SELECT cached_latest_status, COUNT(*) 
-- FROM orders 
-- GROUP BY cached_latest_status;

