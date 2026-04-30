'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── CREATE ARTIST ────────────────────────────────────────────
export async function createArtist(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const name         = formData.get('name') as string
  const bio          = formData.get('bio') as string
  const genreTagsRaw = formData.get('genre_tags') as string
  const instagramUrl = formData.get('instagram_url') as string
  const spotifyUrl   = formData.get('spotify_url') as string
  const mediaUrl     = formData.get('media_url') as string
  const techRider    = formData.get('tech_rider') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const defaultRate  = formData.get('default_rate') as string
  const vetted       = formData.get('vetted') === 'true'

  // genre_tags is a comma-separated string from the form input
  // split, trim whitespace, and filter empty strings
  const genreTags = genreTagsRaw
    ? genreTagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Math.random().toString(36).slice(2, 7)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('artists') as any)
    .insert({
      org_id:        session.orgId,
      name,
      bio:           bio || null,
      genre_tags:    genreTags.length > 0 ? genreTags : null,
      instagram_url: instagramUrl || null,
      spotify_url:   spotifyUrl || null,
      media_url:     mediaUrl || null,
      tech_rider:    techRider || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      default_rate:  defaultRate ? parseFloat(defaultRate) : null,
      vetted,
      slug,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createArtist error:', error)
    return
  }

  revalidatePath('/dashboard/artists')
  redirect(`/dashboard/artists/${data.id}`)
}

// ─── UPDATE ARTIST ────────────────────────────────────────────
export async function updateArtist(artistId: string, formData: FormData): Promise<void> {
  await requireSession()
  const supabase = await createClient()

  const genreTagsRaw = formData.get('genre_tags') as string
  const genreTags = genreTagsRaw
    ? genreTagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const defaultRate = formData.get('default_rate') as string

  const { error } = await supabase
    .from('artists')
    .update({
      name:          formData.get('name') as string,
      bio:           (formData.get('bio') as string) || null,
      genre_tags:    genreTags.length > 0 ? genreTags : null,
      instagram_url: (formData.get('instagram_url') as string) || null,
      spotify_url:   (formData.get('spotify_url') as string) || null,
      media_url:     (formData.get('media_url') as string) || null,
      tech_rider:    (formData.get('tech_rider') as string) || null,
      contact_email: (formData.get('contact_email') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      default_rate:  defaultRate ? parseFloat(defaultRate) : null,
      vetted:        formData.get('vetted') === 'true',
    })
    .eq('id', artistId)

  if (error) {
    console.error('updateArtist error:', error)
    return
  }

  revalidatePath(`/dashboard/artists/${artistId}`)
  revalidatePath('/dashboard/artists')
  revalidatePath('/artists')
}

// ─── DELETE ARTIST ────────────────────────────────────────────
// Soft approach — set vetted to false to hide from public
// rather than hard deleting which would break event history
export async function unvetArtist(artistId: string): Promise<void> {
  await requireSession()
  const supabase = await createClient()

  const { error } = await supabase
    .from('artists')
    .update({ vetted: false })
    .eq('id', artistId)

  if (error) {
    console.error('unvetArtist error:', error)
    return
  }

  revalidatePath('/dashboard/artists')
  revalidatePath('/artists')
  redirect(`/dashboard/artists/${artistId}?saved=true`)
}