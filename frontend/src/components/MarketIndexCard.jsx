import React from 'react'
import Plot from 'react-plotly.js'
import { TrendingUp, TrendingDown } from 'lucide-react'

const MarketIndexCard = ({ indexData }) => {
  if (!indexData) return null

  const { name, price, change, change_percent, chart_data } = indexData
  const isPositive = change_percent >= 0

  // Prepare chart data
  const times = chart_data.map(d => d.time)
  const prices = chart_data.map(d => d.price)

  const trace = {
    x: times,
    y: prices,
    type: 'scatter',
    mode: 'lines',
    line: {
      color: isPositive ? '#10b981' : '#ef4444',
      width: 2
    },
    fill: 'tozeroy',
    fillcolor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    hoverinfo: 'y'
  }

  const layout = {
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { t: 0, r: 0, b: 0, l: 0 },
    xaxis: {
      visible: false,
      showgrid: false
    },
    yaxis: {
      visible: false,
      showgrid: false
    },
    hovermode: 'x'
  }

  const config = {
    displayModeBar: false,
    responsive: true
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-medium tracking-wide">{name}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
          isPositive ? 'bg-green-900/50' : 'bg-red-900/50'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs font-semibold ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? '+' : ''}{change_percent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-white mb-1">
          {price.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
        <div className={`text-sm font-medium ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}
        </div>
      </div>

      {/* Mini Chart */}
      {chart_data && chart_data.length > 0 && (
        <div style={{ height: '60px', marginTop: '10px' }}>
          <Plot
            data={[trace]}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>
      )}
    </div>
  )
}

export default MarketIndexCard
