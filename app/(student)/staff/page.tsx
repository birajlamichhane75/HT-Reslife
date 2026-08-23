import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StaffList } from '@/components/features/StaffCard'

export const revalidate = 0

export default async function StaffDirectoryPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: staff, error } = await supabase
    .from('staff_directory')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching staff directory:', error)
  }

  // Fetch Resident Assistants (RAs) from students table
  let ras: any[] = []
  try {
    const { data: raData, error: raError } = await supabase
      .from('students')
      .select('id, full_name, email, building, suite, room, bed, is_ra')
      .eq('is_ra', true)
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (raError) {
      console.warn('Could not fetch RAs (column is_ra may need to be added to database):', raError.message)
    } else if (raData) {
      ras = raData
    }
  } catch (err) {
    console.error('Error fetching RAs:', err)
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
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Staff Directory</h1>
          <p className="text-[10px] text-gray-400 font-medium">Contact your housing & RA support team</p>
        </div>
      </div>

      {/* Staff search and listings container */}
      <StaffList initialStaff={staff || []} initialRas={ras} />
    </div>
  )
}
