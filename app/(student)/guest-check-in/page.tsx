import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function GuestCheckInPlaceholder() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 text-gray-400 hover:text-brand hover:bg-gray-150/50 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Guest Check-In</h1>
          <p className="text-[10px] text-gray-400 font-medium">Register and authorize overnight visitors</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-[#E5E8EF] p-8 rounded-2xl shadow-sm text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#FFCC00]/10 rounded-2xl flex items-center justify-center border border-[#FFCC00]/30 text-2xl shadow-inner text-brand">
          👋
        </div>
        <div className="flex flex-col gap-1.5 max-w-sm">
          <h3 className="font-display font-bold text-gray-900 text-base">Visitor Registration System</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Submit guest requests, view university visitation guidelines, and track active visitor passes. All guest check-ins require approval from your Residence Hall Coordinator.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-brand text-white font-semibold text-xs rounded-xl hover:bg-[#520100] transition-colors shadow-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
