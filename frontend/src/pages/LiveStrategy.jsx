import React, { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Volume2, VolumeX, Bell, BellOff, Activity } from 'lucide-react'
import axios from 'axios'
import StrategyChart from '../components/StrategyChart'
import SignalNotificationContainer from '../components/SignalNotification'
import SignalDetailsModal from '../components/SignalDetailsModal'
import NotificationBell from '../components/NotificationBell'
import { playNotificationSound, requestNotificationPermission, showBrowserNotification } from '../utils/notificationSound'

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

const RESOLUTIONS = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '60m' }
]

const REFRESH_OPTIONS = [
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' }
]

const LiveStrategy = () => {
  const [symbol, setSymbol] = useState('RELIANCE.NS')
  const [strategy, setStrategy] = useState('ema_crossover')
  const [resolution, setResolution] = useState('5')
  const [lookback, setLookback] = useState(240)
  const [refreshSeconds, setRefreshSeconds] = useState(15)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [results, setResults] = useState(null)
  const [marketStatus, setMarketStatus] = useState(null)

  const [activeNotifications, setActiveNotifications] = useState([])
  const [notificationHistory, setNotificationHistory] = useState([])
  const [selectedSignal, setSelectedSignal] = useState(null)

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  const notificationIdRef = useRef(0)
  const lastEmittedKeyRef = useRef(null)
  const pollingRef = useRef(null)

  const strategyName = useMemo(() => STRATEGIES.find(s => s.id === strategy)?.name || strategy, [strategy])

  // Validate stock symbol format
  const isValidSymbol = (sym) => {
    if (!sym || typeof sym !== 'string') return false
    const trimmed = sym.trim()
    // Valid symbols should be at least 2 characters and contain letters/numbers/dots/hyphens
    // Examples: AAPL, RELIANCE.NS, BRK.B, BRK-A
    return trimmed.length >= 2 && /^[A-Z0-9][A-Z0-9.\-]*$/i.test(trimmed)
  }

  useEffect(() => {
    requestNotificationPermission().then(granted => setBrowserNotificationsEnabled(granted))
  }, [])

  const pushSignalNotification = (signal) => {
    const notification = {
      id: notificationIdRef.current++,
      ...signal,
      timestamp: Date.now()
    }

    setActiveNotifications(prev => [...prev, notification])
    setNotificationHistory(prev => [notification, ...prev])

    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 3000)

    if (soundEnabled) {
      playNotificationSound(notification.type === 'BUY' ? 'buy' : 'sell')
    }

    if (browserNotificationsEnabled) {
      showBrowserNotification(notification)
    }
  }

  const fetchLive = async ({ silent = false } = {}) => {
    // Validate symbol before fetching
    if (!isValidSymbol(symbol)) {
      if (!silent) {
        setError('Please enter a valid stock symbol (e.g., RELIANCE.NS, AAPL, TCS.NS)')
        setResults(null)
      }
      return
    }

    if (!silent) {
      setLoading(true)
    }
    setError(null)

    try {
      const res = await axios.get('/api/strategy/live', {
        params: {
          name: strategy,
          symbol: symbol.toUpperCase(),
          resolution,
          lookback
        },
        timeout: 20000
      })

      const data = res.data
      setResults(data)
      setMarketStatus(data.market_status)
      setLastUpdated(new Date())

      // Only emit notifications if market is open AND alerts are enabled
      const isMarketOpen = data.market_status?.is_open !== false
      if (alertsEnabled && isMarketOpen && data?.latest_signal?.type && data?.latest_signal?.date) {
        const key = `${data.latest_signal.type}|${data.latest_signal.date}|${strategy}|${symbol.toUpperCase()}|${resolution}`

        if (lastEmittedKeyRef.current !== key) {
          lastEmittedKeyRef.current = key

          pushSignalNotification({
            type: data.latest_signal.type,
            price: Number(data.latest_signal.close || 0),
            strategyId: strategy,
            strategyName,
            symbol: symbol.toUpperCase(),
            date: data.latest_signal.date
          })
        }
      }
    } catch (err) {
      console.error('Live strategy fetch error:', err)
      if (!silent) {
        setError(err.response?.data?.error || 'Failed to fetch live strategy data')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    // Only fetch if symbol is valid
    if (isValidSymbol(symbol)) {
      fetchLive()
      // reset emitted key when changing query so we can get first signal of new selection
      lastEmittedKeyRef.current = null
    } else {
      setError('Please enter a valid stock symbol (minimum 2 characters)')
      setResults(null)
    }
  }, [symbol, strategy, resolution, lookback])

  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    // Only set up polling if symbol is valid
    if (isValidSymbol(symbol)) {
      pollingRef.current = setInterval(() => {
        fetchLive({ silent: true })
      }, refreshSeconds * 1000)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [refreshSeconds, symbol, strategy, resolution, lookback, alertsEnabled, soundEnabled, browserNotificationsEnabled])

  const handleCloseNotification = (id) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleMoreInfo = (notification) => {
    setSelectedSignal(notification)
    handleCloseNotification(notification.id)
  }

  const handleClearAllHistory = () => {
    setNotificationHistory([])
  }

  const handleRemoveFromHistory = (id) => {
    setNotificationHistory(prev => prev.filter(n => n.id !== id))
  }

  const chartData = results?.data || []
  const buySignals = results?.buy_signals || []
  const sellSignals = results?.sell_signals || []

  return (
    <>
      <SignalNotificationContainer
        notifications={activeNotifications}
        onClose={handleCloseNotification}
        onMoreInfo={handleMoreInfo}
      />

      {selectedSignal && (
        <SignalDetailsModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}

      <div className="space-y-6">
        {/* Dedicated Live Strategy Top Bar */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-5 shadow-card dark:shadow-dark-card border border-border dark:border-dark-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary dark:text-neon-purple" />
                <h1 className="text-lg font-bold text-text dark:text-dark-text">Live Strategy Signals</h1>
              </div>
              <div className="lg:hidden">
                <NotificationBell
                  notifications={notificationHistory}
                  onClearAll={handleClearAllHistory}
                  onRemove={handleRemoveFromHistory}
                  onSelectNotification={(n) => setSelectedSignal(n)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 flex-1">
              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1">Stock</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-dark-bg-elevated text-text dark:text-dark-text focus:outline-none focus:ring-2 ${
                    symbol && !isValidSymbol(symbol)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border dark:border-dark-border focus:ring-primary'
                  }`}
                  placeholder="e.g. RELIANCE.NS"
                />
                {symbol && !isValidSymbol(symbol) && (
                  <p className="text-xs text-red-500 mt-1">Invalid symbol format (min 2 chars)</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1">Strategy</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {STRATEGIES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1">Interval</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {RESOLUTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1">Refresh</label>
                <select
                  value={refreshSeconds}
                  onChange={(e) => setRefreshSeconds(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {REFRESH_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => fetchLive()}
                  disabled={loading || !isValidSymbol(symbol)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => setAlertsEnabled(v => !v)}
                className={`p-2.5 rounded-lg border transition ${
                  alertsEnabled
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border'
                }`}
                title={alertsEnabled ? 'Alerts enabled' : 'Alerts disabled'}
              >
                {alertsEnabled ? (
                  <Bell className="w-5 h-5 text-green-600 dark:text-neon-green" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-500 dark:text-dark-text-muted" />
                )}
              </button>

              <button
                onClick={() => setSoundEnabled(v => !v)}
                className="p-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated hover:bg-gray-50 dark:hover:bg-dark-bg-card transition"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary dark:text-neon-purple" />
                ) : (
                  <VolumeX className="w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                )}
              </button>

              <NotificationBell
                notifications={notificationHistory}
                onClearAll={handleClearAllHistory}
                onRemove={handleRemoveFromHistory}
                onSelectNotification={(n) => setSelectedSignal(n)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <p className="text-xs text-text-muted dark:text-dark-text-muted">
                Data source: <span className="font-semibold">{results?.data_source || '—'}</span>
                {results?.resolution ? (
                  <>
                    {' '}| Resolution: <span className="font-semibold">{results.resolution}m</span>
                  </>
                ) : null}
              </p>
              {marketStatus && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                  marketStatus.is_open 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    marketStatus.is_open ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                  }`}></span>
                  <span>{marketStatus.market} {marketStatus.is_open ? 'OPEN' : 'CLOSED'}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              {chartData && chartData.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  📈 Showing {chartData.length} candles | Latest: {new Date(chartData[chartData.length - 1]?.date).toLocaleTimeString()}
                </p>
              )}
              <p className="text-xs text-text-muted dark:text-dark-text-muted">
                Last updated: <span className="font-semibold">{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {marketStatus && !marketStatus.is_open && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Market is Currently Closed</h3>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  {marketStatus.message}
                  {marketStatus.next_open && (
                    <span className="block mt-1">Next opens: {new Date(marketStatus.next_open).toLocaleString()}</span>
                  )}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
                  ⚠️ Signals shown are based on the last available trading session data. No new notifications will be triggered while market is closed.
                </p>
              </div>
            </div>
          </div>
        )}

        {marketStatus && marketStatus.is_open && chartData && chartData.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              🔄 <strong>Live Data:</strong> Market data may have a 5-15 minute delay. The chart shows the most recent available data from yfinance. Click refresh to get the latest candles.
            </p>
          </div>
        )}

        {/* Chart + signal overlay */}
        {chartData && chartData.length > 0 ? (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
            <StrategyChart
              data={chartData}
              buySignals={buySignals}
              sellSignals={sellSignals}
              strategyName={`${strategyName} (Live)`}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-10 shadow-card dark:shadow-dark-card text-center">
            <p className="text-text-muted dark:text-dark-text-muted">
              {loading ? 'Loading live data...' : 'No live data to display yet. Try Refresh.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default LiveStrategy
