import { createClient, createPublicClient } from '@/lib/supabase/server'

export async function getPublicArtists() {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('artists')
    .select('id, slug, name, bio, photo_url, genre_tags, instagram_url, spotify_url, media_url')
    .eq('vetted', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('getPublicArtists error:', error)
    return []
  }

  return data
}

export async function getPublicArtistBySlug(slug: string) {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('artists')
    .select('id, slug, name, bio, photo_url, genre_tags, instagram_url, spotify_url, media_url')
    .eq('slug', slug)
    .eq('vetted', true)
    .maybeSingle()

  if (error) {
    console.error('getPublicArtistBySlug error:', error)
    return null
  }

  return data
}

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

export async function getDashboardArtistById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('getDashboardArtistById error:', error)
    return null
  }

  return data
}