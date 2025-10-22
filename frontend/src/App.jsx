import { useState } from 'react'
import { useLanguage } from './LanguageContext'
import TrackingForm from './components/TrackingForm'
import TrackingResult from './components/TrackingResult'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const { t } = useLanguage()
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTrack = async (orderId) => {
    setLoading(true)
    setError(null)
    setTrackingData(null)

    try {
      const response = await fetch(`/api/track/${encodeURIComponent(orderId)}`)
      const data = await response.json()

      if (response.ok && data.status === 'success') {
        setTrackingData(data)
      } else if (data.status === 'not_found') {
        setError(data.message)
      } else {
        setError(data.message || 'An error occurred while tracking your order')
      }
    } catch (err) {
      console.error('Tracking error:', err)
      setError('Unable to connect to tracking service. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTrackingData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
              {t.hero.title}
            </h1>
            <p className="text-lg text-gray-600">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Tracking Form */}
          <div className="mb-8">
            <TrackingForm 
              onTrack={handleTrack} 
              loading={loading}
              disabled={loading}
            />
          </div>

          {/* Results Section */}
          {loading && (
            <div className="card text-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">{t.loading.title}</p>
                <p className="text-gray-500 text-sm mt-2">{t.loading.subtitle}</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="card border-l-4 border-yellow-500">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{t.error.title}</h3>
                  <p className="text-gray-600">{error}</p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 {t.error.commonReasons}</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>{t.error.reason1}</li>
                      <li>{t.error.reason2}</li>
                      <li>{t.error.reason3}</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2 italic">
                      ⏰ {t.error.checkBack}
                    </p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {t.error.tryAnother}
                  </button>
                </div>
              </div>
            </div>
          )}

          {trackingData && !loading && (
            <TrackingResult data={trackingData} onReset={handleReset} />
          )}

          {/* Info Section */}
          {!trackingData && !loading && !error && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t.info.fastTracking.title}</h3>
                <p className="text-gray-600 text-sm">{t.info.fastTracking.description}</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t.info.multiCarrier.title}</h3>
                <p className="text-gray-600 text-sm">{t.info.multiCarrier.description}</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t.info.available247.title}</h3>
                <p className="text-gray-600 text-sm">{t.info.available247.description}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App











