import { createClient, createPublicClient } from '@/lib/supabase/server'

export async function getPublicVenues() {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('venues')
    .select('id, slug, name, address, city, state, capacity, vibe_tags, cover_image_url, google_maps_embed, instagram_url')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('getPublicVenues error:', error)
    return []
  }

  return data
}

export async function getPublicVenueBySlug(slug: string) {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('venues')
    .select('id, slug, name, address, city, state, capacity, vibe_tags, cover_image_url, google_maps_embed, instagram_url')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('getPublicVenueBySlug error:', error)
    return null
  }

  return data
}

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