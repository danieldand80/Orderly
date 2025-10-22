import fetch from "node-fetch";

/**
 * Fetches tracking data from 17Track API
 * @param {string} trackingNumber - The tracking number to query
 * @returns {Promise<Array>} - Array of courier tracking results
 */
export async function fetchTrackingDataFrom17Track(trackingNumber) {
  const apiKey = process.env.TRACK17_API_KEY;
  
  if (!apiKey) {
    throw new Error("17Track API key is not configured");
  }

  const headers = {
    "Content-Type": "application/json",
    "17token": apiKey,
  };

  try {
    // Step 1: Try to get tracking info directly first (skip registration if already exists)
    console.log(`Attempting to fetch tracking info directly: ${trackingNumber}`);
    const trackUrlDirect = "https://api.17track.net/track/v2/gettrackinfo";
    
    const trackBodyDirect = [{ 
      number: trackingNumber
    }];
    
    const trackResDirect = await fetch(trackUrlDirect, {
      method: "POST",
      headers,
      body: JSON.stringify(trackBodyDirect),
    });

    const trackTextDirect = await trackResDirect.text();
    console.log(`Direct track response (${trackResDirect.status}):`, trackTextDirect);

    let dataDirect;
    try {
      dataDirect = JSON.parse(trackTextDirect);
    } catch (e) {
      console.error("Failed to parse direct track JSON");
    }

    // If direct fetch worked and has data, return it
    if (dataDirect && dataDirect.data && dataDirect.data.accepted && dataDirect.data.accepted.length > 0) {
      console.log("✅ Found tracking data directly without registration!");
      return dataDirect.data.accepted;
    }

    // If direct fetch returned "No tracking information" but number is registered,
    // try to delete and re-register to force a fresh sync
    if (dataDirect && dataDirect.data && dataDirect.data.rejected && dataDirect.data.rejected.length > 0) {
      const rejection = dataDirect.data.rejected[0];
      if (rejection.error && rejection.error.code === -18019909) {
        console.log(`⚠️ Tracking number registered but has no data. Attempting to delete and re-register...`);
        
        // Try to delete the tracking number first
        const deleteUrl = "https://api.17track.net/track/v2/delete";
        const deleteBody = [{ number: trackingNumber }];
        
        try {
          const deleteRes = await fetch(deleteUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(deleteBody),
          });
          const deleteText = await deleteRes.text();
          console.log(`Delete response (${deleteRes.status}):`, deleteText);
          
          // Wait a moment after deletion
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("Delete failed, continuing anyway...", e.message);
        }
      }
    }

    // If still not found, try registration
    console.log(`Registering tracking number: ${trackingNumber}`);
    const registerUrl = "https://api.17track.net/track/v2/register";
    
    const registerBody = [{ 
      number: trackingNumber,
      auto_query: 1  // Request immediate data fetch
    }];
    console.log("Register request body:", JSON.stringify(registerBody));
    
    const registerRes = await fetch(registerUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(registerBody),
    });

    const registerText = await registerRes.text();
    console.log(`Registration response (${registerRes.status}):`, registerText);

    if (!registerRes.ok) {
      console.error(`Registration failed with status: ${registerRes.status}`);
    }

    // Step 2: Wait a moment for registration to process
    console.log("Waiting for registration to process...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Get tracking information
    console.log(`Fetching tracking info for: ${trackingNumber}`);
    const trackUrl = "https://api.17track.net/track/v2/gettrackinfo";
    
    const trackBody = [{ 
      number: trackingNumber
    }];
    console.log("Track request body:", JSON.stringify(trackBody));
    
    const trackRes = await fetch(trackUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(trackBody),
    });

    const trackText = await trackRes.text();
    console.log(`Track response (${trackRes.status}):`, trackText);

    if (!trackRes.ok) {
      throw new Error(`17Track API returned status ${trackRes.status}: ${trackText}`);
    }

    let data;
    try {
      data = JSON.parse(trackText);
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
      throw new Error("Invalid JSON response from 17Track API");
    }
    
    console.log("Parsed data structure:", JSON.stringify(data, null, 2));
    
    if (!data) {
      console.log("No data returned from API");
      return [];
    }

    // Handle 17Track API v2 response structure
    // Response format: { code: 0, data: { accepted: [...], rejected: [...] } }
    if (data.data && data.data.accepted && Array.isArray(data.data.accepted)) {
      const acceptedCount = data.data.accepted.length;
      const rejectedCount = data.data.rejected ? data.data.rejected.length : 0;
      
      console.log(`✅ Received ${acceptedCount} accepted tracking result(s)`);
      if (rejectedCount > 0) {
        console.log(`⚠️ ${rejectedCount} rejected tracking number(s)`);
      }
      
      return data.data.accepted;
    }
    
    // Fallback: old structure
    if (data.data && Array.isArray(data.data)) {
      console.log(`Received ${data.data.length} tracking results (old format)`);
      return data.data;
    } else if (Array.isArray(data)) {
      console.log(`Received ${data.length} tracking results (direct array)`);
      return data;
    } else {
      console.log("Unexpected data structure:", typeof data);
      console.log("Data keys:", Object.keys(data));
      return [];
    }
  } catch (error) {
    console.error("Error fetching from 17Track API:", error.message);
    console.error("Full error:", error);
    throw new Error("Failed to fetch tracking data: " + error.message);
  }
}

/**
 * Parses 17Track response and extracts relevant tracking information
 * @param {Array} trackingData - Raw data from 17Track API
 * @returns {Object|null} - Formatted tracking information or null
 */
export function parseTrackingData(trackingData) {
  console.log("parseTrackingData called with:", typeof trackingData);
  
  if (!trackingData) {
    console.log("trackingData is null/undefined");
    return null;
  }
  
  if (!Array.isArray(trackingData)) {
    console.log("trackingData is not an array, type:", typeof trackingData);
    return null;
  }
  
  if (trackingData.length === 0) {
    console.log("trackingData is empty array");
    return null;
  }

  console.log(`Processing ${trackingData.length} tracking items`);
  const results = [];

  for (const item of trackingData) {
    console.log("Processing item:", item.number);
    
    // Handle 17Track API v2 structure: track_info instead of track
    const trackInfo = item.track_info || item.track;
    
    if (!trackInfo) {
      console.log("No track_info found for:", item.number);
      continue;
    }

    // Get courier info from providers array (v2) or w1 (old)
    let courierName = "Unknown Carrier";
    let courierCode = null;
    
    if (trackInfo.tracking?.providers?.[0]?.provider) {
      const provider = trackInfo.tracking.providers[0].provider;
      courierName = provider.alias || provider.name || "Unknown Carrier";
      courierCode = provider.key;
    } else if (trackInfo.w1) {
      courierName = trackInfo.w1.wname || "Unknown Carrier";
      courierCode = trackInfo.w1.wcode;
    }

    // Get events from providers (v2) or z1 (old)
    let trackingEvents = [];
    if (trackInfo.tracking?.providers?.[0]?.events) {
      trackingEvents = trackInfo.tracking.providers[0].events;
    } else if (trackInfo.z1) {
      trackingEvents = trackInfo.z1;
    }

    if (trackingEvents.length === 0) {
      console.log("No tracking events for:", item.number);
      continue;
    }

    // Sort events by date (most recent first)
    const sortedEvents = trackingEvents.sort((a, b) => {
      const dateA = new Date(a.time_utc || a.time_iso || a.a || a.z);
      const dateB = new Date(b.time_utc || b.time_iso || b.a || b.z);
      return dateB - dateA;
    });

    const latestEvent = sortedEvents[0];

    // Get status and location (v2 structure)
    const latestStatus = latestEvent.description || latestEvent.z || "Status unavailable";
    const lastUpdated = latestEvent.time_iso || latestEvent.a || latestEvent.z || "";
    const location = latestEvent.location || latestEvent.c || "";

    results.push({
      courier: courierName,
      courierCode: courierCode,
      latestStatus: latestStatus,
      lastUpdated: lastUpdated,
      location: location,
      statusCode: trackInfo.latest_status?.status || trackInfo.e || 0,
      history: sortedEvents.map(event => ({
        date: event.time_iso || event.a || event.z || "",
        status: event.description || event.z || "Status unavailable",
        location: event.location || event.c || "",
      })),
      timestamp: new Date(lastUpdated),
    });
    
    console.log(`✅ Parsed ${courierName}: ${latestStatus}`);
  }

  console.log(`Total results parsed: ${results.length}`);
  return results;
}





