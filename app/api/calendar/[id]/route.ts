import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/calendar/[id] - Edit calendar entry (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'Calendar entry ID is required.' }, { status: 400 })
  }

  try {
    const { title, description, start_date, end_date, category } = await req.json()

    if (!title || !start_date || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('academic_calendar')
      .update({
        title,
        description: description || null,
        start_date,
        end_date: end_date || null,
        category,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating calendar entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/calendar/[id] - Delete calendar entry (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'Calendar entry ID is required.' }, { status: 400 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('academic_calendar')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting calendar entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
