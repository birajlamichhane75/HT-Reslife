import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AnnouncementCard from '@/components/features/AnnouncementCard'
import { THANKSGIVING_BREAK_FORM } from '@/lib/constants'

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

  // Filter out any duplicate if it happens to be in DB
  const otherAnnouncements = (announcements || []).filter(
    (ann) => !ann.title.toLowerCase().includes('thanksgiving break housing form')
  )

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
      <div className="flex flex-col gap-4">
        {/* Pinned Seasonal Housing Form */}
        <AnnouncementCard
          isPinned
          defaultExpanded
          actionUrl={THANKSGIVING_BREAK_FORM.url}
          actionLabel="Complete Housing Form"
          announcement={{
            id: THANKSGIVING_BREAK_FORM.id,
            title: THANKSGIVING_BREAK_FORM.title,
            body:
              'Residential students planning to stay on campus during any portion of Thanksgiving Break (2026–2027) are required to submit this registration form.\n\nPlease complete and submit your request to confirm your stay and ensure uninterrupted residence hall access and dining coordination.',
            priority: 'urgent',
            created_by: 'Residence Life & Housing Office',
            created_at: new Date().toISOString(),
          }}
        />

        {/* Other database announcements */}
        {otherAnnouncements.map((ann) => (
          <AnnouncementCard key={ann.id} announcement={ann} />
        ))}
      </div>
    </div>
  )
}
