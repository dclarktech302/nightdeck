import { getEventBySlug } from '@/lib/queries/events'
import { SiteNav } from '@/components/ui/SiteNav'
import { ParticleField } from '@/components/canvas/ParticleField'
import { RSVPForm } from '@/components/ui/RSVPForm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getEventMedia } from '@/lib/queries/events'
import { ShareButton } from '@/components/ui/ShareButton'
import { GalleryLightbox } from '@/components/ui/GalleryLightbox'

interface EventDetailPageProps {
  params: Promise<{ slug: string }>
}

function formatFullDate(dateString: string) {
  const date = new Date(dateString)
  return {
    full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) return { title: 'Event not found — Shore Pulse' }

  const date = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return {
    title: `${event.name} — Shore Pulse`,
    description: event.description
      ?? `${event.name} · ${date}${event.venues ? ` · ${event.venues.name}` : ''}. RSVP on Shore Pulse.`,
    openGraph: {
      title: event.name,
      description: event.description ?? `${event.name} · ${date}`,
      images: event.cover_image_url
        ? [{ url: event.cover_image_url, width: 1200, height: 630 }]
        : [],
      type: 'website',
    },
    twitter: {
      card: event.cover_image_url ? 'summary_large_image' : 'summary',
      title: event.name,
      description: event.description ?? `${event.name} · ${date}`,
      images: event.cover_image_url ? [event.cover_image_url] : [],
    },
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const media = await getEventMedia(event.id)

  const isCompleted   = event.status === 'completed'
  const promoVideos   = media.filter(m => m.context === 'promotional' && m.media_type === 'video')
  const promoImages   = media.filter(m => m.context === 'promotional' && m.media_type === 'image')
  const galleryMedia  = media.filter(m => m.context === 'gallery')
  const { full, time } = formatFullDate(event.event_date)
  const doorsTime = event.doors_open
    ? new Date(event.doors_open).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null
  const venue = event.venues
  const venueSlug = venue && 'slug' in venue ? (venue as any).slug : null
  const lineup = event.event_artists ?? []
  const maxSetOrder = lineup.length > 0 ? Math.max(...lineup.map(l => l.set_order ?? 0)) : -1

  return (
    <>
      <ParticleField density={30} />
      <SiteNav />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-32">

        {/* -- FLYER -- */}
        {event.cover_image_url && (
          <div
            className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* -- HEADER -- */}
        <div className="mb-10">
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
            style={{ color: '#c9a84c' }}
          >
            {full}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {event.name}
          </h1>
          {event.description && (
            <p className="text-white/50 text-base leading-relaxed max-w-2xl">
              {event.description}
            </p>
          )}
        </div>

        {/* -- TWO COLUMN LAYOUT -- */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-10">

          {/* LEFT COLUMN */}
          <div className="space-y-10">

            {/* Event details */}
            <div className="space-y-3">
              <h2
                className="text-xs tracking-[0.3em] uppercase font-semibold"
                style={{ color: '#c9a84c' }}
              >
                Details
              </h2>
              <div className="space-y-2 text-sm text-white/60">
                {doorsTime && (
                  <p>Doors <span className="text-white">{doorsTime}</span></p>
                )}
                <p>Show <span className="text-white">{time}</span></p>
                <p>
                  Cover{' '}
                  <span className="text-white">
                    {event.door_price ? `$${event.door_price}` : 'Free'}
                  </span>
                </p>
                {event.rsvp_count > 0 && (
                  <p>
                    <span className="text-white">{event.rsvp_count}</span> attending
                  </p>
                )}
              </div>
            </div>

            {/* Venue */}
            {venue && (
              <div className="space-y-3">
                <h2
                  className="text-xs tracking-[0.3em] uppercase font-semibold"
                  style={{ color: '#c9a84c' }}
                >
                  Venue
                </h2>
                <div className="text-sm text-white/60 space-y-1">
                  {venueSlug ? (
                    <Link
                      href={`/venues/${venueSlug}`}
                      className="text-white font-medium hover:text-[#c9a84c] transition-colors duration-200"
                    >
                      {venue.name}
                    </Link>
                  ) : (
                    <p className="text-white font-medium">{venue.name}</p>
                  )}
                  {venue.address && <p>{venue.address}</p>}
                  {venue.city && <p>{venue.city}</p>}
                </div>
                {venue.google_maps_embed && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      [venue.address, venue.city].filter(Boolean).join(', ')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors"
                    style={{ color: '#c9a84c' }}
                  >
                    Get directions →
                  </a>
                )}
              </div>
            )}

            {/* Lineup */}
            {lineup.length > 0 && (
              <div className="space-y-3">
                <h2
                  className="text-xs tracking-[0.3em] uppercase font-semibold"
                  style={{ color: '#c9a84c' }}
                >
                  Lineup
                </h2>
                <div className="space-y-3">
                  {lineup
                    .sort((a, b) => (b.set_order ?? 0) - (a.set_order ?? 0))
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-4 p-3 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {/* Artist photo */}
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#111]">
                          {slot.artists?.photo_url ? (
                            <Image
                              src={slot.artists.photo_url}
                              alt={slot.artists.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                              {slot.artists?.name?.[0]}
                            </div>
                          )}
                        </div>

                        {/* Artist info */}
                        <div className="flex-1 min-w-0">
                          {slot.artists?.slug ? (
                              <Link
                                href={`/artists/${slot.artists.slug}`}
                                className="text-sm font-medium text-white truncate hover:text-[#c9a84c] transition-colors duration-200"
                              >
                                {slot.artists?.name}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium text-white truncate">
                                {slot.artists?.name}
                              </p>
                            )}
                          {slot.artists?.genre_tags && slot.artists.genre_tags.length > 0 && (
                            <p className="text-xs text-white/30 truncate">
                              {slot.artists.genre_tags.join(' · ')}
                            </p>
                          )}
                        </div>

                        {/* Headliner badge */}
                        {slot.set_order === maxSetOrder && (
                          <span
                            className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded shrink-0"
                            style={{
                              background: 'oklch(0.78 0.15 85 / 0.1)',
                              border: '1px solid oklch(0.78 0.15 85 / 0.3)',
                              color: '#c9a84c',
                            }}
                          >
                            Headliner
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Promotional images — pre-event strip */}
            {!isCompleted && promoImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
                {promoImages.map((img, index) => (
                  <div key={img.id} className="shrink-0 w-24 h-24 rounded-lg overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Image
                      src={img.url}
                      alt=""
                      width={96}
                      height={96}
                      className="w-full h-auto object-cover"
                      priority={index === 0}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

          </div>
          {/* END LEFT COLUMN */}

          {/* RIGHT COLUMN: RSVP FORM or completed state */}
          <div className="md:sticky md:top-24 h-fit space-y-4">

            {/* Promotional video — pre-event */}
            {!isCompleted && promoVideos.length > 0 && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <video
                  src={promoVideos[0].url}
                  className="w-full"
                  controls
                  preload="metadata"
                  playsInline
                />
              </div>
            )}

            {/* RSVP form — only for upcoming events */}
            {!isCompleted && (
              <RSVPForm eventId={event.id} eventName={event.name} />
            )}

            {!isCompleted && (
              <>
                <RSVPForm eventId={event.id} eventName={event.name} />
                <ShareButton
                  title={event.name}
                  text={`${full} · ${venue?.name ?? 'Shore Pulse'}`}
                  url={`${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}`}
                />
              </>
            )}

            {/* Completed state */}
            {isCompleted && (
              <div
                className="rounded-xl p-5 text-center space-y-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#c9a84c' }}>
                  This event has passed
                </p>
                <p className="text-xs text-white/30">
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

        </div>
        {/* END TWO COLUMN LAYOUT */}

        {/* -- GALLERY -- post-event only */}
        {isCompleted && galleryMedia.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs tracking-[0.3em] uppercase font-semibold"
                style={{ color: '#c9a84c' }}>
                Gallery
              </span>
              <div className="flex-1 h-px"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <GalleryLightbox items={galleryMedia} />
          </div>
        )}

      </div>
    </>
  )
}