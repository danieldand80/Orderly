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
    
    const statusLower = status.toLowerCase().trim();
    const trackingStatuses = translations[language]?.trackingStatuses || {};
    
    // 1. Try exact match first
    if (trackingStatuses[statusLower]) {
      return trackingStatuses[statusLower];
    }
    
    // 2. Try exact match with original status
    if (trackingStatuses[status]) {
      return trackingStatuses[status];
    }
    
    // 3. For Hebrew language, check if status contains mixed language (Hebrew + English)
    // Extract only the clean part based on selected language
    if (status.includes(' / ')) {
      const parts = status.split(' / ');
      
      if (language === 'he') {
        // Return Hebrew part (usually first)
        const hebrewPart = parts.find(p => /[\u0590-\u05FF]/.test(p));
        if (hebrewPart) return hebrewPart.trim();
      } else {
        // Return English part (usually second)
        const englishPart = parts.find(p => !/[\u0590-\u05FF]/.test(p));
        if (englishPart) return englishPart.trim();
      }
    }
    
    // 4. Try partial match - find if status contains any key from translations
    for (const [key, value] of Object.entries(trackingStatuses)) {
      // Check if the status contains the translation key
      if (statusLower.includes(key)) {
        return value;
      }
      
      // Check if the key contains the status (reverse match)
      if (key.includes(statusLower)) {
        return value;
      }
    }
    
    // 5. Try word-by-word matching for compound statuses
    const words = statusLower.split(' ');
    for (const [key, value] of Object.entries(trackingStatuses)) {
      const keyWords = key.split(' ');
      // If most words match, use this translation
      const matchCount = keyWords.filter(kw => words.includes(kw)).length;
      if (matchCount >= Math.min(2, keyWords.length)) {
        return value;
      }
    }
    
    // 6. If nothing found, return original status
    return status;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateStatus }}>
      {children}
    </LanguageContext.Provider>
  );
};

