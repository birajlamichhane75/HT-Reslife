import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, location, event_date, tag, description, image_url } = await req.json()

    if (!title || !event_date || !tag) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const cleanImageUrl = image_url && typeof image_url === 'string' ? image_url.trim() : null

    const insertData: any = {
      title,
      location: location || null,
      event_date,
      tag,
      description: description || null,
      created_by: admin.id,
    }

    if (cleanImageUrl) {
      insertData.image_url = cleanImageUrl
    }

    let { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single()

    // Graceful fallback if image_url column doesn't exist yet in Supabase schema
    if (error && cleanImageUrl && (error.code === 'PGRST204' || error.message?.includes('image_url'))) {
      const fallbackDesc = description
        ? `${description}\n\n[image: ${cleanImageUrl}]`
        : `[image: ${cleanImageUrl}]`

      const retry = await supabase
        .from('events')
        .insert({
          title,
          location: location || null,
          event_date,
          tag,
          description: fallbackDesc,
          created_by: admin.id,
        })
        .select()
        .single()

      data = retry.data
      error = retry.error
    }

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
