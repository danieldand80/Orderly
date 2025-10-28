import { useState } from 'react'
import { useLanguage } from '../LanguageContext'

function ProductLookup() {
  const { t } = useLanguage()
  const [orderId, setOrderId] = useState('')
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLookup = async (e) => {
    e.preventDefault()
    
    if (!orderId.trim()) return

    setLoading(true)
    setError(null)
    setProductData(null)

    try {
      const response = await fetch(`/api/product/${encodeURIComponent(orderId.trim())}`)
      const data = await response.json()

      if (response.ok && data.status === 'success') {
        setProductData(data)
      } else if (data.status === 'not_found') {
        setError(t.productLookup.error.notFound)
      } else {
        setError(t.productLookup.error.generalError)
      }
    } catch (err) {
      console.error('Product lookup error:', err)
      setError(t.productLookup.error.generalError)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setOrderId('')
    setProductData(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          {t.productLookup.title}
        </h1>
        <p className="text-lg text-gray-600">
          {t.productLookup.subtitle}
        </p>
      </div>

      {/* Search Form */}
      {!productData && (
        <div className="mb-8">
          <form onSubmit={handleLookup} className="card">
            <div className="mb-4">
              <label htmlFor="product-orderId" className="block text-sm font-medium text-gray-700 mb-2">
                {t.productLookup.form.label}
              </label>
              <input
                type="text"
                id="product-orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t.productLookup.form.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                {t.productLookup.form.hint}
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {loading ? t.productLookup.form.buttonLoading : t.productLookup.form.button}
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">{t.productLookup.loading.title}</p>
            <p className="text-gray-500 text-sm mt-2">{t.productLookup.loading.subtitle}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-500 ltr:mr-3 rtl:ml-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">{t.productLookup.error.title}</h3>
              <p className="text-gray-600 whitespace-pre-line">{error}</p>
              <button 
                onClick={handleReset}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {t.productLookup.error.tryAnother}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Result */}
      {productData && !loading && (
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.productLookup.result.title}</h2>
          </div>

          {/* Product Image */}
          <div className="mb-6 flex justify-center">
            {productData.imageUrl ? (
              <img 
                src={productData.imageUrl} 
                alt={productData.productName}
                className="max-w-full h-auto rounded-lg shadow-lg max-h-96 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">{t.productLookup.result.noImage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4 bg-gray-50 rounded-lg p-6">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                {t.productLookup.result.orderId}
              </p>
              <p className="text-lg font-medium text-gray-900">{productData.orderId}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                {t.productLookup.result.productName}
              </p>
              <p className="text-lg font-medium text-gray-900">{productData.productName}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                {t.productLookup.result.productCode}
              </p>
              <p className="text-lg font-medium text-gray-900">{productData.productCode}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={handleReset}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              {t.productLookup.result.searchAnother}
            </button>
          </div>
        </div>
      )}

      {/* Info Cards (when no result) */}
      {!productData && !loading && !error && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Real Product Info</h3>
            <p className="text-gray-600 text-sm">See the actual product you ordered, not a placeholder</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">Get your product information in seconds</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductLookup

