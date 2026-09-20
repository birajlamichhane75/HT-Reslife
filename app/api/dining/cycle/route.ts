import { NextRequest, NextResponse } from 'next/server'
import { 
  CAFETERIA_28_DAY_MENU, 
  CAFETERIA_CYCLE_DAYS, 
  calculateCycleWeek, 
  JS_DAY_TO_NAME 
} from '@/lib/dining/cafeteria-data'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    const currentDay = JS_DAY_TO_NAME[today.getDay()] || 'Thursday'
    const currentWeek = calculateCycleWeek(today)

    // Attempt to read from supabase cafeteria_menus if table exists, otherwise use source of truth
    let menus = CAFETERIA_28_DAY_MENU

    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('cafeteria_menus')
        .select('*')
        .order('week_number', { ascending: true })

      if (!error && data && data.length > 0) {
        // Map database records into cycle menu format if populated
        // This allows cafeteria staff to update menus via database in the future!
        const grouped: Record<string, any> = {}
        data.forEach((row: any) => {
          const key = `${row.week_number}-${row.day_of_week}`
          if (!grouped[key]) {
            grouped[key] = {
              week_number: row.week_number,
              day_of_week: row.day_of_week,
              breakfast_type: 'Breakfast',
              breakfast_items: [],
              lunch_items: [],
              dinner_items: null,
              soup: null,
              grill_station_items: []
            }
          }
          if (row.meal_type === 'Breakfast' || row.meal_type === 'Brunch') {
            grouped[key].breakfast_type = row.meal_type
            grouped[key].breakfast_items = row.items || []
          } else if (row.meal_type === 'Lunch') {
            grouped[key].lunch_items = row.items || []
          } else if (row.meal_type === 'Dinner') {
            grouped[key].dinner_items = row.items || []
          } else if (row.meal_type === 'Soup') {
            grouped[key].soup = (row.items && row.items[0]) || null
          } else if (row.meal_type === 'Grill Station') {
            grouped[key].grill_station_items = row.items || []
          }
        })
        const dbMenus = Object.values(grouped) as any[]
        if (dbMenus.length >= 28) {
          menus = dbMenus
        }
      }
    } catch (e) {
      // Fallback seamlessly to CAFETERIA_28_DAY_MENU
    }

    return NextResponse.json({
      current_week: currentWeek,
      current_day: currentDay,
      cycle_days: CAFETERIA_CYCLE_DAYS,
      menus: menus
    })
  } catch (err: any) {
    console.error('Error fetching cycle menu:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch cycle menu' },
      { status: 500 }
    )
  }
}
