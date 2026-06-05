import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_ATTENDEE_TYPES  = new Set(['attendee', 'performer'])
const VALID_REFERRAL_SOURCES = new Set(['friend', 'performer', 'venue', 'social_media', 'other'])
const VALID_PRIMARY_REASONS  = new Set(['performer', 'venue', 'friends', 'supporting_local_scene', 'looking_for_something_to_do'])

// In-memory rate limit: max 3 submissions per IP per event per hour
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, eventId: string): boolean {
  const key = `${ip}:${eventId}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }

  if (entry.count >= 3) return false

  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { event_id, attendee_type, first_time, referral_source, primary_reason } = body as Record<string, unknown>

  if (typeof event_id !== 'string' || !event_id) {
    return NextResponse.json({ error: 'event_id is required' }, { status: 400 })
  }

  if (!VALID_ATTENDEE_TYPES.has(attendee_type as string)) {
    return NextResponse.json({ error: 'Invalid attendee_type' }, { status: 400 })
  }

  if (typeof first_time !== 'boolean') {
    return NextResponse.json({ error: 'first_time must be a boolean' }, { status: 400 })
  }

  if (!VALID_REFERRAL_SOURCES.has(referral_source as string)) {
    return NextResponse.json({ error: 'Invalid referral_source' }, { status: 400 })
  }

  if (!VALID_PRIMARY_REASONS.has(primary_reason as string)) {
    return NextResponse.json({ error: 'Invalid primary_reason' }, { status: 400 })
  }

  if (!checkRateLimit(ip, event_id)) {
    return NextResponse.json({ error: 'Too many submissions' }, { status: 429 })
  }

  const supabase = createServiceClient()

  // Verify the event exists before writing
  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', event_id)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const { error } = await (supabase as any)
    .from('event_attendance')
    .insert({
      event_id,
      attendee_type,
      first_time,
      referral_source,
      primary_reason,
    })

  if (error) {
    console.error('attend insert error:', error)
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
