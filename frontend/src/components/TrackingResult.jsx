import { useState } from 'react'

function TrackingResult({ data, onReset }) {
  const [showHistory, setShowHistory] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
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
    { id: 1, name: 'Order Received', icon: '📋' },
    { id: 2, name: 'In Transit', icon: '✈️' },
    { id: 3, name: 'Customs', icon: '🛃' },
    { id: 4, name: 'Out for Delivery', icon: '🚚' },
    { id: 5, name: 'Delivered', icon: '📦' },
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
          {data.latestStatus}
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
                    <p className="text-xs text-gray-500 mt-1">Current Status</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 rounded-lg p-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Order ID</p>
            <p className="text-gray-800 font-medium">{data.orderId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tracking Number</p>
            <p className="text-gray-800 font-medium">{data.trackingNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Courier</p>
            <p className="text-gray-800 font-medium">{data.courier}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Last Updated</p>
            <p className="text-gray-800 font-medium">{formatDate(data.lastUpdated)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            {showHistory ? 'Hide' : 'Show'} Tracking History
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Track Another Order
          </button>
        </div>
      </div>

      {/* Tracking History */}
      {showHistory && data.history && data.history.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tracking History
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
                    <p className="font-medium text-gray-800">{event.status}</p>
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











