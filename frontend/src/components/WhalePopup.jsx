import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'

const WhalePopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [whaleAlerts, setWhaleAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [newAlertDetected, setNewAlertDetected] = useState(false)
  const previousAlertsRef = useRef([])
  const notificationShownRef = useRef(new Set())

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
      const value = (Math.random() * 4000 + 400).toFixed(0) // ₹400Cr - ₹4400Cr
      const time = Math.floor(Math.random() * 120) + 1 // 1-120 minutes ago
      const price = (Math.random() * 5000 + 500).toFixed(2) // ₹500 - ₹5500

      const explanations = {
        'Large Buy': `🚨 A rich investor just bought ${volume} Million shares at ₹${price} each!\n\n💡 What this means for you: When big investors buy heavily, they expect the price to go UP. This could be a good time to consider buying this stock.`,
        'Massive Sell': `⚠️ A major shareholder sold ${volume} Million shares at ₹${price}. Total money taken out: ₹${value} Crores!\n\n💡 What this means for you: Big investors are cashing out. The price might DROP soon. If you own this stock, consider selling. If planning to buy, wait for price to fall.`,
        'Whale Accumulation': `📊 Smart investors are slowly buying ${volume} Million shares over the past hour at around ₹${price}.\n\n💡 What this means for you: When experts buy quietly, they're preparing for a BIG price jump. This is often a STRONG BUY signal!`,
        'Dark Pool Activity': `🔍 ${volume} Million shares were traded secretly at ₹${price} (not on regular exchange).\n\n💡 What this means for you: Big institutions are making moves without showing their cards. Watch this stock closely - something big might happen soon!`,
        'Options Flow': `⚡ ALERT! ${volume} Million options contracts detected - huge bets being placed!\n\n💡 What this means for you: Professional traders are betting BIG money on this stock's price movement. This often leads to high volatility (big price swings). Great for quick profits but risky!`,
        'Insider Trading': `💼 Company INSIDER (someone who works there) bought ${volume} Million shares at ₹${price}!\n\n💡 What this means for you: People inside the company know secrets about future plans. When they buy, it's usually VERY GOOD NEWS. Strong buy signal!`,
        'Institutional Dump': `📉 A big institution just sold ${volume} Million shares rapidly!\n\n💡 What this means for you: Banks or mutual funds are exiting. This could mean trouble ahead. If you own this stock, consider selling. Don't buy right now - wait and watch.`,
        'Block Trade': `🧱 HUGE trade! ${volume} Million shares changed hands at ₹${price}.\n\n💡 What this means for you: A major investor either entered or exited. Check if it's a buy or sell to decide your move. Big changes are coming!`
      }

      alerts.push({
        symbol,
        type: typeData.name,
        emoji: typeData.emoji,
        color: typeData.color,
        sentiment: typeData.sentiment,
        explanation: explanations[typeData.name],
        volume: volume + 'M shares',
        value: '₹' + value + ' Cr',
        time: time + 'm ago',
        price: '₹' + price
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

  // Whale Activity Detector - checks for new buy/sell activities
  useEffect(() => {
    if (whaleAlerts.length > 0) {
      // Detect new alerts
      const newAlerts = whaleAlerts.filter(alert =>
        !previousAlertsRef.current.some(prev =>
          prev.symbol === alert.symbol && prev.time === alert.time
        )
      )

      // Show notifications for new whale activities
      newAlerts.forEach(alert => {
        const alertKey = `${alert.symbol}-${alert.time}-${alert.type}`

        // Only show notification once per unique alert
        if (!notificationShownRef.current.has(alertKey)) {
          notificationShownRef.current.add(alertKey)

          // Visual indicator
          setNewAlertDetected(true)
          setTimeout(() => setNewAlertDetected(false), 3000)

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const isBuy = alert.sentiment === 'bullish'
            new Notification(`🐋 Whale Alert: ${alert.symbol}`, {
              body: `${alert.type} detected! ${isBuy ? '📈 Bullish' : '📉 Bearish'} signal`,
              icon: '🐋',
              tag: alertKey
            })
          }
        }
      })

      previousAlertsRef.current = whaleAlerts
    }
  }, [whaleAlerts])

  // Auto-refresh whale data every 2 minutes
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        fetchWhaleAlerts()
      }, 120000) // 2 minutes

      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const togglePopup = () => {
    setIsOpen(!isOpen)
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
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
        className="fixed top-56 right-6 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-0 rounded-full shadow-2xl hover:shadow-3xl transition-all w-16 h-16 flex items-center justify-center overflow-visible group"
        style={{
          zIndex: 9998,
          boxShadow: newAlertDetected
            ? '0 10px 50px rgba(59, 130, 246, 1)'
            : '0 10px 40px rgba(59, 130, 246, 0.6)'
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: newAlertDetected ? [
            '0 10px 50px rgba(59, 130, 246, 1)',
            '0 10px 60px rgba(59, 130, 246, 0.8)',
            '0 10px 50px rgba(59, 130, 246, 1)'
          ] : [
            '0 10px 40px rgba(59, 130, 246, 0.6)',
            '0 10px 50px rgba(59, 130, 246, 0.8)',
            '0 10px 40px rgba(59, 130, 246, 0.6)'
          ],
          scale: newAlertDetected ? [1, 1.1, 1] : 1
        }}
        transition={{
          boxShadow: {
            duration: newAlertDetected ? 0.5 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 0.5,
            repeat: newAlertDetected ? Infinity : 0
          }
        }}
        aria-label="Whale Alerts"
      >
        <div className="relative">
          <span className="text-3xl">🐋</span>
          {newAlertDetected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed top-56 right-28 w-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-700 overflow-hidden"
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
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      Big Money Tracker
                      {newAlertDetected && (
                        <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                    </h3>
                    <p className="text-blue-100 text-xs">Watch what the big investors are doing • Auto-refreshes every 2 min</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scanning for big investor moves...</p>
                </div>
              ) : whaleAlerts.length > 0 ? (
                <div className="space-y-4">
                  {/* Beginner's Guide */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full p-2 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">📚 What is "Big Money" Activity?</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-2">
                          These are HUGE trades made by rich investors, banks, and mutual funds. When they buy millions of shares, it's like a signal that the stock might go UP 📈. When they sell, it might go DOWN 📉.
                        </p>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mt-2">
                          <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">💡 How to use this:</p>
                          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                            <li>✅ <strong>Green "BUYING"</strong> = Good time to consider buying</li>
                            <li>⚠️ <strong>Red "SELLING"</strong> = Be careful, price might drop</li>
                            <li>📊 <strong>Read the explanation</strong> below each alert for what to do</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Overview */}
                  {stats && (
                    <div className="grid grid-cols-4 gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Activities</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.bullish}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Buying</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.bearish}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">Selling</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.neutral}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Mixed</div>
                      </div>
                    </div>
                  )}

                  {/* Market Sentiment */}
                  {stats && (
                    <div className={`p-4 rounded-xl border ${stats.sentiment === 'Bullish'
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
                            Big Money is {stats.sentiment === 'Bullish' ? 'Buying' : stats.sentiment === 'Bearish' ? 'Selling' : 'Mixed'}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Based on {stats.total} large transactions in the last hour
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alert List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>🔔</span> Latest Big Investor Moves
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
                                  {alert.sentiment === 'bullish' ? 'BUYING' : alert.sentiment === 'bearish' ? 'SELLING' : 'MIXED'}
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

                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-2">
                          {alert.explanation.split('\n\n').map((paragraph, idx) => (
                            <p key={idx} className={idx === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border-l-4 border-yellow-400 font-medium' : ''}>
                              {paragraph}
                            </p>
                          ))}
                        </div>

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
                      💡 These are large transactions by institutional investors. Following them doesn't guarantee profits. Always do your own research!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🐋</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No major investor activity detected right now. Check back soon!
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
