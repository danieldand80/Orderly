import { useLanguage } from '../LanguageContext'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <p className="text-gray-600 text-sm mb-4">
            {t.footer.copyright}
          </p>
          <p className="text-gray-500 text-xs">
            {t.footer.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer






