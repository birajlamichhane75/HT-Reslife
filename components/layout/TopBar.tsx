'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TopBar({ studentName }: { studentName: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  const handleSignOutClick = () => {
    setShowSignOutModal(true)
  }

  const confirmSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <header className="sticky top-0 bg-white border-b border-[#E5E8EF] z-30 px-5 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo-ht.png" alt="HT Logo" className="w-8 h-8 object-contain" />
        <Link href="/profile" className="hover:opacity-80 active:scale-[0.98] transition-all text-left group">
          <h2 className="text-sm font-semibold text-gray-900 leading-tight font-display group-hover:text-brand transition-colors">HT Housing</h2>
          {studentName && (
            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
              Hello, {studentName.split(' ')[0]} 
              <span className="text-[8px] px-1 bg-brand-light text-brand rounded font-bold uppercase scale-90 origin-left">Profile</span>
            </p>
          )}
        </Link>
      </div>
      
      <button
        onClick={handleSignOutClick}
        className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-50"
      >
        Sign Out
      </button>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col gap-5 transform scale-100 transition-transform duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Sign Out</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">Are you sure you want to sign out of your housing portal?</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
