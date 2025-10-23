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
      hint: "You can find your order number in your confirmation email",
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
      // Keep original English - no translation needed
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
      hint: "תוכל למצוא את מספר ההזמנה שלך באימייל האישור",
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
      // Delivery statuses (exact match from API - lowercase)
      "delivered": "נמסר",
      "final delivery": "מסירה סופית",
      "out for delivery": "יצא למשלוח",
      
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
      "package detail received": "פרטי החבילה התקבלו"
    }
  }
};

