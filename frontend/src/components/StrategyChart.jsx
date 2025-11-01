import React, { useState } from 'react'
import Plot from 'react-plotly.js'
import { BarChart3, TrendingUp } from 'lucide-react'

const StrategyChart = ({ data, buySignals, sellSignals, strategyName }) => {
  const [isCandlestick, setIsCandlestick] = useState(false)
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-gray-500">No data to display</p>
      </div>
    )
  }

  const dates = data.map(d => d.date)
  const prices = data.map(d => d.close)
  const buyDates = buySignals.map(s => s.date)
  const buyPrices = buySignals.map(s => s.close)
  const sellDates = sellSignals.map(s => s.date)
  const sellPrices = sellSignals.map(s => s.close)

  // Price trace - either line or candlestick
  const priceTrace = isCandlestick ? {
    x: dates,
    open: data.map(d => d.open),
    high: data.map(d => d.high),
    low: data.map(d => d.low),
    close: data.map(d => d.close),
    type: 'candlestick',
    name: 'Price',
    increasing: { line: { color: '#22c55e' } },
    decreasing: { line: { color: '#ef4444' } }
  } : {
    x: dates,
    y: prices,
    type: 'scatter',
    mode: 'lines',
    name: 'Price',
    line: { color: '#38bdf8', width: 2 }
  }

  const traces = [
    priceTrace,
    {
      x: buyDates,
      y: buyPrices,
      type: 'scatter',
      mode: 'markers',
      name: 'Buy Signal',
      marker: {
        color: '#22c55e',
        size: 10,
        symbol: 'triangle-up'
      }
    },
    {
      x: sellDates,
      y: sellPrices,
      type: 'scatter',
      mode: 'markers',
      name: 'Sell Signal',
      marker: {
        color: '#ef4444',
        size: 10,
        symbol: 'triangle-down'
      }
    }
  ]

  const layout = {
    title: {
      text: `${strategyName} - Trading Signals`,
      font: { color: '#1e293b', size: 18, family: 'Inter' }
    },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#f8fafc',
    xaxis: {
      title: 'Date',
      gridcolor: '#e2e8f0',
      color: '#64748b'
    },
    yaxis: {
      title: 'Price (₹)',
      gridcolor: '#e2e8f0',
      color: '#64748b'
    },
    legend: {
      font: { color: '#64748b' },
      bgcolor: '#ffffff',
      bordercolor: '#e2e8f0',
      borderwidth: 1
    },
    hovermode: 'x unified',
    margin: { t: 50, r: 30, b: 50, l: 60 }
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      {/* Chart Type Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">Chart View</h3>
        <button
          onClick={() => setIsCandlestick(prev => !prev)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isCandlestick
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          {isCandlestick ? (
            <>
              <BarChart3 className="w-4 h-4" />
              <span>Candlestick</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>Line Chart</span>
            </>
          )}
        </button>
      </div>

      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '650px' }}
        useResizeHandler={true}
      />
    </div>
  )
}

export default StrategyChart
