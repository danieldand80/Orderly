# Backend API - Shipment Tracking System

Express.js backend for automatic shipment tracking.

## 📁 File Structure

```
backend/
├── server.js                   # Main Express server
├── utils/
│   ├── googleSheet.js         # Google Sheets integration
│   ├── track17.js             # 17Track API client
│   └── selectBestCourier.js   # Smart courier selection
├── package.json
├── .env                        # Environment variables (create this)
├── .env.example               # Template for .env
├── credentials.json           # Google service account key (add this)
└── .gitignore
```

## 🔌 API Endpoints

### Health Check
```http
GET /
```

Response:
```json
{
  "status": "ok",
  "message": "Shipment Tracking API is running",
  "version": "1.0.0"
}
```

### Track Shipment
```http
GET /api/track/:orderId
```

**Parameters:**
- `orderId` (path) - The order ID to track

**Success Response (200):**
```json
{
  "status": "success",
  "orderId": "FLY25090726005462",
  "trackingNumber": "78841458",
  "courier": "Yuansheng Ancheng",
  "courierCode": "yuansheng",
  "latestStatus": "In Transit",
  "lastUpdated": "2025-10-08 06:42",
  "location": "HONGKONG",
  "history": [
    {
      "date": "2025-10-08 06:42",
      "status": "In Transit",
      "location": "HONGKONG"
    }
  ]
}
```

**Not Found Response (404):**
```json
{
  "status": "not_found",
  "message": "Order ID not found in our system. Please verify your order number.",
  "orderId": "INVALID123"
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "message": "An error occurred while processing your request. Please try again later."
}
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=5000
GOOGLE_SHEET_ID=1tNqqxbaihaXG7ho6CUnMBiOhtxHwXRnwXpJq85MXOi8
GOOGLE_SERVICE_ACCOUNT_JSON=./credentials.json
TRACK17_API_KEY=your_17track_api_key_here
```

### Google Sheets Setup

1. Create service account in Google Cloud Console
2. Download `credentials.json`
3. Place in `backend/` folder
4. Share your Google Sheet with service account email

### 17Track API Setup

1. Register at https://api.17track.net/
2. Get your API key
3. Add to `.env` file

## 🚀 Running

### Development
```bash
npm install
npm run dev  # Uses nodemon for auto-reload
```

### Production
```bash
npm install
npm start
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/

# Track order
curl http://localhost:5000/api/track/FLY25090726005462

# Test with invalid order
curl http://localhost:5000/api/track/INVALID123
```

## 🧠 How It Works

### 1. Receive Request
```javascript
GET /api/track/FLY25090726005462
```

### 2. Query Google Sheets
```javascript
// utils/googleSheet.js
const trackingNumber = await getTrackingNumberFromGoogleSheet(orderId)
// Returns: "78841458"
```

### 3. Query 17Track API
```javascript
// utils/track17.js
const trackingData = await fetchTrackingDataFrom17Track(trackingNumber)
// Returns array of courier results
```

### 4. Select Best Courier
```javascript
// utils/selectBestCourier.js
const bestCourier = selectBestCourierData(parsedData)
// Selects based on latest timestamp + delivery stage
```

### 5. Return Formatted Response
```javascript
res.json({
  status: "success",
  orderId: orderId,
  trackingNumber: trackingNumber,
  courier: bestCourier.courier,
  // ... rest of data
})
```

## 📊 Courier Selection Logic

The system intelligently selects the best courier based on:

1. **Primary Factor: Latest Timestamp**
   - Newer tracking events preferred

2. **Secondary Factor: Delivery Stage Priority**
   - When timestamps are within 24 hours, choose most advanced stage

**Stage Priority (highest to lowest):**
- Delivered (100)
- Out for delivery (90)
- Arrived at facility (80)
- Customs cleared (75)
- In customs (70)
- In transit (60)
- Flight departed (50)
- Awaiting flight (40)
- Delayed (35)
- Received (30)
- Info received (20)
- Registered (10)

## 🔍 Error Handling

### Google Sheets Errors
```javascript
// If sheet not accessible
throw new Error("Failed to fetch data from Google Sheets")
```

### 17Track API Errors
```javascript
// If API returns error
throw new Error("Failed to fetch tracking data")
```

### Not Found Cases
```javascript
// Order ID not in sheet
return { status: "not_found", message: "Order ID not found..." }

// No tracking data yet
return { status: "not_found", message: "Package not registered yet..." }
```

## 📝 Logging

Console logs include:
- ✅ Success indicators
- ❌ Error indicators
- 📦 Request tracking
- 🔍 Search operations

Example output:
```
📦 Tracking request for Order ID: FLY25090726005462
Step 1: Fetching tracking number from Google Sheets...
✅ Found tracking number: 78841458
Step 2: Querying 17Track API...
✅ Received 2 tracking results
Step 3: Parsing tracking data...
Step 4: Selecting best from 2 courier(s)...
✅ Selected courier: Yuansheng Ancheng
✅ Latest status: In Transit
```

## 🔒 Security

- CORS enabled for frontend
- Environment variables for secrets
- Service account for Google API
- API key for 17Track
- Error messages don't expose internals

## 📦 Dependencies

```json
{
  "express": "^4.18.2",        // Web framework
  "cors": "^2.8.5",            // CORS middleware
  "dotenv": "^16.3.1",         // Environment variables
  "googleapis": "^126.0.1",    // Google Sheets API
  "node-fetch": "^3.3.2"       // HTTP client
}
```

## 🐛 Common Issues

**Issue: "Cannot find module 'googleapis'"**
```bash
npm install
```

**Issue: "Authentication error"**
- Check `credentials.json` exists
- Verify sheet is shared with service account

**Issue: "17Track API error"**
- Verify API key is correct
- Check rate limits (100/day free tier)

## 🚀 Deployment

### Railway.app
```bash
# Set environment variables in dashboard
# Upload credentials.json as volume
# Deploy!
```

### Render.com
```bash
# Add environment variables
# Upload credentials.json as secret file
# Deploy from GitHub
```

## 📈 Performance

- Average response time: 2-5 seconds
- Google Sheets query: ~500ms
- 17Track API query: 1-3 seconds
- Processing & selection: <100ms

## 🔄 Updates

To update dependencies:
```bash
npm update
```

To add new features:
1. Update relevant utility file
2. Modify server.js if needed
3. Test thoroughly
4. Deploy

---

**Ready to track shipments! 🚀**













