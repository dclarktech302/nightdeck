import { getPublicVenueBySlug } from '@/lib/queries/venues'
import { getUpcomingEvents } from '@/lib/queries/events'
import { SiteNav } from '@/components/ui/SiteNav'
import { ParticleField } from '@/components/canvas/ParticleField'
import { EventCard } from '@/components/ui/EventCard'
import { notFound } from 'next/navigation'

interface VenuePageProps {
  params: Promise<{ slug: string }>
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params
  const venue = await getPublicVenueBySlug(slug)

  if (!venue) notFound()

  const allEvents = await getUpcomingEvents()
  const venueEvents = allEvents.filter(event =>
    event.venues?.name === venue.name
  )

  return (
    <>
      <ParticleField density={25} />
      <SiteNav />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-32">

        {/* -- VENUE HEADER -- */}
        <div className="mb-12">

          {/* Cover image */}
          {venue.cover_image_url && (
            <div
              className="relative w-full aspect-21/9 rounded-2xl overflow-hidden mb-8"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venue.cover_image_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Vibe tags */}
          {venue.vibe_tags && venue.vibe_tags.length > 0 && (
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
              style={{ color: '#c9a84c' }}
            >
              {venue.vibe_tags.join(' · ')}
            </p>
          )}

          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            {venue.name}
          </h1>

          {/* Venue details row */}
          <div className="flex flex-wrap gap-6 text-sm text-white/40">
            {venue.city && (
              <span>
                {venue.city}{venue.state ? `, ${venue.state}` : ''}
              </span>
            )}
            {venue.capacity && (
              <span>Capacity {venue.capacity.toLocaleString()}</span>
            )}
            {venue.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  [venue.address, venue.city, venue.state].filter(Boolean).join(', ')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
                style={{ color: '#c9a84c' }}
              >
                Get directions →
              </a>
            )}
            {venue.instagram_url && (
              <a
                href={venue.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors"
              >
                Instagram →
              </a>
            )}
          </div>
        </div>

        {/* -- UPCOMING EVENTS -- */}
        {venueEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span
                className="text-xs tracking-[0.3em] uppercase font-semibold"
                style={{ color: '#c9a84c' }}
              >
                Upcoming events
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venueEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {venueEvents.length === 0 && (
          <p className="text-white/20 text-sm">No upcoming events at this venue.</p>
        )}

      </div>
    </>
  )
}