import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyStudent } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const student = await verifyStudent(req)
  if (!student) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { item_id, completed } = await req.json()

    if (!item_id) {
      return NextResponse.json({ error: 'Missing item_id' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Upsert student checklist progress
    const { data, error } = await supabase
      .from('checklist_progress')
      .upsert(
        {
          student_id: student.id,
          item_id,
          completed: !!completed,
        },
        { onConflict: 'student_id,item_id' }
      )
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
