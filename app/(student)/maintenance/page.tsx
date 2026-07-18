import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MaintenanceForm from '@/components/features/MaintenanceForm'

export default async function MaintenanceRequestPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('room_number')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">File Request</h1>
            <p className="text-[10px] text-gray-400 font-medium">Submit room maintenance request</p>
          </div>
        </div>
        <Link href="/maintenance/history">
          <span className="text-xs font-bold text-brand hover:underline">View History</span>
        </Link>
      </div>

      <MaintenanceForm initialRoom={student?.room_number ?? ''} />
    </div>
  )
}
