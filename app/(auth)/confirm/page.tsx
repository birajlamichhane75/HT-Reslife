'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tokenHash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type') || 'magiclink'
  const isLinkInvalid = !tokenHash && !code

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (isLinkInvalid) {
      setError('Invalid or missing confirmation token. Please request a new login link.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_hash: tokenHash,
          code: code,
          type,
        }),
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        if (result.error === 'not_registered' || result.error === 'not_htu_email') {
          router.push(`/login?error=${result.error}`)
        } else {
          setError(result.error || 'Verification failed. The link may have expired or already been used.')
          setLoading(false)
        }
        return
      }

      if (result.success) {
        router.refresh()
        const destination = result.role === 'admin' ? '/admin' : '/'
        router.push(destination)
      } else {
        setError('No active session found. Please try logging in again.')
        setLoading(false)
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F2F4F8] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#1E4E8C] mb-4 shadow-md shadow-[#1E4E8C]/20 hover:scale-105 transition-transform duration-250">
            <span className="text-white font-bold text-xl">HT</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 font-display">HT Housing</h1>
          <p className="text-sm text-gray-500 mt-1">Huston-Tillotson University</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-700 font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Page Content */}
        {!error && isLinkInvalid ? (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
              <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                This verification link is invalid or incomplete. Please request a new one from the sign-in page.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors shadow-sm"
            >
              Back to Sign-in
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Confirm Your Sign-in</h2>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Please click the button below to complete your sign-in to HT Housing. 
                This verification step ensures a secure session and prevents external email scanners from expiring your link.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1E4E8C] text-white font-semibold text-sm hover:bg-[#1a4279] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Confirm Sign-in'
              )}
            </button>

            {error && (
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gray-50 text-gray-650 font-semibold text-sm hover:bg-gray-100 transition-colors border border-gray-150"
              >
                Back to Login
              </button>
            )}
          </form>
        )}

        <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed font-medium">
          If you didn't request this sign-in link, you can safely ignore this page.
        </p>
      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F2F4F8] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#1E4E8C] mb-4 shadow-md shadow-[#1E4E8C]/20">
            <span className="text-white font-bold text-xl">HT</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 font-display">HT Housing</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Huston-Tillotson University</p>
          <div className="flex items-center justify-center gap-3 py-3 text-sm text-gray-500 font-medium">
            <svg className="animate-spin h-5 w-5 text-[#1E4E8C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
      </main>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
