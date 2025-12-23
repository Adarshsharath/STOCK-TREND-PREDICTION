import React, { useEffect, useMemo, useState } from 'react'
import { Star, Plus, Trash2, RefreshCcw, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import api from '../utils/api'

const Stat = ({ label, value }) => (
  <div className="text-sm">
    <div className="text-text-muted dark:text-dark-text-muted">{label}</div>
    <div className="font-semibold text-text dark:text-dark-text">{value ?? '-'}</div>
  </div>
)

const Sparkline = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-10" />
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-10">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary dark:text-neon-purple"
        points={points}
      />
    </svg>
  )
}

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Load favorites list
  const loadFavorites = async () => {
    try {
      const res = await api.get('/api/favorites')
      setFavorites(res.data.favorites || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load favorites')
    }
  }

  const loadSummary = async () => {
    if (!favorites.length) { setSummary({ symbols: [], data: [], errors: [] }); return }
    try {
      setRefreshing(true)
      const res = await api.get('/api/favorites/summary')
      setSummary(res.data)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load summary')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true)
      await loadFavorites()
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites.map(f => f.symbol).join(',')])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => loadSummary(), 30000)
    return () => clearInterval(id)
  }, [autoRefresh, favorites])

  const onAdd = async () => {
    const s = (symbol || '').trim().toUpperCase()
    if (!s) return
    setAdding(true)
    setError('')
    try {
      const res = await api.post('/api/favorites', { symbol: s })
      setFavorites(res.data.favorites || [])
      setSymbol('')
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to add favorite')
    } finally {
      setAdding(false)
    }
  }

  const onRemove = async (sym) => {
    try {
      await api.delete(`/api/favorites/${encodeURIComponent(sym)}`)
      await loadFavorites()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to remove favorite')
    }
  }

  const summaryMap = useMemo(() => {
    const map = new Map()
    if (summary?.data) {
      for (const row of summary.data) {
        map.set(row.symbol, row)
      }
    }
    return map
  }, [summary])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold">Favorites</h1>
            <p className="opacity-90">Track your most-traded symbols and today\'s moves at a glance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" className="accent-white" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            <span>Auto-refresh (30s)</span>
          </label>
          <button onClick={loadSummary} disabled={refreshing} className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center space-x-2">
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-card dark:shadow-dark-card">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-3 space-y-3 md:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-2">Add Symbol</label>
            <input
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, INFY.NS"
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={onAdd}
            disabled={adding}
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> <span>Add</span>
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        {summary?.errors && summary.errors.length > 0 && (
          <div className="mt-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            Some symbols could not be loaded:
            <ul className="list-disc ml-5 mt-1">
              {summary.errors.slice(0,5).map((e, idx) => (
                <li key={idx}><span className="font-semibold">{e.symbol}</span>: {e.error || 'Unavailable'}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* List and Summary */}
      {loading ? (
        <div className="text-text-muted dark:text-dark-text-muted">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="text-text-muted dark:text-dark-text-muted">No favorites yet. Add your first symbol above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((f) => {
            const s = summaryMap.get(f.symbol) || { symbol: f.symbol }
            const chg = s.change_percent
            const up = chg != null && chg >= 0
            return (
              <div key={f.symbol} className="rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg-elevated p-4 shadow-card dark:shadow-dark-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold text-text dark:text-dark-text">{f.display_name || f.symbol}</div>
                    <div className="text-sm text-text-muted dark:text-dark-text-muted">{f.symbol}</div>
                  </div>
                  <button onClick={() => onRemove(f.symbol)} className="p-2 rounded-lg hover:bg-background-dark dark:hover:bg-dark-bg-secondary" title="Remove">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-2xl font-extrabold flex items-center space-x-2">
                    <span>₹{s.price != null ? s.price.toFixed(2) : '-'}</span>
                    {chg != null && (
                      <span className={`text-sm px-2 py-1 rounded-md ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {up ? <ArrowUpRight className="inline w-4 h-4" /> : <ArrowDownRight className="inline w-4 h-4" />} {chg.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-text-muted dark:text-dark-text-muted">Last update: {s.market_time || '-'}</div>
                <div className="mt-3">
                  <Sparkline data={s.sparkline} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Stat label="Day High" value={s.day_high != null ? `₹${s.day_high.toFixed(2)}` : '-'} />
                  <Stat label="Day Low" value={s.day_low != null ? `₹${s.day_low.toFixed(2)}` : '-'} />
                  <Stat label="Volume" value={s.volume != null ? Math.round(s.volume).toLocaleString() : '-'} />
                </div>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <a href={`/strategies?symbol=${encodeURIComponent(f.symbol)}`} className="text-sm text-primary hover:underline">Open Strategy</a>
                  <span className="opacity-40">•</span>
                  <a href={`/predictions`} className="text-sm text-primary hover:underline">Open Predictions</a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Favorites
