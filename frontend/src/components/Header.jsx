import { useLanguage } from '../LanguageContext'

function Header() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img 
              src="/flylinklogo.png" 
              alt="Flylink Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="text-sm text-gray-600">{t.header.subtitle}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Switch language"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'עברית' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header






