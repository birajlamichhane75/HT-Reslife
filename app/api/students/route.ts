import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/students - Get all students (Admin only)
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceRoleClient()
  try {
    const { data, error } = await serviceSupabase
      .from('students')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/students - Add a student (Admin only)
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const {
      email,
      full_name,
      role = 'student',
      is_active = true,
      student_id,
      first_name,
      last_name,
      session,
      cohort,
      building,
      suite,
      room,
      bed,
      is_ra = false,
      password // Optional password for admin/cafeteria_admin
    } = payload

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and Full Name are required.' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    const serviceSupabase = createServiceRoleClient()

    let userId = null

    // For admins or cafeteria admins, provision in Supabase Auth immediately
    if (role === 'admin' || role === 'cafeteria_admin') {
      const authPassword = password || `${trimmedEmail}_admin_pw_2026!`
      const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
        email: trimmedEmail,
        email_confirm: true,
        password: authPassword,
      })

      if (authError) {
        // If already registered, fetch the user ID
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          const { data: { users } } = await serviceSupabase.auth.admin.listUsers()
          const existingUser = users.find(u => u.email?.toLowerCase() === trimmedEmail)
          if (existingUser) {
            userId = existingUser.id
          } else {
            throw new Error('User already registered in Auth, but could not retrieve ID.')
          }
        } else {
          throw authError
        }
      } else if (authData?.user) {
        userId = authData.user.id
      }
    }

    // Insert into students table
    const insertData: any = {
      email: trimmedEmail,
      full_name,
      role,
      is_active,
      student_id: student_id || null,
      first_name: first_name || null,
      last_name: last_name || null,
      session: session || null,
      cohort: cohort || null,
      building: building || null,
      suite: suite || null,
      room: room || null,
      bed: bed || null,
      is_ra,
      hall_name: building || null,
      room_number: room || null
    }

    if (userId) {
      insertData.id = userId
    }

    const { data, error } = await serviceSupabase
      .from('students')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/students - Update a student (Admin only)
export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const {
      id,
      email,
      full_name,
      role,
      is_active,
      student_id,
      first_name,
      last_name,
      session,
      cohort,
      building,
      suite,
      room,
      bed,
      is_ra
    } = payload

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
    }

    const serviceSupabase = createServiceRoleClient()

    const updateData: any = {}
    if (email !== undefined) updateData.email = email.trim().toLowerCase()
    if (full_name !== undefined) updateData.full_name = full_name
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active
    if (student_id !== undefined) updateData.student_id = student_id || null
    if (first_name !== undefined) updateData.first_name = first_name || null
    if (last_name !== undefined) updateData.last_name = last_name || null
    if (session !== undefined) updateData.session = session || null
    if (cohort !== undefined) updateData.cohort = cohort || null
    if (building !== undefined) {
      updateData.building = building || null
      updateData.hall_name = building || null
    }
    if (suite !== undefined) updateData.suite = suite || null
    if (room !== undefined) {
      updateData.room = room || null
      updateData.room_number = room || null
    }
    if (bed !== undefined) updateData.bed = bed || null
    if (is_ra !== undefined) updateData.is_ra = is_ra

    const { data, error } = await serviceSupabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/students - Delete a student (Admin only)
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
  }

  const serviceSupabase = createServiceRoleClient()
  try {
    // 1. Delete user from Supabase Auth first
    const { error: authError } = await serviceSupabase.auth.admin.deleteUser(id)
    if (authError) {
      // Ignore if user doesn't exist in Supabase Auth (e.g. they never logged in or synced)
      console.warn(`Could not delete auth user ${id}: ${authError.message}`)
    }

    // 2. Delete from students database table
    const { error: dbError } = await serviceSupabase
      .from('students')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
