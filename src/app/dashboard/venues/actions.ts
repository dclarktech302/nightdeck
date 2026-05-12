'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validateString, validatePositiveInt, sanitizeTags } from '@/lib/validate'

// ─── CREATE VENUE ─────────────────────────────────────────────
export async function createVenue(formData: FormData): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  const name = validateString(formData.get('name'), 120)
  if (!name) return

  const address         = validateString(formData.get('address'), 200)
  const city            = validateString(formData.get('city'), 100)
  const state           = validateString(formData.get('state'), 100)
  const capacity        = validatePositiveInt(formData.get('capacity'), 100_000)
  const vibeTags        = sanitizeTags(formData.get('vibe_tags'))
  const googleMapsEmbed = validateString(formData.get('google_maps_embed'), 2000)
  const instagramUrl    = validateString(formData.get('instagram_url'), 500)
  const active          = formData.get('active') !== 'false'

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
      address:            address         ?? null,
      city:               city            ?? null,
      state:              state           ?? null,
      capacity:           capacity        ?? null,
      vibe_tags:          vibeTags.length > 0 ? vibeTags : null,
      google_maps_embed:  googleMapsEmbed ?? null,
      instagram_url:      instagramUrl    ?? null,
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
  const session = await requireSession()
  const supabase = await createClient()

  // Verify ownership — defense in depth on top of RLS.
  const { data: existing } = await supabase
    .from('venues')
    .select('id')
    .eq('id', venueId)
    .eq('org_id', session.orgId)
    .single()

  if (!existing) {
    redirect('/dashboard/venues')
  }

  const name = validateString(formData.get('name'), 120)
  if (!name) return

  const address         = validateString(formData.get('address'), 200)
  const city            = validateString(formData.get('city'), 100)
  const state           = validateString(formData.get('state'), 100)
  const capacity        = validatePositiveInt(formData.get('capacity'), 100_000)
  const vibeTags        = sanitizeTags(formData.get('vibe_tags'))
  const googleMapsEmbed = validateString(formData.get('google_maps_embed'), 2000)
  const instagramUrl    = validateString(formData.get('instagram_url'), 500)

  const { error } = await supabase
    .from('venues')
    .update({
      name,
      address:           address         ?? null,
      city:              city            ?? null,
      state:             state           ?? null,
      capacity:          capacity        ?? null,
      vibe_tags:         vibeTags.length > 0 ? vibeTags : null,
      google_maps_embed: googleMapsEmbed ?? null,
      instagram_url:     instagramUrl    ?? null,
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
