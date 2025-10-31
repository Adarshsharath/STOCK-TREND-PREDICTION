import React, { useState } from 'react'
import { Search, Loader2, LineChart, Activity } from 'lucide-react'
import axios from 'axios'
import StrategyChart from '../components/StrategyChart'
import InfoCard from '../components/InfoCard'
import WeatherAlerts from '../components/WeatherAlerts'
import NewsSentiment from '../components/NewsSentiment'
import SignalStrength from '../components/SignalStrength'

const STRATEGIES = [
  { id: 'ema_crossover', name: 'EMA Crossover' },
  { id: 'rsi', name: 'RSI Strategy' },
  { id: 'macd', name: 'MACD Strategy' },
  { id: 'bollinger_scalping', name: 'Bollinger Scalping' },
  { id: 'supertrend', name: 'SuperTrend' }
]

const Strategies = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('ema_crossover')
  const [symbol, setSymbol] = useState('AAPL')
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchStrategy = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await axios.get('/api/strategy', {
        params: {
          name: selectedStrategy,
          symbol: symbol.toUpperCase(),
          period
        },
        timeout: 60000 // 60 second timeout
      })

      if (response.data && response.data.data) {
        setData(response.data)
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Strategy fetch error:', err)
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout - please try a shorter period or different symbol')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.message) {
        setError(`Error: ${err.message}`)
      } else {
        setError('Failed to fetch strategy data. Please check if backend is running.')
      }
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchStrategy()
  }

  return (
    <div className="space-y-6">
      {/* Weather Alerts */}
      <WeatherAlerts />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <LineChart className="w-6 h-6" />
          <span className="text-sm font-medium">Trading Strategy Analysis</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Trading Strategies</h1>
        <p className="text-white text-opacity-90">
          Backtest and visualize professional trading strategies on real market data
        </p>
      </div>

      {/* Controls */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Strategy</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {STRATEGIES.map(strategy => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, TSLA"
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Loading Message */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-blue-800 font-medium">Analyzing {symbol} with {STRATEGIES.find(s => s.id === selectedStrategy)?.name}...</p>
          <p className="text-blue-600 text-sm mt-2">This may take 10-30 seconds depending on the period selected.</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-2">Try a different symbol or shorter period, or check if the backend is running.</p>
        </div>
      )}

      {/* Results */}
      {data && (
        <>
          {/* Main Strategy Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StrategyChart
                data={data.data}
                buySignals={data.buy_signals}
                sellSignals={data.sell_signals}
                strategyName={data.metadata.name}
              />
            </div>
            <div className="space-y-4">
              <InfoCard
                title={data.metadata.name}
                description={data.metadata.description}
                parameters={data.metadata.parameters}
              />
              <div className="bg-white rounded-xl p-6 shadow-card">
                <h3 className="text-lg font-semibold text-text mb-4">Signal Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-text">Buy Signals</span>
                    <span className="text-xl font-bold text-success">{data.buy_signals.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-text">Sell Signals</span>
                    <span className="text-xl font-bold text-danger">{data.sell_signals.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Signal Strength */}
            <SignalStrength 
              buySignals={data.buy_signals} 
              sellSignals={data.sell_signals}
            />
            
            {/* News Sentiment */}
            <NewsSentiment symbol={symbol} />
          </div>
        </>
      )}
    </div>
  )
}

export default Strategies
