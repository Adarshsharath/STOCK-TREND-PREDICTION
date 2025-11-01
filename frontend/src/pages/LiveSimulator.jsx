import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Bell, TrendingUp, TrendingDown, Clock, Zap, Settings } from 'lucide-react'
import Plot from 'react-plotly.js'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const LiveSimulator = () => {
  const [symbol, setSymbol] = useState('AAPL')
  const [strategy, setStrategy] = useState('macd')
  const [speed, setSpeed] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [historicalData, setHistoricalData] = useState([])
  const [liveData, setLiveData] = useState([])
  const [signals, setSignals] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const notificationIdRef = useRef(0)

  const SUGGESTED_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'INFY.NS', name: 'Infosys' }
  ]

  const STRATEGIES = [
    { id: 'macd', name: 'MACD' },
    { id: 'rsi', name: 'RSI' },
    { id: 'ema_crossover', name: 'EMA Crossover' },
    { id: 'bollinger_scalping', name: 'Bollinger Bands' },
    { id: 'supertrend', name: 'SuperTrend' }
  ]

  const SPEED_OPTIONS = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' }
  ]

  // Fetch historical data for simulation
  const fetchHistoricalData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch intraday data for realistic second-by-second simulation
      const response = await axios.get('/api/simulator-data', {
        params: {
          symbol: symbol,
          strategy: strategy
        },
        timeout: 30000
      })
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setHistoricalData(response.data.data)
        setLiveData([])
        setCurrentIndex(0)
        setSignals([])
        setNotifications([])
      } else {
        setError('No data available for simulation')
      }
    } catch (err) {
      console.error('Error fetching simulator data:', err)
      setError(err.response?.data?.error || 'Failed to load simulation data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoricalData()
  }, [symbol, strategy])

  // Check for buy/sell signals
  const checkForSignals = (dataPoint, index) => {
    if (!dataPoint.signal) return

    const signal = {
      type: dataPoint.signal === 1 ? 'BUY' : 'SELL',
      price: dataPoint.close,
      time: dataPoint.date,
      index: index
    }

    setSignals(prev => [...prev, signal])
    showNotification(signal)
  }

  // Show notification
  const showNotification = (signal) => {
    const id = notificationIdRef.current++
    const notification = {
      id,
      type: signal.type,
      message: signal.type === 'BUY' 
        ? `🟢 BUY Signal detected for ${symbol} at ₹${signal.price.toFixed(2)}`
        : `🔴 SELL Signal detected for ${symbol} at ₹${signal.price.toFixed(2)}`,
      time: signal.time
    }

    setNotifications(prev => [...prev, notification])

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)

    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Trading Signal', {
        body: notification.message,
        icon: signal.type === 'BUY' ? '🟢' : '🔴'
      })
    }
  }

  // Simulate real-time data
  useEffect(() => {
    if (isPlaying && historicalData.length > 0 && currentIndex < historicalData.length) {
      const interval = 1000 / speed // Adjust speed
      
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1
          
          if (nextIndex >= historicalData.length) {
            setIsPlaying(false)
            return prevIndex
          }

          const newDataPoint = historicalData[nextIndex]
          setLiveData(prev => [...prev, newDataPoint])
          
          // Check for signals
          checkForSignals(newDataPoint, nextIndex)
          
          return nextIndex
        })
      }, interval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isPlaying, speed, currentIndex, historicalData])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
    setLiveData([])
    setSignals([])
    setNotifications([])
  }

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Prepare chart data
  const chartData = liveData.length > 0 ? liveData : []
  const dates = chartData.map(d => d.date)
  const prices = chartData.map(d => d.close)
  const buySignals = signals.filter(s => s.type === 'BUY')
  const sellSignals = signals.filter(s => s.type === 'SELL')

  // Current price and change
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0
  const previousPrice = chartData.length > 1 ? chartData[0].close : currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0
  const isPositive = priceChange >= 0

  // Progress
  const progress = historicalData.length > 0 ? (currentIndex / historicalData.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Zap className="w-8 h-8 mr-3" />
              Live Market Simulator
            </h1>
            <p className="text-white text-opacity-90">
              Real-time market simulation with live buy/sell signal detection
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white text-opacity-75 mb-1">Simulating</p>
            <p className="text-2xl font-bold">Last Friday's Market</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Stock Symbol */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Stock Symbol
            </label>
            <div className="relative">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, MSFT, RELIANCE.NS"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isPlaying}
                list="stock-suggestions"
              />
              <datalist id="stock-suggestions">
                {SUGGESTED_STOCKS.map(stock => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.name}
                  </option>
                ))}
              </datalist>
            </div>
            <p className="text-xs text-text-muted mt-1">
              💡 Try: AAPL, MSFT, TSLA, RELIANCE.NS, TCS.NS
            </p>
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Detection Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isPlaying}
            >
              {STRATEGIES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Speed Control */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Playback Speed
            </label>
            <div className="flex space-x-1">
              {SPEED_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSpeedChange(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${
                    speed === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-light hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Playback Controls */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Controls
            </label>
            <div className="flex space-x-2">
              <button
                onClick={handlePlayPause}
                disabled={loading || !historicalData.length}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition ${
                  isPlaying
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-muted mb-2">
            <span>Simulation Progress</span>
            <span>{currentIndex} / {historicalData.length} data points</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Start Button */}
        {!loading && historicalData.length === 0 && (
          <button
            onClick={fetchHistoricalData}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition"
          >
            Load Simulation Data
          </button>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-text-muted">Loading simulation data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-semibold mb-2">{error}</p>
                <div className="bg-white rounded p-3 mt-2">
                  <p className="text-sm text-text-muted mb-2">💡 Try these popular stocks:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_STOCKS.map(stock => (
                      <button
                        key={stock.symbol}
                        onClick={() => {
                          setSymbol(stock.symbol)
                          setError(null)
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                      >
                        {stock.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Price Display */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Current Price</p>
              <p className="text-4xl font-bold text-text">₹{currentPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isPositive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}
                  </p>
                  <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex space-x-4">
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">Buy Signals</p>
                  <p className="text-2xl font-bold text-green-600">{buySignals.length}</p>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">Sell Signals</p>
                  <p className="text-2xl font-bold text-red-600">{sellSignals.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Live Market Graph - {symbol}
          </h3>
          <Plot
            data={[
              {
                x: dates,
                y: prices,
                type: 'scatter',
                mode: 'lines',
                name: 'Price',
                line: { color: '#3b82f6', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(59, 130, 246, 0.1)'
              },
              {
                x: buySignals.map(s => chartData[s.index]?.date),
                y: buySignals.map(s => s.price),
                type: 'scatter',
                mode: 'markers',
                name: 'Buy Signal',
                marker: {
                  color: '#10b981',
                  size: 14,
                  symbol: 'triangle-up',
                  line: { color: '#065f46', width: 2 }
                }
              },
              {
                x: sellSignals.map(s => chartData[s.index]?.date),
                y: sellSignals.map(s => s.price),
                type: 'scatter',
                mode: 'markers',
                name: 'Sell Signal',
                marker: {
                  color: '#ef4444',
                  size: 14,
                  symbol: 'triangle-down',
                  line: { color: '#991b1b', width: 2 }
                }
              }
            ]}
            layout={{
              autosize: true,
              height: 500,
              margin: { l: 60, r: 40, t: 40, b: 60 },
              xaxis: {
                title: 'Time',
                showgrid: true,
                gridcolor: '#f3f4f6'
              },
              yaxis: {
                title: 'Price (₹)',
                showgrid: true,
                gridcolor: '#f3f4f6'
              },
              hovermode: 'x unified',
              showlegend: true,
              legend: {
                x: 0,
                y: 1,
                bgcolor: 'rgba(255,255,255,0.8)'
              },
              plot_bgcolor: '#ffffff',
              paper_bgcolor: '#ffffff'
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false
            }}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Notifications Panel */}
      <div className="fixed top-20 right-6 z-50 space-y-3 max-w-md">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`rounded-xl p-4 shadow-lg border-l-4 ${
                notification.type === 'BUY'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Bell className={`w-5 h-5 mt-0.5 ${
                    notification.type === 'BUY' ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <div>
                    <p className={`font-bold text-sm mb-1 ${
                      notification.type === 'BUY' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {notification.type} Signal Detected!
                    </p>
                    <p className={`text-sm ${
                      notification.type === 'BUY' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LiveSimulator
