import React from 'react'
import { MessageCircle, X } from 'lucide-react'
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
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
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
