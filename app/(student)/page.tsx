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
  if (student && student.role === 'cafeteria_admin') {
    redirect('/cafeteria-admin')
  }
  const announcements = announcementsRes.data || []
  const openTicketsCount = ticketsCountRes.count || 0

  const QUICK_ACTIONS = [
    {
      label: 'My Housing',
      href: '/profile',
      bg: 'bg-[#660100]/5 border-[#660100]/15 hover:border-[#660100]/35 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'eRezLife',
      href: '/erezlife',
      bg: 'bg-[#FFCC00]/10 border-[#FFCC00]/25 hover:border-[#FFCC00]/45 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      label: 'Room Assessments',
      href: '/room-assessments',
      bg: 'bg-[#660100]/5 border-[#660100]/15 hover:border-[#660100]/35 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Guest Check-In',
      href: '/guest-check-in',
      bg: 'bg-[#FFCC00]/10 border-[#FFCC00]/25 hover:border-[#FFCC00]/45 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: 'Maintenance Requests',
      href: '/maintenance',
      bg: 'bg-[#660100]/5 border-[#660100]/15 hover:border-[#660100]/35 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Report a Concern',
      href: '/report-concern',
      bg: 'bg-[#FFCC00]/10 border-[#FFCC00]/25 hover:border-[#FFCC00]/45 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: 'Forms & Requests',
      href: '/forms',
      bg: 'bg-[#660100]/5 border-[#660100]/15 hover:border-[#660100]/35 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Contact My RHC',
      href: '/staff',
      bg: 'bg-[#FFCC00]/10 border-[#FFCC00]/25 hover:border-[#FFCC00]/45 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      label: 'Residence Life Handbook',
      href: '/handbooks',
      bg: 'bg-[#660100]/5 border-[#660100]/15 hover:border-[#660100]/35 text-[#660100]',
      icon: (
        <svg className="w-5 h-5 text-[#660100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: 'Emergency/Safety Info',
      href: '/resources/emergency',
      bg: 'bg-red-50 border-red-100 hover:border-red-300 text-red-750',
      icon: (
        <svg className="w-5 h-5 text-red-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {QUICK_ACTIONS.map((action) => {
            const isExternal = action.href.startsWith('http')
            
            return (
              <Link 
                key={action.label} 
                href={action.href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <div className={`p-4 rounded-xl border flex flex-col gap-3 items-start transition-all duration-200 shadow-sm active:scale-[0.98] ${action.bg}`}>
                  <div className="p-1.5 bg-white rounded-lg border border-inherit shadow-sm">
                    {action.icon}
                  </div>
                  <span className="text-xs font-semibold leading-tight">{action.label}</span>
                </div>
              </Link>
            )
          })}
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
