import { createClient } from '@/lib/supabase/server'

/**
 * Returns all active venues for the public Shore Pulse venue directory.
 */
export async function getPublicVenues() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('venues')
    .select('id, name, address, city, state, capacity, vibe_tags, cover_image_url, google_maps_embed, instagram_url')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('getPublicVenues error:', error)
    return []
  }

  return data
}

/**
 * Returns a single active venue by id for the public venue page.
 */
export async function getPublicVenueById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('venues')
    .select('id, name, address, city, state, capacity, vibe_tags, cover_image_url, google_maps_embed, instagram_url')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error) {
    console.error('getPublicVenueById error:', error)
    return null
  }

  return data
}

/**
 * Returns all venues for the ops dashboard including inactive.
 */
export async function getDashboardVenues() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('getDashboardVenues error:', error)
    return []
  }

  return data
}