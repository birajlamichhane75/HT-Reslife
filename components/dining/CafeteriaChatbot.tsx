'use client'

import React, { useState, useRef, useEffect } from 'react'
import { formatDateMonthDay } from '@/lib/dining/cafeteria-data'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  suggestions?: string[]
}

interface CafeteriaChatbotProps {
  currentWeek?: number
  currentDay?: string
  todayDate?: Date
  className?: string
  defaultOpen?: boolean
}

export function CafeteriaChatbot({
  currentWeek,
  currentDay,
  todayDate = new Date(),
  className = '',
  defaultOpen = true
}: CafeteriaChatbotProps) {
  const formattedToday = formatDateMonthDay(todayDate)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 Hello! I'm your **Ram Dining Assistant**.\n\nToday is **${formattedToday}**.\n\nAsk me anything about today's meals, upcoming dates, dietary options, or specific stations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "What's for lunch today?",
        "What's at the Grill Station?",
        "Today's soup",
        "Are there vegetarian options?",
        "What's for dinner?"
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim()
    if (!textToSend || loading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/dining/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          current_week: currentWeek,
          current_day: currentDay
        })
      })

      if (!res.ok) {
        throw new Error('Dining assistant is currently unavailable')
      }

      const data = await res.json()
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.data?.answer || 'I am sorry, I could not retrieve that menu item.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.data?.suggestions || [
          "What's for lunch?",
          "What's at the Grill Station?",
          "What soup is available?"
        ]
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ ${err.message || 'Unable to load menu right now. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Format message markdown-like bullets and bold
  const renderMessageText = (text: string) => {
    const lines = text.split('\n')
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />
          }

          // Bullet points
          if (line.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#FFCC00] font-bold select-none">•</span>
                <span className="font-medium">{line.substring(2)}</span>
              </div>
            )
          }

          // Section Headings (e.g. Lunch, Dinner, Grill Station)
          if (
            line === 'Breakfast' ||
            line === 'Brunch' ||
            line === 'Lunch' ||
            line === 'Dinner' ||
            line === 'Soup' ||
            line === 'Grill Station' ||
            line.endsWith(':')
          ) {
            return (
              <div key={idx} className="font-bold text-[#FFCC00] uppercase tracking-wider text-[11px] mt-2 pt-1 border-t border-white/10 first:border-0 first:pt-0 first:mt-0">
                {line}
              </div>
            )
          }

          // Bold tags **text**
          const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: boldFormatted }}
              className="text-gray-100"
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className={`bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#660100] via-[#520100] to-[#3B0000] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-lg shadow-inner">
            🍲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm tracking-wide text-white">Ram Dining Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FFCC00]/20 border border-[#FFCC00]/40 text-[#FFCC00] text-[9px] font-extrabold uppercase tracking-wider">
                AI Menu Bot
              </span>
            </div>
            <p className="text-[11px] text-white/75 font-medium">
              {formattedToday} • HTU Union Cafeteria
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Minimize Chat' : 'Expand Chat'}
          className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Collapsible Body */}
      {isOpen && (
        <>
          {/* Chat Messages List */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[380px] min-h-[260px] space-y-3 bg-[#FAF8F5]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#660100] text-white rounded-tr-none'
                      : 'bg-gradient-to-br from-[#400000] to-[#2B0000] text-gray-100 border border-[#660100]/30 rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                  ) : (
                    renderMessageText(msg.text)
                  )}
                  <div
                    className={`text-[9px] mt-1.5 opacity-60 font-mono text-right ${
                      msg.sender === 'user' ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Inline suggestions below assistant message */}
                {msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        disabled={loading}
                        className="text-[11px] px-2.5 py-1 bg-white border border-[#E5E8EF] text-[#660100] font-semibold rounded-full hover:bg-amber-50 hover:border-amber-200 transition-all shadow-2xs hover:scale-[1.02] active:scale-95 text-left"
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 italic p-2 bg-white/70 rounded-xl w-fit border border-gray-100">
                <span className="inline-block w-2 h-2 rounded-full bg-[#660100] animate-ping" />
                Checking 28-day menu cycle...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Pills */}
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Ask:</span>
            {[
              "What's for lunch?",
              "Grill Station today",
              "Today's soup",
              "Is there pizza?",
              "Vegetarian choices"
            ].map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 hover:text-[#660100] hover:border-[#660100]/40 rounded-lg text-[11px] font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about meals, grill items, soups, Week 2 Tuesday..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#660100] focus:bg-white text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-[#660100] text-white rounded-xl font-bold text-xs hover:bg-[#520100] transition-colors disabled:opacity-40 disabled:hover:bg-[#660100] shadow-sm flex items-center gap-1.5"
            >
              <span>Send</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  )
}
