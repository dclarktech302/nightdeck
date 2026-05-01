import { getPublicArtists } from '@/lib/queries/artists'
import { SiteNav } from '@/components/ui/SiteNav'
import { ParticleField } from '@/components/canvas/ParticleField'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 300

export default async function ArtistsPage() {
  const artists = await getPublicArtists()

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
          <h1 className="text-4xl font-bold text-white">Artists</h1>
          <p className="text-white/40 text-sm mt-2">
            Vetted talent performing on the Eastern Shore.
          </p>
        </div>

        {artists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artists.map(artist => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug ?? artist.id}`}
                className="group block"
              >
                <div
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Artist photo */}
                  <div className="relative aspect-square bg-[#111] overflow-hidden">
                    {artist.photo_url ? (
                      <Image
                        src={artist.photo_url}
                        alt={artist.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/10">
                          {artist.name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Artist info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#c9a84c] transition-colors duration-200">
                      {artist.name}
                    </p>
                    {artist.genre_tags && artist.genre_tags.length > 0 && (
                      <p className="text-xs text-white/30 truncate mt-0.5">
                        {artist.genre_tags.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-white/20 text-sm">Artists coming soon.</p>
          </div>
        )}

      </div>
    </>
  )
}