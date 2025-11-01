import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // Load conversations list
  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await axios.get('/api/conversations')
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Load conversations when chat opens
  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

  const addMessage = (message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
    setConversationHistory([])
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  const createNewConversation = async () => {
    try {
      const response = await axios.post('/api/conversations/new')
      const newConversationId = response.data.conversation_id
      setCurrentConversationId(newConversationId)
      setMessages([])
      setConversationHistory([])
      await loadConversations()
      return newConversationId
    } catch (error) {
      console.error('Failed to create conversation:', error)
      return null
    }
  }

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`)
      const conversation = response.data
      
      setCurrentConversationId(conversationId)
      setMessages(conversation.messages || [])
      
      // Build conversation history for API
      const history = (conversation.messages || []).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      setConversationHistory(history)
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`/api/conversations/${conversationId}`)
      
      // If deleting current conversation, clear it
      if (conversationId === currentConversationId) {
        setCurrentConversationId(null)
        setMessages([])
        setConversationHistory([])
      }
      
      await loadConversations()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      clearMessages,
      isOpen,
      toggleChat,
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
    }}>
      {children}
    </ChatContext.Provider>
  )
}
