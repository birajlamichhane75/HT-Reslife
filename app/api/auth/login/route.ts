import { createServiceRoleClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // 1. Query students table using service role client to check if registered & role
    const serviceSupabase = createServiceRoleClient()
    const { data: student, error: studentError } = await serviceSupabase
      .from('students')
      .select('*')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (studentError) {
      console.error('Database query error in login API:', studentError)
      return NextResponse.json({ error: 'Database query failed.' }, { status: 500 })
    }

    // Check if registered and active
    if (!student || !student.is_active) {
      return NextResponse.json(
        { error: 'This email is not registered for on-campus housing. Contact the Housing Office.' },
        { status: 400 }
      )
    }

    let authPassword = password

    // 2. If student role, enforce <student_id><first_name> password
    if (student.role === 'student') {
      const studentId = student.student_id ? student.student_id.trim() : ''
      const firstName = student.first_name ? student.first_name.trim() : ''
      const expectedPassword = studentId + firstName

      if (!expectedPassword) {
        return NextResponse.json(
          { error: 'Student credentials are not fully configured in the database.' },
          { status: 500 }
        )
      }

      // Case-insensitive verification for student safety
      if (password.trim().toLowerCase() !== expectedPassword.toLowerCase()) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
      }

      // Enforce the exact expected password for Supabase Auth to ensure consistency
      authPassword = expectedPassword

      // Sync Supabase Auth user on-the-fly if needed
      const { error: createError } = await serviceSupabase.auth.admin.createUser({
        email: trimmedEmail,
        email_confirm: true,
        password: authPassword,
      })

      if (createError) {
        const errMsg = createError.message.toLowerCase()
        if (errMsg.includes('already registered') || errMsg.includes('already been registered')) {
          // Find the existing user to reset password to the expected one
          let page = 1
          const perPage = 100
          let authUser: any = null
          while (true) {
            const { data: { users }, error: listError } = await serviceSupabase.auth.admin.listUsers({
              page,
              perPage,
            })
            if (listError || !users || users.length === 0) {
              break
            }
            const found = users.find((u: any) => u.email?.toLowerCase() === trimmedEmail)
            if (found) {
              authUser = found
              break
            }
            if (users.length < perPage) {
              break
            }
            page++
          }

          if (authUser) {
            const { error: updatePwError } = await serviceSupabase.auth.admin.updateUserById(
              authUser.id,
              { password: authPassword }
            )
            if (updatePwError) {
              console.error('Failed to reset password for student login:', updatePwError)
              return NextResponse.json({ error: 'Failed to update authentication credentials.' }, { status: 500 })
            }
          } else {
            console.error('Could not find existing auth user by email:', trimmedEmail)
            return NextResponse.json({ error: 'Failed to retrieve auth user.' }, { status: 500 })
          }
        } else {
          console.warn('Student auth user creation warning:', createError.message)
        }
      }
    }

    // 3. Authenticate session with Supabase Auth
    const response = NextResponse.json({ role: student.role })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: authPassword,
    })

    if (signInError) {
      console.error('Sign-in error in login route:', signInError)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
    }

    // 4. Link the profile ID if not already done
    const user = signInData.user
    if (user && student.id !== user.id) {
      const { error: updateError } = await serviceSupabase
        .from('students')
        .update({ id: user.id })
        .eq('email', trimmedEmail)

      if (updateError) {
        console.error('Failed to link student auth ID during login:', updateError)
      }
    }

    return response

  } catch (err: any) {
    console.error('Unexpected error in login route:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
