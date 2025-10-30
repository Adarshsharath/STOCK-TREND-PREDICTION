import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChat } from '../context/ChatContext'
import axios from 'axios'

const ChatWindow = () => {
  const { messages, addMessage, clearMessages, conversationHistory, setConversationHistory } = useChat()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    addMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chatbot', {
        message: input,
        conversation_history: conversationHistory
      })

      const botMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      }

      addMessage(botMessage)
      
      if (response.data.conversation_history) {
        setConversationHistory(response.data.conversation_history)
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-96 h-[600px] bg-white border border-border rounded-xl shadow-2xl flex flex-col z-40"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">FinBot AI</h3>
            <p className="text-xs text-white opacity-90">Your Finance Assistant</p>
          </div>
          <button
            onClick={clearMessages}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-muted">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about finance!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : msg.error
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-background text-text border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background text-text border border-border p-3 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about stocks, strategies..."
            className="flex-1 bg-white border border-border rounded-lg px-4 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatWindow
