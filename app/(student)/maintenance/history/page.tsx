import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MaintenanceTicketCard from '@/components/features/MaintenanceTicketCard'

export const revalidate = 0

export default async function MaintenanceHistoryPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: tickets, error } = await supabase
    .from('maintenance_tickets')
    .select('*, student:students(full_name, email, hall_name)')
    .eq('student_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance history:', error)
  }

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/maintenance"
            className="p-1.5 text-gray-400 hover:text-brand hover:bg-gray-150/50 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Request History</h1>
            <p className="text-[10px] text-gray-400 font-medium">Your current and past tickets</p>
          </div>
        </div>
        <Link href="/maintenance">
          <span className="text-xs font-bold text-brand hover:underline">New Request</span>
        </Link>
      </div>

      {/* Tickets List */}
      {!tickets || tickets.length === 0 ? (
        <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-400 flex flex-col gap-3 items-center justify-center">
          <p>You have not submitted any maintenance requests yet.</p>
          <Link href="/maintenance">
            <span className="text-xs font-bold text-brand hover:underline">Submit Your First Request</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((t) => (
            <MaintenanceTicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </div>
  )
}
