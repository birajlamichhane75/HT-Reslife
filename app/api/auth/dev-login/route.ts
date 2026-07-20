import { createServiceRoleClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Step 1 — Check email ends with @htu.edu
    if (!trimmedEmail.endsWith('@htu.edu')) {
      return NextResponse.json({ error: 'Only @htu.edu emails allowed.' }, { status: 400 })
    }

    // Step 2 — Query students table using service role client
    const serviceSupabase = createServiceRoleClient()
    const { data: student, error: studentError } = await serviceSupabase
      .from('students')
      .select('id, full_name, role, is_active')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (studentError) {
      console.error('Database query error in dev-login:', studentError)
      return NextResponse.json({ error: 'Database query failed.' }, { status: 500 })
    }

    // Step 3 — Check if registered and active
    if (!student || !student.is_active) {
      return NextResponse.json(
        { error: 'This email is not registered for on-campus housing. Contact the Housing Office.' },
        { status: 400 }
      )
    }

    // Step 4 — Use supabase.auth.admin.createUser / signInWithPassword
    const tempPassword = trimmedEmail + '_dev_temp_pw_hth2026'

    // Attempt to create user (if already exists, this returns an error which we will handle by resetting their password)
    const { error: createError } = await serviceSupabase.auth.admin.createUser({
      email: trimmedEmail,
      email_confirm: true,
      password: tempPassword,
    })

    if (createError) {
      if (createError.message.toLowerCase().includes('already registered') || createError.message.toLowerCase().includes('already been registered')) {
        // User already exists in Auth, retrieve their user ID to update their password to the dev one
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
            { password: tempPassword }
          )
          if (updatePwError) {
            console.error('Failed to reset password for dev-login:', updatePwError)
            return NextResponse.json({ error: 'Failed to update dev-login credentials.' }, { status: 500 })
          }
        } else {
          console.error('Could not find existing auth user by email:', trimmedEmail)
          return NextResponse.json({ error: 'Failed to retrieve auth user.' }, { status: 500 })
        }
      } else {
        console.warn('Non-critical user creation warning:', createError.message)
      }
    }

    // Step 5 — Set the session cookie using createServerClient
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
      password: tempPassword,
    })

    if (signInError) {
      console.error('Sign-in error in dev-login:', signInError)
      return NextResponse.json({ error: signInError.message }, { status: 400 })
    }

    // Link the student profile id in the students table to the user.id if not already done
    const user = signInData.user
    if (user && student.id !== user.id) {
      const { error: updateError } = await serviceSupabase
        .from('students')
        .update({ id: user.id })
        .eq('email', trimmedEmail)

      if (updateError) {
        console.error('Failed to link student auth ID during dev-login:', updateError)
      }
    }

    // Step 6 — Return 200 { role: student.role }
    return response

  } catch (err: any) {
    console.error('Unexpected error in dev-login route:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
