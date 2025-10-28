import { google } from "googleapis";

/**
 * Fetches product information from Google Sheets based on Order ID
 * 
 * Flow:
 * 1. Look up Order ID in "Flylink Data" sheet → Get Product Code (column B)
 * 2. Look up Product Code in "Product Codes" sheet → Get Product Name + Image
 * 
 * @param {string} orderId - The order ID to search for (e.g. FLY25092...)
 * @returns {Promise<Object|null>} - Product info {productName, productCode, imageUrl} or null
 */
export async function getProductInfoFromGoogleSheet(orderId) {
  try {
    // Setup Google Sheets auth
    let authConfig;
    const credentialPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (credentialPath && credentialPath.startsWith('{')) {
      // JSON string provided (for Railway/Vercel)
      authConfig = {
        credentials: JSON.parse(credentialPath),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      };
    } else {
      // File path provided (for local development)
      authConfig = {
        keyFile: credentialPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      };
    }

    const auth = new google.auth.GoogleAuth(authConfig);
    const sheets = google.sheets({ version: "v4", auth });
    
    // STEP 1: Find Product Code from Order ID
    console.log(`🔍 Step 1: Looking up Order ID "${orderId}" in Flylink Data sheet...`);
    
    const flylinkDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Flylink Data'!A:C", // Order ID | Product Code | logisticsNo (Note: single quotes around sheet name with spaces)
    });

    const flylinkRows = flylinkDataResponse.data.values;
    if (!flylinkRows || flylinkRows.length === 0) {
      console.log("❌ No data found in Flylink Data sheet");
      return null;
    }

    // Find matching order ID (case-insensitive)
    const orderMatch = flylinkRows.find(row => 
      row[0] && row[0].toString().trim().toLowerCase() === orderId.toString().trim().toLowerCase()
    );
    
    if (!orderMatch) {
      console.log(`❌ Order ID "${orderId}" not found in Flylink Data sheet`);
      return null;
    }

    const productCode = orderMatch[1]; // Column B - Product Code
    
    if (!productCode || !productCode.toString().trim()) {
      console.log(`❌ Order ID "${orderId}" found but Product Code (column B) is empty`);
      return null;
    }

    console.log(`✅ Found Product Code: ${productCode}`);

    // STEP 2: Find Product Name and Image from Product Code
    console.log(`🔍 Step 2: Looking up Product Code "${productCode}" in Product Codes sheet...`);
    
    const productCodesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Product Codes'!A:C", // Product | FlyCode | Image (Note: single quotes around sheet name with spaces)
    });

    const productRows = productCodesResponse.data.values;
    if (!productRows || productRows.length === 0) {
      console.log("❌ No data found in Product Codes sheet");
      return null;
    }

    // Find matching product code (FlyCode column - column B)
    const productMatch = productRows.find(row => 
      row[1] && row[1].toString().trim().toLowerCase() === productCode.toString().trim().toLowerCase()
    );
    
    if (!productMatch) {
      console.log(`❌ Product Code "${productCode}" not found in Product Codes sheet`);
      return null;
    }

    const productName = productMatch[0]; // Column A - Product Name
    const imageUrl = productMatch[2];    // Column C - Image URL

    if (!productName || !productName.toString().trim()) {
      console.log(`❌ Product Code "${productCode}" found but Product Name (column A) is empty`);
      return null;
    }

    console.log(`✅ Found Product: ${productName}`);
    console.log(`✅ Image URL: ${imageUrl || 'Not available'}`);

    return {
      productName: productName.toString().trim(),
      productCode: productCode.toString().trim(),
      imageUrl: imageUrl ? imageUrl.toString().trim() : null,
    };

  } catch (error) {
    console.error("❌ Error fetching product info from Google Sheets:", error.message);
    throw new Error("Failed to fetch product data from Google Sheets: " + error.message);
  }
}

