import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import ChatWindow from './ChatWindow'

const Chatbot = () => {
  const { isOpen, toggleChat } = useChat()

  return (
    <>
      {isOpen && <ChatWindow />}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-finsight-blue-600 to-finsight-teal-600 hover:from-finsight-blue-700 hover:to-finsight-teal-700 text-white rounded-full p-4 shadow-neon-blue hover:shadow-neon-teal transition-all"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  )
}

export default Chatbot