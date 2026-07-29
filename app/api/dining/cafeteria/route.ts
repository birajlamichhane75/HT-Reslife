import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { verifyCafeteriaAdmin } from '@/lib/auth'
import { sendPushNotification } from '@/lib/push'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('cafeteria_info').select('*').maybeSingle()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyCafeteriaAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Cafeteria Admin access required.' }, { status: 401 })
    }

    const { name, location, phone, email, announcement, image_url, send_push } = await request.json()

    const supabase = createServerSupabaseClient()
    
    // Find the single row's ID
    const { data: existing } = await supabase.from('cafeteria_info').select('id').maybeSingle()
    const targetId = existing?.id || 'd1111111-1111-1111-1111-111111111111'

    const { data, error } = await supabase
      .from('cafeteria_info')
      .upsert({
        id: targetId,
        name,
        location,
        phone,
        email,
        announcement: announcement || null,
        image_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Send push notification if requested and announcement is set
    let sentCount = 0
    if (send_push && announcement) {
      const serviceSupabase = createServiceRoleClient()
      const { data: subscribers } = await serviceSupabase
        .from('students')
        .select('id, push_subscription')
        .not('push_subscription', 'is', null)

      if (subscribers && subscribers.length > 0) {
        const results = await Promise.all(
          subscribers.map(async (sub: any) => {
            return await sendPushNotification(sub.push_subscription, {
              title: `📢 Cafeteria Announcement`,
              body: announcement,
              url: '/dining'
            })
          })
        )
        sentCount = results.filter(Boolean).length
      }
    }

    return NextResponse.json({ data, sentCount })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
