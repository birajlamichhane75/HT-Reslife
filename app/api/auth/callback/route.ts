import { createServerSupabaseClient } from '@/lib/supabase/server'
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
      const email = data.session.user.email ?? ''

      // Check if email ends in @htu.edu
      const isHtuEmail = email.endsWith('@htu.edu')

      // Check if email exists in students table and is_active is true
      let student = null
      if (isHtuEmail) {
        const { data: studentData } = await supabase
          .from('students')
          .select('id, role, is_active')
          .eq('email', email)
          .single()
        student = studentData
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
