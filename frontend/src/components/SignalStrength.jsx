import React from 'react'
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react'

const SignalStrength = ({ buySignals, sellSignals }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100 border-green-300'
    if (confidence >= 65) return 'text-green-500 bg-green-50 border-green-200'
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-300'
    if (confidence >= 35) return 'text-orange-600 bg-orange-100 border-orange-300'
    return 'text-red-600 bg-red-100 border-red-300'
  }

  const getConfidenceBarColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-600'
    if (confidence >= 65) return 'bg-green-500'
    if (confidence >= 50) return 'bg-yellow-500'
    if (confidence >= 35) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const signals = [
    ...buySignals.map(s => ({ ...s, type: 'buy' })),
    ...sellSignals.map(s => ({ ...s, type: 'sell' }))
  ].sort((a, b) => {
    if (!a.confidence || !b.confidence) return 0
    return b.confidence - a.confidence
  })

  if (!signals || signals.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text">AI Confidence Scores</h3>
        </div>
        <p className="text-sm text-text-light">No signals with confidence scores available</p>
      </div>
    )
  }

  // Calculate average confidence
  const avgConfidence = signals.reduce((sum, s) => sum + (s.confidence || 0), 0) / signals.length

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-text">AI Confidence Scores</h3>
            <p className="text-xs text-text-light">Signal strength analysis</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-light">Average</p>
          <p className="text-xl font-bold text-primary">{avgConfidence.toFixed(1)}%</p>
        </div>
      </div>

      {/* Confidence Legend */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-gray-600" />
          <p className="text-xs font-medium text-gray-700">Confidence Levels</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="text-gray-600">80-100%: Very Strong</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600">65-79%: Strong</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-600">50-64%: Moderate</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-600">35-49%: Weak</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600">0-34%: Very Weak</span>
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {signals.map((signal, index) => (
          <div 
            key={index} 
            className={`border-2 rounded-lg p-4 ${getConfidenceColor(signal.confidence || 0)}`}
          >
            {/* Signal Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {signal.type === 'buy' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <div>
                  <p className="font-semibold text-sm">
                    {signal.type === 'buy' ? 'BUY' : 'SELL'} Signal
                  </p>
                  <p className="text-xs opacity-75">{formatDate(signal.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium opacity-75">Price</p>
                <p className="text-sm font-bold">${signal.close.toFixed(2)}</p>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">Confidence Score</p>
                <p className="text-sm font-bold">{(signal.confidence || 0).toFixed(1)}%</p>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${getConfidenceBarColor(signal.confidence || 0)}`}
                  style={{ width: `${signal.confidence || 0}%` }}
                />
              </div>
              <p className="text-xs font-medium mt-1">
                {signal.confidence_label || 'Unknown'}
              </p>
            </div>

            {/* Confidence Factors */}
            {signal.factors && Object.keys(signal.factors).length > 0 && (
              <div className="pt-3 border-t border-current border-opacity-20">
                <p className="text-xs font-semibold mb-2">Contributing Factors</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(signal.factors).map(([factor, score]) => (
                    <div key={factor} className="flex items-center justify-between text-xs">
                      <span className="opacity-75 capitalize">{factor}</span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <Info className="w-3 h-3 inline mr-1" />
          Confidence scores are calculated using volume, momentum, volatility, and trend strength. 
          Higher scores indicate stronger signal reliability.
        </p>
      </div>
    </div>
  )
}

export default SignalStrength
