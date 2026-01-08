import { useState, useRef, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import './ChatContainer.css'

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    await sendMessage(input)
    setInput('')
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h1>Bot</h1>
        <button onClick={clearChat} className="clear-btn" title="Clear conversation">
          ⟲
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-wrapper">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>How can I help you today?</h2>
            <p>Ask me anything and I'll do my best to help.</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="send-btn"
        >
          {isLoading ? '⏳' : '→'}
        </button>
      </form>
    </div>
  )
}
