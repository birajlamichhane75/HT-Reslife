import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { verifyCafeteriaAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyCafeteriaAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Cafeteria Admin access required.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const item_name = formData.get('item_name') as string | null

    if (!file || !item_name) {
      return NextResponse.json({ error: 'File and item_name are required' }, { status: 400 })
    }

    const serviceSupabase = createServiceRoleClient()

    // Ensure the meal-images bucket exists
    try {
      const { data: buckets } = await serviceSupabase.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === 'meal-images')
      if (!bucketExists) {
        await serviceSupabase.storage.createBucket('meal-images', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        })
      }
    } catch (bucketErr) {
      console.warn('Error checking/creating storage bucket:', bucketErr)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`

    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('meal-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        duplex: 'half'
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = serviceSupabase.storage
      .from('meal-images')
      .getPublicUrl(fileName)

    const supabase = createServerSupabaseClient()
    const { data: dbData, error: dbError } = await supabase
      .from('meal_images')
      .upsert({
        item_name: item_name.trim(),
        image_url: publicUrl
      }, { onConflict: 'item_name' })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({
      success: true,
      image_url: publicUrl,
      data: dbData
    })

  } catch (err: any) {
    console.error('Error in POST /api/dining/images:', err)
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 })
  }
}
