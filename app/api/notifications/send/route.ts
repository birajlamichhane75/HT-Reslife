import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { sendPushNotification } from '@/lib/push'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, body, url } = await req.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Fetch all students with non-null subscriptions
    const { data: subscribers, error } = await supabase
      .from('students')
      .select('id, push_subscription')
      .not('push_subscription', 'is', null)

    if (error) throw error

    let sentCount = 0
    if (subscribers && subscribers.length > 0) {
      const results = await Promise.all(
        subscribers.map(async (sub: any) => {
          return await sendPushNotification(sub.push_subscription, {
            title,
            body,
            url: url || '/',
          })
        })
      )
      sentCount = results.filter(Boolean).length
    }

    return NextResponse.json({ success: true, sentCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
