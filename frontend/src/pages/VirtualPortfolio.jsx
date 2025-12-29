import React, { useState, useEffect } from 'react'
import { Wallet, Briefcase, History, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw, DollarSign, Search, Activity, AlertCircle, RotateCcw } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../config'
import { useAuth } from '../context/AuthContext'
import TradeModal from '../components/TradeModal'
import ResetPortfolioModal from '../components/ResetPortfolioModal'

const VirtualPortfolio = () => {
    const { user } = useAuth()
    const [balance, setBalance] = useState(0)
    const [portfolio, setPortfolio] = useState([])
    const [summary, setSummary] = useState({
        total_market_value: 0,
        total_cost_basis: 0,
        total_pnl: 0,
        total_pnl_percent: 0
    })
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('portfolio')

    // Search & Trade State
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [tradeSuccess, setTradeSuccess] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const [balanceRes, portfolioRes, historyRes] = await Promise.all([
                axios.get(`${API_URL}/api/paper/balance`, { headers }),
                axios.get(`${API_URL}/api/paper/portfolio`, { headers }),
                axios.get(`${API_URL}/api/paper/history`, { headers })
            ])

            setBalance(balanceRes.data.balance)
            setPortfolio(portfolioRes.data.portfolio)
            setSummary(portfolioRes.data.summary)
            setHistory(historyRes.data.history)
        } catch (err) {
            console.error('Error fetching paper trading data:', err)
            setError('Failed to load portfolio data. Please make sure you are logged in.')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = async (initialBalance) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/paper/reset`, {
                initial_balance: initialBalance
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTradeSuccess({ type: 'reset', quantity: 0, symbol: 'Portfolio' });
            setIsResetModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Reset error:', err);
            setError('Failed to reset portfolio');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData()
    }, [])

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(value)
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery) return

        setSearching(true)
        setSearchError(null)
        setSearchResult(null)

        try {
            const res = await axios.get(`${API_URL}/api/stock-price?symbol=${searchQuery.toUpperCase()}`)
            setSearchResult(res.data)
        } catch (err) {
            console.error('Search error:', err)
            setSearchError(err.response?.data?.error || 'Stock not found. Try symbols like RELIANCE.NS, AAPL, or TSLA.')
        } finally {
            setSearching(false)
        }
    }

    if (loading && !balance) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-8 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center space-x-2 text-indigo-100 mb-2">
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Virtual Balance</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <h1 className="text-5xl font-black">{formatCurrency(balance)}</h1>
                            {balance === 0 && (
                                <button
                                    onClick={() => setIsResetModalOpen(true)}
                                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center space-x-2"
                                >
                                    <IndianRupee className="w-4 h-4" />
                                    <span>INITIALIZE CAPITAL</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[240px]">
                        <div className="text-indigo-100 text-sm mb-1">Total Portfolio Value</div>
                        <div className="text-2xl font-bold mb-2">{formatCurrency(summary.total_market_value + balance)}</div>
                        <div className={`flex items-center space-x-1 text-sm font-bold ${summary.total_pnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {summary.total_pnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            <span>{formatCurrency(Math.abs(summary.total_pnl))} ({summary.total_pnl_percent.toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm border border-border dark:border-dark-border">
                    <div className="text-text-muted dark:text-dark-text-muted text-sm mb-2">Market Value</div>
                    <div className="text-2xl font-bold dark:text-white">{formatCurrency(summary.total_market_value)}</div>
                </div>
                <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm border border-border dark:border-dark-border">
                    <div className="text-text-muted dark:text-dark-text-muted text-sm mb-2">Total Returns</div>
                    <div className={`text-2xl font-bold ${summary.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.total_pnl >= 0 ? '+' : ''}{formatCurrency(summary.total_pnl)}
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm border border-border dark:border-dark-border">
                    <div className="text-text-muted dark:text-dark-text-muted text-sm mb-2">Assets</div>
                    <div className="text-2xl font-bold dark:text-white">{portfolio.length} Stocks</div>
                </div>
            </div>

            {/* Quick Trade Section */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-3xl p-6 shadow-sm border border-border dark:border-dark-border">
                <div className="flex items-center space-x-2 text-primary mb-4">
                    <Activity className="w-5 h-5 font-bold" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Quick Invest</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-text-muted dark:text-dark-text-muted text-sm mb-4">
                            Ready to invest? Search for a stock symbol to see its live price and execute a virtual trade instantly.
                        </p>
                        <form onSubmit={handleSearch} className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Symbol (e.g. INFY.NS, TSLA, AAPL)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg-elevated border border-border dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={searching}
                                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-dark text-white px-6 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                                {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'SEARCH'}
                            </button>
                        </form>
                        {searchError && (
                            <p className="text-red-500 text-xs mt-2 font-bold flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" /> {searchError}
                            </p>
                        )}
                    </div>

                    <div className="min-h-[100px] flex items-center justify-center border-l-0 lg:border-l border-border dark:border-dark-border lg:pl-8">
                        {searchResult ? (
                            <div className="w-full flex items-center justify-between bg-primary/5 rounded-2xl p-5 border border-primary/10 animate-scale-in">
                                <div>
                                    <div className="text-2xl font-black text-text dark:text-dark-text">{searchResult.symbol}</div>
                                    <div className={`flex items-center text-sm font-bold ${searchResult.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {searchResult.change >= 0 ? '+' : ''}{searchResult.change.toFixed(2)} ({searchResult.change_percent.toFixed(2)}%)
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="text-3xl font-black text-primary mb-2">₹{searchResult.price.toLocaleString('en-IN')}</div>
                                    <button
                                        onClick={() => setIsTradeModalOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95"
                                    >
                                        FETCH & INVEST
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-text-muted dark:text-dark-text-muted text-sm italic py-4">
                                Enter a symbol above to get started...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {tradeSuccess && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center justify-between animate-bounce shadow-lg">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-1.5 rounded-full">
                            {tradeSuccess.type === 'reset' ? <RotateCcw className="w-4 h-4 text-white" /> : <TrendingUp className="w-4 h-4 text-white" />}
                        </div>
                        <p className="text-green-800 dark:text-green-300 font-bold">
                            {tradeSuccess.type === 'reset'
                                ? 'Portfolio has been reset successfully!'
                                : `Trade executed! ${tradeSuccess.quantity} shares of ${tradeSuccess.symbol} ${tradeSuccess.type}ed.`}
                        </p>
                    </div>
                    <button onClick={() => setTradeSuccess(null)} className="text-green-700 dark:text-green-400 font-black">CLOSE</button>
                </div>
            )}

            {/* Tabs & Reset */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex space-x-1 bg-gray-100 dark:bg-dark-bg-elevated p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'portfolio'
                            ? 'bg-white dark:bg-dark-bg-secondary shadow-sm text-primary'
                            : 'text-text-muted dark:text-dark-text-muted hover:text-text'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4" />
                            <span>My Holdings</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
                            ? 'bg-white dark:bg-dark-bg-secondary shadow-sm text-primary'
                            : 'text-text-muted dark:text-dark-text-muted hover:text-text'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <History className="w-4 h-4" />
                            <span>Trade History</span>
                        </div>
                    </button>
                </div>

                <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-red-100 dark:border-red-900/20"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>{balance === 0 ? 'Initialize Balance' : 'Reset Portfolio'}</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
                {activeTab === 'portfolio' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-dark-bg-elevated border-b border-border dark:border-dark-border">
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Avg Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Current Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">P&L</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider text-right">Market Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-dark-border text-sm">
                                {portfolio.length > 0 ? (
                                    portfolio.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-black text-text dark:text-dark-text">{item.symbol}</span>
                                            </td>
                                            <td className="px-6 py-4 text-text dark:text-dark-text">{item.quantity}</td>
                                            <td className="px-6 py-4 text-text dark:text-dark-text">{formatCurrency(item.avg_price)}</td>
                                            <td className="px-6 py-4 text-text dark:text-dark-text">{formatCurrency(item.current_price)}</td>
                                            <td className="px-6 py-4">
                                                <div className={`font-bold ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
                                                    <span className="block text-xs font-medium">({item.pnl_percent.toFixed(2)}%)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-text dark:text-dark-text">{formatCurrency(item.market_value)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-text-muted dark:text-dark-text-muted italic">
                                            No holdings yet. Start investing with your virtual money!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-dark-bg-elevated border-b border-border dark:border-dark-border">
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider text-right">Total Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-dark-border text-sm">
                                {history.length > 0 ? (
                                    history.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-text-light dark:text-dark-text-secondary">
                                                {new Date(tx.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-black uppercase ${tx.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-text dark:text-dark-text">{tx.symbol}</td>
                                            <td className="px-6 py-4 text-text dark:text-dark-text">{tx.quantity}</td>
                                            <td className="px-6 py-4 text-text dark:text-dark-text">{formatCurrency(tx.price)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-text dark:text-dark-text">{formatCurrency(tx.total_val)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-text-muted dark:text-dark-text-muted italic">
                                            No transaction history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={() => setIsTradeModalOpen(false)}
                symbol={searchResult?.symbol}
                currentPrice={searchResult?.price}
                prediction={{
                    direction: searchResult?.change >= 0 ? 'Bullish' : 'Bearish',
                    modelName: 'Direct Trade'
                }}
                onSuccess={(type, quantity, symbol) => {
                    setTradeSuccess({ type, quantity, symbol })
                    fetchData()
                    setTimeout(() => setTradeSuccess(null), 8000)
                }}
            />

            <ResetPortfolioModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onReset={handleReset}
                loading={loading}
                isInitializing={balance === 0}
            />
        </div>
    )
}

export default VirtualPortfolio
