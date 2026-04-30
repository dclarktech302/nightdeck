import { getPublicVenues } from '@/lib/queries/venues'
import { SiteNav } from '@/components/ui/SiteNav'
import { ParticleField } from '@/components/canvas/ParticleField'
import Link from 'next/link'

export default async function VenuesPage() {
  const venues = await getPublicVenues()

  return (
    <>
      <ParticleField density={30} />
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-32">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.4em] uppercase font-medium mb-3"
            style={{ color: '#c9a84c' }}>
            Shore Pulse
          </p>
          <h1 className="text-4xl font-bold text-white">Venues</h1>
          <p className="text-white/40 text-sm mt-2">
            Where it happens on the Eastern Shore.
          </p>
        </div>

        {venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map(venue => (
              <Link
                key={venue.id}
                href={`/venues/${venue.slug ?? venue.id}`}
                className="group block"
              >
                <div
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Cover image */}
                  <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
                    {venue.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={venue.cover_image_url}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/5">
                          {venue.name[0]}
                        </span>
                      </div>
                    )}

                    {/* Hover gold border */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                      style={{ boxShadow: 'inset 0 0 0 1px oklch(0.78 0.15 85 / 0.4)' }}
                    />
                  </div>

                  {/* Venue info */}
                  <div className="p-4 space-y-2">
                    {/* Vibe tags */}
                    {venue.vibe_tags && venue.vibe_tags.length > 0 && (
                      <p className="text-[10px] tracking-[0.2em] uppercase font-medium"
                        style={{ color: '#c9a84c' }}>
                        {venue.vibe_tags.join(' · ')}
                      </p>
                    )}

                    <h3 className="text-base font-semibold text-white group-hover:text-[#c9a84c] transition-colors duration-200">
                      {venue.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/30">
                        {[venue.city, venue.state].filter(Boolean).join(', ')}
                      </p>
                      {venue.capacity && (
                        <p className="text-xs text-white/20">
                          Cap. {venue.capacity.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-white/20 text-sm">Venues coming soon.</p>
          </div>
        )}

      </div>
    </>
  )
}