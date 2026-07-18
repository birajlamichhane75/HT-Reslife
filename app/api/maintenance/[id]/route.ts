import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { sendTicketStatusUpdate } from '@/lib/email'
import { sendPushNotification } from '@/lib/push'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const { status, staff_notes } = await req.json()

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Update ticket
    const { data: ticket, error } = await supabase
      .from('maintenance_tickets')
      .update({
        status,
        staff_notes: staff_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, student:students(email, push_subscription)')
      .single()

    if (error) throw error

    // Send email update
    const studentInfo = ticket.student as any
    if (studentInfo?.email) {
      await sendTicketStatusUpdate(
        studentInfo.email,
        id,
        status,
        staff_notes
      )
    }

    // Send push notification if subscription exists
    if (studentInfo?.push_subscription) {
      const formattedStatus = status.replace('_', ' ').toUpperCase()
      await sendPushNotification(studentInfo.push_subscription, {
        title: `Maintenance Update: #${id.slice(0, 8).toUpperCase()}`,
        body: `Ticket status is now ${formattedStatus}.${staff_notes ? ` Note: ${staff_notes}` : ''}`,
        url: '/maintenance/history',
      })
    }

    return NextResponse.json(ticket)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
