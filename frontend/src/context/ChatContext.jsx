import React, { createContext, useContext, useState } from 'react'

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

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      clearMessages,
      isOpen,
      toggleChat,
      conversationHistory,
      setConversationHistory
    }}>
      {children}
    </ChatContext.Provider>
  )
}
