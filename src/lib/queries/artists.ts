import { createClient, createPublicClient } from '@/lib/supabase/server'

/**
 * Returns all vetted artists for the public Shore Pulse artist directory.
 * Private fields (contact, rate, rider) are filtered by RLS for anon requests.
 */
export async function getPublicArtists() {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('artists')
    .select('id, name, bio, photo_url, genre_tags, instagram_url, spotify_url, media_url')
    .eq('vetted', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('getPublicArtists error:', error)
    return []
  }

  return data
}

/**
 * Returns a single vetted artist by id for the public profile page.
 */
export async function getPublicArtistById(id: string) {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('artists')
    .select('id, name, bio, photo_url, genre_tags, instagram_url, spotify_url, media_url')
    .eq('id', id)
    .eq('vetted', true)
    .single()

  if (error) {
    console.error('getPublicArtistById error:', error)
    return null
  }

  return data
}

/**
 * Returns the full artist roster for the ops dashboard.
 * Includes private fields — RLS allows these for authenticated users.
 */
export async function getDashboardArtists() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('getDashboardArtists error:', error)
    return []
  }

  return data
}

/**
 * Returns a single artist with full details for the ops dashboard.
 */
export async function getDashboardArtistById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('getDashboardArtistById error:', error)
    return null
  }

  return data
}