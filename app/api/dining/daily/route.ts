import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { verifyCafeteriaAdmin } from '@/lib/auth'
import { sendPushNotification } from '@/lib/push'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    if (!dateStr) {
      return NextResponse.json({ error: 'date query parameter is required (YYYY-MM-DD)' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('daily_menu')
      .select('*')
      .eq('menu_date', dateStr)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyCafeteriaAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Cafeteria Admin access required.' }, { status: 401 })
    }

    const {
      menu_date,
      meal_slot,
      items,
      special_note,
      is_cancelled,
      cancel_reason,
      send_push
    } = await request.json()

    if (!menu_date || !meal_slot || !items) {
      return NextResponse.json({ error: 'menu_date, meal_slot, and items are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('daily_menu')
      .upsert({
        menu_date,
        meal_slot,
        items,
        special_note: special_note || null,
        is_cancelled: is_cancelled || false,
        cancel_reason: cancel_reason || null,
        created_by: admin.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'menu_date,meal_slot' })
      .select()
      .single()

    if (error) throw error

    // Send push notifications if requested
    let sentCount = 0
    if (send_push) {
      // Use service role client to query all students with push subscriptions
      const serviceSupabase = createServiceRoleClient()
      const { data: subscribers } = await serviceSupabase
        .from('students')
        .select('id, push_subscription')
        .not('push_subscription', 'is', null)

      if (subscribers && subscribers.length > 0) {
        let title = `Cafeteria Menu Update`
        let body = `${meal_slot.charAt(0).toUpperCase() + meal_slot.slice(1)} menu updated for ${menu_date}.`
        
        if (is_cancelled) {
          title = `🚨 Meal Cancelled: ${meal_slot.toUpperCase()}`
          body = `${menu_date}: ${cancel_reason || 'No reason provided.'}`
        } else if (special_note) {
          title = `✨ Cafeteria Special: ${meal_slot.toUpperCase()}`
          body = special_note
        }

        const results = await Promise.all(
          subscribers.map(async (sub: any) => {
            return await sendPushNotification(sub.push_subscription, {
              title,
              body,
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
