import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroCard from '@/components/features/HeroCard'
import NotifBanner from '@/components/features/NotifBanner'
import AnnouncementCard from '@/components/features/AnnouncementCard'
import ThanksgivingBanner from '@/components/features/ThanksgivingBanner'

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

  const hasThanksgivingAnnouncement = announcements.some(
    (a) => a.title.toLowerCase().includes('thanksgiving') || a.body.toLowerCase().includes('thanksgiving')
  )

  // Modern categorized services (Dining is kept in the dedicated Dining tab)
  const SERVICE_CATEGORIES = [
    {
      title: 'Daily Essentials',
      description: 'Frequently accessed campus living tools',
      items: [
        {
          label: 'Notices & Bulletins',
          subtitle: 'Official announcements & flyers',
          href: '/announcements',
          icon: '📢',
          badge: announcements.length > 0 ? `${announcements.length} New` : undefined,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          label: 'Campus Events',
          subtitle: 'Social, academic & hall calendar',
          href: '/events',
          icon: '📅',
        },
        {
          label: 'Room Maintenance',
          subtitle: 'Submit repairs & work orders',
          href: '/maintenance',
          icon: '🛠️',
          badge: openTicketsCount > 0 ? `${openTicketsCount} Active` : undefined,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          label: 'Academic Calendar',
          subtitle: 'Key university term dates & deadlines',
          href: '/calendar',
          icon: '📆',
        },
      ],
    },
    {
      title: 'Residence & Housing Portal',
      description: 'Room documentation, requests, and self-service',
      items: [
        {
          label: 'Room Assessments',
          subtitle: 'Move-in & condition inspections',
          href: '/room-assessments',
          icon: '📋',
        },
        {
          label: 'My Housing Profile',
          subtitle: 'Assigned hall, room & meal plan',
          href: '/profile',
          icon: '👤',
        },
        {
          label: 'eRezLife Portal',
          subtitle: 'Applications & guest check-in',
          href: '/erezlife',
          icon: '🔑',
        },
        {
          label: 'Forms & Waivers',
          subtitle: 'Breaks, room change, agreements',
          href: '/forms',
          icon: '📑',
          badge: 'Holiday Form',
          badgeColor: 'bg-[#FFCC00]/20 text-[#660100] border-[#FFCC00]/40',
        },
      ],
    },
    {
      title: 'Support & Community Safety',
      description: 'Staff directory, confidential reporting & emergency contacts',
      items: [
        {
          label: 'Contact My RHC',
          subtitle: 'Residence Hall Coordinator directory',
          href: '/staff',
          icon: '📞',
        },
        {
          label: 'Report a Concern',
          subtitle: 'Confidential residential reports',
          href: '/report-concern',
          icon: '⚠️',
        },
        {
          label: 'Campus Police & Safety',
          subtitle: '24/7 emergency & safety contacts',
          href: '/resources/emergency',
          icon: '🚨',
          badge: '24/7',
          badgeColor: 'bg-red-50 text-red-700 border-red-200',
        },
        {
          label: 'Res Life Handbook',
          subtitle: 'Housing rules, policies & guidelines',
          href: '/handbooks',
          icon: '📖',
        },
      ],
    },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Resident Hero Profile */}
      {student && (
        <HeroCard
          studentName={student.full_name}
          hallName={student.hall_name}
          roomNumber={student.room_number}
        />
      )}

      {/* Push notifications and open tickets banner */}
      <NotifBanner ticketCount={openTicketsCount} />

      {/* Featured Seasonal Announcement Banner */}
      {hasThanksgivingAnnouncement && <ThanksgivingBanner />}

      {/* Categorized Services Directory */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-base">
              Resident Services & Hub
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Quick access to housing, maintenance, forms, and student support
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {SERVICE_CATEGORIES.map((category) => (
            <div key={category.title} className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="mb-3.5 pb-2 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-sm">
                    {category.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {category.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group bg-gray-50/70 hover:bg-white hover:border-[#660100]/30 border border-gray-200/70 p-3.5 rounded-xl transition-all duration-150 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xl p-2 bg-white rounded-lg border border-gray-100 shadow-2xs group-hover:scale-105 transition-transform">
                        {item.icon}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-gray-900 group-hover:text-[#660100] transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Announcements Section */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base">
              Latest Housing Updates
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Notices, policy updates, and flyers from Residence Life
            </p>
          </div>
          <Link
            href="/announcements"
            className="text-xs font-bold text-[#660100] hover:text-[#520100] hover:underline flex items-center gap-1"
          >
            <span>View All ({announcements.length})</span>
            <span>→</span>
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center text-xs text-gray-400">
            No announcements posted yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {announcements.map((ann, index) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                isPinned={index === 0 && ann.priority === 'urgent'}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
