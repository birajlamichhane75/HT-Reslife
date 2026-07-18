import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()

  // Calculate date thresholds
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const now = new Date().toISOString()
  
  // Parallel fetch counts & data
  const [
    studentsCountRes,
    openTicketsCountRes,
    eventsCountRes,
    announcementsCountRes,
    recentTicketsRes
  ] = await Promise.all([
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('maintenance_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('event_date', now),
    supabase
      .from('announcements')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('maintenance_tickets')
      .select('*, student:students(full_name, hall_name, room_number)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalStudents = studentsCountRes.count || 0
  const openTickets = openTicketsCountRes.count || 0
  const upcomingEvents = eventsCountRes.count || 0
  const activeAnnouncements = announcementsCountRes.count || 0
  const recentTickets = recentTicketsRes.data || []

  const METRICS = [
    {
      label: 'Registered Students',
      value: totalStudents,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: 'bg-blue-50/50 border-blue-100',
    },
    {
      label: 'Open Maintenance',
      value: openTickets,
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bg: 'bg-amber-50/50 border-amber-100',
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents,
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bg: 'bg-green-50/50 border-green-100',
    },
    {
      label: 'Active Updates (30d)',
      value: activeAnnouncements,
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      bg: 'bg-indigo-50/50 border-indigo-100',
    },
  ]

  const priorityColors = {
    routine: 'bg-gray-50 text-gray-600 border-gray-200',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
    emergency: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-950">Dashboard</h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5">Housing Management Portal</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric) => (
          <Card key={metric.label} className={`flex items-center gap-4 border ${metric.bg} p-4`}>
            <div className="p-2.5 bg-white rounded-xl border border-inherit shadow-sm">
              {metric.icon}
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{metric.label}</span>
              <p className="font-display font-bold text-xl text-gray-900 mt-0.5 leading-none">{metric.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Open Tickets Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-gray-950 text-sm">Recent Open Tickets</h2>
          <Link href="/admin/maintenance">
            <span className="text-xs font-bold text-brand hover:underline">Manage All</span>
          </Link>
        </div>

        <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden">
          {recentTickets.length === 0 ? (
            <div className="text-center py-10 text-gray-450 text-xs">
              All clear! No open maintenance tickets.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Issue</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-750">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {ticket.student?.full_name || 'Unknown Student'}
                      </td>
                      <td className="px-5 py-4">
                        Room {ticket.room_number} {ticket.student?.hall_name ? `• ${ticket.student.hall_name}` : ''}
                      </td>
                      <td className="px-5 py-4 font-medium">{ticket.issue_type}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[ticket.priority as keyof typeof priorityColors] || ''}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/maintenance`}>
                          <span className="text-brand hover:underline font-bold">View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
