import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AnnouncementsViewer from '@/components/features/AnnouncementsViewer'

export const revalidate = 0

export default async function AnnouncementsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: announcements, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
  }

  const allAnnouncements = announcements || []

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-5">
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
            Announcements & Bulletins
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Official Residence Life notices, campus updates & event flyers
          </p>
        </div>
      </div>

      {/* Announcements Interactive Viewer */}
      <AnnouncementsViewer initialAnnouncements={allAnnouncements} />
    </div>
  )
}
