export const translations = {
  en: {
    // Header
    header: {
      title: "Flylink",
      subtitle: "Shipment Tracking System"
    },
    
    // Hero Section
    hero: {
      title: "Track Your Shipment",
      subtitle: "Enter your order number below to get real-time tracking updates"
    },
    
    // Form
    form: {
      label: "Order Number",
      placeholder: "Enter your order number",
      hint: "You can find your order number in your confirmation email. Its the number that starts with \"FLY\"",
      button: "Track Shipment",
      buttonLoading: "Tracking..."
    },
    
    // Loading
    loading: {
      title: "Tracking your shipment...",
      subtitle: "This may take a few moments"
    },
    
    // Error
    error: {
      title: "Unable to Track",
      commonReasons: "Common reasons:",
      reason1: "Package just created (not yet scanned by courier)",
      reason2: "Shipping label printed but not picked up",
      reason3: "Courier hasn't updated their system yet",
      checkBack: "Please check back in 3-4 days",
      tryAnother: "Try another order",
      // Specific error messages
      orderNotFound: "We couldn't find your order ID in our system.\n\nThis usually happens for one of two reasons:\n• The order number was entered incorrectly.\n• Your tracking number is not yet available - it may take up to 7 days to appear in the system.\n\nYour order ID starts with FLY. For example: FLY25082571179141\n\nPlease double-check your order number or try again later.",
      trackingNotGenerated: "Your order was found in our system. However, the tracking number has not yet been generated. This is completely normal - it usually takes around 10–14 days for the tracking number to appear after the package is first registered with the courier.\n\nPlease check back in a few days to see your updated tracking information.",
      trackingSystemError: "We found your tracking number, but there was a problem retrieving the shipment details from our tracking system.\n\nThis is usually a temporary issue.\n\nPlease try again later - your order information is safe and will appear once the system updates successfully.",
      generalError: "An error occurred while processing your request. Please try again later."
    },
    
    // Results
    results: {
      orderId: "Order ID",
      trackingNumber: "Tracking Number",
      courier: "Courier",
      lastUpdated: "Last Updated",
      showHistory: "Show Tracking History",
      hideHistory: "Hide Tracking History",
      trackAnother: "Track Another Order",
      historyTitle: "Tracking History"
    },
    
    // Progress Stages
    stages: {
      received: "Order Received",
      inTransit: "In Transit",
      customs: "Customs",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      currentStatus: "Current Status"
    },
    
    // Info Cards
    info: {
      fastTracking: {
        title: "Fast Tracking",
        description: "Get real-time updates on your shipment status instantly"
      },
      multiCarrier: {
        title: "Multi-Carrier",
        description: "Automatic detection of carrier for accurate tracking"
      },
      available247: {
        title: "24/7 Available",
        description: "Track your packages anytime, anywhere"
      }
    },
    
    // Footer
    footer: {
      copyright: "© 2025 Flylink. All rights reserved.",
      poweredBy: "Powered by 17Track API & Google Sheets"
    },
    
    // Tracking Status Translations (from courier API)
    trackingStatuses: {
      // Delivery & Arrival statuses
      "arrived at destination": "Arrived at destination",
      "arrived": "Arrived",
      "delivered": "Delivered",
      "final delivery": "Final delivery",
      "out for delivery": "Out for delivery",
      
      // Transit statuses
      "departed from hongkong": "Departed from HongKong",
      "departed": "Departed",
      "sent to hongkong": "Sent to HongKong",
      "in transit": "In transit",
      
      // Flight statuses
      "flight delayed": "Flight delayed",
      "delayed": "Delayed",
      "waiting for flight": "Waiting for flight",
      "estimated time for flight": "Estimated time for flight",
      "estimated time for flight on": "Estimated time for flight on",
      "flight departed": "Flight departed",
      "flight landed": "Flight landed",
      
      // Scan & Processing statuses
      "instation scan": "Station scan",
      "package scanned": "Package scanned",
      "received": "Received",
      "info received": "Information received",
      "sent to guangzhou sorting facility": "Sent to Guangzhou sorting facility",
      
      // Customs statuses
      "parcel data received at israel customs": "Parcel data received at Israel customs",
      "customs cleared": "Customs cleared",
      "in customs": "In customs",
      "vat paid": "VAT paid",
      
      // Chinese statuses (from Chinese carriers) - English translation
      "货物离开操作中心": "Package left the operation center",
      "货物到达操作中心": "Package arrived at the operation center",
      "到达收货点": "Arrived at pickup point",
      "货物电子信息已经收到": "Package electronic information received",
      "货物离开操作作中心": "Package left the operation center",
      "货物已到达": "Package has arrived",
      "包裹详情已收到": "Package details received",
      "已收货": "Received",
      "已签收": "Signed for delivery",
      "运输中": "In transit",
      "派送中": "Out for delivery",
      "已发货": "Shipped",
      "清关中": "In customs clearance",
      "清关完成": "Customs clearance completed",
      "航班起飞": "Flight departed",
      "航班降落": "Flight landed",
      "到达目的地机场": "Arrived at destination airport",
      "离开始发地机场": "Departed from origin airport"
    }
  },
  
  he: {
    // Header
    header: {
      title: "Flylink",
      subtitle: "מערכת מעקב משלוחים"
    },
    
    // Hero Section
    hero: {
      title: "עקוב אחר המשלוח שלך",
      subtitle: "הזן את מספר ההזמנה שלך למטה כדי לקבל עדכוני מעקב בזמן אמת"
    },
    
    // Form
    form: {
      label: "מספר הזמנה",
      placeholder: "הזן את מספר ההזמנה שלך",
      hint: "תוכל למצוא את מספר ההזמנה שלך באימייל האישור. זה המספר שמתחיל ב-\"FLY\"",
      button: "עקוב אחר משלוח",
      buttonLoading: "מעקב..."
    },
    
    // Loading
    loading: {
      title: "עוקב אחר המשלוח שלך...",
      subtitle: "זה עשוי לקחת כמה רגעים"
    },
    
    // Error
    error: {
      title: "לא ניתן לעקוב",
      commonReasons: "סיבות נפוצות:",
      reason1: "חבילה נוצרה זה עתה (עדיין לא נסרקה על ידי השליח)",
      reason2: "תווית משלוח הודפסה אך לא נאספה",
      reason3: "השליח עדיין לא עדכן את המערכת שלו",
      checkBack: "אנא בדוק שוב בעוד 3-4 ימים",
      tryAnother: "נסה הזמנה אחרת",
      // Specific error messages
      orderNotFound: "לא הצלחנו למצוא את מספר ההזמנה שלך במערכת שלנו.\n\nזה בדרך כלל קורה מאחת משתי סיבות:\n• מספר ההזמנה הוזן באופן שגוי\n• מספר המעקב שלך עדיין לא זמין - זה עלול לקחת עד 7 ימים להופיע במערכת\n\nמספר ההזמנה שלך מתחיל ב-FLY. לדוגמה: FLY25082571179141\n\nאנא בדוק שוב את מספר ההזמנה שלך או נסה שוב מאוחר יותר.",
      trackingNotGenerated: "ההזמנה שלך נמצאה במערכת שלנו. אולם, מספר המעקב עדיין לא נוצר. זה לגמרי נורמלי - בדרך כלל לוקח כ-10-14 ימים עד שמספר המעקב יופיע לאחר שהחבילה נרשמה לראשונה אצל השליח.\n\nאנא בדוק שוב בעוד מספר ימים כדי לראות את מידע המעקב המעודכן שלך.",
      trackingSystemError: "מצאנו את מספר המעקב שלך, אך הייתה בעיה בקבלת פרטי המשלוח ממערכת המעקב שלנו.\n\nזו בדרך כלל בעיה זמנית.\n\nאנא נסה שוב מאוחר יותר - מידע ההזמנה שלך בטוח ויופיע ברגע שהמערכת תתעדכן בהצלחה.",
      generalError: "אירעה שגיאה בעיבוד הבקשה שלך. אנא נסה שוב מאוחר יותר."
    },
    
    // Results
    results: {
      orderId: "מספר הזמנה",
      trackingNumber: "מספר מעקב",
      courier: "שליח",
      lastUpdated: "עודכן לאחרונה",
      showHistory: "הצג היסטוריית מעקב",
      hideHistory: "הסתר היסטוריית מעקב",
      trackAnother: "עקוב אחר הזמנה אחרת",
      historyTitle: "היסטוריית מעקב"
    },
    
    // Progress Stages
    stages: {
      received: "הזמנה התקבלה",
      inTransit: "במעבר",
      customs: "מכס",
      outForDelivery: "יצא למשלוח",
      delivered: "נמסר",
      currentStatus: "סטטוס נוכחי"
    },
    
    // Info Cards
    info: {
      fastTracking: {
        title: "מעקב מהיר",
        description: "קבל עדכונים בזמן אמת על סטטוס המשלוח שלך מיד"
      },
      multiCarrier: {
        title: "מרובה שליחים",
        description: "זיהוי אוטומטי של שליח למעקב מדויק"
      },
      available247: {
        title: "זמין 24/7",
        description: "עקוב אחר החבילות שלך בכל זמן ובכל מקום"
      }
    },
    
    // Footer
    footer: {
      copyright: "© 2025 Flylink. כל הזכויות שמורות.",
      poweredBy: "מופעל על ידי 17Track API ו-Google Sheets"
    },
    
    // Tracking Status Translations (from courier API)
    trackingStatuses: {
      // Delivery & Arrival statuses
      "arrived at destination": "הגיע ליעד",
      "arrived": "הגיע",
      "delivered": "נמסר",
      "final delivery": "מסירה סופית",
      "out for delivery": "יצא למשלוח",
      
      // Transit statuses
      "departed from hongkong": "יצא מהונג קונג",
      "departed": "יצא",
      "sent to hongkong": "נשלח להונג קונג",
      "in transit": "במעבר",
      
      // Flight statuses
      "flight delayed": "טיסה מתעכבת",
      "delayed": "מתעכב",
      "waiting for flight": "ממתין לטיסה",
      "estimated time for flight": "זמן משוער לטיסה",
      "estimated time for flight on": "זמן משוער לטיסה ב",
      "flight departed": "הטיסה המריאה",
      "flight landed": "הטיסה נחתה",
      
      // Scan & Processing statuses
      "instation scan": "סריקה בתחנה",
      "package scanned": "החבילה נסרקה",
      "received": "התקבל",
      "info received": "מידע התקבל",
      "sent to guangzhou sorting facility": "נשלח למרכז מיון בגואנגג'ואו",
      
      // Customs statuses
      "parcel data received at israel customs": "נתוני החבילה התקבלו במכס ישראל",
      "customs cleared": "עבר מכס",
      "in customs": "במכס",
      "vat paid": "מע\"מ שולם",
      
      // Pickup statuses
      "item received at delivery unit": "החבילה התקבלה ביחידת המשלוחים",
      "package scanned at pick up point/waiting for pick up": "החבילה נסרקה בנקודת איסוף / ממתינה לאיסוף",
      "package waiting for pickup by buyer": "החבילה ממתינה לאיסוף על ידי הקונה",
      "available for pickup": "זמין לאיסוף",
      
      // Transit statuses
      "package in regional center": "החבילה במרכז אזורי",
      "package in sorting center": "החבילה במרכז מיון",
      "sorted to delivery point (after customs)": "מוינה לנקודת משלוח (לאחר מכס)",
      
      // Customs statuses
      "parcel cleared": "החבילה עברה מכס",
      "package released from customs": "החבילה שוחררה מהמכס",
      "clearance process started": "תהליך שחרור מהמכס החל",
      
      // Airport/Flight statuses
      "package flight details received": "התקבלו פרטי הטיסה של החבילה",
      "package landed in tlv airport, il": "החבילה נחתה בשדה התעופה בן גוריון",
      "departed from airport of origin": "המריא משדה תעופה מקור",
      "landed in israel": "נחתה בישראל",
      "arrive at destination airport": "הגיע לשדה תעופה ביעד",
      "arrived post terminal": "הגיע למסוף דואר",
      "arrival at inward office of exchange": "הגיע למשרד חילופי דואר נכנס",
      "the flight has departed": "הטיסה המריאה",
      "arrive at departure airport": "הגיע לשדה תעופה היציאה",
      
      // Origin statuses
      "export clearance success": "אישור יצוא הצליח",
      "the package leaves the operation center": "החבילה עזבה את מרכז התפעול",
      "the package has arrived at the operation center": "החבילה הגיעה למרכז התפעול",
      "the package has been sent out": "החבילה נשלחה",
      "the electronic information of the package has been received": "המידע האלקטרוני של החבילה התקבל",
      "package details received": "פרטי החבילה התקבלו",
      
      // Manifest/System statuses
      "cargo manifest received": "התקבל מניפסט מטען",
      "parcel manifest received": "התקבל מניפסט חבילה",
      "parcel manifest update received": "התקבל עדכון מניפסט חבילה",
      "package detail received": "פרטי החבילה התקבלו",
      
      // Chinese statuses (from Chinese carriers) - Hebrew translation
      "货物离开操作中心": "החבילה עזבה את מרכז התפעול",
      "货物到达操作中心": "החבילה הגיעה למרכז התפעול",
      "到达收货点": "הגיע לנקודת איסוף",
      "货物电子信息已经收到": "המידע האלקטרוני של החבילה התקבל",
      "货物离开操作作中心": "החבילה עזבה את מרכז התפעול",
      "货物已到达": "החבילה הגיעה",
      "包裹详情已收到": "פרטי החבילה התקבלו",
      "已收货": "התקבל",
      "已签收": "נחתם על המסירה",
      "运输中": "במעבר",
      "派送中": "יצא למשלוח",
      "已发货": "נשלח",
      "清关中": "בתהליך שחרור מכס",
      "清关完成": "שחרור מכס הושלם",
      "航班起飞": "הטיסה המריאה",
      "航班降落": "הטיסה נחתה",
      "到达目的地机场": "הגיע לשדה תעופה ביעד",
      "离开始发地机场": "עזב את שדה תעופה מקור"
    }
  }
};

