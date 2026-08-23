import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function StudentProfilePage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!student) {
    return (
      <div className="p-6 text-center text-gray-500">
        Profile details not found. Please contact the housing office.
      </div>
    )
  }

  // Generate initials for avatar
  const initials = student.full_name
    ? student.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'HT'

  return (
    <div className="p-5 flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 font-display">My Profile</h1>
      </div>

      {/* Hero Avatar Card */}
      <div className="bg-white border border-[#E5E8EF] rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-sm relative overflow-hidden">
        {/* Decorative corner background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -mr-8 -mt-8" />
        
        <div className="w-20 h-20 rounded-2xl bg-brand text-white flex items-center justify-center font-display text-2xl font-bold border-4 border-white shadow-md relative z-10">
          {initials}
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{student.full_name}</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">{student.email}</p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-brand-light text-brand text-[10px] font-bold uppercase tracking-wider">
            {student.role}
          </span>
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold uppercase tracking-wider">
            Active Status
          </span>
        </div>
      </div>

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Housing Assignment Info */}
        <div className="bg-white border border-[#E5E8EF] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-gray-900 text-sm">Housing Assignment</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Residence Hall</p>
              <p className="text-gray-900 font-semibold mt-0.5">{student.building ?? 'Unassigned'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 font-medium">Suite/Room No.</p>
                <p className="text-gray-900 font-semibold mt-0.5">{student.suite ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Bed/Sub-Room</p>
                <p className="text-gray-900 font-semibold mt-0.5">{student.room ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic & System Info */}
        <div className="bg-white border border-[#E5E8EF] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-gray-900 text-sm">Academic Details</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Student ID</p>
              <p className="text-gray-900 font-semibold mt-0.5">{student.student_id ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Session</p>
              <p className="text-gray-900 font-semibold mt-0.5">{student.session ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Cohort Group</p>
              <p className="text-gray-900 font-semibold mt-0.5">{student.cohort ?? 'N/A'}</p>
            </div>
          </div>
        </div>

      </div>

      <p className="text-center text-[10px] text-gray-400 mt-2">
        To modify your housing registration details, please contact the Residence Life and Housing Office.
      </p>
    </div>
  )
}
