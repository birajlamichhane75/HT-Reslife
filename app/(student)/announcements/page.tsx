import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AnnouncementCard from '@/components/features/AnnouncementCard'

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

  return (
    <div className="p-5 flex flex-col gap-5">
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
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Announcements</h1>
          <p className="text-[10px] text-gray-400 font-medium">HT Housing Updates & Notifications</p>
        </div>
      </div>

      {/* Announcements List */}
      {!announcements || announcements.length === 0 ? (
        <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-400">
          No announcements posted yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map((ann) => (
            <AnnouncementCard key={ann.id} announcement={ann} />
          ))}
        </div>
      )}
    </div>
  )
}
