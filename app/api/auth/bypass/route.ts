import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.endsWith('@htu.edu')) {
      return NextResponse.json({ error: 'Only @htu.edu emails are allowed' }, { status: 400 })
    }

    const serviceSupabase = createServiceRoleClient()

    // 1. Check if the user exists in our students table first
    const { data: student } = await serviceSupabase
      .from('students')
      .select('id, is_active')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (!student) {
      return NextResponse.json({ error: 'not_registered' }, { status: 400 })
    }

    if (!student.is_active) {
      return NextResponse.json({ error: 'not_registered' }, { status: 403 })
    }

    // 2. Ensure the user exists in auth.users by trying to create them.
    // If they already exist, it will return an error which we can ignore safely.
    await serviceSupabase.auth.admin.createUser({
      email: trimmedEmail,
      email_confirm: true,
    })

    // 3. Generate a magiclink verification URL for the user programmatically
    const redirectUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin) + '/confirm'
    const { data, error } = await serviceSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: trimmedEmail,
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Extract the token parameter from the generated action link
    const actionUrl = new URL(data.properties.action_link)
    const token = actionUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Failed to extract verification token.' }, { status: 500 })
    }

    // Construct the direct client confirmation URL
    const confirmationUrl = `${redirectUrl}?token_hash=${token}&type=magiclink`

    // Return the direct confirmation URL
    return NextResponse.json({ action_link: confirmationUrl })
  } catch (err: any) {
    console.error('Bypass authentication error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
