'use client'

import { useState, useRef, useEffect } from 'react'
import type { KigurumiUser, ChatMessage } from '@/types'

interface AIChatModalProps {
  user: KigurumiUser
  onClose: () => void
}

export default function AIChatModal({ user, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
    // 添加欢迎消息
    setMessages([{
      role: 'assistant',
      content: `你好呀～我是${user.cnName}！很高兴认识你 (◕‿◕)♡ 有什么想聊的吗？`,
      timestamp: Date.now()
    }])
  }, [user.cnName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user.id,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now()
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || '抱歉，出了点问题...',
          timestamp: Date.now()
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '网络好像有点问题，稍后再试试吧～',
        timestamp: Date.now()
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-lg mx-4 h-[600px] max-h-[85vh] transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 聊天卡片 */}
        <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10 flex flex-col">
          {/* 头部 */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/20">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50">
              <img src={user.photos[0]} alt={user.cnName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">{user.cnName}</h3>
              <p className="text-xs text-white/50">AI 陪聊模式</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md' 
                    : 'bg-white/10 text-white/90 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`和${user.cnName}聊点什么...`}
                rows={1}
                className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/30 outline-none resize-none focus:ring-2 focus:ring-purple-500/50"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/30 mt-2 text-center">
              AI 生成内容仅供娱乐，不代表真实用户观点
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
