import { useState, useRef, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import { DocumentUpload } from './DocumentUpload'
import './ChatContainer.css'

export function ChatContainer() {
  const { 
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
  } = useChat()
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Delete this conversation?')) {
      deleteConversation(id)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={createNewChat} className="new-chat-btn">
            <span className="icon">✚</span>
            New Chat
          </button>
          
          <div style={{ marginTop: '1rem' }}>
            <DocumentUpload />
          </div>
        </div>

        <div className="conversations-list">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`conversation-item ${convo.id === currentConversationId ? 'active' : ''}`}
              onClick={() => switchConversation(convo.id)}
            >
              <div className="conversation-content">
                <div className="conversation-title">{convo.title}</div>
                <div className="conversation-date">{formatDate(convo.lastUpdated)}</div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteConversation(e, convo.id)}
                title="Delete conversation"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-sidebar-btn">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="menu-btn" title="Show sidebar">
                ☰
              </button>
            )}
            <h1>AI Assistant</h1>
          </div>
          <button onClick={clearChat} className="clear-btn" title="Clear conversation">
            🗑️ Clear
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
    </div>
  )
}
