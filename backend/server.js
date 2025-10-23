import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getTrackingNumberFromGoogleSheet } from "./utils/googleSheet.js";
import { fetchTrackingDataFrom17Track, parseTrackingData } from "./utils/track17.js";
import { selectBestCourierData } from "./utils/selectBestCourier.js";

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
    // Step 1: Fetch tracking number from Google Sheets
    console.log("Step 1: Fetching tracking number from Google Sheets...");
    const trackingNumber = await getTrackingNumberFromGoogleSheet(orderId);

    if (!trackingNumber) {
      console.log("❌ Order ID not found in system");
      return res.status(404).json({
        status: "not_found",
        message: "We couldn't find your order ID in our system.\n\nThis usually happens for one of two reasons:\n• The order number was entered incorrectly.\n• Your tracking number is not yet available - it may take up to 7 days to appear in the system.\n\nYour order ID starts with FLY. For example: FLY25082571179141\n\nPlease double-check your order number or try again later.",
        orderId: orderId,
      });
    }

    console.log(`✅ Found tracking number: ${trackingNumber}`);

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

    // Step 5: Return formatted response
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Shipment Tracking API Server`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`🔍 Track endpoint: GET /api/track/:orderId`);
  
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






