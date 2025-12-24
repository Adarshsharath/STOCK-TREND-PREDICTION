import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Waves, TrendingUp, TrendingDown, AlertCircle, Loader2, DollarSign } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const WhaleAlertPopup = ({ isOpen, onClose, onToggle }) => {
  const { isDark } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const [whaleEnabled, setWhaleEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [whaleData, setWhaleData] = useState([])
  const [error, setError] = useState('')

  // Load saved whale alert preference from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedWhale = localStorage.getItem(`whale_enabled_${user.username}`)
      const savedData = localStorage.getItem(`whale_data_${user.username}`)
      
      if (savedWhale === 'true') {
        setWhaleEnabled(true)
        if (savedData) {
          setWhaleData(JSON.parse(savedData))
        }
      }
    }
  }, [isAuthenticated, user])

  const handleToggleWhale = async () => {
    if (!whaleEnabled) {
      // Enabling whale alerts - fetch data
      setWhaleEnabled(true)
      await fetchWhaleAlerts()
    } else {
      // Disabling whale alerts - clear everything
      setWhaleEnabled(false)
      setWhaleData([])
      setError('')
      if (user) {
        localStorage.removeItem(`whale_enabled_${user.username}`)
        localStorage.removeItem(`whale_data_${user.username}`)
      }
    }
  }

  const fetchWhaleAlerts = async () => {
    setLoading(true)
    setError('')

    try {
      // Simulated whale alert data - in production, this would call a real API
      // You can integrate with services like Whale Alert API or similar
      const mockData = [
        {
          id: 1,
          symbol: 'BTC',
          amount: 1250.5,
          value: 52000000,
          type: 'buy',
          exchange: 'Binance',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          symbol: 'ETH',
          amount: 15000,
          value: 35000000,
          type: 'sell',
          exchange: 'Coinbase',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          symbol: 'AAPL',
          amount: 500000,
          value: 95000000,
          type: 'buy',
          exchange: 'NYSE',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 4,
          symbol: 'TSLA',
          amount: 250000,
          value: 68000000,
          type: 'sell',
          exchange: 'NASDAQ',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        }
      ]

      setWhaleData(mockData)
      
      // Save to localStorage
      if (user) {
        localStorage.setItem(`whale_enabled_${user.username}`, 'true')
        localStorage.setItem(`whale_data_${user.username}`, JSON.stringify(mockData))
      }
    } catch (err) {
      console.error('Whale Alert API error:', err)
      setError('Failed to fetch whale alerts. Please try again.')
      setWhaleEnabled(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      {isAuthenticated && (
        <motion.button
          onClick={onToggle}
          className="fixed top-44 right-6 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white p-0 rounded-full shadow-2xl transition-all w-14 h-14 z-[9997]"
          style={{
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.6)'
          }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              '0 10px 40px rgba(59, 130, 246, 0.6)',
              '0 10px 50px rgba(59, 130, 246, 0.8)',
              '0 10px 40px rgba(59, 130, 246, 0.6)'
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          title="Whale Alert - Large Market Movements"
        >
          <div className="w-full h-full flex items-center justify-center">
            <Waves className="w-6 h-6" />
          </div>
          
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </motion.button>
      )}

      {/* Popup Window */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 50, y: -20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
              className="fixed top-44 right-24 z-[9997] w-[360px] max-h-[calc(100vh-12rem)] overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)'
              }}
            >
            <div className="bg-white dark:bg-dark-bg-secondary border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl shadow-2xl dark:shadow-dark-card h-full flex flex-col">
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-dark-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-xl">
                      <Waves className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Whale Alert
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-dark-text-muted mt-0.5">
                        Track large market movements and whale activity
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-elevated transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-dark-text-muted" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Toggle Section */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white dark:bg-dark-bg-elevated rounded-lg">
                      <Waves className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Whale Alerts
                      </p>
                      <p className="text-xs text-gray-600 dark:text-dark-text-muted">
                        {whaleEnabled ? 'Active' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <button
                    onClick={handleToggleWhale}
                    disabled={loading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-secondary disabled:opacity-50 ${
                      whaleEnabled 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                        whaleEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 text-blue-500 m-1 animate-spin" />
                      ) : whaleEnabled ? (
                        <Waves className="w-4 h-4 text-blue-500 m-1" />
                      ) : null}
                    </span>
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Whale Alerts Display */}
                {whaleEnabled && whaleData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wide">
                        Recent Large Transactions
                      </p>
                      <span className="text-xs text-gray-500 dark:text-dark-text-muted">
                        Last 24h
                      </span>
                    </div>

                    <div className="space-y-2">
                      {whaleData.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border ${
                            alert.type === 'buy'
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2">
                              <div className={`p-1.5 rounded-lg ${
                                alert.type === 'buy'
                                  ? 'bg-green-100 dark:bg-green-900/40'
                                  : 'bg-red-100 dark:bg-red-900/40'
                              }`}>
                                {alert.type === 'buy' ? (
                                  <TrendingUp className={`w-4 h-4 ${
                                    alert.type === 'buy'
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`} />
                                ) : (
                                  <TrendingDown className={`w-4 h-4 ${
                                    alert.type === 'sell'
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-green-600 dark:text-green-400'
                                  }`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {alert.symbol}
                                  </span>
                                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                    alert.type === 'buy'
                                      ? 'bg-green-200 dark:bg-green-900/60 text-green-700 dark:text-green-300'
                                      : 'bg-red-200 dark:bg-red-900/60 text-red-700 dark:text-red-300'
                                  }`}>
                                    {alert.type.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-dark-text-muted mt-1">
                                  {alert.amount.toLocaleString()} units · {alert.exchange}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatCurrency(alert.value)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                                {getTimeAgo(alert.timestamp)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                            What are Whale Alerts?
                          </p>
                          <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                            Whale alerts track large transactions by institutional investors and high net-worth individuals. 
                            These movements can indicate market sentiment and potential price shifts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* When Whale Alerts are OFF */}
                {!whaleEnabled && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-bg-elevated rounded-full mb-4">
                      <Waves className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-dark-text-muted">
                      Enable Whale Alerts to track large market movements and institutional trading activity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default WhaleAlertPopup
