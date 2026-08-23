'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NAV_ITEMS } from '@/components/layout/BottomNav'
import clsx from 'clsx'

export default function StudentSidebar({
  studentName,
  hallName,
  roomNumber,
}: {
  studentName: string
  hallName: string | null
  roomNumber: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
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
    <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-[#E5E8EF] md:bg-white md:h-screen md:sticky md:top-0 md:z-30 p-5 justify-between flex-shrink-0">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img src="/logo-ht.png" alt="HT Logo" className="w-9 h-9 object-contain" />
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight font-display">HT Housing</h2>
            <p className="text-[9px] text-brand font-bold uppercase tracking-wider">Student Portal</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold',
                  active
                    ? 'bg-brand-light text-brand font-bold'
                    : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                )}
              >
                <div className={clsx(
                  'transition-transform duration-200 flex-shrink-0',
                  active ? 'text-brand scale-105' : 'text-gray-400'
                )}>
                  {item.icon(active)}
                </div>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile details and Sign Out */}
      <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
        <Link 
          href="/profile" 
          className="block p-2.5 rounded-xl hover:bg-gray-50/80 active:bg-gray-100 border border-transparent hover:border-gray-100 transition-all duration-200 group text-left"
        >
          <div className="flex justify-between items-center">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-gray-900 group-hover:text-brand transition-colors leading-tight truncate">{studentName}</p>
              {(hallName || roomNumber) && (
                <p className="text-[10px] text-gray-450 font-semibold mt-0.5 leading-tight truncate">
                  {hallName ?? 'Unassigned'} {roomNumber ? `• Room ${roomNumber}` : ''}
                </p>
              )}
            </div>
            <div className="text-gray-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
        <button
          onClick={handleSignOutClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-650 font-semibold text-xs hover:bg-red-100 hover:text-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

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
              <div>
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
    </aside>
  )
}
