'use client'

import React from 'react'
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

  const handleSignOut = async () => {
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
        <div>
          <p className="text-xs font-bold text-gray-900 leading-tight">{studentName}</p>
          {(hallName || roomNumber) && (
            <p className="text-[10px] text-gray-450 font-semibold mt-0.5 leading-tight">
              {hallName ?? 'Unassigned'} {roomNumber ? `• Room ${roomNumber}` : ''}
            </p>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-650 font-semibold text-xs hover:bg-red-100 hover:text-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
