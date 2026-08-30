import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FormItem } from '@/lib/types'

export const revalidate = 0

const DEFAULT_EREZLIFE_URL = 'https://htu.erezlife.com/'

const FALLBACK_LINKS: FormItem[] = [
  {
    id: 'rcr',
    title: 'Room Assessments (RCR)',
    description: 'Complete your room condition report at move-in and check room inspection updates.',
    url: 'https://htu.erezlife.com/',
    is_erezlife: true,
    sort_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'guest',
    title: 'Guest Check-In Form',
    description: 'Register overnight visitors and check status of approved guest passes.',
    url: 'https://htu.erezlife.com/',
    is_erezlife: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'forms',
    title: 'Forms & Requests',
    description: 'Fill out housing applications, roommate agreements, and move-in preference sheets.',
    url: 'https://htu.erezlife.com/',
    is_erezlife: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'duty',
    title: 'Duty Processes & Logs',
    description: 'Submit duty logs, incident reports, and round logs (Authorized Staff only).',
    url: 'https://htu.erezlife.com/',
    is_erezlife: true,
    sort_order: 3,
    created_at: new Date().toISOString()
  }
]

export default async function ERezLifePage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  let links: FormItem[] = []
  try {
    const { data, error } = await supabase
      .from('forms_directory')
      .select('*')
      .eq('is_erezlife', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      links = FALLBACK_LINKS
    } else {
      links = data
    }
  } catch (e) {
    links = FALLBACK_LINKS
  }

  // Get icons for the different links
  const getIcon = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('assessment') || t.includes('rcr')) return '📋'
    if (t.includes('guest') || t.includes('visitor')) return '👋'
    if (t.includes('duty') || t.includes('log') || t.includes('staff')) return '🛡️'
    return '📝'
  }

  return (
    <div className="p-5 flex flex-col gap-6">
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
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">eRezLife Portal</h1>
          <p className="text-[10px] text-gray-400 font-medium">HTU residential systems integration</p>
        </div>
      </div>

      {/* Landing explanation banner */}
      <div className="bg-gradient-to-br from-[#660100] to-[#3B0000] rounded-2xl p-6 text-white shadow-md border border-[#660100]/20 relative overflow-hidden flex flex-col gap-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <span className="px-3 py-1 bg-[#FFCC00]/20 border border-[#FFCC00]/40 text-[#FFCC00] rounded-full text-[10px] font-bold uppercase tracking-wider self-start">
          Campus Portal
        </span>
        <div className="flex flex-col gap-1.5 max-w-lg">
          <h2 className="font-display font-bold text-base md:text-lg">What is eRezLife?</h2>
          <p className="text-xs text-white/90 leading-relaxed font-medium">
            Huston-Tillotson University partners with eRezLife to manage key residential services. You can use the buttons below to deep-link directly into corresponding forms and operations, or access the general login page.
          </p>
        </div>
      </div>

      {/* Explanatory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-[#E5E8EF] rounded-xl shadow-sm flex gap-3">
          <div className="text-xl">📋</div>
          <div className="flex flex-col gap-1">
            <h4 className="font-display font-bold text-gray-900 text-xs">Room Assessments (RCR)</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Verify your Room Condition Report at check-in, record inspections, document damages, and review check-out logs.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E5E8EF] rounded-xl shadow-sm flex gap-3">
          <div className="text-xl">👋</div>
          <div className="flex flex-col gap-1">
            <h4 className="font-display font-bold text-gray-900 text-xs">Guest Check-In</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Register overnight visitors, submit emergency contacts, and obtain hall coordinator permissions.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E5E8EF] rounded-xl shadow-sm flex gap-3">
          <div className="text-xl">📝</div>
          <div className="flex flex-col gap-1">
            <h4 className="font-display font-bold text-gray-900 text-xs">Forms & Sign-ups</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Submit room change requests, roommate search profiles, housing contract renewals, and select move-in time slots.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E5E8EF] rounded-xl shadow-sm flex gap-3">
          <div className="text-xl">🛡️</div>
          <div className="flex flex-col gap-1">
            <h4 className="font-display font-bold text-gray-900 text-xs">Duty Processes & Logs</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Enables Resident Assistants and staff members to file round logs, incident reports, and duty shift check-ins.
            </p>
          </div>
        </div>
      </div>

      {/* Deep-linking Actions Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-gray-900 text-sm">Deep-Link Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {links.map((link) => {
            const destinationUrl = link.url && link.url.trim() !== '' ? link.url : DEFAULT_EREZLIFE_URL
            
            return (
              <div 
                key={link.id}
                className="bg-white border border-[#E5E8EF] p-4 rounded-xl flex flex-col gap-3.5 shadow-sm justify-between hover:border-brand/20 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFCC00]/10 border border-[#FFCC00]/25 flex items-center justify-center text-lg flex-shrink-0">
                    {getIcon(link.title)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-display font-bold text-gray-900 text-xs leading-tight">{link.title}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{link.description}</p>
                  </div>
                </div>

                <a
                  href={destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 bg-[#660100] hover:bg-[#520100] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  Launch Service <span>↗</span>
                </a>
              </div>
            )
          })}
        </div>
      </div>

      {/* General Portal Action */}
      <div className="bg-[#FFCC00]/10 border border-[#FFCC00]/25 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h4 className="font-display font-bold text-gray-900 text-xs">Need to access the general dashboard?</h4>
          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
            Click below to navigate directly to the general eRezLife login interface.
          </p>
        </div>
        <a
          href={DEFAULT_EREZLIFE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#FFCC00] hover:bg-[#E6B800] text-[#660100] font-bold text-xs rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          General eRezLife Login
        </a>
      </div>
    </div>
  )
}
