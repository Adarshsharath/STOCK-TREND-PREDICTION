import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AstroPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [astroData, setAstroData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && !astroData) {
      generateAstroInsights()
    }
  }, [isOpen])

  const getZodiacSign = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', emoji: '♈', color: 'from-red-500 to-orange-500' }
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', emoji: '♉', color: 'from-green-500 to-emerald-500' }
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', emoji: '♊', color: 'from-yellow-500 to-amber-500' }
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', emoji: '♋', color: 'from-blue-400 to-cyan-400' }
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', emoji: '♌', color: 'from-orange-500 to-yellow-500' }
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', emoji: '♍', color: 'from-green-600 to-teal-500' }
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', emoji: '♎', color: 'from-pink-500 to-rose-500' }
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', emoji: '♏', color: 'from-red-600 to-purple-600' }
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: 'Sagittarius', emoji: '♐', color: 'from-purple-500 to-indigo-500' }
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: 'Capricorn', emoji: '♑', color: 'from-gray-600 to-slate-600' }
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', emoji: '♒', color: 'from-cyan-500 to-blue-500' }
    return { sign: 'Pisces', emoji: '♓', color: 'from-indigo-500 to-purple-500' }
  }

  const getMoonPhase = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const day = today.getDate()
    
    // Simple moon phase calculation
    const phases = [
      { name: 'New Moon', emoji: '🌑', energy: 'New Beginnings', advice: 'Start fresh projects, set intentions' },
      { name: 'Waxing Crescent', emoji: '🌒', energy: 'Growth', advice: 'Build momentum, take action' },
      { name: 'First Quarter', emoji: '🌓', energy: 'Challenges', advice: 'Overcome obstacles, make decisions' },
      { name: 'Waxing Gibbous', emoji: '🌔', energy: 'Refinement', advice: 'Perfect strategies, adjust plans' },
      { name: 'Full Moon', emoji: '🌕', energy: 'Culmination', advice: 'Harvest results, celebrate wins' },
      { name: 'Waning Gibbous', emoji: '🌖', energy: 'Gratitude', advice: 'Share knowledge, reflect' },
      { name: 'Last Quarter', emoji: '🌗', energy: 'Release', advice: 'Let go of losses, forgive mistakes' },
      { name: 'Waning Crescent', emoji: '🌘', energy: 'Rest', advice: 'Conserve energy, plan ahead' }
    ]
    
    const phaseIndex = Math.floor((day / 29.53) * 8) % 8
    return phases[phaseIndex]
  }

  const generateAstroInsights = () => {
    setLoading(true)
    
    setTimeout(() => {
      const today = new Date()
      const zodiac = getZodiacSign(today)
      const moon = getMoonPhase()
      
      // Market predictions based on day
      const dayOfWeek = today.getDay()
      const predictions = {
        0: { // Sunday
          market: 'Week ahead shows potential volatility',
          lucky: ['AAPL', 'MSFT', 'GOOGL'],
          caution: ['High-risk crypto'],
          strategy: 'Review and plan for the week ahead'
        },
        1: { // Monday
          market: 'Fresh start energy favors blue-chip stocks',
          lucky: ['Tech Giants', 'Banking Sector'],
          caution: ['Penny stocks'],
          strategy: 'Set stop-losses for new positions'
        },
        2: { // Tuesday
          market: 'Mars energy suggests momentum trading',
          lucky: ['Growth Stocks', 'Energy Sector'],
          caution: ['Overtrading'],
          strategy: 'Follow trends but respect risk limits'
        },
        3: { // Wednesday
          market: 'Mercury midweek brings analytical clarity',
          lucky: ['Healthcare', 'Consumer Goods'],
          caution: ['FOMO trades'],
          strategy: 'Deep analysis before entry'
        },
        4: { // Thursday
          market: 'Jupiter expansion favors diversification',
          lucky: ['Index Funds', 'Dividend Stocks'],
          caution: ['Over-leverage'],
          strategy: 'Balance portfolio allocation'
        },
        5: { // Friday
          market: 'Venus closing energy suggests profit booking',
          lucky: ['Established positions'],
          caution: ['New risky entries'],
          strategy: 'Secure gains before weekend'
        },
        6: { // Saturday
          market: 'Saturn discipline for portfolio review',
          lucky: ['Long-term holds'],
          caution: ['Emotional decisions'],
          strategy: 'Study and prepare for next week'
        }
      }

      const dailyPrediction = predictions[dayOfWeek]

      setAstroData({
        zodiac,
        moon,
        prediction: dailyPrediction,
        energy: Math.floor(Math.random() * 30) + 70, // 70-100%
        date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      })
      
      setLoading(false)
    }, 800)
  }

  const togglePopup = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={togglePopup}
        className="fixed top-20 right-6 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-0 rounded-full shadow-2xl hover:shadow-3xl transition-all w-14 h-14 flex items-center justify-center overflow-visible group"
        style={{
          zIndex: 9998,
          boxShadow: '0 10px 40px rgba(168, 85, 247, 0.6)'
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 10px 40px rgba(168, 85, 247, 0.6)',
            '0 10px 50px rgba(168, 85, 247, 0.8)',
            '0 10px 40px rgba(168, 85, 247, 0.6)'
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        aria-label="Astro Prediction"
      >
        <span className="text-2xl">✨</span>
      </motion.button>

      {/* Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed top-20 right-24 w-[480px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-700 overflow-hidden"
            style={{ zIndex: 9997 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <span className="text-3xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Astro Trading Insights</h3>
                    <p className="text-purple-100 text-xs">Cosmic Market Analysis</p>
                  </div>
                </div>
                <button
                  onClick={togglePopup}
                  className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reading cosmic patterns...</p>
                </div>
              ) : astroData ? (
                <div className="space-y-4">
                  {/* Date */}
                  <div className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{astroData.date}</p>
                  </div>

                  {/* Zodiac & Moon */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`bg-gradient-to-br ${astroData.zodiac.color} p-4 rounded-xl text-white`}>
                      <div className="text-3xl mb-2">{astroData.zodiac.emoji}</div>
                      <div className="text-sm font-semibold">{astroData.zodiac.sign}</div>
                      <div className="text-xs opacity-90">Today's Sign</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl text-white">
                      <div className="text-3xl mb-2">{astroData.moon.emoji}</div>
                      <div className="text-sm font-semibold">{astroData.moon.name}</div>
                      <div className="text-xs opacity-90">{astroData.moon.energy}</div>
                    </div>
                  </div>

                  {/* Energy Level */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Cosmic Energy</span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{astroData.energy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${astroData.energy}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Market Prediction */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 p-4 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">🔮</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1">Market Forecast</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{astroData.prediction.market}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lucky Sectors */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">🍀</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-2">Favorable Today</h4>
                        <div className="flex flex-wrap gap-2">
                          {astroData.prediction.lucky.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Caution */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 p-4 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-orange-900 dark:text-orange-300 mb-2">Exercise Caution</h4>
                        <div className="flex flex-wrap gap-2">
                          {astroData.prediction.caution.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Moon Advice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{astroData.moon.emoji}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Moon Phase Wisdom</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{astroData.moon.advice}</p>
                      </div>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-300 dark:border-purple-600 p-4 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1">Recommended Strategy</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{astroData.prediction.strategy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                      ⚠️ Astro insights are for entertainment. Always do your own research before trading.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AstroPopup
