import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FormItem } from '@/lib/types'
import { THANKSGIVING_BREAK_FORM } from '@/lib/constants'
import FormsViewer from '@/components/features/FormsViewer'

export const revalidate = 0

const DEFAULT_FORM_FALLBACK_URL = 'https://htu.edu'

const FALLBACK_FORMS: FormItem[] = [
  {
    id: THANKSGIVING_BREAK_FORM.id,
    title: THANKSGIVING_BREAK_FORM.title,
    description: THANKSGIVING_BREAK_FORM.description,
    url: THANKSGIVING_BREAK_FORM.url,
    is_erezlife: false,
    sort_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'room-change',
    title: 'Room Change Request Form',
    description: 'Request an official room reassignment or hall swap for the active semester.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'key-replace',
    title: 'Key Replacement & Lock Change Agreement',
    description: 'Acknowledge terms and fees for replacement of lost residence hall keys or lock recore.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'liability',
    title: 'Liability & Student Property Damage Waiver',
    description: 'Standard release of liability and resident personal property responsibility guidelines.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'meal-plan',
    title: 'Meal Plan Adjustment Request',
    description: 'Submit tier changes or dietary accommodation requests for the cafeteria union meal plan.',
    url: 'https://htu.edu',
    is_erezlife: false,
    sort_order: 4,
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
      const hasThanksgiving = data.some(
        (f) => f.title.toLowerCase().includes('thanksgiving') || f.id === THANKSGIVING_BREAK_FORM.id
      )
      if (!hasThanksgiving) {
        forms = [FALLBACK_FORMS[0], ...data]
      } else {
        forms = data
      }
    }
  } catch (e) {
    forms = FALLBACK_FORMS
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 text-gray-500 hover:text-[#660100] bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all shadow-2xs"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900 leading-tight">
            Forms & Requests Directory
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Housing documentation, break stay applications, and eRezLife links
          </p>
        </div>
      </div>

      {/* Forms Viewer */}
      <FormsViewer forms={forms} />
    </div>
  )
}
