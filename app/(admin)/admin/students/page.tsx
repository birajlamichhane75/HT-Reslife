import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import StudentManager from '@/components/admin/StudentManager'

export const revalidate = 0

export default async function AdminStudentsPage() {
  const supabase = createServerSupabaseClient()
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching students:', error)
  }

  // Inline Server Action for secure user active state updates via Supabase service_role
  async function toggleStudentActive(studentId: string, isActive: boolean) {
    'use server'
    const supabaseClient = createServerSupabaseClient()
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: admin } = await supabaseClient
      .from('students')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (!admin || admin.role !== 'admin' || !admin.is_active) {
      throw new Error('Not authorized')
    }

    const serviceClient = createServiceRoleClient()
    const { error: updateError } = await serviceClient
      .from('students')
      .update({ is_active: isActive })
      .eq('id', studentId)

    if (updateError) throw new Error(updateError.message)
    return { success: true }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Student Registry</h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5 font-medium">Manage housing student logins</p>
      </div>

      <StudentManager initialStudents={students || []} toggleActive={toggleStudentActive} />
    </div>
  )
}
