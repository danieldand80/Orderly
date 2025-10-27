/**
 * Supabase Database Client
 * 
 * Handles all database operations for order tracking
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables");
  throw new Error("Supabase credentials not configured");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// GET ORDER BY ORDER ID
// ============================================

/**
 * Fetches an order by Order ID
 * @param {string} orderId - The order ID (e.g., FLY25100384811164)
 * @returns {Promise<Object|null>} - Order object or null if not found
 */
export async function getOrderByOrderId(orderId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("order_id", orderId.trim()) // Case-insensitive match
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error.message);
    throw new Error("Failed to fetch order from database: " + error.message);
  }
}

// ============================================
// UPDATE ORDER CACHED DATA
// ============================================

/**
 * Updates cached tracking data for an order
 * @param {string} orderId - The order ID
 * @param {Object} trackingData - Tracking data from 17Track API
 */
export async function updateOrderCache(orderId, trackingData) {
  try {
    const updateData = {
      cached_courier_name: trackingData.courier || null,
      cached_courier_code: trackingData.courierCode || null,
      cached_latest_status: trackingData.latestStatus || null,
      cached_last_location: trackingData.location || null,
      cached_last_updated_at: trackingData.lastUpdated ? new Date(trackingData.lastUpdated).toISOString() : null,
      last_checked_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_id", orderId)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Updated cache for order ${orderId}`);
    return data;
  } catch (error) {
    console.error(`Error updating cache for ${orderId}:`, error.message);
    // Don't throw - cache update is not critical
  }
}

// ============================================
// SAVE TRACKING HISTORY
// ============================================

/**
 * Saves tracking history events for an order
 * @param {string} orderId - The order ID
 * @param {Array} historyEvents - Array of tracking events
 */
export async function saveTrackingHistory(orderId, historyEvents) {
  try {
    if (!historyEvents || historyEvents.length === 0) {
      return;
    }

    // Delete old history for this order
    await supabase
      .from("tracking_history")
      .delete()
      .eq("order_id", orderId);

    // Insert new history
    const historyRecords = historyEvents.map((event) => ({
      order_id: orderId,
      event_time: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
      status: event.status || "",
      location: event.location || "",
      stage: event.stage || null,
      description: event.status || "",
    }));

    const { data, error } = await supabase
      .from("tracking_history")
      .insert(historyRecords)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Saved ${historyRecords.length} history events for order ${orderId}`);
    return data;
  } catch (error) {
    console.error(`Error saving history for ${orderId}:`, error.message);
    // Don't throw - history saving is not critical
  }
}

// ============================================
// GET TRACKING HISTORY
// ============================================

/**
 * Fetches tracking history for an order
 * @param {string} orderId - The order ID
 * @returns {Promise<Array>} - Array of tracking events
 */
export async function getTrackingHistory(orderId) {
  try {
    const { data, error } = await supabase
      .from("tracking_history")
      .select("*")
      .eq("order_id", orderId)
      .order("event_time", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error fetching history for ${orderId}:`, error.message);
    return [];
  }
}

// ============================================
// CREATE NEW ORDER
// ============================================

/**
 * Creates a new order in the database
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order object
 */
export async function createOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Created new order: ${orderData.order_id}`);
    return data[0];
  } catch (error) {
    console.error(`Error creating order ${orderData.order_id}:`, error.message);
    throw new Error("Failed to create order: " + error.message);
  }
}

// ============================================
// GET ALL ORDERS
// ============================================

/**
 * Fetches all orders (for admin panel)
 * @param {number} limit - Maximum number of orders to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} - Array of orders
 */
export async function getAllOrders(limit = 100, offset = 0) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("datetime_of_purchase", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching all orders:", error.message);
    throw new Error("Failed to fetch orders: " + error.message);
  }
}

// ============================================
// EXPORT CLIENT (for direct queries if needed)
// ============================================

export { supabase };

