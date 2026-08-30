import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FormItem } from '@/lib/types'

export const revalidate = 0

const DEFAULT_FORM_FALLBACK_URL = 'https://htu.edu'

const FALLBACK_FORMS: FormItem[] = [
  {
    id: 'room-change',
    title: 'Room Change Request Form',
    description: 'Request a room change or swap for the current academic semester.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'key-replace',
    title: 'Key Replacement Agreement',
    description: 'Acknowledge terms and fees for replacement of residence hall keys.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'liability',
    title: 'Liability & Property Damage Waiver',
    description: 'Standard release of liability and student property responsibility disclaimer.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'meal-plan',
    title: 'Meal Plan Adjustment Request',
    description: 'Submit changes to your default student union meal plan tier.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 3,
    created_at: new Date().toISOString()
  }
]

export default async function FormsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  let forms: FormItem[] = []
  try {
    const { data, error } = await supabase
      .from('forms_directory')
      .select('*')
      .eq('is_erezlife', false)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      forms = FALLBACK_FORMS
    } else {
      forms = data
    }
  } catch (e) {
    forms = FALLBACK_FORMS
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
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Forms & Requests</h1>
          <p className="text-[10px] text-gray-400 font-medium">Housing forms, waivers, and releases</p>
        </div>
      </div>

      {/* Main explanation card */}
      <div className="bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xl">📝</div>
          <div>
            <h4 className="font-display font-bold text-gray-900 text-xs">HT Housing Forms Directory</h4>
            <p className="text-[10px] text-gray-450 font-semibold">Access required residential paperwork online</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Please download and review the required forms below. Once completed, submit them to the Residential Life Office or your Residence Hall Coordinator. Fully digital workflow submissions are currently in integration.
        </p>
      </div>

      {/* Forms Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-gray-900 text-sm">Available Paperwork</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form) => {
            const destinationUrl = form.url && form.url.trim() !== '' ? form.url : DEFAULT_FORM_FALLBACK_URL
            
            return (
              <div 
                key={form.id} 
                className="bg-white border border-[#E5E8EF] p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:border-brand/20 transition-colors"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#FFCC00] tracking-wider">Document</span>
                  <h4 className="font-display font-bold text-gray-900 text-xs leading-tight">{form.title}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{form.description}</p>
                </div>
                <a
                  href={destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 bg-brand hover:bg-[#520100] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  Access Form <span>↗</span>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
