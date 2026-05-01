import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, url, mediaType, context, sizeBytes, orgId } = body

    const serviceClient = createServiceClient()

    const { data, error } = await serviceClient
      .from('event_media')
      .insert({
        event_id:      eventId,
        org_id:        orgId,
        url,
        media_type:    mediaType,
        context,
        size_bytes:    sizeBytes ?? null,
        is_public:     false,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('Media insert error:', error)
      return NextResponse.json({ error: 'Failed to save media' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })

  } catch (err: any) {
    console.error('Media API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}