-- Add updated_at field for sync tracking
-- This migration should be run in Supabase SQL Editor

-- Add updated_at column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on updated_at for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- Create index on datetime_of_purchase for faster date range queries
CREATE INDEX IF NOT EXISTS idx_orders_purchase_date ON orders(datetime_of_purchase);

-- Add comment
COMMENT ON COLUMN orders.updated_at IS 'Last time this order was synced from Google Sheets';

