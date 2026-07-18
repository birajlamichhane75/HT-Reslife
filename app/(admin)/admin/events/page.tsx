import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EventManager } from '@/components/admin/EventEditor'

export const revalidate = 0

export default async function AdminEventsPage() {
  const supabase = createServerSupabaseClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return <EventManager initialEvents={events || []} />
}
