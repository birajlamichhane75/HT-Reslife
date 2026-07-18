'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ERROR_MESSAGES: Record<string, string> = {
  not_htu_email: 'Only @htu.edu email addresses are allowed.',
  not_registered: 'Your email is not registered for on-campus housing. Contact the Housing Office.',
  auth_failed: 'Sign-in failed. Please try again.',
}

function LoginContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const errorParam = searchParams.get('error')
  const urlErrorMessage = errorParam
    ? ERROR_MESSAGES[errorParam] ?? 'Something went wrong.'
    : null

  const displayError = localError || urlErrorMessage

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    setSuccess(false)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.endsWith('@htu.edu')) {
      setLocalError('Only @htu.edu email addresses are allowed.')
      return
    }

    setLoading(true)
    try {
      const shouldBypass = process.env.NEXT_PUBLIC_BYPASS_EMAIL_AUTH === 'true'

      if (shouldBypass) {
        const res = await fetch('/api/auth/bypass', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: trimmedEmail }),
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setLocalError(data.error === 'not_registered' ? ERROR_MESSAGES.not_registered : (data.error || 'Failed to bypass authentication.'))
        } else if (data.action_link) {
          window.location.href = data.action_link
        }
      } else {
        const redirectUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) + '/confirm'
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: {
            emailRedirectTo: redirectUrl,
          },
        })

        if (error) {
          setLocalError(error.message || 'Failed to send login link.')
        } else {
          setSuccess(true)
          setEmail('')
        }
      }
    } catch (err: any) {
      setLocalError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#1E4E8C] mb-4">
            <span className="text-white font-bold text-xl">HT</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 font-display">HT Housing</h1>
          <p className="text-sm text-gray-500 mt-1">Huston-Tillotson University</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              Check your HTU email — we sent you a login link.
            </p>
          </div>
        )}

        {/* Error message */}
        {displayError && !success && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{displayError}</p>
          </div>
        )}

        {/* Sign in form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-650 mb-1.5">
              HTU Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="yourname@htu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1E4E8C] focus:ring-1 focus:ring-[#1E4E8C] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1E4E8C] text-white font-semibold text-sm hover:bg-[#1a4279] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending link...' : 'Send login link'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-450 leading-relaxed font-medium">
          Only registered on-campus residents can log in.
          Contact the Housing Office if you did not receive your link.
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F2F4F8] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-pulse">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#1E4E8C] mb-4">
            <span className="text-white font-bold text-xl">HT</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 font-display">HT Housing</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Huston-Tillotson University</p>
          <div className="h-10 bg-gray-100 rounded-xl mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
