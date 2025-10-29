import { useState } from 'react'
import { useLanguage } from '../LanguageContext'

function TrackingResult({ data, onReset }) {
  const { t, language, translateStatus } = useLanguage()
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      const locale = language === 'he' ? 'he-IL' : 'en-US'
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Format date for 17track style: YYYY-MM-DD HH:MM
  const formatDateFor17Track = (dateString) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch {
      return dateString
    }
  }

  // Copy tracking details in 17track format
  const copyTrackingDetails = async () => {
    // Calculate days in transit
    let daysText = ''
    if (data.history && data.history.length > 0) {
      const firstEvent = new Date(data.history[data.history.length - 1].date)
      const lastEvent = new Date(data.history[0].date)
      const days = Math.ceil((lastEvent - firstEvent) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        daysText = ` (${days} Days)`
      }
    }

    // Format status
    const status = translateStatus(data.latestStatus)

    // Build the text in 17track format
    let text = `Number: ${data.trackingNumber}\n`
    text += `Package status: ${status}${daysText}\n`
    text += `Country: China -> Israel\n`
    text += `${data.courier}:\n`

    // Add tracking history
    if (data.history && data.history.length > 0) {
      data.history.forEach((event) => {
        const formattedDate = formatDateFor17Track(event.date)
        const formattedStatus = translateStatus(event.status)
        const location = event.location ? `${event.location}, ` : 'IL, '
        text += `${formattedDate} ${location}${formattedStatus}\n`
      })
    }

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Determine delivery stage based on status
  const getDeliveryStage = () => {
    const status = data.latestStatus?.toLowerCase() || ''
    
    if (status.includes('delivered') || status.includes('final delivery')) {
      return 5
    } else if (status.includes('out for delivery') || status.includes('available for pickup')) {
      return 4
    } else if (status.includes('customs') || status.includes('cleared') || status.includes('arrival')) {
      return 3
    } else if (status.includes('transit') || status.includes('flight') || status.includes('departed') || status.includes('airport')) {
      return 2
    } else if (status.includes('received') || status.includes('info received') || status.includes('registered')) {
      return 1
    } else {
      return 1
    }
  }

  const currentStage = getDeliveryStage()

  const deliveryStages = [
    { id: 1, name: t.stages.received, icon: '📋' },
    { id: 2, name: t.stages.inTransit, icon: '✈️' },
    { id: 3, name: t.stages.customs, icon: '🛃' },
    { id: 4, name: t.stages.outForDelivery, icon: '🚚' },
    { id: 5, name: t.stages.delivered, icon: '📦' },
  ]

  const getStatusIcon = () => {
    const status = data.latestStatus?.toLowerCase() || ''
    
    if (status.includes('delivered')) {
      return (
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    } else if (status.includes('transit') || status.includes('flight')) {
      return (
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className="card text-center">
      {getStatusIcon()}

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {translateStatus(data.latestStatus)}
      </h2>
        
        <p className="text-gray-600 mb-6">
          {data.location && (
            <span className="inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {data.location}
            </span>
          )}
        </p>

        {/* Progress Bar - Desktop */}
        <div className="mb-8 hidden sm:block">
          <div className="flex items-center justify-between mb-4">
            {deliveryStages.map((stage, index) => (
              <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                {/* Line connecting stages */}
                {index < deliveryStages.length - 1 && (
                  <div 
                    className={`absolute top-6 left-1/2 w-full h-1 -z-10 ${
                      currentStage > stage.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
                
                {/* Stage Circle */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                    currentStage >= stage.id 
                      ? 'bg-green-500 text-white ring-4 ring-green-200' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStage >= stage.id ? (
                    stage.id === currentStage ? stage.icon : '✓'
                  ) : (
                    stage.icon
                  )}
                </div>
                
                {/* Stage Label */}
                <p className={`text-xs font-medium text-center px-1 ${
                  currentStage >= stage.id ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stage.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar - Mobile (Vertical) */}
        <div className="mb-8 sm:hidden">
          <div className="space-y-3">
            {deliveryStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center relative">
                {/* Vertical Line */}
                {index < deliveryStages.length - 1 && (
                  <div 
                    className={`absolute left-6 top-12 w-0.5 h-8 ${
                      currentStage > stage.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
                
                {/* Stage Circle */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 flex-shrink-0 transition-all ${
                    currentStage >= stage.id 
                      ? 'bg-green-500 text-white ring-4 ring-green-200' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStage >= stage.id ? (
                    stage.id === currentStage ? stage.icon : '✓'
                  ) : (
                    stage.icon
                  )}
                </div>
                
                {/* Stage Info */}
                <div className="flex-1">
                  <p className={`font-medium ${
                    currentStage >= stage.id ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </p>
                  {stage.id === currentStage && (
                    <p className="text-xs text-gray-500 mt-1">{t.stages.currentStatus}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 rounded-lg p-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t.results.orderId}</p>
            <p className="text-gray-800 font-medium">{data.orderId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t.results.trackingNumber}</p>
            <p className="text-gray-800 font-medium">{data.trackingNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t.results.courier}</p>
            <p className="text-gray-800 font-medium">{data.courier}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t.results.lastUpdated}</p>
            <p className="text-gray-800 font-medium">{formatDate(data.lastUpdated)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={copyTrackingDetails}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {t.results.copied}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t.results.copyDetails}
              </>
            )}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            {showHistory ? t.results.hideHistory : t.results.showHistory}
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {t.results.trackAnother}
          </button>
        </div>
      </div>

      {/* Tracking History */}
      {showHistory && data.history && data.history.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.results.historyTitle}
          </h3>
          
          <div className="space-y-4">
            {data.history.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  {index < data.history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 ml-1 mt-1"></div>
                  )}
                </div>
                
                <div className="flex-grow pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                    <p className="font-medium text-gray-800">{translateStatus(event.status)}</p>
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                  </div>
                  {event.location && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackingResult











