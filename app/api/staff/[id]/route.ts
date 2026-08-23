import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/staff/[id] - Edit staff member (Admin only)
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
    return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 })
  }

  try {
    const { full_name, role, hall, phone, email, avatar_initials, sort_order } = await req.json()

    if (!full_name || !role) {
      return NextResponse.json({ error: 'Missing name or role' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('staff_directory')
      .update({
        full_name,
        role,
        hall: hall || null,
        phone: phone || null,
        email: email || null,
        avatar_initials: avatar_initials || full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        sort_order: sort_order === undefined ? 0 : (parseInt(sort_order) || 0),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating staff member:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/staff/[id] - Remove staff member (Admin only)
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
    return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('staff_directory')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
