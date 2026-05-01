import { getFeaturedEvents, getUpcomingEvents } from '@/lib/queries/events'
import { ParticleField } from '@/components/canvas/ParticleField'
import { SiteNav } from '@/components/ui/SiteNav'
import { EventCard } from '@/components/ui/EventCard'

export const revalidate = 300

export default async function HomePage() {
  // Both run in parallel — not sequential
  const [featured, upcoming] = await Promise.all([
    getFeaturedEvents(),
    getUpcomingEvents(),
  ])

  return (
    <>
      {/* Particle field — the one showstopper, fixed behind everything */}
      <ParticleField density={60} />

      <SiteNav />

      {/* -- HERO -- */}
      <section className="relative min-h-screen flex items-center justify-center px-6">

        {/* Ambient gold orb — depth without grid texture */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, oklch(0.78 0.15 85 / 0.05) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 text-center max-w-3xl">

          {/* Eyebrow */}
          <p
            className="text-xs tracking-[0.4em] uppercase mb-8 font-medium"
            style={{ color: '#c9a84c' }}
          >
            Eastern Shore · Delaware · Maryland
          </p>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6">
            What&apos;s happening
            <br />
            <span
              className="text-glow"
              style={{ color: '#c9a84c' }}
            >
              on the Shore.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-12">
            Curated events, vetted artists, real venues.
            No noise — only what&apos;s worth showing up for.
          </p>

          {/* CTA */}
          <a
            href="/events"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.1)',
              border: '1px solid oklch(0.78 0.15 85 / 0.4)',
              color: '#c9a84c',
              boxShadow: '0 0 20px oklch(0.78 0.15 85 / 0.1)',
            }}
          >
            Browse events →
          </a>
        </div>
      </section>

      {/* -- FEATURED EVENTS -- */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="flex items-center gap-4 mb-8">
            <span
              className="text-xs tracking-[0.3em] uppercase font-semibold"
              style={{ color: '#c9a84c' }}
            >
              Featured
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* -- UPCOMING EVENTS -- */}
      {upcoming.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="flex items-center gap-4 mb-8">
            <span
              className="text-xs tracking-[0.3em] uppercase font-semibold"
              style={{ color: '#c9a84c' }}
            >
              Upcoming
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state — no events yet */}
      {featured.length === 0 && upcoming.length === 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-32 text-center">
          <p className="text-white/20 text-sm">Events coming soon.</p>
        </section>
      )}

      {/* -- FOOTER -- */}
      <footer
        className="border-t px-6 py-8 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs text-white/20">
          Shore Pulse · Built by{' '}
          <a
            href="https://denkoregroup.com"
            className="hover:text-white/40 transition-colors"
          >
            Denkore Group
          </a>
        </p>
      </footer>
    </>
  )
}