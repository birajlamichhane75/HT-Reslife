import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MealSlot } from '@/lib/types'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Parse the date carefully to avoid timezone conversion offsets
    const date = new Date(dateStr + 'T00:00:00')
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const jsDay = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1 // 0 = Monday, ..., 6 = Sunday

    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    const slots: MealSlot[] = isWeekend ? ['brunch', 'dinner'] : ['breakfast', 'lunch', 'dinner']

    const supabase = createServerSupabaseClient()

    // Parallel fetches for base data
    const [hoursRes, imagesRes, cafeteriaRes] = await Promise.all([
      supabase.from('dining_hours').select('*'),
      supabase.from('meal_images').select('*'),
      supabase.from('cafeteria_info').select('*').maybeSingle()
    ])

    if (hoursRes.error) throw hoursRes.error
    if (imagesRes.error) throw imagesRes.error

    // Fetch overrides and templates for the relevant slots
    const meals = await Promise.all(
      slots.map(async (slot) => {
        // 1. Check daily override
        const { data: override } = await supabase
          .from('daily_menu')
          .select('*')
          .eq('menu_date', dateStr)
          .eq('meal_slot', slot)
          .maybeSingle()

        if (override) {
          return {
            slot,
            items: override.items || [],
            special_note: override.special_note || null,
            is_cancelled: override.is_cancelled || false,
            cancel_reason: override.cancel_reason || null,
            source: 'daily_override' as const
          }
        }

        // 2. Fall back to template
        const { data: template } = await supabase
          .from('menu_template')
          .select('*')
          .eq('day_of_week', dayOfWeek)
          .eq('meal_slot', slot)
          .maybeSingle()

        return {
          slot,
          items: template?.items || [],
          special_note: null,
          is_cancelled: false,
          cancel_reason: null,
          source: 'template' as const
        }
      })
    )

    return NextResponse.json({
      date: dateStr,
      day_of_week: dayOfWeek,
      meals,
      hours: hoursRes.data || [],
      images: imagesRes.data || [],
      cafeteria: cafeteriaRes.data || null
    })

  } catch (err: any) {
    console.error('Error in GET /api/dining/menu:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
