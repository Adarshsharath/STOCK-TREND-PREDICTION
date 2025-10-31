import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, ChevronRight, Filter } from 'lucide-react'
import { strategiesData } from '../data/strategiesData'

const Strategies = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

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
          Analyze stocks with 10 powerful trading strategies. Each with multiple sub-strategies and timeframes.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search strategies..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
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
            className="group bg-white rounded-xl p-6 shadow-card hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary"
          >
            {/* Icon and Name */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${strategy.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                  {strategy.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {strategy.name}
                  </h3>
                  <p className="text-xs text-text-muted">{strategy.category}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            {/* Description */}
            <p className="text-sm text-text-light mb-4 line-clamp-2">
              {strategy.description}
            </p>

            {/* Sub-strategies count */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-text-muted">
                {strategy.subStrategies.length} Sub-Strategies
              </span>
              <span className="text-xs font-semibold text-primary">
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredStrategies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">No strategies found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default Strategies
