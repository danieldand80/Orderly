/**
 * Migration Script: Google Sheets → Supabase
 * 
 * This script reads all orders from Google Sheets and imports them into Supabase.
 * Run this ONCE after setting up your Supabase database.
 * 
 * Usage:
 *   node database/migrate-sheets-to-supabase.js
 */

import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // Use SERVICE key for migration

const SHEET_RANGE = "Flylink Data Global!A:D"; // A=Order ID, B=Datetime, C=LogisticsNo, D=Provider

// ============================================
// INITIALIZE CLIENTS
// ============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// FETCH DATA FROM GOOGLE SHEETS
// ============================================

async function fetchFromGoogleSheets() {
  console.log("\n📊 Step 1: Fetching data from Google Sheets...\n");

  try {
    // Setup Google Sheets authentication
    let authConfig;
    if (GOOGLE_CREDENTIALS && GOOGLE_CREDENTIALS.startsWith("{")) {
      authConfig = {
        credentials: JSON.parse(GOOGLE_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      };
    } else {
      authConfig = {
        keyFile: GOOGLE_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      };
    }

    const auth = new google.auth.GoogleAuth(authConfig);
    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("❌ No data found in Google Sheet");
      return [];
    }

    console.log(`✅ Found ${rows.length} rows in Google Sheets`);

    // Parse rows (skip header row)
    const orders = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row[0] || !row[0].toString().trim()) continue;

      const order = {
        order_id: row[0]?.toString().trim() || null,
        datetime_of_purchase: row[1] ? parseExcelDate(row[1]) : new Date().toISOString(),
        logistics_no: row[2]?.toString().trim() || null,
        logistics_provider: row[3]?.toString().trim() || null,
      };

      // Validate order_id
      if (order.order_id) {
        orders.push(order);
      }
    }

    console.log(`✅ Parsed ${orders.length} valid orders\n`);
    return orders;
  } catch (error) {
    console.error("❌ Error fetching from Google Sheets:", error.message);
    throw error;
  }
}

// ============================================
// PARSE EXCEL DATE
// ============================================

function parseExcelDate(dateValue) {
  try {
    // If it's already a valid date string
    if (typeof dateValue === "string") {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    // If it's an Excel serial date number (days since 1900-01-01)
    if (typeof dateValue === "number") {
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return date.toISOString();
    }

    // Fallback to current date
    return new Date().toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

// ============================================
// INSERT DATA INTO SUPABASE
// ============================================

async function insertIntoSupabase(orders) {
  console.log("\n📥 Step 2: Inserting data into Supabase...\n");

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const order of orders) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([order])
        .select();

      if (error) {
        // Check if it's a duplicate error
        if (error.code === "23505") {
          console.log(`⚠️  Order ${order.order_id} already exists, skipping...`);
        } else {
          console.error(`❌ Error inserting ${order.order_id}:`, error.message);
          errors.push({ order_id: order.order_id, error: error.message });
          errorCount++;
        }
      } else {
        console.log(`✅ Inserted: ${order.order_id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception inserting ${order.order_id}:`, err.message);
      errors.push({ order_id: order.order_id, error: err.message });
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successfully inserted: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total processed: ${orders.length}`);
  console.log("=".repeat(60) + "\n");

  if (errors.length > 0) {
    console.log("❌ ERRORS:");
    errors.forEach((err) => {
      console.log(`   - ${err.order_id}: ${err.error}`);
    });
  }
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 MIGRATION: Google Sheets → Supabase");
  console.log("=".repeat(60));

  // Validate environment variables
  if (!GOOGLE_SHEET_ID || !GOOGLE_CREDENTIALS) {
    console.error("❌ Missing Google Sheets credentials in .env");
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials in .env");
    process.exit(1);
  }

  try {
    // Step 1: Fetch data from Google Sheets
    const orders = await fetchFromGoogleSheets();

    if (orders.length === 0) {
      console.log("❌ No orders to migrate. Exiting...");
      process.exit(0);
    }

    // Step 2: Insert into Supabase
    await insertIntoSupabase(orders);

    console.log("\n✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
main();

