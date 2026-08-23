'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  not_htu_email: 'Only @htu.edu email addresses are allowed.',
  not_registered: 'Your email is not registered for on-campus housing. Contact the Housing Office.',
  auth_failed: 'Sign-in failed. Please try again.',
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const errorParam = searchParams.get('error')
  const urlErrorMessage = errorParam
    ? ERROR_MESSAGES[errorParam] ?? 'Something went wrong.'
    : null

  const displayError = localError || urlErrorMessage

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.endsWith('@htu.edu')) {
      setLocalError('Only @htu.edu email addresses are allowed.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setLocalError(data.error || 'Failed to authenticate.')
      } else {
        // Redirect based on role
        if (data.role === 'admin') {
          router.push('/admin')
        } else if (data.role === 'cafeteria_admin') {
          router.push('/cafeteria-admin')
        } else {
          router.push('/')
        }
      }
    } catch (err: any) {
      setLocalError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFAEB] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Logo / Brand */}
        <div className="mb-6 text-center flex flex-col items-center">
          <img src="/logo-mascot.png" alt="HTU Mascot" className="w-24 h-24 object-contain mb-3" />
          <h1 className="text-xl font-semibold text-gray-900 font-display">HT Housing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Huston-Tillotson University</p>
        </div>

        {/* Error message */}
        {displayError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{displayError}</p>
          </div>
        )}

        {/* Sign in form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-605 mb-1.5">
              HTU Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="your@htu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-xs font-semibold text-gray-605 mb-1.5">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-[35px] text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.237m2.096-2.096A9.967 9.967 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-6-6l-3-3m-3-3l3 3m0 0l3 3m-9.75-9.75l1.25 1.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-[#520100] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Entering...' : 'Enter app'}
          </button>
        </form>


        <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed font-medium">
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
      <main className="min-h-screen bg-[#FFFAEB] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 font-display">HT Housing</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Huston-Tillotson University</p>
          <div className="h-10 w-full bg-gray-100 rounded-xl mb-4"></div>
          <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
