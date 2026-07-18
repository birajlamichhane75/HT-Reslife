import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('staff_directory')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { full_name, role, hall, phone, email, avatar_initials, sort_order } = await req.json()

    if (!full_name || !role) {
      return NextResponse.json({ error: 'Missing name or role' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('staff_directory')
      .insert({
        full_name,
        role,
        hall: hall || null,
        phone: phone || null,
        email: email || null,
        avatar_initials: avatar_initials || full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        sort_order: sort_order || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
