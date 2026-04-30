import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { EventWithVenue, EventWithLineup } from '@/types'

// ─── Public queries (Shore Pulse) ────────────────────────────
// These run without auth — RLS ensures only confirmed events return.

/**
 * Returns all upcoming confirmed events with their venue.
 * Used by the Shore Pulse homepage and /events page.
 */
export async function getUpcomingEvents(): Promise<EventWithVenue[]> {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        name,
        address,
        city,
        state,
        google_maps_embed
      )
    `)
    .eq('status', 'confirmed')
    .gte('event_date', new Date().toISOString()) // only future events
    .order('event_date', { ascending: true })

  if (error) {
    console.error('getUpcomingEvents error:', error)
    return []
  }

  return data as EventWithVenue[]
}

/**
 * Returns the 3 featured confirmed events for the homepage hero.
 */
export async function getFeaturedEvents(): Promise<EventWithVenue[]> {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        name,
        address,
        city,
        state,
        google_maps_embed
      )
    `)
    .eq('status', 'confirmed')
    .eq('featured', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  if (error) {
    console.error('getFeaturedEvents error:', error)
    return []
  }

  return data as EventWithVenue[]
}

/**
 * Returns a single event by slug (the event name slugified).
 * Includes venue + full lineup with artist details.
 * Used by the Shore Pulse event detail page.
 *
 * Note: we match on a generated slug pattern using the event id
 * for now. In v0.5.0 we'll add a slug column to events.
 */
export async function getEventBySlug(slug: string): Promise<EventWithLineup | null> {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        name,
        address,
        city,
        state,
        google_maps_embed
      ),
      event_artists (
        *,
        artists (
          id,
          name,
          slug,
          photo_url,
          genre_tags,
          instagram_url,
          spotify_url
        )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'confirmed')
    .maybeSingle()

  if (error) {
    console.error('getEventBySlug error:', error)
    return null
  }

  return data as EventWithLineup
}

// ─── Dashboard queries (authenticated, org-scoped) ────────────
// RLS automatically scopes these to the current user's org.
// You don't pass org_id manually — the database enforces it.

/**
 * Returns ALL events for the current org regardless of status.
 * Used by the ops dashboard events list.
 */
export async function getDashboardEvents() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        name,
        city
      )
    `)
    .order('event_date', { ascending: false }) // most recent first in dashboard

  if (error) {
    console.error('getDashboardEvents error:', error)
    return []
  }

  return data
}

/**
 * Returns a single event with full lineup for the ops dashboard.
 * No status filter — operators can view events in any status.
 */
export async function getDashboardEventById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        name,
        address,
        city,
        state,
        capacity
      ),
      event_artists (
        *,
        artists (
          id,
          name,
          slug,
          photo_url,
          genre_tags,
          contact_email,
          contact_phone,
          default_rate
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('getDashboardEventById error:', error)
    return null
  }

  return data
}