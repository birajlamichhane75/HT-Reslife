import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyStudent } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const student = await verifyStudent(req)
  if (!student) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { subscription } = await req.json()

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription object' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('students')
      .update({ push_subscription: subscription })
      .eq('id', student.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, student: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
