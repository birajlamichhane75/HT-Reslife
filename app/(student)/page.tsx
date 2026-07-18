import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroCard from '@/components/features/HeroCard'
import NotifBanner from '@/components/features/NotifBanner'
import AnnouncementCard from '@/components/features/AnnouncementCard'

export const revalidate = 0

export default async function StudentDashboard() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Parallel fetches
  const [studentRes, announcementsRes, ticketsCountRes] = await Promise.all([
    supabase
      .from('students')
      .select('*')
      .eq('id', session.user.id)
      .single(),
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('maintenance_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', session.user.id)
      .eq('status', 'open'),
  ])

  const student = studentRes.data
  const announcements = announcementsRes.data || []
  const openTicketsCount = ticketsCountRes.count || 0

  const QUICK_ACTIONS = [
    {
      label: 'Maintenance',
      href: '/maintenance',
      bg: 'bg-orange-50/50 border-orange-100 hover:border-orange-300 text-orange-700',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      label: 'Events',
      href: '/events',
      bg: 'bg-green-50/50 border-green-100 hover:border-green-300 text-green-700',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Staff Directory',
      href: '/staff',
      bg: 'bg-blue-50/50 border-blue-100 hover:border-blue-300 text-blue-700',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Campus Map',
      href: '/map',
      bg: 'bg-purple-50/50 border-purple-100 hover:border-purple-300 text-purple-700',
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      label: 'Updates',
      href: '/announcements',
      bg: 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300 text-indigo-700',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      label: 'FAQ Accordion',
      href: '/faq',
      bg: 'bg-pink-50/50 border-pink-100 hover:border-pink-300 text-pink-700',
      icon: (
        <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Move-in Checklist',
      href: '/movein',
      bg: 'bg-teal-50/50 border-teal-100 hover:border-teal-300 text-teal-700',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Housing Apply',
      href: '#',
      bg: 'bg-rose-50/50 border-rose-100 hover:border-rose-300 text-rose-700',
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
    },
  ]

  return (
    <div className="p-5 flex flex-col gap-6">
      {student && (
        <HeroCard
          studentName={student.full_name}
          hallName={student.hall_name}
          roomNumber={student.room_number}
        />
      )}

      {/* Push notifications and open tickets banner container */}
      <NotifBanner ticketCount={openTicketsCount} />

      {/* Quick Action Grid */}
      <div>
        <h3 className="font-display font-semibold text-gray-900 text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3.5">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href}>
              <div className={`p-4 rounded-xl border flex flex-col gap-3 items-start transition-all duration-200 shadow-sm active:scale-[0.98] ${action.bg}`}>
                <div className="p-1.5 bg-white rounded-lg border border-inherit shadow-sm">
                  {action.icon}
                </div>
                <span className="text-xs font-semibold leading-tight">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Announcements */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-gray-900 text-sm">Latest Updates</h3>
          <Link href="/announcements" className="text-xs font-semibold text-brand hover:underline">
            View All
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-8 rounded-2xl text-center text-xs text-gray-400">
            No announcements posted yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {announcements.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
