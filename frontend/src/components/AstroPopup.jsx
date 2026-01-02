import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Star, TrendingUp, TrendingDown, Clock, Heart, Sparkles, Filter, AlertCircle, ChevronRight, Hash } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../config'
import { generateStockRecs } from '../utils/astroStockSelector'

const AstroPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dob, setDob] = useState(() => localStorage.getItem('user_dob') || '')
  const [showDobInput, setShowDobInput] = useState(!localStorage.getItem('user_dob'))
  const [astroData, setAstroData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ZODIAC_SIGNS = [
    { name: 'Aries', start: '03-21', end: '04-19', emoji: '♈', element: 'Fire' },
    { name: 'Taurus', start: '04-20', end: '05-20', emoji: '♉', element: 'Earth' },
    { name: 'Gemini', start: '05-21', end: '06-20', emoji: '♊', element: 'Air' },
    { name: 'Cancer', start: '06-21', end: '07-22', emoji: '♋', element: 'Water' },
    { name: 'Leo', start: '07-23', end: '08-22', emoji: '♌', element: 'Fire' },
    { name: 'Virgo', start: '08-23', end: '09-22', emoji: '♍', element: 'Earth' },
    { name: 'Libra', start: '09-23', end: '10-22', emoji: '♎', element: 'Air' },
    { name: 'Scorpio', start: '10-23', end: '11-21', emoji: '♏', element: 'Water' },
    { name: 'Sagittarius', start: '11-22', end: '12-21', emoji: '♐', element: 'Fire' },
    { name: 'Capricorn', start: '12-22', end: '01-19', emoji: '♑', element: 'Earth' },
    { name: 'Aquarius', start: '01-20', end: '02-18', emoji: '♒', element: 'Air' },
    { name: 'Pisces', start: '02-19', end: '03-20', emoji: '♓', element: 'Water' }
  ]

  const getZodiacSign = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    return ZODIAC_SIGNS.find(s => {
      if (s.name === 'Capricorn') {
        return mmdd >= '12-22' || mmdd <= '01-19'
      }
      return mmdd >= s.start && mmdd <= s.end
    })
  }

  const fetchAstroData = async () => {
    const sign = getZodiacSign(dob)
    if (!sign) return

    setLoading(true)
    setError(null)
    try {
      // Using backend proxy to bypass CORS
      const response = await axios.post(`${API_URL}/api/astro?sign=${sign.name.toLowerCase()}&day=today`)

      // Generate Stock Recommendations based on vibe
      const recommendations = generateStockRecs(response.data, sign)

      setAstroData({
        ...response.data,
        recommendations,
        sign: sign
      })
    } catch (err) {
      console.error('Aztro API Error:', err)
      setError('The stars are temporarily obscured. Please try again later.')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (isOpen && dob && !astroData) {
      fetchAstroData()
    }
  }, [isOpen, dob])

  const handleDobSubmit = (e) => {
    e.preventDefault()
    if (dob) {
      localStorage.setItem('user_dob', dob)
      setShowDobInput(false)
      fetchAstroData()
    }
  }

  const handleResetDob = () => {
    localStorage.removeItem('user_dob')
    setDob('')
    setShowDobInput(true)
    setAstroData(null)
  }

  return (
    <>
      {/* Floating Action Button - ENHANCED FOR VISIBILITY */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-6 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white p-0 rounded-full shadow-2xl transition-all w-20 h-20 flex items-center justify-center z-[9998] overflow-visible"
        style={{
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(236, 72, 153, 0.5)'
        }}
        whileHover={{ scale: 1.15, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 10, -10, 0],
          boxShadow: [
            '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(236, 72, 153, 0.5)',
            '0 0 60px rgba(139, 92, 246, 1), 0 0 100px rgba(236, 72, 153, 0.8)',
            '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(236, 72, 153, 0.5)'
          ]
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {/* Outer magical ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-40"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.1, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />

        {/* Middle sparkle ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 opacity-30"
          animate={{
            scale: [1, 1.7, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.4
          }}
        />

        {/* Rotating sparkles around button */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50" />
          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-pink-300 rounded-full shadow-lg shadow-pink-300/50" />
          <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50" />
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50" />
        </motion.div>

        <Sparkles className="w-10 h-10 relative z-10 drop-shadow-lg" />

        {/* "ASTRO" label */}
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg"
        >
          ✨ ASTRO
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Astro Insights</h2>
                      <p className="text-purple-100 text-xs">Personalized stock recommendations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900">
                {showDobInput ? (
                  <form onSubmit={handleDobSubmit} className="space-y-6 py-4">
                    <div className="text-center space-y-2 mb-8">
                      <div className="bg-purple-100 dark:bg-purple-900/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-500">
                        <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Enter Your Birth Date</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized stock insights based on your zodiac</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95"
                      >
                        Get My Insights
                      </button>
                    </div>
                  </form>
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-4 border-dashed border-purple-500 rounded-full"
                      />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-purple-500 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-purple-600 dark:text-purple-400 animate-pulse">Reading the stars...</p>
                      <p className="text-xs text-gray-500 mt-2">Analyzing cosmic patterns</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border-2 border-red-200 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-red-700 dark:text-red-400 font-bold">{error}</p>
                    <button onClick={fetchAstroData} className="px-6 py-2 bg-red-600 text-white rounded-xl font-black text-sm">Retry Connection</button>
                  </div>
                ) : astroData && (
                  <div className="space-y-6">
                    {/* User Zodiac Header */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-orange-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{astroData.sign.emoji}</div>
                        <div>
                          <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase">{astroData.sign.name}</h4>
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">{astroData.sign.element} Element</p>
                        </div>
                      </div>
                      <button onClick={handleResetDob} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Daily Description - The "Ganesha Speaks" Vibe */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-t-8 border-orange-500 shadow-xl relative overflow-hidden">
                      <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-orange-50/50 pointer-events-none" />
                      <h5 className="font-black text-maroon-800 dark:text-orange-300 text-lg mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        Daily Predictions
                      </h5>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic text-lg font-medium">
                        "{astroData.description}"
                      </p>
                    </div>

                    {/* Stock Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border-2 border-green-200 shadow-lg">
                        <div className="flex items-center gap-2 mb-4 text-green-700 dark:text-green-400">
                          <TrendingUp className="w-6 h-6" />
                          <h5 className="font-black uppercase tracking-wider">Auspicious Buys</h5>
                        </div>
                        <div className="space-y-2">
                          {astroData.recommendations.up.map(s => (
                            <div key={s} className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl flex items-center justify-between border border-green-100">
                              <span className="font-black text-gray-800 dark:text-white">{s}</span>
                              <ChevronRight className="w-4 h-4 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border-2 border-red-200 shadow-lg">
                        <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-400">
                          <TrendingDown className="w-6 h-6" />
                          <h5 className="font-black uppercase tracking-wider">Planetary Exit</h5>
                        </div>
                        <div className="space-y-2">
                          {astroData.recommendations.down.map(s => (
                            <div key={s} className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl flex items-center justify-between border border-red-100">
                              <span className="font-black text-gray-800 dark:text-white">{s}</span>
                              <ChevronRight className="w-4 h-4 text-red-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Insights Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                        <Clock className="w-5 h-5 text-purple-500 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase">Lucky Time</p>
                        <p className="text-sm font-black text-gray-800 dark:text-white">{astroData.lucky_time}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                        <div
                          className="w-5 h-5 rounded-full mb-2 border border-gray-200"
                          style={{ backgroundColor: astroData.color.toLowerCase() }}
                        />
                        <p className="text-[10px] font-black text-gray-400 uppercase">Lucky Color</p>
                        <p className="text-sm font-black text-gray-800 dark:text-white">{astroData.color}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                        <Hash className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase">Lucky Num</p>
                        <p className="text-sm font-black text-gray-800 dark:text-white">{astroData.lucky_number}</p>
                      </div>
                    </div>

                    {/* Compatibility Banner */}
                    <div className="bg-indigo-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-lg shadow-indigo-500/20">
                      <div>
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Synergistic Partner</p>
                        <h5 className="text-xl font-black">Trade with {astroData.compatibility}s</h5>
                      </div>
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-500 italic">
                        Vedic Market Insights are algorithmic predictions based on astrological patterns. Trading involves risk. Please use your technical analysis before using divine interventions.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!showDobInput && !loading && !error && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Astrology-based insights for entertainment purposes only</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AstroPopup
