/**
 * Selects the best courier data based on smart priority selection
 * Priority 1: If tracking number starts with "JYDIL" -> prefer JYTD courier
 * Priority 2: Prefer Yuansheng Ancheng courier (most reliable for most cases)
 * Priority 3: Latest timestamp > Most advanced delivery stage (fallback)
 * @param {Array} allCouriers - Array of courier tracking data
 * @param {String} trackingNumber - The tracking number being queried
 * @returns {Object|null} - Best courier data or null
 */
export function selectBestCourierData(allCouriers, trackingNumber = null) {
  if (!allCouriers || allCouriers.length === 0) {
    return null;
  }

  // PRIORITY 1: If tracking number starts with "JYDIL" -> prefer JYTD
  if (trackingNumber && trackingNumber.toUpperCase().startsWith("JYDIL")) {
    const jytd = allCouriers.find(courier => 
      courier.courier.includes("JYTD") || 
      courier.courier.includes("捷易通达") ||
      courier.courier.toLowerCase().includes("jietong")
    );
    
    if (jytd) {
      console.log(`✅ PRIORITY 1: Selected JYTD courier for JYDIL tracking number`);
      return jytd;
    }
  }

  // PRIORITY 2: Prefer Yuansheng Ancheng (most reliable for standard shipments)
  const yuansheng = allCouriers.find(courier => 
    courier.courier.includes("Yuansheng") || 
    courier.courier.includes("Ancheng") ||
    courier.courier.includes("元盛")
  );
  
  if (yuansheng) {
    console.log(`✅ PRIORITY 2: Selected Yuansheng Ancheng courier (default priority)`);
    return yuansheng;
  }

  // PRIORITY 3: Fallback to timestamp + stage based selection
  console.log(`ℹ️  PRIORITY 3: No priority courier found, using fallback selection (latest + stage)`);


  // Define delivery stage priority (higher = more advanced)
  const stagePriority = {
    "delivered": 100,
    "delivery": 90,
    "out for delivery": 90,
    "available for pickup": 85,
    "arrived": 80,
    "customs cleared": 75,
    "in customs": 70,
    "in transit": 60,
    "departed": 55,
    "flight": 50,
    "awaiting": 40,
    "delayed": 35,
    "received": 30,
    "info received": 20,
    "registered": 10,
  };

  /**
   * Calculate priority score for a status
   */
  function getStageScore(status) {
    if (!status) return 0;
    const lowerStatus = status.toLowerCase();
    
    for (const [key, value] of Object.entries(stagePriority)) {
      if (lowerStatus.includes(key)) {
        return value;
      }
    }
    return 0;
  }

  let best = null;
  let bestScore = -1;
  let bestTimestamp = null;

  for (const courier of allCouriers) {
    if (!courier.history || courier.history.length === 0) continue;

    const timestamp = courier.timestamp;
    const stageScore = getStageScore(courier.latestStatus);

    // Calculate combined score (timestamp is primary, stage is secondary)
    // If timestamps are within 24 hours, prioritize stage
    if (!best) {
      best = courier;
      bestScore = stageScore;
      bestTimestamp = timestamp;
    } else {
      const timeDiff = Math.abs(timestamp - bestTimestamp) / (1000 * 60 * 60); // hours
      
      if (timeDiff <= 24) {
        // Timestamps are similar, choose based on stage
        if (stageScore > bestScore) {
          best = courier;
          bestScore = stageScore;
          bestTimestamp = timestamp;
        }
      } else if (timestamp > bestTimestamp) {
        // Choose newer timestamp
        best = courier;
        bestScore = stageScore;
        bestTimestamp = timestamp;
      }
    }
  }

  return best;
}










