'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── CREATE VENUE ─────────────────────────────────────────────
export async function createVenue(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const name             = formData.get('name') as string
  const address          = formData.get('address') as string
  const city             = formData.get('city') as string
  const state            = formData.get('state') as string
  const capacity         = formData.get('capacity') as string
  const vibeTagsRaw      = formData.get('vibe_tags') as string
  const googleMapsEmbed  = formData.get('google_maps_embed') as string
  const instagramUrl     = formData.get('instagram_url') as string
  const active           = formData.get('active') !== 'false'

  const vibeTags = vibeTagsRaw
    ? vibeTagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Math.random().toString(36).slice(2, 7)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('venues') as any)
    .insert({
      org_id:             session.orgId,
      name,
      address:            address || null,
      city:               city || null,
      state:              state || null,
      capacity:           capacity ? parseInt(capacity) : null,
      vibe_tags:          vibeTags.length > 0 ? vibeTags : null,
      google_maps_embed:  googleMapsEmbed || null,
      instagram_url:      instagramUrl || null,
      active,
      slug,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createVenue error:', error)
    return
  }

  revalidatePath('/dashboard/venues')
  redirect(`/dashboard/venues/${data.id}`)
}

// ─── UPDATE VENUE ─────────────────────────────────────────────
export async function updateVenue(venueId: string, formData: FormData): Promise<void> {
  await requireSession()
  const supabase = await createClient()

  const vibeTagsRaw = formData.get('vibe_tags') as string
  const vibeTags = vibeTagsRaw
    ? vibeTagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const capacity = formData.get('capacity') as string

  const { error } = await supabase
    .from('venues')
    .update({
      name:              formData.get('name') as string,
      address:           (formData.get('address') as string) || null,
      city:              (formData.get('city') as string) || null,
      state:             (formData.get('state') as string) || null,
      capacity:          capacity ? parseInt(capacity) : null,
      vibe_tags:         vibeTags.length > 0 ? vibeTags : null,
      google_maps_embed: (formData.get('google_maps_embed') as string) || null,
      instagram_url:     (formData.get('instagram_url') as string) || null,
      active:            formData.get('active') !== 'false',
    })
    .eq('id', venueId)

  if (error) {
    console.error('updateVenue error:', error)
    return
  }

  revalidatePath(`/dashboard/venues/${venueId}`)
  revalidatePath('/dashboard/venues')
  revalidatePath('/venues')
  redirect(`/dashboard/venues/${venueId}?saved=true`)
}