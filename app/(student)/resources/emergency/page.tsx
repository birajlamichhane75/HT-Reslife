import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function EmergencyPlaceholder() {
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
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Emergency & Safety</h1>
          <p className="text-[10px] text-gray-400 font-medium">Critical contacts & safety procedures</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-[#E5E8EF] p-6 rounded-2xl shadow-sm flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-2 border-b border-gray-100 pb-5">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200 text-2xl shadow-inner text-red-650 animate-pulse">
            🚨
          </div>
          <h3 className="font-display font-bold text-gray-900 text-base">Immediate Emergency Assistance</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
            For critical emergencies, crime, or medical issues, use the contacts below immediately.
          </p>
        </div>

        {/* Contact Numbers List */}
        <div className="flex flex-col gap-3">
          <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-red-800">Campus Safety & Security</p>
              <p className="text-[10px] text-red-600 font-medium">24/7 Security Duty Line</p>
            </div>
            <a 
              href="tel:5125053010" 
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm"
            >
              Call 512-505-3010
            </a>
          </div>

          <div className="p-3.5 bg-[#FFCC00]/10 border border-[#FFCC00]/25 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-[#660100]">Residence Life Office</p>
              <p className="text-[10px] text-gray-500 font-medium">Normal Working Hours</p>
            </div>
            <a 
              href="tel:5125053000" 
              className="px-3.5 py-1.5 bg-[#660100] hover:bg-[#520100] text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm"
            >
              Call 512-505-3000
            </a>
          </div>

          <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-800">Local Fire / Police / EMS</p>
              <p className="text-[10px] text-gray-400 font-medium">Austin Emergency Dispatch</p>
            </div>
            <a 
              href="tel:911" 
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm"
            >
              Call 911
            </a>
          </div>
        </div>

        <Link
          href="/"
          className="mt-2 text-center py-2 bg-brand text-white font-semibold text-xs rounded-xl hover:bg-[#520100] transition-colors shadow-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
