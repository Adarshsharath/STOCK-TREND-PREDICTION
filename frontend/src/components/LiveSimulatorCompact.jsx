import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Zap, Volume2, VolumeX } from 'lucide-react'
import Plot from 'react-plotly.js'
import axios from 'axios'
import SignalNotificationContainer from './SignalNotification'
import SignalDetailsModal from './SignalDetailsModal'
import NotificationBell from './NotificationBell'
import { playNotificationSound, requestNotificationPermission, showBrowserNotification } from '../utils/notificationSound'

const LiveSimulatorCompact = () => {
  const [symbol, setSymbol] = useState('AAPL')
  const [strategy, setStrategy] = useState('macd')
  const [speed, setSpeed] = useState(2)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [historicalData, setHistoricalData] = useState([])
  const [liveData, setLiveData] = useState([])
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState('')
  const [activeNotifications, setActiveNotifications] = useState([])
  const [notificationHistory, setNotificationHistory] = useState([])
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const intervalRef = useRef(null)
  const notificationIdRef = useRef(0)

  const STRATEGIES = [
    { id: 'ema_crossover', name: 'EMA Crossover' },
    { id: 'rsi', name: 'RSI' },
    { id: 'macd', name: 'MACD' },
    { id: 'bollinger_scalping', name: 'Bollinger Bands' },
    { id: 'supertrend', name: 'SuperTrend' },
    { id: 'ichimoku', name: 'Ichimoku Cloud' },
    { id: 'adx_dmi', name: 'ADX + DMI' },
    { id: 'vwap', name: 'VWAP' },
    { id: 'breakout', name: 'Breakout' },
    { id: 'ml_lstm', name: 'ML / LSTM' }
  ]

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      setBrowserNotificationsEnabled(granted)
    })
  }, [])

  const fetchHistoricalData = async () => {
    setLoading(true)
    setHistoricalData([])
    setLiveData([])
    setSignals([])
    setCurrentIndex(0)
    setActiveNotifications([])
    
    try {
      console.log(`[Simulator] Fetching data for ${symbol} with ${strategy} strategy...`)
      
      const response = await axios.get('/api/simulator-data', {
        params: { 
          symbol: symbol.toUpperCase(), 
          strategy: strategy 
        },
        timeout: 30000
      })
      
      console.log('[Simulator] Response received:', response.data)
      
      // Check if we have valid data
      if (response.data && response.data.success && response.data.data) {
        const dataPoints = response.data.data
        
        if (dataPoints.length > 0) {
          console.log(`[Simulator] ✓ Loaded ${dataPoints.length} data points`)
          console.log(`[Simulator] ✓ Buy signals: ${response.data.buy_signals}`)
          console.log(`[Simulator] ✓ Sell signals: ${response.data.sell_signals}`)
          console.log(`[Simulator] ✓ Data source: ${response.data.data_source}`)
          
          setHistoricalData(dataPoints)
          setDataSource(response.data.data_source || 'unknown')
          
          // Auto-start playback after loading
          setTimeout(() => {
            console.log('[Simulator] Auto-starting playback...')
            setIsPlaying(true)
          }, 800)
        } else {
          console.error('[Simulator] No data points in response')
          alert('Received empty data. Please try again.')
        }
      } else {
        console.error('[Simulator] Invalid response format:', response.data)
        alert('Invalid data format received. Please try again.')
      }
    } catch (err) {
      console.error('[Simulator] Error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to load data: ${errorMsg}\n\nPlease check if the backend server is running.`)
    } finally {
      setLoading(false)
    }
  }

  // No auto-fetch on mount - user clicks Start to load data

  useEffect(() => {
    if (isPlaying && historicalData.length > 0 && currentIndex < historicalData.length) {
      const interval = 1000 / speed
      
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1
          
          if (nextIndex >= historicalData.length) {
            setIsPlaying(false)
            return prevIndex
          }

          const newDataPoint = historicalData[nextIndex]
          setLiveData(prev => [...prev, newDataPoint])
          
          if (newDataPoint.signal !== 0) {
            const signalType = newDataPoint.signal === 1 ? 'BUY' : 'SELL'
            const strategyName = STRATEGIES.find(s => s.id === strategy)?.name || strategy
            
            const signal = {
              type: signalType,
              price: newDataPoint.close,
              index: nextIndex,
              strategyId: strategy,
              strategyName: strategyName,
              symbol: symbol,
              date: newDataPoint.date,
              timestamp: Date.now()
            }
            
            setSignals(prev => [...prev, signal])
            
            // Create notification
            const notification = {
              id: notificationIdRef.current++,
              ...signal
            }
            
            // Add to active notifications (will auto-dismiss)
            setActiveNotifications(prev => [...prev, notification])
            
            // Add to history (persists)
            setNotificationHistory(prev => [notification, ...prev])
            
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
              setActiveNotifications(prev => prev.filter(n => n.id !== notification.id))
            }, 3000)
            
            // Play sound
            if (soundEnabled) {
              playNotificationSound(signalType.toLowerCase())
            }
            
            // Show browser notification
            if (browserNotificationsEnabled) {
              showBrowserNotification(signal)
            }
            
            console.log(`[Signal] ${signalType} - ${strategyName} at ₹${newDataPoint.close.toFixed(2)}`)
          }
          
          return nextIndex
        })
      }, interval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isPlaying, speed, currentIndex, historicalData, strategy, symbol, soundEnabled, browserNotificationsEnabled])

  const handlePlayPause = () => {
    if (historicalData.length === 0) {
      fetchHistoricalData()
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
    setLiveData([])
    setSignals([])
    setActiveNotifications([])
  }

  const handleCloseNotification = (notificationId) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleMoreInfo = (notification) => {
    setSelectedSignal(notification)
    handleCloseNotification(notification.id)
  }

  const handleClearAllHistory = () => {
    setNotificationHistory([])
  }

  const handleRemoveFromHistory = (notificationId) => {
    setNotificationHistory(prev => prev.filter(n => n.id !== notificationId))
  }

  const chartData = liveData.length > 0 ? liveData : []
  const dates = chartData.map(d => d.date)
  const prices = chartData.map(d => d.close)
  const buySignals = signals.filter(s => s.type === 'BUY')
  const sellSignals = signals.filter(s => s.type === 'SELL')

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0
  const previousPrice = chartData.length > 1 ? chartData[0].close : currentPrice
  const priceChange = currentPrice - previousPrice
  const isPositive = priceChange >= 0

  return (
    <>
      {/* Notifications */}
      <SignalNotificationContainer
        notifications={activeNotifications}
        onClose={handleCloseNotification}
        onMoreInfo={handleMoreInfo}
      />

      {/* Signal Details Modal */}
      {selectedSignal && (
        <SignalDetailsModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}

      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <Zap className="w-7 h-7 mr-2" />
            Live Market Simulator
            {dataSource && (
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                dataSource === 'yahoo_finance' 
                  ? 'bg-green-400 bg-opacity-30 text-green-100' 
                  : 'bg-yellow-400 bg-opacity-30 text-yellow-100'
              }`}>
                {dataSource === 'yahoo_finance' ? '📊 Real Data' : '🎲 Demo Data'}
              </span>
            )}
          </h2>
          <p className="text-white text-opacity-90">
            Real-time market simulation with AI-powered signal detection
          </p>
        </div>
        {/* Notification Bell */}
        <div className="flex items-center space-x-4">
          <NotificationBell
            notifications={notificationHistory}
            onClearAll={handleClearAllHistory}
            onRemove={handleRemoveFromHistory}
            onSelectNotification={(notification) => setSelectedSignal(notification)}
          />
          {chartData.length > 0 && (
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm text-white text-opacity-75 mb-1">Current Price</p>
              <p className="text-2xl font-bold">₹{currentPrice.toFixed(2)}</p>
              <div className={`text-sm font-semibold ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{((priceChange / previousPrice) * 100).toFixed(2)}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Stock Symbol"
            className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white"
            disabled={isPlaying}
          />
        </div>
        
        <div>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
            disabled={isPlaying}
          >
            {STRATEGIES.map(s => (
              <option key={s.id} value={s.id} className="text-gray-900">{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setSpeed(1)}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${
              speed === 1 ? 'bg-white text-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setSpeed(2)}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${
              speed === 2 ? 'bg-white text-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
            }`}
          >
            2x
          </button>
          <button
            onClick={() => setSpeed(4)}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${
              speed === 4 ? 'bg-white text-purple-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
            }`}
          >
            4x
          </button>
        </div>

        <button
          onClick={handlePlayPause}
          disabled={loading}
          className="bg-white text-purple-600 hover:bg-opacity-90 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{loading ? 'Loading...' : isPlaying ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={handleReset}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center"
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Signals Summary */}
      {chartData.length > 0 && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2 bg-green-500 bg-opacity-30 px-4 py-2 rounded-lg">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Buy Signals: {buySignals.length}</span>
          </div>
          <div className="flex items-center space-x-2 bg-red-500 bg-opacity-30 px-4 py-2 rounded-lg">
            <TrendingDown className="w-5 h-5" />
            <span className="font-semibold">Sell Signals: {sellSignals.length}</span>
          </div>
          <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${(currentIndex / historicalData.length) * 100}%` }}
            />
          </div>
          <span className="text-sm">{currentIndex}/{historicalData.length}</span>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden">
          <Plot
            data={[
              {
                x: dates,
                y: prices,
                type: 'scatter',
                mode: 'lines',
                name: 'Price',
                line: { color: '#6366f1', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(99, 102, 241, 0.1)'
              },
              {
                x: buySignals.map(s => chartData[s.index]?.date),
                y: buySignals.map(s => s.price),
                type: 'scatter',
                mode: 'markers',
                name: 'Buy',
                marker: { color: '#10b981', size: 12, symbol: 'triangle-up' }
              },
              {
                x: sellSignals.map(s => chartData[s.index]?.date),
                y: sellSignals.map(s => s.price),
                type: 'scatter',
                mode: 'markers',
                name: 'Sell',
                marker: { color: '#ef4444', size: 12, symbol: 'triangle-down' }
              }
            ]}
            layout={{
              autosize: true,
              height: 400,
              margin: { l: 50, r: 30, t: 20, b: 40 },
              xaxis: { showgrid: false, title: '' },
              yaxis: { showgrid: true, gridcolor: '#f3f4f6', title: 'Price ($)' },
              showlegend: true,
              legend: { x: 0, y: 1, bgcolor: 'rgba(255,255,255,0.8)' },
              plot_bgcolor: '#ffffff',
              paper_bgcolor: '#ffffff'
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {loading && (
        <div className="bg-white bg-opacity-10 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-xl mb-2 font-semibold">Loading Market Data...</p>
          <p className="text-white text-opacity-75">
            Fetching {symbol} data with {STRATEGIES.find(s => s.id === strategy)?.name} strategy
          </p>
        </div>
      )}

      {!chartData.length && !loading && (
        <div className="bg-white bg-opacity-10 rounded-xl p-8 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Ready to simulate market data</p>
          <p className="text-white text-opacity-75 text-sm mb-4">
            Click "Start" to load and play historical market data with live signal detection
          </p>
          <p className="text-white text-opacity-60 text-xs">
            💡 Try stocks: AAPL, MSFT, GOOGL, TSLA, AMZN
          </p>
        </div>
      )}
    </div>
    </>
  )
}

export default LiveSimulatorCompact
