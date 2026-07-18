import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token_hash, code, type = 'magiclink' } = await req.json()

    if (!token_hash && !code) {
      return NextResponse.json({ error: 'Missing token_hash or code' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    let authError = null
    let user = null

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      authError = error
      user = data.session?.user
    } else {
      // Verify OTP token_hash
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token_hash!,
        type: type as any,
      })
      authError = error
      user = data.session?.user
    }

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: 'No active session created.' }, { status: 400 })
    }

    const email = user.email ?? ''
    const isHtuEmail = email.endsWith('@htu.edu')

    if (!isHtuEmail) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'not_htu_email' }, { status: 400 })
    }

    // Use service role client to query and update the student profile securely
    const serviceSupabase = createServiceRoleClient()

    // 1. Check if a student already exists with the user's Auth ID
    const { data: studentById } = await serviceSupabase
      .from('students')
      .select('id, role, is_active')
      .eq('id', user.id)
      .maybeSingle()

    let student = studentById

    // 2. If not found by ID, look up by email to link the pre-registered student profile
    if (!student) {
      const { data: studentByEmail } = await serviceSupabase
        .from('students')
        .select('id, role, is_active')
        .eq('email', email)
        .maybeSingle()

      if (studentByEmail) {
        // Link the pre-registered student record by updating its ID to the auth user ID
        const { error: updateError } = await serviceSupabase
          .from('students')
          .update({ id: user.id })
          .eq('email', email)

        if (updateError) {
          console.error('Failed to link student auth ID:', updateError)
          await supabase.auth.signOut()
          return NextResponse.json({ error: 'Failed to update student profile ID.' }, { status: 500 })
        }

        student = {
          id: user.id,
          role: studentByEmail.role,
          is_active: studentByEmail.is_active,
        }
      }
    }

    // 3. If no student record exists by ID or email, reject
    if (!student) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'not_registered' }, { status: 400 })
    }

    // 4. If student exists but is inactive, reject
    if (!student.is_active) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'not_registered' }, { status: 403 })
    }

    // 5. Successful login & validation
    return NextResponse.json({
      success: true,
      role: student.role,
    })
  } catch (err: any) {
    console.error('Unexpected confirmation error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
