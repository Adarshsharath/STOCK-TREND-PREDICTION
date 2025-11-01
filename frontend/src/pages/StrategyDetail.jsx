import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Clock, Settings, Play, Loader2, AlertCircle, DollarSign, TrendingDown } from 'lucide-react'
import axios from 'axios'
import StrategyChart from '../components/StrategyChart'
import MarketValuation from '../components/MarketValuation'
import NewsSentiment from '../components/NewsSentiment'
import SignalStrength from '../components/SignalStrength'
import { strategiesData } from '../data/strategiesData'

// Timeframe enforcement mapping
const strategyTimeframes = {
  'ema-crossover': ['5min', '15min', '30min', '1h', '4h', '1d'],
  'rsi': ['15min', '30min', '1h', '1d'],
  'macd': ['1h', '4h', '1d', '1wk'],
  'bollinger': ['5min', '15min', '1h', '1d'],
  'supertrend': ['15min', '30min', '1h', '1d'],
  'ichimoku': ['1h', '4h', '1d', '1wk'],
  'adx-dmi': ['15min', '1h', '1d'],
  'vwap': ['1min', '5min', '15min'],
  'breakout': ['1h', '4h', '1d'],
  'ml-lstm': ['1d', '1wk']
}

const timeframeLabels = {
  '1min': '1 Minute (Scalping)',
  '5min': '5 Minutes (Scalping)',
  '15min': '15 Minutes (Intraday)',
  '30min': '30 Minutes (Intraday)',
  '1h': '1 Hour (Intraday/Swing)',
  '4h': '4 Hours (Swing)',
  '1d': '1 Day (Swing/Position)',
  '1wk': '1 Week (Position)'
}

const StrategyDetail = () => {
  const { strategyId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const strategy = strategiesData.find(s => s.id === strategyId)
  const fromFinance = location.state?.fromFinance || sessionStorage.getItem('returnToFinance') === 'true'
  
  const [selectedSubStrategy, setSelectedSubStrategy] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')
  const [symbol, setSymbol] = useState('RELIANCE.NS')
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // Get valid timeframes for current strategy
  const validTimeframes = strategyTimeframes[strategyId] || ['1d']
  const isTimeframeValid = (tf) => validTimeframes.includes(tf)

  useEffect(() => {
    if (strategy && strategy.subStrategies.length > 0) {
      setSelectedSubStrategy(strategy.subStrategies[0].id)
    }
    // Auto-set first valid timeframe for this strategy
    if (strategyId && validTimeframes.length > 0) {
      setSelectedTimeframe(validTimeframes[0])
    }
  }, [strategy, strategyId])

  if (!strategy) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Strategy not found</p>
        <button
          onClick={() => navigate('/strategies')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Strategies
        </button>
      </div>
    )
  }

  // All timeframes with validity check
  const allTimeframes = [
    { value: '1min', label: '1 Minute' },
    { value: '5min', label: '5 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1wk', label: '1 Week' }
  ]

  // Get timeframe recommendation text
  const getTimeframeRecommendation = () => {
    const labels = validTimeframes.map(tf => timeframeLabels[tf] || tf)
    if (validTimeframes.includes('1min') || validTimeframes.includes('5min')) {
      return `⏱ Recommended: ${labels.join(', ')} | Best for Scalping/Intraday`
    } else if (validTimeframes.includes('1d') || validTimeframes.includes('1wk')) {
      return `⏱ Recommended: ${labels.join(', ')} | Best for Swing/Position Trading`
    } else {
      return `⏱ Recommended: ${labels.join(', ')} | Best for Intraday/Swing Trading`
    }
  }

  const selectedSubStrategyData = strategy.subStrategies.find(s => s.id === selectedSubStrategy)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Map strategy IDs to backend strategy names (with underscores)
      const strategyMapping = {
        'ema-crossover': 'ema_crossover',
        'rsi': 'rsi',
        'macd': 'macd',
        'bollinger': 'bollinger_scalping',
        'supertrend': 'supertrend',
        'ml-lstm': 'ml_lstm',
        'ichimoku': 'ichimoku',
        'adx-dmi': 'adx_dmi',
        'vwap': 'vwap',
        'breakout': 'breakout'
      }

      const backendStrategyName = strategyMapping[strategyId]
      
      if (!backendStrategyName) {
        setError('This strategy is not yet implemented. Please try another strategy.')
        setLoading(false)
        return
      }

      const params = {
        name: backendStrategyName,
        symbol: symbol.toUpperCase(),
        period: period
      }

      const response = await axios.get('/api/strategy', { params })
      
      // Transform backend response to expected format
      const transformedResults = {
        data: response.data.data,
        buy_signals: response.data.buy_signals || [],
        sell_signals: response.data.sell_signals || [],
        metadata: response.data.metadata || {},
        // Combine buy and sell signals for display
        signals: [
          ...(response.data.buy_signals || []).map(s => ({ ...s, signal: 'BUY' })),
          ...(response.data.sell_signals || []).map(s => ({ ...s, signal: 'SELL' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date))
      }
      
      setResults(transformedResults)
    } catch (err) {
      console.error('Strategy analysis error:', err)
      setError(err.response?.data?.error || 'Failed to analyze strategy. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => {
          if (fromFinance) {
            sessionStorage.removeItem('returnToFinance')
            navigate('/finance')
          } else {
            navigate('/strategies')
          }
        }}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{fromFinance ? 'Back to Smart Start' : 'Back to Strategies'}</span>
      </button>

      {/* Strategy Header */}
      <div className={`bg-gradient-to-r ${strategy.color} text-white rounded-2xl p-8`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">{strategy.icon}</span>
              <div>
                <h1 className="text-3xl font-bold">{strategy.name}</h1>
                <p className="text-white text-opacity-90">{strategy.category}</p>
              </div>
            </div>
            <p className="text-lg text-white text-opacity-95 max-w-2xl mb-4">
              {strategy.description}
            </p>
            
            {/* Ideal Timeframes */}
            <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
              <p className="text-sm font-semibold mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Ideal Timeframes
              </p>
              <ul className="space-y-1">
                {strategy.idealTimeframes.map((tf, index) => (
                  <li key={index} className="text-sm">• {tf}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Tip */}
      {strategy.bonusTip && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div>
              <p className="font-semibold text-yellow-900 mb-1">Pro Tip</p>
              <p className="text-yellow-800 text-sm">{strategy.bonusTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-text">Configure Analysis</h2>
        </div>

        {/* Sub-Strategy Selection - Enhanced */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-light mb-3">
            Select Sub-Strategy Variant
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strategy.subStrategies.map(sub => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubStrategy(sub.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSubStrategy === sub.id
                    ? 'border-primary bg-blue-50'
                    : 'border-border bg-white hover:border-primary hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-text text-sm">{sub.name}</h4>
                  {selectedSubStrategy === sub.id && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
                <p className="text-xs text-text-light mb-2">{sub.description}</p>
                {sub.params && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(sub.params).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 bg-primary bg-opacity-10 text-primary text-xs rounded-full"
                      >
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Timeframe Selection */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Timeframe
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {allTimeframes.map(tf => (
                <option 
                  key={tf.value} 
                  value={tf.value}
                  disabled={!isTimeframeValid(tf.value)}
                  className={!isTimeframeValid(tf.value) ? 'text-gray-400' : ''}
                >
                  {tf.label} {!isTimeframeValid(tf.value) ? '(Not supported)' : ''}
                </option>
              ))}
            </select>
            {/* Timeframe Recommendation */}
            <div className="mt-2 flex items-start space-x-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{getTimeframeRecommendation()}</p>
            </div>
          </div>

          {/* Stock Symbol */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., RELIANCE.NS, TCS.NS"
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Data Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analyze Button - Moved above panels */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <button
          onClick={handleAnalyze}
          disabled={loading || !symbol}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Analyze Strategy</span>
            </>
          )}
        </button>
      </div>

      {/* Market Info Panels - Only visible when no results */}
      {symbol && !results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MarketValuation symbol={symbol} />
          <NewsSentiment symbol={symbol} />
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Strategy Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-muted mb-2">Understanding {strategy.name}</p>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-sm text-text-light leading-relaxed">{strategy.description}</p>
                </div>
              </div>
              
              {selectedSubStrategyData && (
                <>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold text-text mb-2">Selected Sub-Strategy</p>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900">{selectedSubStrategyData.name}</p>
                      <p className="text-xs text-blue-700 mt-1">{selectedSubStrategyData.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold text-text mb-2">Best Use Case</p>
                    <p className="text-xs text-text-light">{selectedSubStrategyData.description}</p>
                  </div>
                </>
              )}

              <div className="border-t border-border pt-3">
                <p className="text-sm font-semibold text-text mb-2">Typical Timeframe</p>
                <p className="text-xs text-text-light">{selectedTimeframe}</p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm font-semibold text-text mb-2">💡 Pro Tip</p>
                <p className="text-xs text-text-light italic">{strategy.bonusTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Strategy Info */}
          {results.metadata && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-text mb-4">{results.metadata.name}</h3>
              <p className="text-text-light mb-4">{results.metadata.description}</p>
              
              {/* Signal Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-text-muted uppercase mb-1">Buy Signals</p>
                  <p className="text-2xl font-bold text-success">{results.buy_signals.length}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-text-muted uppercase mb-1">Sell Signals</p>
                  <p className="text-2xl font-bold text-danger">{results.sell_signals.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-text-muted uppercase mb-1">Total Signals</p>
                  <p className="text-2xl font-bold text-primary">
                    {results.buy_signals.length + results.sell_signals.length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-text-muted uppercase mb-1">Strategy Type</p>
                  <p className="text-lg font-bold text-purple-600">{strategy.category}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Chart */}
          {results.data && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-text mb-4">Chart Analysis</h3>
              <StrategyChart
                data={results.data}
                buySignals={results.buy_signals}
                sellSignals={results.sell_signals}
                strategyName={results.metadata?.name || strategy.name}
              />
            </div>
          )}


        </div>
      )}
    </div>
  )
}

export default StrategyDetail
