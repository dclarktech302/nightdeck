import { getPublicArtistBySlug } from '@/lib/queries/artists'
import { getUpcomingEvents } from '@/lib/queries/events'
import { SiteNav } from '@/components/ui/SiteNav'
import { ParticleField } from '@/components/canvas/ParticleField'
import { EventCard } from '@/components/ui/EventCard'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface ArtistPageProps {
  params: Promise<{ slug: string }>
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params
  const artist = await getPublicArtistBySlug(slug)

  if (!artist) notFound()

  // Filter upcoming events to ones featuring this artist
  const allEvents = await getUpcomingEvents()
  const artistEvents = allEvents.filter(event =>
    (event as any).event_artists?.some(
      (ea: any) => ea.artist_id === artist.id
    )
  )

  return (
    <>
      <ParticleField density={25} />
      <SiteNav />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-32">

        {/* -- ARTIST HEADER -- */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">

          {/* Photo */}
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-[#111]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {artist.photo_url ? (
              <Image
                src={artist.photo_url}
                alt={artist.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-white/10">
                  {artist.name[0]}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              {artist.genre_tags && artist.genre_tags.length > 0 && (
                <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2"
                  style={{ color: '#c9a84c' }}>
                  {artist.genre_tags.join(' · ')}
                </p>
              )}
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {artist.name}
              </h1>
            </div>

            {artist.bio && (
              <p className="text-white/50 text-sm leading-relaxed max-w-xl">
                {artist.bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex items-center gap-4">
              {artist.instagram_url && (
                <a
                  href={artist.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-colors text-white/30 hover:text-white"
                >
                  Instagram →
                </a>
              )}
              {artist.spotify_url && (
                <a
                  href={artist.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-colors text-white/30 hover:text-white"
                >
                  Spotify →
                </a>
              )}
              {artist.media_url && (
                <a
                  href={artist.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#c9a84c' }}
                >
                  Listen →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* -- SPOTIFY EMBED -- */}
        {artist.spotify_url && artist.spotify_url.includes('spotify.com') && (
          <div className="mb-12">
            <p className="text-xs tracking-[0.3em] uppercase font-semibold mb-4"
              style={{ color: '#c9a84c' }}>
              Listen
            </p>
            <iframe
              src={artist.spotify_url.replace('spotify.com/', 'spotify.com/embed/')}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
        )}

        {/* -- UPCOMING SHOWS -- */}
        {artistEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs tracking-[0.3em] uppercase font-semibold"
                style={{ color: '#c9a84c' }}>
                Upcoming shows
              </span>
              <div className="flex-1 h-px"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artistEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}