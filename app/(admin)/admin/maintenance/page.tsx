import { createServerSupabaseClient } from '@/lib/supabase/server'
import TicketManager from '@/components/admin/TicketManager'

export const revalidate = 0

export default async function AdminMaintenancePage() {
  const supabase = createServerSupabaseClient()
  const { data: tickets, error } = await supabase
    .from('maintenance_tickets')
    .select('*, student:students(full_name, email, hall_name, room_number)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance tickets:', error)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Maintenance Manager</h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5 font-medium">Track and resolve residence requests</p>
      </div>

      <TicketManager initialTickets={tickets || []} />
    </div>
  )
}
