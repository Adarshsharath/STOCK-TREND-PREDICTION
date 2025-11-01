import React, { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, RefreshCw, Clock, Eye } from 'lucide-react'
import axios from 'axios'
import MarketIndexCard from '../components/MarketIndexCard'

const LiveMarket = () => {
  const [overview, setOverview] = useState(null)
  const [topMovers, setTopMovers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedMarket, setSelectedMarket] = useState('IN')

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const [overviewRes, moversRes] = await Promise.all([
        axios.get('/api/market-overview'),
        axios.get('/api/top-movers', { params: { market: selectedMarket, limit: 5 } })
      ])
      
      setOverview(overviewRes.data)
      setTopMovers(moversRes.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [selectedMarket])

  const formatTime = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6" />
            <span className="text-sm font-medium">Live Market Overview</span>
          </div>
          {/* Market Selection Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMarket('US')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMarket === 'US'
                  ? 'bg-white text-primary'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              US Markets
            </button>
            <button
              onClick={() => setSelectedMarket('IN')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMarket === 'IN'
                  ? 'bg-white text-primary'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Indian Markets
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {selectedMarket === 'US' ? 'US Markets' : 'India Markets'}
            </h1>
            <p className="text-white text-opacity-90">
              Real-time market indices, summaries, and top movers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="flex items-center space-x-2 text-white text-opacity-80">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Updated {formatTime(lastUpdated)}</span>
              </div>
            )}
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {loading && !overview ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Market Indices Grid */}
          {overview && overview.indices && (
            <div>
              <h2 className="text-xl font-bold text-text mb-4">
                {selectedMarket === 'US' ? 'US Market Indices' : 'Indian Market Indices'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(overview.indices)
                  .filter(([key]) => {
                    const indianIndices = ['nifty50', 'sensex', 'banknifty']
                    const usIndices = ['sp500', 'nasdaq', 'dowjones']
                    return selectedMarket === 'IN' 
                      ? indianIndices.includes(key)
                      : usIndices.includes(key)
                  })
                  .map(([key, data]) => (
                    <MarketIndexCard key={key} indexData={data} />
                  ))}
              </div>
            </div>
          )}

          {/* Market Summary */}
          {overview && overview.summary && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-text">Market Summary</h2>
                <span className="text-xs text-text-muted">
                  AI-Generated Insights
                </span>
              </div>

              <div className="space-y-4">
                {overview.summary.insights && overview.summary.insights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-text-light text-sm leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Movers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Gainers */}
            {topMovers && topMovers.gainers && (
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <h2 className="text-xl font-bold text-text">Top Gainers</h2>
                </div>
                <div className="space-y-3">
                  {topMovers.gainers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div>
                        <p className="font-semibold text-text">{stock.name}</p>
                        <p className="text-sm text-text-muted">{stock.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text">${stock.price.toFixed(2)}</p>
                        <p className="text-sm font-semibold text-success">
                          +{stock.change_percent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Losers */}
            {topMovers && topMovers.losers && (
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-danger" />
                  <h2 className="text-xl font-bold text-text">Top Losers</h2>
                </div>
                <div className="space-y-3">
                  {topMovers.losers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <div>
                        <p className="font-semibold text-text">{stock.name}</p>
                        <p className="text-sm text-text-muted">{stock.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text">${stock.price.toFixed(2)}</p>
                        <p className="text-sm font-semibold text-danger">
                          {stock.change_percent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default LiveMarket
