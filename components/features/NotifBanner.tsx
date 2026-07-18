'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

export default function NotifBanner({ ticketCount }: { ticketCount: number }) {
  const supabase = createClient()
  const toasts = useToast()
  const [showPushPrompt, setShowPushPrompt] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      // Check current permission state
      if (Notification.permission === 'default') {
        setShowPushPrompt(true)
      }
    }
  }, [])

  const subscribeToPush = async () => {
    setLoading(true)
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied.')
      }

      // Check key configuration
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured in frontend.')
      }

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('You must be signed in to subscribe.')

      // Save subscription
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })

      if (!res.ok) {
        throw new Error('Failed to register subscription on server.')
      }

      toasts.success('Push notifications enabled!')
      setShowPushPrompt(false)
    } catch (err: any) {
      toasts.error(err.message || 'Push registration failed.')
      console.error('Subscription error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Open tickets alert (Amber) */}
      {ticketCount > 0 && (
        <a href="/maintenance/history" className="block">
          <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex items-center justify-between shadow-sm hover:bg-amber-100/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <p className="text-xs font-semibold">
                You have {ticketCount} open maintenance {ticketCount === 1 ? 'request' : 'requests'}.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-700">
              <span>History</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>
      )}

      {/* Push subscription banner */}
      {showPushPrompt && (
        <div className="w-full bg-brand-light/30 border border-brand-light/70 text-gray-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-[#E5E8EF] text-brand">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Enable Push Notifications</h4>
              <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                Receive instant status updates on your maintenance tickets and critical housing updates.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowPushPrompt(false)}>
              Dismiss
            </Button>
            <Button size="sm" variant="primary" onClick={subscribeToPush} disabled={loading}>
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
