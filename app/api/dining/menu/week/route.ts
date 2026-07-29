import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MealSlot } from '@/lib/types'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    const currentJsDay = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = currentJsDay === 0 ? 6 : currentJsDay - 1
    
    // Calculate Monday date
    const monday = new Date(today)
    monday.setDate(today.getDate() - daysToMonday)

    // Calculate Sunday date
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const mondayStr = monday.toISOString().split('T')[0]
    const sundayStr = sunday.toISOString().split('T')[0]

    const supabase = createServerSupabaseClient()

    // Parallel fetches in bulk
    const [hoursRes, imagesRes, cafeteriaRes, templatesRes, overridesRes] = await Promise.all([
      supabase.from('dining_hours').select('*'),
      supabase.from('meal_images').select('*'),
      supabase.from('cafeteria_info').select('*').maybeSingle(),
      supabase.from('menu_template').select('*'),
      supabase
        .from('daily_menu')
        .select('*')
        .gte('menu_date', mondayStr)
        .lte('menu_date', sundayStr)
    ])

    if (hoursRes.error) throw hoursRes.error
    if (imagesRes.error) throw imagesRes.error
    if (templatesRes.error) throw templatesRes.error
    if (overridesRes.error) throw overridesRes.error

    const hours = hoursRes.data || []
    const images = imagesRes.data || []
    const cafeteria = cafeteriaRes.data || null
    const templates = templatesRes.data || []
    const overrides = overridesRes.data || []

    // Build the 7 days
    const days = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)
      const dateStr = dayDate.toISOString().split('T')[0]
      const isWeekend = i === 5 || i === 6
      const slots: MealSlot[] = isWeekend ? ['brunch', 'dinner'] : ['breakfast', 'lunch', 'dinner']

      const meals = slots.map((slot) => {
        // Find override
        const override = overrides.find(
          (o) => o.menu_date === dateStr && o.meal_slot === slot
        )
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

        // Find template
        const template = templates.find(
          (t) => t.day_of_week === i && t.meal_slot === slot
        )
        return {
          slot,
          items: template?.items || [],
          special_note: null,
          is_cancelled: false,
          cancel_reason: null,
          source: 'template' as const
        }
      })

      days.push({
        date: dateStr,
        day_of_week: i,
        meals
      })
    }

    return NextResponse.json({
      start_date: mondayStr,
      end_date: sundayStr,
      days,
      hours,
      images,
      cafeteria
    })

  } catch (err: any) {
    console.error('Error in GET /api/dining/menu/week:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
