import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

const BUCKET_NAME = 'reslife-media'

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate image MIME type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 })
    }

    // Limit size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image file size must be less than 10MB' }, { status: 400 })
    }

    const serviceSupabase = createServiceRoleClient()

    // Ensure bucket exists
    try {
      const { data: buckets } = await serviceSupabase.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === BUCKET_NAME)
      if (!bucketExists) {
        await serviceSupabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: MAX_SIZE,
        })
      }
    } catch (bucketErr) {
      console.warn('Storage bucket check warning:', bucketErr)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const rawExt = file.name.split('.').pop() || 'jpg'
    const cleanExt = rawExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg'
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`

    const { error: uploadError } = await serviceSupabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = serviceSupabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 })
  }
}

