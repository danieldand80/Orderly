import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('flylink-language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('flylink-language', language);
    
    // Update document direction for RTL languages
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  const t = translations[language];

  // Function to translate tracking statuses from API
  const translateStatus = (status) => {
    if (!status) return status;
    
    const trackingStatuses = translations[language]?.trackingStatuses || {};
    
    // STEP 1: Handle mixed language statuses (Hebrew / English)
    // Format: "עברית / English" or "עברית (הערה) / English"
    if (status.includes(' / ')) {
      const parts = status.split(' / ');
      
      if (language === 'he') {
        // For Hebrew: take first part (before " / ")
        return parts[0].trim();
      } else {
        // For English: take second part (after " / ")
        return parts[1].trim();
      }
    }
    
    // STEP 2: Try exact match (case-insensitive)
    const statusLower = status.toLowerCase().trim();
    if (trackingStatuses[statusLower]) {
      return trackingStatuses[statusLower];
    }
    
    // STEP 3: Try partial match for statuses with dynamic content (dates, numbers, etc.)
    // Example: "Estimated Time For Flight On 11ST OCT" contains "estimated time for flight on"
    for (const [key, translation] of Object.entries(trackingStatuses)) {
      if (statusLower.startsWith(key.toLowerCase())) {
        // Found a match - keep the dynamic part (date, number) at the end
        const dynamicPart = status.slice(key.length).trim();
        return dynamicPart ? `${translation} ${dynamicPart}` : translation;
      }
    }
    
    // STEP 4: If nothing found, return original
    return status;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateStatus }}>
      {children}
    </LanguageContext.Provider>
  );
};

