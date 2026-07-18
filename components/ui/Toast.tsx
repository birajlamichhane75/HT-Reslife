'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const success = useCallback((message: string) => toast(message, 'success'), [toast])
  const error = useCallback((message: string) => toast(message, 'error'), [toast])
  const info = useCallback((message: string) => toast(message, 'info'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 w-full max-w-[400px] px-6 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between w-full p-4 rounded-xl shadow-md border text-sm transition-all duration-300 transform translate-y-0 bg-white border-[#E5E8EF] text-gray-900 animate-[slideUp_0.2s_ease-out]"
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && (
                <span className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100" />
              )}
              {t.type === 'error' && (
                <span className="flex-shrink-0 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
              )}
              {t.type === 'info' && (
                <span className="flex-shrink-0 w-3 h-3 rounded-full bg-brand ring-4 ring-brand-light" />
              )}
              <span className="font-medium text-gray-800">{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
