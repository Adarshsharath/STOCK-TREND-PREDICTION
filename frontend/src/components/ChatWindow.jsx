import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, MessageCircle, Plus, History, Sparkles, X as CloseIcon, Menu, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../context/ChatContext'
import axios from 'axios'
import FormattedMessage from './FormattedMessage'

const ChatWindow = () => {
  const { 
    messages, 
    addMessage, 
    clearMessages, 
    conversationHistory, 
    setConversationHistory,
    currentConversationId,
    setCurrentConversationId,
    conversations,
    loadConversations,
    createNewConversation,
    loadConversation,
    deleteConversation,
    isLoadingConversations
  } = useChat()
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
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
    const messageToSend = input
    setInput('')
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/chatbot', {
        message: messageToSend,
        conversation_id: currentConversationId,
        conversation_history: conversationHistory
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      
      if (response.data.conversation_id) {
        setCurrentConversationId(response.data.conversation_id)
        await loadConversations()
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

  const handleNewChat = async () => {
    await createNewConversation()
  }

  const handleSelectConversation = async (conversationId) => {
    await loadConversation(conversationId)
  }

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(conversationId)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-24 right-6 w-[1100px] h-[700px] max-w-[95vw] max-h-[85vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex overflow-hidden backdrop-blur-xl"
      style={{ zIndex: 9998 }}
    >
      {/* Modern Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">FinSight AI</h3>
                    <p className="text-blue-100 text-xs">Your Financial Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <CloseIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <button
                onClick={handleNewChat}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                New Conversation
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoadingConversations ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-8 rounded-2xl border border-blue-100 dark:border-blue-900">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-500 opacity-50" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">No conversations yet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Start chatting to begin your journey!</p>
                  </div>
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      currentConversationId === conv.id
                        ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg scale-[1.02]'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md border border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className={`w-4 h-4 flex-shrink-0 ${
                            currentConversationId === conv.id ? 'text-white' : 'text-blue-600'
                          }`} />
                          <p className={`text-sm font-semibold truncate ${
                            currentConversationId === conv.id ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}>
                            {conv.title || 'New Conversation'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={currentConversationId === conv.id ? 'text-blue-100' : 'text-gray-500'}>
                            {conv.message_count || 0} messages
                          </span>
                          <span className={currentConversationId === conv.id ? 'text-blue-100' : 'text-gray-400'}>•</span>
                          <span className={currentConversationId === conv.id ? 'text-blue-100' : 'text-gray-500'}>
                            {formatDate(conv.updated_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conv.id)
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
                          currentConversationId === conv.id 
                            ? 'hover:bg-white/20' 
                            : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                        }`}
                      >
                        <Trash2 className={`w-4 h-4 ${
                          currentConversationId === conv.id ? 'text-white' : 'text-red-600'
                        }`} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 border-b border-gray-200 dark:border-gray-800">
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FinSight AI Assistant
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Powered by Groq + RAG</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Thinking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Welcome to FinSight AI!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Your intelligent financial assistant. Ask me about trading strategies, ML models, stock prices, or anything about the platform!
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                {['What strategies are available?', 'Explain RSI strategy', 'What is MACD?', 'Current price of AAPL?'].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-left transition-all hover:shadow-md hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600 inline mr-2" />
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md'
                  }`}>
                    <FormattedMessage content={message.content} />
                  </div>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-400'
                  }`}>
                    {formatDate(message.timestamp)}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-md">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about trading, strategies, or stock prices..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatWindow
