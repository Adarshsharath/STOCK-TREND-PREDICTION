import React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../context/ChatContext'
import ChatWindow from './ChatWindow'

const Chatbot = () => {
  const { isOpen, toggleChat } = useChat()

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-0 rounded-full shadow-2xl hover:shadow-3xl transition-all w-20 h-20 overflow-visible group"
        style={{
          zIndex: 9999,
          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.6)'
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 10px 40px rgba(59, 130, 246, 0.6)',
            '0 10px 50px rgba(59, 130, 246, 0.8)',
            '0 10px 40px rgba(59, 130, 246, 0.6)'
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {isOpen ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 rounded-full">
            <X className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Bot Image Container with Animations */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Simple Modern Bot SVG */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Glow Circle */}
                  <circle cx="60" cy="60" r="55" fill="url(#blueGradient)" opacity="0.15"/>
                  
                  {/* Main Bot Container */}
                  <circle cx="60" cy="60" r="42" fill="white" stroke="#3B82F6" strokeWidth="3"/>
                  
                  {/* Top Antenna with Light */}
                  <motion.g
                    animate={{ rotate: [-8, 8, -8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "60px 20px" }}
                  >
                    <line x1="60" y1="18" x2="60" y2="8" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
                    <motion.circle 
                      cx="60" 
                      cy="5" 
                      r="5" 
                      fill="#10B981"
                      animate={{ 
                        opacity: [1, 0.3, 1],
                        scale: [1, 1.3, 1]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.g>
                  
                  {/* Bot Face Background */}
                  <circle cx="60" cy="55" r="28" fill="#3B82F6" opacity="0.1"/>
                  
                  {/* Eyes - Digital Display Style */}
                  <motion.g
                    animate={{ scaleY: [1, 0.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {/* Left Eye */}
                    <rect x="45" y="48" width="8" height="12" rx="2" fill="#3B82F6"/>
                    <rect x="46" y="50" width="6" height="2" fill="#60A5FA"/>
                    
                    {/* Right Eye */}
                    <rect x="67" y="48" width="8" height="12" rx="2" fill="#3B82F6"/>
                    <rect x="68" y="50" width="6" height="2" fill="#60A5FA"/>
                  </motion.g>
                  
                  {/* Smile Arc */}
                  <motion.path
                    d="M 45 70 Q 60 80 75 70"
                    stroke="#3B82F6"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    animate={{
                      d: [
                        "M 45 70 Q 60 80 75 70",
                        "M 45 70 Q 60 82 75 70",
                        "M 45 70 Q 60 80 75 70"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Cheek Blush */}
                  <circle cx="40" cy="62" r="6" fill="#EF4444" opacity="0.2"/>
                  <circle cx="80" cy="62" r="6" fill="#EF4444" opacity="0.2"/>
                  
                  {/* Bottom Info Line */}
                  <motion.line
                    x1="45"
                    y1="95"
                    x2="75"
                    y2="95"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{
                      x2: [75, 65, 75],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Gradient Definition */}
                  <defs>
                    <radialGradient id="blueGradient">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                </svg>
                
                {/* Floating Icons */}
                <motion.div
                  className="absolute -top-2 -right-2 text-2xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 15, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  💬
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-2 -left-2 text-xl"
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, -15, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  📊
                </motion.div>
              </div>
            </motion.div>
            
            {/* Multi-layer Pulse Rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-3 border-blue-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 0, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-300"
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
            
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-200"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
            />
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && <ChatWindow />}
      </AnimatePresence>
    </>
  )
}

export default Chatbot
