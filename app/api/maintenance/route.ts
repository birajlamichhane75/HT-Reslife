import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyStudent } from '@/lib/auth'
import { sendMaintenanceConfirmation } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const student = await verifyStudent(req)
  if (!student) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { room_number, issue_type, priority, description, allow_entry } = await req.json()

    if (!room_number || !issue_type || !priority || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (description.trim().length < 20) {
      return NextResponse.json({ error: 'Description must be at least 20 characters' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .insert({
        student_id: student.id,
        room_number,
        issue_type,
        priority,
        description,
        allow_entry,
        status: 'open',
      })
      .select('id')
      .single()

    if (error) throw error

    // Send email notification
    if (student.email) {
      await sendMaintenanceConfirmation(student.email, data.id, issue_type)
    }

    return NextResponse.json({ ticketId: data.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
