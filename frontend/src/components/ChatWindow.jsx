import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, MessageCircle, Plus, History, Sparkles, X as CloseIcon } from 'lucide-react'
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
      const response = await axios.post('/api/chatbot', {
        message: messageToSend,
        conversation_id: currentConversationId,
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

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation()
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-[1100px] h-[700px] max-w-[95vw] max-h-[85vh] bg-dark-bg-secondary border border-dark-border rounded-2xl shadow-glass flex overflow-hidden"
      style={{ zIndex: 9998 }}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-b from-dark-bg-primary to-dark-bg-secondary border-r border-dark-border flex flex-col overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-dark-border">
              <button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500 hover:from-finsight-blue-600 hover:to-finsight-teal-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all shadow-neon-blue hover:shadow-neon-teal"
              >
                <Plus className="w-5 h-5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-finsight-blue-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <History className="w-10 h-10 mx-auto mb-2 text-dark-text-muted" />
                  <p className="text-sm text-dark-text-secondary">No conversations yet</p>
                  <p className="text-xs text-dark-text-muted mt-1">Start chatting to create history</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-xl cursor-pointer transition-all group ${
                        currentConversationId === conv.id
                          ? 'bg-gradient-to-r from-finsight-blue-500/20 to-finsight-teal-500/20 border border-finsight-blue-500/50 shadow-neon-blue'
                          : 'hover:bg-dark-bg-elevated'
                      }`}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-text-primary truncate">
                            {conv.title}
                          </p>
                          <p className="text-xs text-dark-text-muted mt-0.5">
                            {formatDate(conv.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-finsight-blue-600 via-finsight-teal-600 to-finsight-purple-600 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <History className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">FinSight AI</h3>
                  <p className="text-xs text-white opacity-90">Your Intelligent Finance Assistant</p>
                </div>
              </div>
            </div>
            <button
              onClick={clearMessages}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Clear current chat"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-dark-bg-primary">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="bg-gradient-to-br from-finsight-blue-500 to-finsight-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neon-blue">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-text-primary mb-2">Welcome to FinSight AI!</h3>
                <p className="text-sm text-dark-text-secondary mb-4">Your intelligent assistant for stock analysis, trading strategies, and market insights.</p>
                <div className="bg-dark-bg-elevated rounded-xl p-4 shadow-glass border border-dark-border">
                  <p className="text-xs text-dark-text-muted mb-2">Try asking:</p>
                  <div className="space-y-2 text-left">
                    <div className="text-xs text-dark-text-primary bg-dark-bg-card p-2 rounded-lg border border-dark-border-light">💹 "What's the market outlook today?"</div>
                    <div className="text-xs text-dark-text-primary bg-dark-bg-card p-2 rounded-lg border border-dark-border-light">📊 "Explain RSI strategy"</div>
                    <div className="text-xs text-dark-text-primary bg-dark-bg-card p-2 rounded-lg border border-dark-border-light">🎯 "Best indicators for day trading"</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-5 rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500 text-white shadow-neon-blue'
                        : msg.error
                        ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                        : 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-light'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <FormattedMessage content={msg.content} isUser={false} />
                    )}
                    <p className={`text-xs mt-3 pt-2 border-t ${
                      msg.role === 'user' 
                        ? 'text-blue-100 border-blue-400' 
                        : 'text-dark-text-muted border-dark-border-light'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-dark-bg-elevated border border-dark-border-light p-4 rounded-2xl shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-finsight-blue-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-dark-bg-secondary border-t border-dark-border">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about stocks, trading strategies, or market analysis..."
              className="flex-1 bg-dark-bg-elevated border border-dark-border-light rounded-xl px-5 py-3 text-sm text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-finsight-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500 hover:from-finsight-blue-600 hover:to-finsight-teal-600 text-white px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-blue hover:shadow-neon-teal"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatWindow
