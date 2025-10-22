import { useState } from 'react'
import { useLanguage } from '../LanguageContext'

function TrackingForm({ onTrack, loading, disabled }) {
  const { t } = useLanguage()
  const [orderId, setOrderId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (orderId.trim()) {
      onTrack(orderId.trim())
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
            {t.form.label}
          </label>
          <input
            type="text"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder={t.form.placeholder}
            className="input-primary"
            disabled={disabled}
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            {t.form.hint}
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled || !orderId.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 ltr:mr-3 rtl:ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.form.buttonLoading}
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t.form.button}
            </span>
          )}
        </button>
      </form>
    </div>
  )
}

export default TrackingForm













