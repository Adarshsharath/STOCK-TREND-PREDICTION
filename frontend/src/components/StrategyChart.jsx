import React from 'react'
import Plot from 'react-plotly.js'

const StrategyChart = ({ data, buySignals, sellSignals, strategyName }) => {
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

  const traces = [
    {
      x: dates,
      y: prices,
      type: 'scatter',
      mode: 'lines',
      name: 'Price',
      line: { color: '#38bdf8', width: 2 }
    },
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
      title: 'Price ($)',
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
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '500px' }}
        useResizeHandler={true}
      />
    </div>
  )
}

export default StrategyChart
