import React, { useState, useEffect } from 'react'
import { AlertTriangle, CloudRain, Wind, Zap, Info, X, RefreshCw } from 'lucide-react'
import axios from 'axios'

const WeatherAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [marketImpact, setMarketImpact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [highImpactCount, setHighImpactCount] = useState(0)

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('/api/weather-alerts', {
        timeout: 10000
      })
      
      if (response.data) {
        setAlerts(response.data.alerts || [])
        setMarketImpact(response.data.market_impact)
        setTotalAlerts(response.data.total_alerts || 0)
        setHighImpactCount(response.data.high_impact_count || 0)
      }
    } catch (err) {
      console.error('Weather alerts error:', err)
      setError(err.response?.data?.message || 'Unable to fetch weather alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    // Refresh every 30 minutes
    const interval = setInterval(fetchAlerts, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getImpactColor = (level) => {
    const colors = {
      'High': 'bg-red-50 border-red-300 text-red-900',
      'Moderate': 'bg-orange-50 border-orange-300 text-orange-900',
      'Low': 'bg-yellow-50 border-yellow-300 text-yellow-900',
      'Minimal': 'bg-blue-50 border-blue-300 text-blue-900',
      'None': 'bg-green-50 border-green-300 text-green-900'
    }
    return colors[level] || 'bg-gray-50 border-gray-300 text-gray-900'
  }

  const getSeverityBadgeColor = (severity) => {
    if (severity >= 5) return 'bg-red-600 text-white'
    if (severity >= 4) return 'bg-orange-500 text-white'
    if (severity >= 3) return 'bg-yellow-500 text-white'
    return 'bg-blue-500 text-white'
  }

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp * 1000).toLocaleString()
    } catch {
      return 'Unknown'
    }
  }

  const getIcon = () => {
    if (!marketImpact) return <AlertTriangle className="w-5 h-5" />
    
    switch (marketImpact.level) {
      case 'High':
        return <AlertTriangle className="w-5 h-5" />
      case 'Moderate':
        return <Wind className="w-5 h-5" />
      case 'Low':
        return <CloudRain className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  if (dismissed || loading || !marketImpact) return null
  
  // Only show if there are alerts or errors
  if (totalAlerts === 0 && !error) return null

  return (
    <div className="mb-6">
      {/* Main Alert Banner */}
      <div className={`border-2 rounded-xl p-4 ${getImpactColor(marketImpact?.level)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-lg">
                  {error ? 'Weather Alerts Unavailable' : 'Weather & Disaster Alert'}
                </h3>
                {!error && highImpactCount > 0 && (
                  <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                    {highImpactCount} High Impact
                  </span>
                )}
              </div>
              
              {error ? (
                <p className="text-sm">{error}</p>
              ) : (
                <>
                  <p className="font-medium mb-2">
                    {marketImpact?.recommendation}
                  </p>
                  <p className="text-sm opacity-90">
                    <strong>{totalAlerts}</strong> weather alert{totalAlerts !== 1 ? 's' : ''} detected 
                    in major financial centers. Natural disasters can significantly impact market stability.
                  </p>
                  
                  {marketImpact?.affected_regions && marketImpact.affected_regions.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Affected Regions: </span>
                      <span className="text-sm">{marketImpact.affected_regions.join(', ')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAlerts}
              className="p-2 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
              title="Refresh alerts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alert Details */}
        {!error && alerts.length > 0 && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-60 rounded-lg p-3 border border-current border-opacity-20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity_name}
                      </span>
                      <span className="font-semibold text-sm">{alert.city}</span>
                      <span className="text-xs opacity-75">({alert.region})</span>
                    </div>
                    <p className="font-medium text-sm mb-1">{alert.event}</p>
                    <p className="text-xs opacity-90 line-clamp-2">{alert.description}</p>
                    {alert.start && (
                      <p className="text-xs opacity-75 mt-1">
                        Start: {formatDate(alert.start)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.length > 5 && (
              <p className="text-xs text-center opacity-75 pt-2">
                + {alerts.length - 5} more alerts
              </p>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-4 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs opacity-75">
            <Info className="w-3 h-3 inline mr-1" />
            Weather data from major financial centers: New York, London, Tokyo, Hong Kong, Mumbai, and more.
            Consider postponing major investments during severe weather events.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WeatherAlerts
