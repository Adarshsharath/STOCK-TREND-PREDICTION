import React from 'react'
import Plot from 'react-plotly.js'

const PredictionChart = ({ predictions, actual, dates, modelName, metrics }) => {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-gray-500">No predictions to display</p>
      </div>
    )
  }

  const traces = [
    {
      x: dates,
      y: actual,
      type: 'scatter',
      mode: 'lines',
      name: 'Actual Price',
      line: { color: '#38bdf8', width: 2 }
    },
    {
      x: dates,
      y: predictions,
      type: 'scatter',
      mode: 'lines',
      name: 'Predicted Price',
      line: { color: '#22c55e', width: 2, dash: 'dot' }
    }
  ]

  const layout = {
    title: {
      text: `${modelName} - Price Prediction`,
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
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-card">
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
        />
      </div>

      {metrics && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">MAE</p>
            <p className="text-2xl font-bold text-primary">₹{metrics.mae?.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">RMSE</p>
            <p className="text-2xl font-bold text-primary">₹{metrics.rmse?.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Directional Accuracy</p>
            <p className="text-2xl font-bold text-success">{metrics.directional_accuracy?.toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionChart
