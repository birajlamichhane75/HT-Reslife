import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error during exchangeCodeForSession:', error)
    }

    if (!error && data.session) {
      const user = data.session.user
      const email = user.email ?? ''

      // Check if email ends in @htu.edu
      const isHtuEmail = email.endsWith('@htu.edu')

      let student = null

      if (isHtuEmail) {
        // Use service role client to query and update the student profile securely
        const serviceSupabase = createServiceRoleClient()

        // 1. Check if a student already exists with the user's Auth ID
        const { data: studentById } = await serviceSupabase
          .from('students')
          .select('id, role, is_active')
          .eq('id', user.id)
          .maybeSingle()

        student = studentById

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
            } else {
              student = {
                id: user.id,
                role: studentByEmail.role,
                is_active: studentByEmail.is_active,
              }
            }
          }
        }
      }

      // If either check fails: sign out and redirect to /login?error=not_registered
      if (!isHtuEmail || !student || !student.is_active) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/login?error=not_registered`
        )
      }

      // All good — redirect based on role
      const destination = student.role === 'admin' ? '/admin' : '/'
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
