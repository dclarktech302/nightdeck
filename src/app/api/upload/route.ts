import { createClient } from '@/lib/supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// File size limits
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024  // 50MB

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'] // mp4 + mov

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileType, fileSize, eventId, context } = body

    // Validate inputs
    if (!fileName || !fileType || !fileSize || !eventId || !context) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['promotional', 'gallery'].includes(context)) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 })
    }

    // Determine media type
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'File type not allowed. Use JPG, PNG, WebP, MP4, or MOV.' },
        { status: 400 }
      )
    }

    // Size check
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
    if (fileSize > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max ${isImage ? '10MB' : '50MB'} for ${isImage ? 'images' : 'videos'}.` },
        { status: 400 }
      )
    }

    // Build S3 key — timestamp prefix prevents collisions
    const ext       = fileName.split('.').pop()?.toLowerCase()
    const timestamp = Date.now()
    const safeFile  = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const key       = `events/${eventId}/${context}/${timestamp}-${safeFile}`

    // Generate presigned URL — valid for 5 minutes
    const command = new PutObjectCommand({
      Bucket:      process.env.AWS_S3_BUCKET_NAME!,
      Key:         key,
      ContentType: fileType,
      ContentLength: fileSize,
    })

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    // The public URL (used after upload completes)
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      key,
      mediaType: isImage ? 'image' : 'video',
    })

  } catch (err: any) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}