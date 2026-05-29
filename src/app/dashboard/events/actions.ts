'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validateString, validatePositiveInt, validatePositiveFloat } from '@/lib/validate'
import type { Enums } from '@/types/database.types'

const VALID_EVENT_STATUSES = new Set(['draft', 'pending', 'confirmed', 'completed', 'cancelled'])

// ─── CREATE EVENT ─────────────────────────────────────────────
export async function createEvent(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const name      = validateString(formData.get('name'), 200)
  const eventDate = validateString(formData.get('event_date'), 50)
  if (!name || !eventDate) return

  const description = validateString(formData.get('description'), 5000)
  const doorsOpen   = validateString(formData.get('doors_open'), 50)
  const venueId     = validateString(formData.get('venue_id'), 50)
  const doorPrice   = validatePositiveFloat(formData.get('door_price'), 10_000)
  const rsvpLimit   = validatePositiveInt(formData.get('rsvp_limit'), 100_000)
  const featured    = formData.get('featured') === 'true'

  const rawStatus = formData.get('status') as string
  const status = (VALID_EVENT_STATUSES.has(rawStatus) ? rawStatus : 'draft') as Enums<'event_status'>

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Math.random().toString(36).slice(2, 7)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('events') as any)
    .insert({
      org_id:      session.orgId,
      name,
      description: description ?? null,
      event_date:  eventDate,
      doors_open:  doorsOpen   ?? null,
      venue_id:    venueId     ?? null,
      door_price:  doorPrice   ?? null,
      rsvp_limit:  rsvpLimit   ?? null,
      status,
      featured,
      slug,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createEvent error:', error)
    return
  }

  revalidatePath('/dashboard/events')
  redirect(`/dashboard/events/${data.id}`)
}

// ─── UPDATE EVENT ─────────────────────────────────────────────
export async function updateEvent(eventId: string, formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  // Verify ownership — defense in depth on top of RLS.
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('org_id', session.orgId)
    .single()

  if (!existing) {
    redirect('/dashboard/events')
  }

  const name      = validateString(formData.get('name'), 200)
  const eventDate = validateString(formData.get('event_date'), 50)
  if (!name || !eventDate) return

  const description = validateString(formData.get('description'), 5000)
  const doorsOpen   = validateString(formData.get('doors_open'), 50)
  const venueId     = validateString(formData.get('venue_id'), 50)
  const doorPrice   = validatePositiveFloat(formData.get('door_price'), 10_000)
  const rsvpLimit   = validatePositiveInt(formData.get('rsvp_limit'), 100_000)

  const rawStatus = formData.get('status') as string
  const status = (VALID_EVENT_STATUSES.has(rawStatus) ? rawStatus : 'draft') as Enums<'event_status'>

  const { error } = await supabase
    .from('events')
    .update({
      name,
      description: description ?? null,
      event_date:  eventDate,
      doors_open:  doorsOpen   ?? null,
      venue_id:    venueId     ?? null,
      door_price:  doorPrice   ?? null,
      rsvp_limit:  rsvpLimit   ?? null,
      status,
      featured:    formData.get('featured') === 'true',
    })
    .eq('id', eventId)

  if (error) {
    console.error('updateEvent error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
  revalidatePath('/dashboard/events')
  revalidatePath('/')
  redirect(`/dashboard/events/${eventId}?saved=true`)
}

// ─── ADD ARTIST TO LINEUP ─────────────────────────────────────
export async function addArtistToLineup(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const eventId  = validateString(formData.get('event_id'), 50)
  const artistId = validateString(formData.get('artist_id'), 50)
  if (!eventId || !artistId) return

  // Verify caller owns the event
  const { data: eventCheck } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('org_id', session.orgId)
    .single()

  if (!eventCheck) return

  const agreedPay = validatePositiveFloat(formData.get('agreed_pay'), 100_000)
  const setOrder  = validatePositiveInt(formData.get('set_order'), 999)

  const { error } = await supabase
    .from('event_artists')
    .insert({
      event_id:       eventId,
      artist_id:      artistId,
      agreed_pay:     agreedPay ?? null,
      set_order:      setOrder  ?? null,
      booking_status: 'confirmed',
      pay_status:     'pending',
    })

  if (error) {
    console.error('addArtistToLineup error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}

// ─── REMOVE ARTIST FROM LINEUP ────────────────────────────────
export async function removeArtistFromLineup(eventArtistId: string, eventId: string): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  // Verify caller owns the event before touching the lineup row
  const { data: eventCheck } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('org_id', session.orgId)
    .single()

  if (!eventCheck) return

  const { error } = await supabase
    .from('event_artists')
    .delete()
    .eq('id', eventArtistId)

  if (error) {
    console.error('removeArtistFromLineup error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}

// ─── MARK ARTIST PAID ─────────────────────────────────────────
export async function markArtistPaid(eventArtistId: string, eventId: string): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  // Verify caller owns the event
  const { data: eventCheck } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('org_id', session.orgId)
    .single()

  if (!eventCheck) return

  const { error } = await supabase
    .from('event_artists')
    .update({ pay_status: 'paid' })
    .eq('id', eventArtistId)

  if (error) {
    console.error('markArtistPaid error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}

// ─── ADD EXPENSE ──────────────────────────────────────────────
export async function addExpense(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const eventId  = validateString(formData.get('event_id'), 50)
  const category = formData.get('category') as Enums<'expense_category'>
  const amount   = validatePositiveFloat(formData.get('amount'), 1_000_000)

  if (!eventId || !category || amount === null) return

  // Verify caller owns the event
  const { data: eventCheck } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('org_id', session.orgId)
    .single()

  if (!eventCheck) return

  const description = validateString(formData.get('description'), 500)

  const { error } = await supabase
    .from('expenses')
    .insert({
      event_id:    eventId,
      category,
      description: description ?? null,
      amount,
    })

  if (error) {
    console.error('addExpense error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}

// ─── ADD REVENUE ──────────────────────────────────────────────
export async function addRevenue(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const eventId = validateString(formData.get('event_id'), 50)
  const source  = formData.get('source') as Enums<'revenue_source'>
  const amount  = validatePositiveFloat(formData.get('amount'), 1_000_000)

  if (!eventId || !source || amount === null) return

  // Verify caller owns the event
  const { data: eventCheck } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('org_id', session.orgId)
    .single()

  if (!eventCheck) return

  const notes = validateString(formData.get('notes'), 500)

  const { error } = await supabase
    .from('revenue')
    .insert({
      event_id: eventId,
      source,
      amount,
      notes:    notes ?? null,
    })

  if (error) {
    console.error('addRevenue error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}
