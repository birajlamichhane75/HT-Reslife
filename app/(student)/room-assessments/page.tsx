import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function RoomAssessmentsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 text-gray-500 hover:text-[#660100] bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all shadow-2xs"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900 leading-tight">
            Room Condition Assessments
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Move-in condition reports (RCR), term inspections, and checkout verifications
          </p>
        </div>
      </div>

      {/* Current Room Status Card */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Current Term: Active
          </span>
          <h3 className="font-display font-bold text-gray-900 text-base mt-1.5">
            {student?.hall_name || 'Residence Hall'} • Room {student?.room_number || 'N/A'}
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Initial check-in assessment recorded upon arrival.
          </p>
        </div>

        <Link
          href="/maintenance"
          className="px-4 py-2 bg-[#660100]/5 hover:bg-[#660100]/10 text-[#660100] border border-[#660100]/20 rounded-xl text-xs font-bold transition-colors"
        >
          Report Damage or Issue →
        </Link>
      </div>

      {/* Assessment Cycle Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
            ✓
          </div>
          <h4 className="font-display font-bold text-gray-900 text-xs">1. Move-In RCR</h4>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
            Completed within 48 hours of move-in. Documents existing fixtures, furniture, and paint condition.
          </p>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
            🔍
          </div>
          <h4 className="font-display font-bold text-gray-900 text-xs">2. Health & Safety Checks</h4>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
            Periodic inspections conducted by Residence Life staff to ensure smoke detectors and life-safety compliance.
          </p>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-200">
            📦
          </div>
          <h4 className="font-display font-bold text-gray-900 text-xs">3. Checkout Walkthrough</h4>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
            Final inspection at the end of the academic year with your RA prior to key surrender and deposit return.
          </p>
        </div>
      </div>
    </div>
  )
}
