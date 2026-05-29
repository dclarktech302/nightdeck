import { Resend } from 'resend'
import { RSVPConfirmation } from '@/emails/RSVPConfirmation'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateEmail, validatePhone, validateString, validatePositiveInt } from '@/lib/validate'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventId, firstName, email, phone, partySize, source } = body

    // -- INPUT VALIDATION --
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 })
    }

    const validatedEmail = validateEmail(email)
    if (!validatedEmail) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const validatedName = validateString(firstName, 100)
    if (!validatedName) {
      return NextResponse.json({ error: 'Name is required (max 100 characters)' }, { status: 400 })
    }

    const validatedPhone = validatePhone(phone)

    const validatedPartySize = validatePositiveInt(partySize, 10)
    if (validatedPartySize === null || validatedPartySize < 1) {
      return NextResponse.json({ error: 'Party size must be between 1 and 10' }, { status: 400 })
    }

    const validatedSource = validateString(source, 50) ?? 'direct'

    const supabase = createServiceClient()

    // -- FETCH EVENT --
    // Verify the event exists and is confirmed before accepting RSVPs.
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id, name, event_date, doors_open, door_price, rsvp_limit, rsvp_count,
        venues ( name, address, city )
      `)
      .eq('id', eventId)
      .eq('status', 'confirmed')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // -- RSVP LIMIT CHECK --
    if (event.rsvp_limit && event.rsvp_count >= event.rsvp_limit) {
      return NextResponse.json(
        { error: 'Event is at capacity' },
        { status: 409 }
      )
    }

    // -- GET OR CREATE ATTENDEE --
    // Check if attendee already exists by email first.
    // We never update an existing attendee record — just reuse it.
    let attendeeId: string

    const { data: existingAttendee } = await supabase
      .from('attendees')
      .select('id')
      .eq('email', validatedEmail)
      .maybeSingle()

    if (existingAttendee) {
      // Attendee already exists — reuse their record
      attendeeId = existingAttendee.id
    } else {
      // New attendee — create the record
      const { data: newAttendee, error: attendeeError } = await supabase
        .from('attendees')
        .insert({
          email:      validatedEmail,
          first_name: validatedName,
          phone:      validatedPhone,
          source:     validatedSource,
        })
        .select('id')
        .single()

      if (attendeeError || !newAttendee) {
        console.error('Attendee insert error:', attendeeError)
        return NextResponse.json(
          { error: 'Failed to create attendee' },
          { status: 500 }
        )
      }

      attendeeId = newAttendee.id
    }

    // -- DUPLICATE RSVP CHECK --
    // Check if this attendee already has an active RSVP for this event.
    const { data: existing } = await supabase
      .from('rsvps')
      .select('id, confirmation_code')
      .eq('event_id', eventId)
      .eq('attendee_id', attendeeId)
      .eq('status', 'confirmed')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered', confirmationCode: existing.confirmation_code },
        { status: 409 }
      )
    }

    // -- CREATE RSVP --
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .insert({
        event_id:    eventId,
        attendee_id: attendeeId,
        party_size:  validatedPartySize,
        status:      'confirmed',
      })
      .select('confirmation_code')
      .single()

    if (rsvpError || !rsvp) {
      console.error('RSVP insert error:', rsvpError)
      return NextResponse.json(
        { error: 'Failed to create RSVP' },
        { status: 500 }
      )
    }

    // -- FORMAT EMAIL DATA --
    const eventDate = new Date(event.event_date)
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    })
    const venue = event.venues as { name: string; address: string | null; city: string | null } | null

    // -- SEND CONFIRMATION EMAIL --
    const { error: emailError } = await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to:      validatedEmail,
      subject: `You're on the list — ${event.name}`,
      react:   RSVPConfirmation({
        firstName:        validatedName,
        eventName:        event.name,
        eventDate:        formattedDate,
        eventTime:        formattedTime,
        venueName:        venue?.name ?? null,
        venueAddress:     venue?.address
                            ? `${venue.address}${venue.city ? `, ${venue.city}` : ''}`
                            : null,
        doorPrice:        event.door_price ? `$${event.door_price}` : 'Free',
        confirmationCode: rsvp.confirmation_code,
        partySize:        validatedPartySize,
      }),
    })

    if (emailError) {
      // Log the error but don't fail the request —
      // the RSVP is saved. Email failure shouldn't undo the registration.
      console.error('Resend error:', emailError)
    }

    return NextResponse.json(
      { success: true, confirmationCode: rsvp.confirmation_code },
      { status: 201 }
    )

  } catch (err) {
    console.error('RSVP route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
