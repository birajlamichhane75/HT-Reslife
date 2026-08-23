import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin, verifyStudent } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/calendar - Get all academic calendar entries (Any authenticated student/admin)
export async function GET(req: NextRequest) {
  const student = await verifyStudent(req)
  if (!student) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('academic_calendar')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching academic calendar:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/calendar - Add a calendar entry (Admin only)
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, start_date, end_date, category } = await req.json()

    if (!title || !start_date || !category) {
      return NextResponse.json({ error: 'Missing required fields (title, start_date, category)' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('academic_calendar')
      .insert({
        title,
        description: description || null,
        start_date,
        end_date: end_date || null,
        category,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating calendar entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
