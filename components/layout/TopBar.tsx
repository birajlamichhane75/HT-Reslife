'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TopBar({ studentName }: { studentName: string }) {
  const supabase = createClient()
  const router = useRouter()

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
    <header className="sticky top-0 bg-white border-b border-[#E5E8EF] z-30 px-5 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo-ht.png" alt="HT Logo" className="w-8 h-8 object-contain" />
        <div>
          <h2 className="text-sm font-semibold text-gray-900 leading-tight font-display">HT Housing</h2>
          {studentName && (
            <p className="text-[10px] text-gray-400 font-medium">Hello, {studentName.split(' ')[0]}</p>
          )}
        </div>
      </div>
      
      <button
        onClick={handleSignOut}
        className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-50"
      >
        Sign Out
      </button>
    </header>
  )
}
