import axios from "axios";
import { useState, useCallback } from "react";

type MessageRole = "user"|"assistant"|"system"

interface Message {
    role : MessageRole
    content : string
}

interface UseChatReturn {
    messages : Message[]
    isLoading: boolean
    error: string|null
    sendMessage: (message: string) => Promise<void>  
    clearChat: () => void  
}


export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return

    // Add user message
    const userMsg: Message = {
      role: "user",
      content: userMessage
    }
    setMessages(prev => [...prev, userMsg])
    setError(null)
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: userMessage
      })

      // Add assistant message
      const assistantMsg: Message = {
        role: "assistant",
        content: response.data.reply
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      let errorMessage = "Unknown error"
      if (axios.isAxiosError(err)) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      // Remove user message if API fails
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  }
}
