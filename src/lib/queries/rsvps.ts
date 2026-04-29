import { createClient } from '@/lib/supabase/server'
import type { RSVPWithAttendee } from '@/types'

/**
 * Returns all RSVPs for a given event with attendee details.
 * Used by the ops dashboard attendee list and CSV export.
 */
export async function getRSVPsByEvent(eventId: string): Promise<RSVPWithAttendee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .select(`
      *,
      attendees (
        id,
        first_name,
        email,
        phone
      )
    `)
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getRSVPsByEvent error:', error)
    return []
  }

  return data as RSVPWithAttendee[]
}

/**
 * Looks up a single RSVP by confirmation code.
 * Used by the check-in tool when scanning a QR code.
 * Returns null if the code doesn't exist.
 */
export async function getRSVPByConfirmationCode(code: string): Promise<RSVPWithAttendee | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .select(`
      *,
      attendees (
        id,
        first_name,
        email,
        phone
      )
    `)
    .eq('confirmation_code', code)
    .single()

  if (error) {
    console.error('getRSVPByConfirmationCode error:', error)
    return null
  }

  return data as RSVPWithAttendee
}

/**
 * Checks whether an email already has an active RSVP for a given event.
 * Used during RSVP submission to prevent duplicates before inserting.
 * Returns the existing RSVP if found, null if not.
 */
export async function getExistingRSVP(eventId: string, email: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rsvps')
    .select('id, confirmation_code, status')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .in(
      'attendee_id',
      // Subquery: find attendee id for this email first
      (await supabase
        .from('attendees')
        .select('id')
        .eq('email', email.toLowerCase())
      ).data?.map(a => a.id) ?? []
    )
    .maybeSingle() // returns null if not found, doesn't throw

  if (error) {
    console.error('getExistingRSVP error:', error)
    return null
  }

  return data
}