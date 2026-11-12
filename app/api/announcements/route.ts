import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, body, priority, image_url } = await req.json()
    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const cleanImageUrl = image_url && typeof image_url === 'string' ? image_url.trim() : null

    const insertData: any = {
      title,
      body,
      priority: priority || 'info',
      created_by: admin.id,
    }

    if (cleanImageUrl) {
      insertData.image_url = cleanImageUrl
    }

    let { data, error } = await supabase
      .from('announcements')
      .insert(insertData)
      .select()
      .single()

    // Graceful fallback if image_url column doesn't exist yet in Supabase schema
    if (error && cleanImageUrl && (error.code === 'PGRST204' || error.message?.includes('image_url'))) {
      const fallbackBody = `${body}\n\n[image: ${cleanImageUrl}]`
      const retry = await supabase
        .from('announcements')
        .insert({
          title,
          body: fallbackBody,
          priority: priority || 'info',
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
      return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
