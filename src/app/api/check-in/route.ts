import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { confirmationCode, eventId } = body

    if (!confirmationCode || !eventId) {
      return NextResponse.json(
        { error: 'Missing confirmation code or event ID' },
        { status: 400 }
      )
    }

    // Verify the requester is authenticated
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service client for the lookup and update
    const supabase = createServiceClient()

    // Find the RSVP by confirmation code scoped to this event
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select(`
        id,
        checked_in,
        checked_in_at,
        party_size,
        event_id,
        attendees ( first_name )
      `)
      .eq('confirmation_code', confirmationCode)
      .eq('event_id', eventId)
      .eq('status', 'confirmed')
      .single()

    if (rsvpError || !rsvp) {
      return NextResponse.json(
        { error: 'Invalid code or wrong event' },
        { status: 404 }
      )
    }

    // Already checked in — return success with warning flag
    if (rsvp.checked_in) {
      return NextResponse.json({
        success:          true,
        alreadyCheckedIn: true,
        firstName:        (rsvp.attendees as any)?.first_name ?? 'Guest',
        partySize:        rsvp.party_size,
        checkedInAt:      rsvp.checked_in_at,
      })
    }

    // Mark as checked in
    const { error: updateError } = await supabase
      .from('rsvps')
      .update({
        checked_in:    true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', rsvp.id)

    if (updateError) {
      console.error('Check-in update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to check in' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:          true,
      alreadyCheckedIn: false,
      firstName:        (rsvp.attendees as any)?.first_name ?? 'Guest',
      partySize:        rsvp.party_size,
    })

  } catch (err) {
    console.error('Check-in route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}