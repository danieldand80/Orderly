import { google } from "googleapis";
import fs from "fs";

/**
 * Fetches tracking number from Google Sheets based on Order ID
 * @param {string} orderId - The order ID to search for
 * @returns {Promise<string|null>} - The tracking number or null if not found
 */
export async function getTrackingNumberFromGoogleSheet(orderId) {
  try {
    // Support both file path and JSON string for credentials
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
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Flylink Data Global'!A:C", // Updated range to include column C (Note: single quotes around sheet name with spaces)
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in Google Sheet");
      return null;
    }

    // Find matching order ID (case-insensitive)
    const match = rows.find(row => 
      row[0] && row[0].toString().trim().toLowerCase() === orderId.toString().trim().toLowerCase()
    );
    
    if (match) {
      const trackingNumber = match[2]; // Column C (logisticsNo)
      if (trackingNumber && trackingNumber.toString().trim()) {
        console.log(`Found order ${orderId} in sheet`);
        console.log(`Using logisticsNo as tracking number: ${trackingNumber}`);
        return trackingNumber.toString().trim();
      } else {
        console.log(`Order ${orderId} found but logisticsNo (column C) is empty`);
        return null;
      }
    }

    console.log(`Order ${orderId} not found in sheet`);
    return null;
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error.message);
    throw new Error("Failed to fetch data from Google Sheets: " + error.message);
  }
}





