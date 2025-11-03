import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { getOrderByOrderId, updateOrderCache, saveTrackingHistory } from "./utils/database.js";
import { fetchTrackingDataFrom17Track, parseTrackingData } from "./utils/track17.js";
import { selectBestCourierData } from "./utils/selectBestCourier.js";
import { getProductInfoFromGoogleSheet } from "./utils/productLookup.js";
import { syncOrdersFromGoogleSheets } from "./utils/syncOrders.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Shipment Tracking API is running",
    version: "1.0.0",
    mode: DEMO_MODE ? "DEMO" : "PRODUCTION"
  });
});

/**
 * Main tracking endpoint
 * GET /api/track/:orderId
 */
app.get("/api/track/:orderId", async (req, res) => {
  const { orderId } = req.params;

  if (!orderId || orderId.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Order ID is required",
    });
  }

  console.log(`\n📦 Tracking request for Order ID: ${orderId}`);

  // DEMO MODE - Return mock data without API calls
  if (DEMO_MODE) {
    console.log("🎭 DEMO MODE: Returning mock data");
    
    // Mock data for demo
    const mockData = {
      "FLY25090726005462": {
        status: "success",
        orderId: "FLY25090726005462",
        trackingNumber: "78841458",
        courier: "Yuansheng Ancheng",
        courierCode: "yuansheng",
        latestStatus: "Estimated Time For Flight On 11th OCT",
        lastUpdated: "2025-10-08 06:42",
        location: "HONGKONG",
        history: [
          {
            date: "2025-10-08 06:42",
            status: "Estimated Time For Flight On 11th OCT",
            location: "HONGKONG"
          },
          {
            date: "2025-10-07 01:19",
            status: "Flight Delayed",
            location: "HONGKONG"
          },
          {
            date: "2025-10-06 14:30",
            status: "Package Received at Warehouse",
            location: "HONGKONG"
          },
          {
            date: "2025-10-05 09:15",
            status: "Shipment Information Received",
            location: "ORIGIN"
          }
        ]
      },
      "TEST001": {
        status: "success",
        orderId: "TEST001",
        trackingNumber: "1234567890",
        courier: "DHL Express",
        courierCode: "dhl",
        latestStatus: "Out for Delivery",
        lastUpdated: "2025-10-16 10:30",
        location: "NEW YORK, USA",
        history: [
          {
            date: "2025-10-16 10:30",
            status: "Out for Delivery",
            location: "NEW YORK, USA"
          },
          {
            date: "2025-10-16 07:15",
            status: "Arrived at Delivery Facility",
            location: "NEW YORK, USA"
          },
          {
            date: "2025-10-15 18:45",
            status: "In Transit",
            location: "CHICAGO, USA"
          },
          {
            date: "2025-10-14 22:00",
            status: "Departed from Origin",
            location: "LOS ANGELES, USA"
          }
        ]
      },
      "DEMO123": {
        status: "success",
        orderId: "DEMO123",
        trackingNumber: "9876543210",
        courier: "FedEx International",
        courierCode: "fedex",
        latestStatus: "Delivered",
        lastUpdated: "2025-10-15 14:22",
        location: "LONDON, UK",
        history: [
          {
            date: "2025-10-15 14:22",
            status: "Delivered - Signed by Customer",
            location: "LONDON, UK"
          },
          {
            date: "2025-10-15 09:30",
            status: "Out for Delivery",
            location: "LONDON, UK"
          },
          {
            date: "2025-10-14 16:45",
            status: "Customs Cleared",
            location: "LONDON, UK"
          },
          {
            date: "2025-10-13 08:20",
            status: "In Transit",
            location: "PARIS, FRANCE"
          }
        ]
      }
    };

    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (mockData[orderId]) {
      console.log(`✅ Found mock data for ${orderId}`);
      return res.json(mockData[orderId]);
    } else {
      console.log(`❌ No mock data for ${orderId}`);
      return res.status(404).json({
        status: "not_found",
        message: "We couldn't find your order ID in our system.\n\nThis usually happens for one of two reasons:\n• The order number was entered incorrectly.\n• Your tracking number is not yet available - it may take up to 7 days to appear in the system.\n\nYour order ID starts with FLY. For example: FLY25082571179141\n\nPlease double-check your order number or try again later.",
        orderId: orderId,
      });
    }
  }

  try {
    // Step 1: Fetch order from database
    console.log("Step 1: Fetching order from database...");
    const order = await getOrderByOrderId(orderId);

    if (!order) {
      console.log("❌ Order ID not found in system");
      return res.status(404).json({
        status: "not_found",
        message: "We couldn't find your order ID in our system.\n\nThis usually happens for one of two reasons:\n• The order number was entered incorrectly.\n• Your tracking number is not yet available - it may take up to 7 days to appear in the system.\n\nYour order ID starts with FLY. For example: FLY25082571179141\n\nPlease double-check your order number or try again later.",
        orderId: orderId,
      });
    }

    const trackingNumber = order.logistics_no;

    if (!trackingNumber) {
      console.log("❌ Order found but tracking number not available yet");
      return res.status(404).json({
        status: "tracking_not_generated",
        message: "Your order was found in our system.\nHowever, the tracking number has not yet been generated.\nThis is completely normal - it usually takes around 10–14 days for the tracking number to appear after the package is first registered with the courier.\n\nPlease check back in a few days to see your updated tracking information.",
        orderId: orderId,
      });
    }

    console.log(`✅ Found order: ${orderId}`);
    console.log(`✅ Tracking number: ${trackingNumber}`);

    // Step 2: Query 17Track API
    console.log("Step 2: Querying 17Track API...");
    const rawTrackingData = await fetchTrackingDataFrom17Track(trackingNumber);

    if (!rawTrackingData || rawTrackingData.length === 0) {
      console.log("⚠️ No tracking data available yet");
      return res.json({
        status: "tracking_system_error",
        message: "We found your tracking number, but there was a problem retrieving the shipment details from our tracking system.\n\nThis is usually a temporary issue.\n\nPlease try again later - your order information is safe and will appear once the system updates successfully.",
        orderId: orderId,
        trackingNumber: trackingNumber,
      });
    }

    // Step 3: Parse tracking data
    console.log("Step 3: Parsing tracking data...");
    console.log("Raw tracking data type:", typeof rawTrackingData);
    console.log("Is array?:", Array.isArray(rawTrackingData));
    console.log("Data length:", rawTrackingData ? rawTrackingData.length : "null/undefined");
    
    const parsedData = parseTrackingData(rawTrackingData);

    if (!parsedData || parsedData.length === 0) {
      console.log("⚠️ Unable to parse tracking data");
      return res.json({
        status: "tracking_system_error",
        message: "We found your tracking number, but there was a problem retrieving the shipment details from our tracking system.\n\nThis is usually a temporary issue.\n\nPlease try again later - your order information is safe and will appear once the system updates successfully.",
        orderId: orderId,
        trackingNumber: trackingNumber,
      });
    }

    // Step 4: Select best courier data with smart priority
    console.log(`Step 4: Selecting best from ${parsedData.length} courier(s) for tracking number: ${trackingNumber}...`);
    const bestCourier = selectBestCourierData(parsedData, trackingNumber);

    if (!bestCourier) {
      console.log("⚠️ No valid tracking information found");
      return res.json({
        status: "tracking_system_error",
        message: "We found your tracking number, but there was a problem retrieving the shipment details from our tracking system.\n\nThis is usually a temporary issue.\n\nPlease try again later - your order information is safe and will appear once the system updates successfully.",
        orderId: orderId,
        trackingNumber: trackingNumber,
      });
    }

    console.log(`✅ Selected courier: ${bestCourier.courier}`);
    console.log(`✅ Latest status: ${bestCourier.latestStatus}`);

    // Step 5: Update cache and save history (async, non-blocking)
    updateOrderCache(orderId, bestCourier).catch(err => 
      console.error("Cache update failed (non-critical):", err.message)
    );
    
    saveTrackingHistory(orderId, bestCourier.history).catch(err =>
      console.error("History save failed (non-critical):", err.message)
    );

    // Step 6: Return formatted response
    const response = {
      status: "success",
      orderId: orderId,
      trackingNumber: trackingNumber,
      courier: bestCourier.courier,
      courierCode: bestCourier.courierCode,
      latestStatus: bestCourier.latestStatus,
      lastUpdated: bestCourier.lastUpdated,
      location: bestCourier.location,
      history: bestCourier.history,
    };

    return res.json(response);

  } catch (error) {
    console.error("❌ Error processing tracking request:", error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Product Lookup endpoint
 * GET /api/product/:orderId
 */
app.get("/api/product/:orderId", async (req, res) => {
  const { orderId } = req.params;

  if (!orderId || orderId.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Order ID is required",
    });
  }

  console.log(`\n🔍 Product Lookup request for Order ID: ${orderId}`);

  try {
    const productInfo = await getProductInfoFromGoogleSheet(orderId);

    if (!productInfo) {
      console.log("❌ Product not found for this order");
      return res.status(404).json({
        status: "not_found",
        message: "We couldn't find product information for this order ID.\n\nPlease make sure:\n• The order number is correct (starts with FLY)\n• The order exists in our system\n\nIf you continue to experience issues, please contact support.",
        orderId: orderId,
      });
    }

    console.log(`✅ Product found: ${productInfo.productName}`);

    return res.json({
      status: "success",
      orderId: orderId,
      productName: productInfo.productName,
      productCode: productInfo.productCode,
      imageUrl: productInfo.imageUrl,
    });

  } catch (error) {
    console.error("❌ Error processing product lookup request:", error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Order Synchronization endpoint
 * GET or POST /api/sync-orders
 * 
 * Protected by API key (SYNC_API_KEY)
 * Syncs orders from Google Sheets to Supabase
 * - Updates existing orders
 * - Adds new orders
 * - Deletes orders older than 4 months
 * 
 * Usage:
 * - GET: Open in browser with ?api_key=YOUR_KEY
 * - POST: Send with x-api-key header or api_key query param
 */
const handleSync = async (req, res) => {
  console.log("\n🔄 Sync request received");

  // Check API key authentication
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  const validApiKey = process.env.SYNC_API_KEY;

  if (!validApiKey) {
    console.error("❌ SYNC_API_KEY not configured in environment");
    return res.status(500).json({
      status: "error",
      message: "Sync API key not configured on server",
    });
  }

  if (!apiKey || apiKey !== validApiKey) {
    console.error("❌ Unauthorized sync attempt");
    return res.status(401).json({
      status: "error",
      message: "Unauthorized - Invalid API key",
    });
  }

  console.log("✅ API key validated");

  try {
    // Run synchronization
    const result = await syncOrdersFromGoogleSheets();

    if (result.success) {
      return res.json({
        status: "success",
        message: result.message,
        stats: result.stats,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: result.message,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error("❌ Sync endpoint error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Synchronization failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Support both GET and POST methods
app.get("/api/sync-orders", handleSync);
app.post("/api/sync-orders", handleSync);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// ============================================
// AUTOMATIC DAILY SYNC (Built-in Cron Job)
// ============================================

// Schedule sync to run every day at 3:00 AM UTC (6:00 AM Israel Time)
cron.schedule('0 3 * * *', async () => {
  console.log('\n⏰ ===== SCHEDULED SYNC TRIGGERED =====');
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  try {
    await syncOrdersFromGoogleSheets();
    console.log('✅ Scheduled sync completed successfully\n');
  } catch (error) {
    console.error('❌ Scheduled sync failed:', error.message);
    console.error('Will retry tomorrow at 3:00 AM UTC\n');
  }
}, {
  timezone: "UTC"
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Shipment Tracking API Server`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`🔍 Track endpoint: GET /api/track/:orderId`);
  console.log(`🔍 Product Lookup endpoint: GET /api/product/:orderId`);
  console.log(`🔄 Sync endpoint: GET/POST /api/sync-orders (Protected)`);
  console.log(`⏰ Auto-sync: Every day at 3:00 AM UTC (Built-in)`);
  
  if (DEMO_MODE) {
    console.log(`\n🎭 ========== DEMO MODE ENABLED ==========`);
    console.log(`📦 Test with these Order IDs:`);
    console.log(`   - FLY25090726005462 (In Transit)`);
    console.log(`   - TEST001 (Out for Delivery)`);
    console.log(`   - DEMO123 (Delivered)`);
    console.log(`   - Any other ID will return "not found"`);
    console.log(`========================================\n`);
  } else {
    console.log(`\n⚠️  Production mode - API credentials required\n`);
  }
});






