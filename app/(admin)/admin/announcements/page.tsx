import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AnnouncementManager } from '@/components/admin/AnnouncementEditor'

export const revalidate = 0

export default async function AdminAnnouncementsPage() {
  const supabase = createServerSupabaseClient()
  const { data: announcements, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
  }

  return <AnnouncementManager initialAnnouncements={announcements || []} />
}
