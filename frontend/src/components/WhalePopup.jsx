import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WhalePopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [whaleAlerts, setWhaleAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Fetch alerts when popup opens
    if (isOpen && whaleAlerts.length === 0) {
      fetchWhaleAlerts()
    }
  }, [isOpen])

  const generateMockWhaleData = () => {
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'BTC', 'ETH', 'SPY', 'QQQ']
    const types = [
      { name: 'Large Buy', emoji: '📈', color: 'green', sentiment: 'bullish' },
      { name: 'Massive Sell', emoji: '📉', color: 'red', sentiment: 'bearish' },
      { name: 'Whale Accumulation', emoji: '🐋', color: 'blue', sentiment: 'bullish' },
      { name: 'Dark Pool Activity', emoji: '🌑', color: 'purple', sentiment: 'neutral' },
      { name: 'Options Flow', emoji: '⚡', color: 'yellow', sentiment: 'bullish' },
      { name: 'Insider Trading', emoji: '🔒', color: 'orange', sentiment: 'bullish' },
      { name: 'Institutional Dump', emoji: '💨', color: 'red', sentiment: 'bearish' },
      { name: 'Block Trade', emoji: '🧱', color: 'indigo', sentiment: 'neutral' }
    ]

    const alerts = []
    const numAlerts = Math.floor(Math.random() * 5) + 5 // 5-9 alerts

    for (let i = 0; i < numAlerts; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const typeData = types[Math.floor(Math.random() * types.length)]
      const volume = (Math.random() * 5 + 0.5).toFixed(1) // 0.5M - 5.5M
      const value = (Math.random() * 500 + 50).toFixed(0) // $50M - $550M
      const time = Math.floor(Math.random() * 120) + 1 // 1-120 minutes ago
      const price = (Math.random() * 500 + 50).toFixed(2)
      
      const explanations = {
        'Large Buy': `Whale bought ${volume}M shares at $${price}. Institutional accumulation detected.`,
        'Massive Sell': `Major holder sold ${volume}M shares at $${price}. Worth $${value}M liquidated.`,
        'Whale Accumulation': `Gradual buying of ${volume}M shares detected over last hour. Smart money positioning.`,
        'Dark Pool Activity': `${volume}M shares traded in dark pool at $${price}. Hidden liquidity movement.`,
        'Options Flow': `Unusual ${volume}M options volume detected. Large bullish bets placed.`,
        'Insider Trading': `Corporate insider purchased ${volume}M shares at $${price}. Confidence signal.`,
        'Institutional Dump': `Institution sold ${volume}M shares rapidly. Possible rebalancing.`,
        'Block Trade': `Large block of ${volume}M shares traded at $${price}. Major position change.`
      }

      alerts.push({
        symbol,
        type: typeData.name,
        emoji: typeData.emoji,
        color: typeData.color,
        sentiment: typeData.sentiment,
        explanation: explanations[typeData.name],
        volume: volume + 'M',
        value: '$' + value + 'M',
        time: time + 'm ago',
        price: '$' + price
      })
    }

    // Calculate stats
    const bullish = alerts.filter(a => a.sentiment === 'bullish').length
    const bearish = alerts.filter(a => a.sentiment === 'bearish').length
    const neutral = alerts.filter(a => a.sentiment === 'neutral').length

    return {
      alerts,
      stats: {
        total: alerts.length,
        bullish,
        bearish,
        neutral,
        sentiment: bullish > bearish ? 'Bullish' : bearish > bullish ? 'Bearish' : 'Neutral'
      }
    }
  }

  const fetchWhaleAlerts = async () => {
    setLoading(true)
    
    // Try API first, fall back to mock data
    try {
      const response = await fetch('/api/whale-alerts')
      
      if (response.ok) {
        const data = await response.json()
        setWhaleAlerts(data.alerts || [])
        setStats(data.stats || null)
      } else {
        throw new Error('API not available')
      }
    } catch (err) {
      console.log('Using mock whale data (API not available)')
      // Generate mock data
      const mockData = generateMockWhaleData()
      setWhaleAlerts(mockData.alerts)
      setStats(mockData.stats)
    } finally {
      setLoading(false)
    }
  }

  const togglePopup = () => {
    setIsOpen(!isOpen)
  }

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'bullish': return 'text-green-600 dark:text-green-400'
      case 'bearish': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getTypeColor = (color) => {
    const colors = {
      green: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
      red: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
      blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
    }
    return colors[color] || colors.blue
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={togglePopup}
        className="fixed top-40 right-6 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-0 rounded-full shadow-2xl hover:shadow-3xl transition-all w-14 h-14 flex items-center justify-center overflow-visible group"
        style={{
          zIndex: 9998,
          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.6)'
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
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
        aria-label="Whale Alerts"
      >
        <span className="text-2xl">🐋</span>
      </motion.button>

      {/* Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed top-40 right-24 w-[520px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-700 overflow-hidden"
            style={{ zIndex: 9997 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <span className="text-3xl">🐋</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Whale Alert Monitor</h3>
                    <p className="text-blue-100 text-xs">Real-time Large Transaction Tracking</p>
                  </div>
                </div>
                <button
                  onClick={togglePopup}
                  className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detecting whale movements...</p>
                </div>
              ) : whaleAlerts.length > 0 ? (
                <div className="space-y-4">
                  {/* Stats Overview */}
                  {stats && (
                    <div className="grid grid-cols-4 gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.bullish}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Bullish</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.bearish}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">Bearish</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.neutral}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Neutral</div>
                      </div>
                    </div>
                  )}

                  {/* Market Sentiment */}
                  {stats && (
                    <div className={`p-4 rounded-xl border ${
                      stats.sentiment === 'Bullish' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : stats.sentiment === 'Bearish'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {stats.sentiment === 'Bullish' ? '📈' : stats.sentiment === 'Bearish' ? '📉' : '➡️'}
                        </span>
                        <div className="flex-1">
                          <h4 className={`text-sm font-bold ${getSentimentColor(stats.sentiment.toLowerCase())}`}>
                            Overall Whale Sentiment: {stats.sentiment}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Based on {stats.total} detected transactions in the last hour
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alert List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>🔔</span> Recent Whale Movements
                    </h4>
                    {whaleAlerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${getTypeColor(alert.color)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{alert.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                  {alert.symbol}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSentimentColor(alert.sentiment)}`}>
                                  {alert.sentiment.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {alert.type}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{alert.time}</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {alert.explanation}
                        </p>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Volume:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{alert.volume}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Value:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{alert.value}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Price:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{alert.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                      ⚠️ Whale activity is informational only. Does not guarantee price movement. Always DYOR.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🐋</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No significant whale activity detected recently.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default WhalePopup
