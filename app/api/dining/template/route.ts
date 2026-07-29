import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyCafeteriaAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('menu_template').select('*').order('day_of_week', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyCafeteriaAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Cafeteria Admin access required.' }, { status: 401 })
    }

    const { day_of_week, meal_slot, items } = await request.json()
    if (day_of_week === undefined || !meal_slot || !items) {
      return NextResponse.json({ error: 'day_of_week, meal_slot, and items are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('menu_template')
      .upsert({ 
        day_of_week, 
        meal_slot, 
        items,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'day_of_week,meal_slot' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
