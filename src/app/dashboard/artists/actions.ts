'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  validateString,
  validateEmail,
  validatePhone,
  validatePositiveFloat,
  sanitizeTags,
} from '@/lib/validate'

// ─── CREATE ARTIST ────────────────────────────────────────────
export async function createArtist(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const name = validateString(formData.get('name'), 120)
  if (!name) return

  const bio          = validateString(formData.get('bio'), 2000)
  const genreTags    = sanitizeTags(formData.get('genre_tags'))
  const instagramUrl = validateString(formData.get('instagram_url'), 500)
  const spotifyUrl   = validateString(formData.get('spotify_url'), 500)
  const mediaUrl     = validateString(formData.get('media_url'), 500)
  const techRider    = validateString(formData.get('tech_rider'), 2000)
  const contactEmail = validateEmail(formData.get('contact_email'))
  const contactPhone = validatePhone(formData.get('contact_phone'))
  const defaultRate  = validatePositiveFloat(formData.get('default_rate'), 100_000)
  const vetted       = formData.get('vetted') === 'true'

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
      bio:           bio          ?? null,
      genre_tags:    genreTags.length > 0 ? genreTags : null,
      instagram_url: instagramUrl ?? null,
      spotify_url:   spotifyUrl   ?? null,
      media_url:     mediaUrl     ?? null,
      tech_rider:    techRider    ?? null,
      contact_email: contactEmail ?? null,
      contact_phone: contactPhone ?? null,
      default_rate:  defaultRate  ?? null,
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
  const session = await requireSession()
  const supabase = await createClient()

  // Verify ownership — defense in depth on top of RLS.
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .eq('id', artistId)
    .eq('org_id', session.orgId)
    .single()

  if (!existing) {
    redirect('/dashboard/artists')
  }

  const name = validateString(formData.get('name'), 120)
  if (!name) return

  const bio          = validateString(formData.get('bio'), 2000)
  const genreTags    = sanitizeTags(formData.get('genre_tags'))
  const instagramUrl = validateString(formData.get('instagram_url'), 500)
  const spotifyUrl   = validateString(formData.get('spotify_url'), 500)
  const mediaUrl     = validateString(formData.get('media_url'), 500)
  const techRider    = validateString(formData.get('tech_rider'), 2000)
  const contactEmail = validateEmail(formData.get('contact_email'))
  const contactPhone = validatePhone(formData.get('contact_phone'))
  const defaultRate  = validatePositiveFloat(formData.get('default_rate'), 100_000)

  const { error } = await supabase
    .from('artists')
    .update({
      name,
      bio:           bio          ?? null,
      genre_tags:    genreTags.length > 0 ? genreTags : null,
      instagram_url: instagramUrl ?? null,
      spotify_url:   spotifyUrl   ?? null,
      media_url:     mediaUrl     ?? null,
      tech_rider:    techRider    ?? null,
      contact_email: contactEmail ?? null,
      contact_phone: contactPhone ?? null,
      default_rate:  defaultRate  ?? null,
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

// ─── UNVET ARTIST ─────────────────────────────────────────────
// Soft approach — set vetted to false to hide from public
// rather than hard deleting which would break event history
export async function unvetArtist(artistId: string): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  // Verify ownership — defense in depth on top of RLS.
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .eq('id', artistId)
    .eq('org_id', session.orgId)
    .single()

  if (!existing) {
    redirect('/dashboard/artists')
  }

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
