import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StudentCalendarList from '@/components/features/StudentCalendarList'

export const revalidate = 0

export default async function AcademicCalendarPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  let initialEntries = []
  try {
    const { data, error } = await supabase
      .from('academic_calendar')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching academic calendar:', error)
    } else if (data) {
      initialEntries = data
    }
  } catch (err) {
    console.error('Unexpected error fetching academic calendar:', err)
  }

  return (
    <div className="p-5 flex flex-col gap-5 text-left">
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
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Academic Calendar</h1>
          <p className="text-[10px] text-gray-400 font-medium">Important dates, term schedules, deadlines and holidays</p>
        </div>
      </div>

      {/* Calendar List with Search and Grouping */}
      <StudentCalendarList initialEntries={initialEntries} />
    </div>
  )
}
