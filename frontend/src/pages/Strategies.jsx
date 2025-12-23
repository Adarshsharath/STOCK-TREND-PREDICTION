import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, ChevronRight, Filter, HelpCircle, Lightbulb } from 'lucide-react'
import { strategiesData } from '../data/strategiesData'
import { useAuth } from '../context/AuthContext'

const Strategies = () => {
  const navigate = useNavigate()
  const { experienceLevel } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(true)

  const isBeginner = experienceLevel === 'beginner'

  // Get unique categories
  const categories = ['all', ...new Set(strategiesData.map(s => s.category))]

  // Filter strategies
  const filteredStrategies = strategiesData.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStrategyClick = (strategyId) => {
    navigate(`/strategies/${strategyId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6" />
          <span className="text-sm font-medium">Professional Trading Strategies</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Trading Strategies</h1>
        <p className="text-white text-opacity-90 text-lg">
          {isBeginner ? (
            <>Discover trading strategies that help you make informed decisions. Each strategy uses different market signals to identify buying and selling opportunities.</>
          ) : (
            <>Analyze stocks with 10 powerful trading strategies. Each with multiple sub-strategies and timeframes.</>
          )}
        </p>
      </div>

      {/* Beginner Guide */}
      {isBeginner && showBeginnerGuide && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-3 rounded-xl text-white flex-shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text dark:text-dark-text mb-2">📚 New to Trading Strategies?</h3>
                <p className="text-sm text-text-light dark:text-dark-text-secondary mb-3">
                  Trading strategies are systematic methods used to decide when to buy or sell stocks. Think of them as rules based on market data (like price and volume) that help remove emotion from trading decisions.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span className="text-text-light dark:text-dark-text-secondary">
                      <strong className="text-text dark:text-dark-text">Trend Following:</strong> Strategies like EMA and MACD help you follow market momentum
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <span className="text-text-light dark:text-dark-text-secondary">
                      <strong className="text-text dark:text-dark-text">Mean Reversion:</strong> Strategies like RSI and Bollinger Bands find oversold/overbought conditions
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                    <span className="text-text-light dark:text-dark-text-secondary">
                      <strong className="text-text dark:text-dark-text">Volatility-Based:</strong> Strategies like SuperTrend adapt to market volatility
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-3">
                  💡 Tip: Start with simpler strategies like EMA Crossover or RSI before moving to complex ones like Ichimoku Cloud.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBeginnerGuide(false)}
              className="text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text text-sm flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted dark:text-dark-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search strategies..."
              className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-bg-elevated text-text dark:text-dark-text"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted dark:text-dark-text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white dark:bg-dark-bg-elevated text-text dark:text-dark-text"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStrategies.map(strategy => (
          <div
            key={strategy.id}
            onClick={() => handleStrategyClick(strategy.id)}
            className="group bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card hover:shadow-lg dark:hover:shadow-neon transition-all cursor-pointer border-2 border-transparent hover:border-primary dark:hover:border-neon-purple"
          >
            {/* Icon and Name */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${strategy.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                  {strategy.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-neon-purple transition-colors">
                    {strategy.name}
                  </h3>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">{strategy.category}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted dark:text-dark-text-muted group-hover:text-primary dark:group-hover:text-neon-purple group-hover:translate-x-1 transition-all" />
            </div>

            {/* Description */}
            <p className="text-sm text-text-light dark:text-dark-text-secondary mb-4 line-clamp-2">
              {strategy.description}
            </p>

            {/* Sub-strategies count */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-dark-border">
              <span className="text-xs text-text-muted dark:text-dark-text-muted">
                {strategy.subStrategies.length} Sub-Strategies
              </span>
              <span className="text-xs font-semibold text-primary dark:text-neon-purple">
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredStrategies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted dark:text-dark-text-muted">No strategies found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default Strategies
