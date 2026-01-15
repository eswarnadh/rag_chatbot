import axios from "axios";
import { useState, useCallback, useEffect } from "react";

type MessageRole = "user"|"assistant"|"system"

interface Message {
    role : MessageRole
    content : string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  lastUpdated: number
}

interface UseChatReturn {
    conversations: Conversation[]
    currentConversationId: string | null
    messages : Message[]
    isLoading: boolean
    error: string|null
    sendMessage: (message: string) => Promise<void>  
    clearChat: () => void
    createNewChat: () => void
    switchConversation: (id: string) => void
    deleteConversation: (id: string) => void
}

const STORAGE_KEY = 'chat_conversations'

const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveConversations = (convos: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
  } catch (e) {
    console.error('Failed to save conversations', e)
  }
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

const getConversationTitle = (messages: Message[]): string => {
  if (messages.length === 0) return 'New Chat'
  const firstUserMsg = messages.find(m => m.role === 'user')
  if (!firstUserMsg) return 'New Chat'
  return firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
}

export const useChat = (): UseChatReturn => {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current messages
  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const messages = currentConversation?.messages || []

  // Save to localStorage whenever conversations change
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      const newConvo: Conversation = {
        id: generateId(),
        title: 'New Chat',
        messages: [],
        lastUpdated: Date.now()
      }
      setConversations([newConvo])
      setCurrentConversationId(newConvo.id)
    } else if (!currentConversationId) {
      setCurrentConversationId(conversations[0].id)
    }
  }, [])

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || !currentConversationId) return

    const userMsg: Message = {
      role: "user",
      content: userMessage
    }

    // Update current conversation with user message
    setConversations(prev => prev.map(c => 
      c.id === currentConversationId 
        ? { ...c, messages: [...c.messages, userMsg], lastUpdated: Date.now() }
        : c
    ))
    setError(null)
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: userMessage
      })

      const assistantMsg: Message = {
        role: "assistant",
        content: response.data.reply
      }

      // Update conversation with assistant message and title
      setConversations(prev => prev.map(c => {
        if (c.id === currentConversationId) {
          const updatedMessages = [...c.messages, assistantMsg]
          return {
            ...c,
            messages: updatedMessages,
            title: getConversationTitle(updatedMessages),
            lastUpdated: Date.now()
          }
        }
        return c
      }))
    } catch (err) {
      let errorMessage = "Unknown error"
      if (axios.isAxiosError(err)) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      // Remove user message if API fails
      setConversations(prev => prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: c.messages.slice(0, -1) }
          : c
      ))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId])

  const clearChat = useCallback(() => {
    if (!currentConversationId) return
    setConversations(prev => prev.map(c =>
      c.id === currentConversationId
        ? { ...c, messages: [], title: 'New Chat', lastUpdated: Date.now() }
        : c
    ))
    setError(null)
  }, [currentConversationId])

  const createNewChat = useCallback(() => {
    const newConvo: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      lastUpdated: Date.now()
    }
    setConversations(prev => [newConvo, ...prev])
    setCurrentConversationId(newConvo.id)
    setError(null)
  }, [])

  const switchConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
    setError(null)
  }, [])

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      // If deleting current conversation, switch to another
      if (id === currentConversationId) {
        setCurrentConversationId(filtered.length > 0 ? filtered[0].id : null)
      }
      // If no conversations left, create a new one
      if (filtered.length === 0) {
        const newConvo: Conversation = {
          id: generateId(),
          title: 'New Chat',
          messages: [],
          lastUpdated: Date.now()
        }
        setCurrentConversationId(newConvo.id)
        return [newConvo]
      }
      return filtered
    })
  }, [currentConversationId])

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    createNewChat,
    switchConversation,
    deleteConversation
  }
}
