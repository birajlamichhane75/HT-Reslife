import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CafeteriaAgent } from '@/lib/dining/cafeteria-agent'
import { calculateCycleWeek, JS_DAY_TO_NAME, DayOfWeekName } from '@/lib/dining/cafeteria-data'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, current_week, current_day, current_date } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'User question is required' },
        { status: 400 }
      )
    }

    const today = new Date()
    const dayName = (current_day || JS_DAY_TO_NAME[today.getDay()] || 'Thursday') as DayOfWeekName
    const weekNum = current_week || calculateCycleWeek(today)
    const dateStr = current_date || today.toISOString().split('T')[0]

    // Determine day type for hours lookup
    const jsDay = today.getDay()
    const dayType = jsDay === 0 ? 'sunday' : jsDay === 6 ? 'saturday' : 'weekday'

    // Fetch verified meal times from dining_hours if available
    let mealTimes: Record<string, { start: string; end: string } | null> | null = null
    try {
      const supabase = createServerSupabaseClient()
      const { data: hoursData } = await supabase
        .from('dining_hours')
        .select('*')
        .eq('day_type', dayType)
        .eq('is_active', true)

      if (hoursData && hoursData.length > 0) {
        mealTimes = {}
        hoursData.forEach((h: any) => {
          if (h.meal_slot) {
            mealTimes![h.meal_slot.toLowerCase()] = {
              start: h.open_time,
              end: h.close_time
            }
          }
        })
      }
    } catch (dbErr) {
      // Non-blocking: If database is unreachable, proceed without meal times per Rule 4
      mealTimes = null
    }

    // Process using CafeteriaAgent
    const agentResponse = await CafeteriaAgent.processMessage({
      current_date: dateStr,
      current_day: dayName,
      current_week: weekNum,
      meal_times: mealTimes,
      user_question: message
    })

    return NextResponse.json({
      success: true,
      data: agentResponse,
      current_status: {
        date: dateStr,
        day: dayName,
        week: weekNum
      }
    })
  } catch (err: any) {
    console.error('Error in Cafeteria Chat API:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
