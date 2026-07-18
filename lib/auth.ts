import { createServerSupabaseClient } from './supabase/server'
import { NextRequest } from 'next/server'
import { Student } from './types'

// Use in API routes to verify a logged-in student
export async function verifyStudent(req: NextRequest): Promise<Student | null> {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('id', session.user.id)
    .eq('is_active', true)
    .single()

  return data ?? null
}

// Use in API routes to verify an admin
export async function verifyAdmin(req: NextRequest): Promise<Student | null> {
  const student = await verifyStudent(req)
  if (!student || student.role !== 'admin') return null
  return student
}
