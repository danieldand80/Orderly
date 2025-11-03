/**
 * Order Synchronization from Google Sheets to Supabase
 * 
 * This module handles:
 * 1. Reading order data from Google Sheets
 * 2. UPSERT (update or insert) orders into Supabase
 * 3. Cleanup of old orders (>4 months)
 */

import { google } from "googleapis";
import dotenv from "dotenv";

// Import Supabase client and functions
import { supabase } from "./database.js";

dotenv.config();

// ============================================
// FETCH ORDERS FROM GOOGLE SHEETS
// ============================================

/**
 * Fetches all orders from Google Sheets
 * @returns {Promise<Array>} - Array of order objects
 */
async function fetchOrdersFromGoogleSheets() {
  try {
    console.log("📊 Fetching orders from Google Sheets...");

    // Setup Google Sheets API authentication
    let authConfig;
    const credentialPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!credentialPath) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not configured");
    }

    if (credentialPath.startsWith("{")) {
      authConfig = {
        credentials: JSON.parse(credentialPath),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      };
    } else {
      authConfig = {
        keyFile: credentialPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      };
    }

    const auth = new google.auth.GoogleAuth(authConfig);
    const sheets = google.sheets({ version: "v4", auth });

    // Fetch from "Flylink Global Data" sheet (for tracking)
    const trackingSheetId = process.env.GOOGLE_SHEET_ID;
    if (!trackingSheetId) {
      throw new Error("GOOGLE_SHEET_ID not configured");
    }

    console.log(`📋 Reading from sheet: ${trackingSheetId}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: trackingSheetId,
      range: "'Flylink Global Data'!A:D", // Order ID | Datetime | Product Code | logisticsNo
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("⚠️ No data found in Google Sheets");
      return [];
    }

    console.log(`✅ Found ${rows.length - 1} rows in Google Sheets`);

    // Parse rows (skip header)
    const orders = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row[0] || !row[0].trim()) {
        continue;
      }

      const orderId = row[0].trim();
      const purchaseDate = row[1] ? row[1].trim() : null;
      const productCode = row[2] ? row[2].trim() : null;
      const trackingNumber = row[3] ? row[3].trim() : null;

      orders.push({
        order_id: orderId,
        datetime_of_purchase: purchaseDate,
        product_code: productCode,
        tracking_number: trackingNumber,
      });
    }

    console.log(`✅ Parsed ${orders.length} valid orders`);
    return orders;

  } catch (error) {
    console.error("❌ Error fetching from Google Sheets:", error.message);
    throw error;
  }
}

// ============================================
// UPSERT ORDERS TO SUPABASE
// ============================================

/**
 * Upserts orders into Supabase (update if exists, insert if new)
 * @param {Array} orders - Array of order objects from Google Sheets
 * @returns {Promise<Object>} - Statistics about the sync
 */
async function upsertOrdersToSupabase(orders) {
  try {
    console.log(`💾 Upserting ${orders.length} orders to Supabase...`);

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    let errors = 0;

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      
      try {
        // First, get existing orders with their data
        const orderIds = batch.map(o => o.order_id);
        const { data: existingOrders, error: checkError } = await supabase
          .from("orders")
          .select("order_id, logistics_no, product_code, datetime_of_purchase")
          .in("order_id", orderIds);

        if (checkError) {
          console.error(`❌ Error checking existing orders:`, checkError.message);
          errors += batch.length;
          continue;
        }

        // Create map of existing orders for quick lookup
        const existingOrdersMap = new Map(
          existingOrders.map(o => [o.order_id, o])
        );

        let batchInsertCount = 0;
        let batchUpdateCount = 0;
        let batchUnchangedCount = 0;

        // Prepare data for upsert and count changes
        const upsertData = batch.map(order => {
          const existing = existingOrdersMap.get(order.order_id);
          
          if (!existing) {
            // New order
            batchInsertCount++;
          } else {
            // Check if data actually changed
            const trackingChanged = (order.tracking_number || null) !== (existing.logistics_no || null);
            const productChanged = (order.product_code || null) !== (existing.product_code || null);
            const dateChanged = (order.datetime_of_purchase || null) !== (existing.datetime_of_purchase || null);
            
            if (trackingChanged || productChanged || dateChanged) {
              batchUpdateCount++;
            } else {
              batchUnchangedCount++;
            }
          }

          return {
            order_id: order.order_id,
            logistics_no: order.tracking_number || null,
            product_code: order.product_code || null,
            datetime_of_purchase: order.datetime_of_purchase || null,
            updated_at: new Date().toISOString(),
          };
        });

        // Upsert using order_id as conflict target
        const { data, error } = await supabase
          .from("orders")
          .upsert(upsertData, {
            onConflict: "order_id",
            ignoreDuplicates: false, // Update existing records
          })
          .select();

        if (error) {
          console.error(`❌ Batch error:`, error.message);
          errors += batch.length;
          continue;
        }

        // Count inserts vs updates vs unchanged
        inserted += batchInsertCount;
        updated += batchUpdateCount;
        unchanged += batchUnchangedCount;

        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(orders.length / batchSize)}: +${batchInsertCount} new, ~${batchUpdateCount} updated, ${batchUnchangedCount} unchanged`);

      } catch (batchError) {
        console.error(`❌ Error processing batch:`, batchError.message);
        errors += batch.length;
      }
    }

    console.log(`✅ Upsert complete: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged, ${errors} errors`);
    
    return {
      total: orders.length,
      inserted: inserted,
      updated: updated,
      unchanged: unchanged,
      errors: errors,
    };

  } catch (error) {
    console.error("❌ Error upserting to Supabase:", error.message);
    throw error;
  }
}

// ============================================
// CLEANUP OLD ORDERS (>4 MONTHS)
// ============================================

/**
 * Deletes orders older than 4 months
 * @returns {Promise<number>} - Number of deleted orders
 */
async function cleanupOldOrders() {
  try {
    console.log("🧹 Cleaning up old orders (>4 months)...");

    // Calculate date 4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    const cutoffDate = fourMonthsAgo.toISOString();

    console.log(`📅 Deleting orders with updated_at before: ${cutoffDate}`);

    // Delete old orders
    const { data, error } = await supabase
      .from("orders")
      .delete()
      .lt("updated_at", cutoffDate)
      .select("order_id");

    if (error) {
      console.error("❌ Error deleting old orders:", error.message);
      throw error;
    }

    const deletedCount = data ? data.length : 0;
    console.log(`✅ Deleted ${deletedCount} old orders`);

    return deletedCount;

  } catch (error) {
    console.error("❌ Error in cleanup:", error.message);
    throw error;
  }
}

// ============================================
// MAIN SYNC FUNCTION
// ============================================

/**
 * Main synchronization function
 * 1. Fetches orders from Google Sheets
 * 2. Upserts to Supabase
 * 3. Cleans up old orders
 * @returns {Promise<Object>} - Sync statistics
 */
export async function syncOrdersFromGoogleSheets() {
  const startTime = Date.now();
  console.log("\n🔄 ===== STARTING ORDER SYNCHRONIZATION =====");
  console.log(`⏰ Start time: ${new Date().toISOString()}`);

  try {
    // Step 1: Fetch from Google Sheets
    const orders = await fetchOrdersFromGoogleSheets();

    if (orders.length === 0) {
      console.log("⚠️ No orders to sync");
      return {
        success: true,
        message: "No orders found in Google Sheets",
        stats: {
          fetched: 0,
          inserted: 0,
          updated: 0,
          unchanged: 0,
          errors: 0,
          deleted: 0,
        },
      };
    }

    // Step 2: Upsert to Supabase
    const upsertStats = await upsertOrdersToSupabase(orders);

    // Step 3: Cleanup old orders
    const deletedCount = await cleanupOldOrders();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log("\n✅ ===== SYNCHRONIZATION COMPLETE =====");
    console.log(`📊 Fetched: ${orders.length} orders`);
    console.log(`📊 Inserted (new): ${upsertStats.inserted} orders`);
    console.log(`📊 Updated (changed): ${upsertStats.updated} orders`);
    console.log(`📊 Unchanged (synced): ${upsertStats.unchanged} orders`);
    console.log(`📊 Errors: ${upsertStats.errors} orders`);
    console.log(`📊 Deleted (old): ${deletedCount} orders`);
    console.log(`⏱️ Duration: ${duration}s`);

    return {
      success: true,
      message: "Synchronization completed successfully",
      stats: {
        fetched: orders.length,
        inserted: upsertStats.inserted,
        updated: upsertStats.updated,
        unchanged: upsertStats.unchanged,
        errors: upsertStats.errors,
        deleted: deletedCount,
        duration: `${duration}s`,
      },
    };

  } catch (error) {
    console.error("\n❌ ===== SYNCHRONIZATION FAILED =====");
    console.error("Error:", error.message);

    return {
      success: false,
      message: "Synchronization failed",
      error: error.message,
    };
  }
}

// ============================================
// EXPORT
// ============================================

export default syncOrdersFromGoogleSheets;

