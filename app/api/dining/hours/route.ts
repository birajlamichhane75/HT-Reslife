import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyCafeteriaAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('dining_hours').select('*')
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyCafeteriaAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Cafeteria Admin access required.' }, { status: 401 })
    }

    const { id, open_time, close_time, is_active } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('dining_hours')
      .update({ open_time, close_time, is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
