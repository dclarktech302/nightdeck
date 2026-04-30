'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Enums } from '@/types/database.types'

// ─── CREATE EVENT ─────────────────────────────────────────────
export async function createEvent(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const name        = formData.get('name') as string
  const description = formData.get('description') as string
  const eventDate   = formData.get('event_date') as string
  const doorsOpen   = formData.get('doors_open') as string
  const venueId     = formData.get('venue_id') as string
  const doorPrice   = formData.get('door_price') as string
  const rsvpLimit   = formData.get('rsvp_limit') as string
  const status      = (formData.get('status') || 'draft') as Enums<'event_status'>
  const featured    = formData.get('featured') === 'true'

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
      description: description || null,
      event_date:  eventDate,
      doors_open:  doorsOpen || null,
      venue_id:    venueId || null,
      door_price:  doorPrice ? parseFloat(doorPrice) : null,
      rsvp_limit:  rsvpLimit ? parseInt(rsvpLimit) : null,
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
  await requireSession()
  const supabase = await createClient()
  const status = formData.get('status') as Enums<'event_status'>

  const { error } = await supabase
    .from('events')
    .update({
      name:        formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      event_date:  formData.get('event_date') as string,
      doors_open:  (formData.get('doors_open') as string) || null,
      venue_id:    (formData.get('venue_id') as string) || null,
      door_price:  formData.get('door_price') ? parseFloat(formData.get('door_price') as string) : null,
      rsvp_limit:  formData.get('rsvp_limit') ? parseInt(formData.get('rsvp_limit') as string) : null,
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
  await requireSession()
  const supabase = await createClient()

  const eventId   = formData.get('event_id') as string
  const artistId  = formData.get('artist_id') as string
  const agreedPay = formData.get('agreed_pay') as string
  const setOrder  = formData.get('set_order') as string

  const { error } = await supabase
    .from('event_artists')
    .insert({
      event_id:       eventId,
      artist_id:      artistId,
      agreed_pay:     agreedPay ? parseFloat(agreedPay) : null,
      set_order:      setOrder ? parseInt(setOrder) : null,
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
  await requireSession()
  const supabase = await createClient()

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
  await requireSession()
  const supabase = await createClient()

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
  await requireSession()
  const supabase = await createClient()

  const eventId     = formData.get('event_id') as string
  const category    = formData.get('category') as Enums<'expense_category'>
  const description = formData.get('description') as string
  const amount      = formData.get('amount') as string

  const { error } = await supabase
    .from('expenses')
    .insert({
      event_id:    eventId,
      category,
      description: description || null,
      amount:      parseFloat(amount),
    })

  if (error) {
    console.error('addExpense error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}

// ─── ADD REVENUE ──────────────────────────────────────────────
export async function addRevenue(formData: FormData): Promise<void> {
  await requireSession()
  const supabase = await createClient()

  const eventId = formData.get('event_id') as string
  const source  = formData.get('source') as Enums<'revenue_source'>
  const amount  = formData.get('amount') as string
  const notes   = formData.get('notes') as string

  const { error } = await supabase
    .from('revenue')
    .insert({
      event_id: eventId,
      source,
      amount:   parseFloat(amount),
      notes:    notes || null,
    })

  if (error) {
    console.error('addRevenue error:', error)
    return
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}