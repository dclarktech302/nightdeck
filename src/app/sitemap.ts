import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const base     = 'https://nightdeck.vercel.app'

  const [eventsRes, artistsRes, venuesRes] = await Promise.all([
    supabase
      .from('events')
      .select('slug, event_date')
      .in('status', ['confirmed', 'completed'])
      .not('slug', 'is', null),

    supabase
      .from('artists')
      .select('slug, updated_at')
      .eq('vetted', true)
      .not('slug', 'is', null),

    supabase
      .from('venues')
      .select('slug, updated_at')
      .eq('active', true)
      .not('slug', 'is', null),
  ])

  const eventUrls = (eventsRes.data ?? []).map(e => ({
    url:          `${base}/events/${e.slug}`,
    lastModified: new Date(e.event_date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const artistUrls = (artistsRes.data ?? []).map(a => ({
    url:          `${base}/artists/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const venueUrls = (venuesRes.data ?? []).map(v => ({
    url:          `${base}/venues/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    {
      url:             `${base}`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1,
    },
    {
      url:             `${base}/events`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${base}/artists`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${base}/venues`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    ...eventUrls,
    ...artistUrls,
    ...venueUrls,
  ]
}
