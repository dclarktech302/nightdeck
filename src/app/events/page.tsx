import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'
import { SiteNav } from '@/components/ui/SiteNav'
import { EventCard } from '@/components/ui/EventCard'
import { ParticleField } from '@/components/canvas/ParticleField'

export const revalidate = 300

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
  ])

  return (
    <>
      <ParticleField density={40} />
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-32 space-y-16">

        {/* Upcoming Events Section */}
        <div>
          <div className="mb-12">
            <p className="text-xs tracking-[0.4em] uppercase font-medium mb-3" style={{ color: '#c9a84c' }}>
              Shore Pulse
            </p>
            <h1 className="text-4xl font-bold text-white">Upcoming events</h1>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-white/20 text-sm">No upcoming events. Check back soon.</p>
            </div>
          )}
        </div>

        {/* Past Events Section */}
        {past.length > 0 && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-2xl font-bold text-white/60">Past events</h2>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-xs text-white/20 tabular-nums">
                  {past.length} {past.length === 1 ? 'event' : 'events'}
                </span>
              </div>
              <p className="text-sm text-white/30">
                Relive the moments — browse galleries and highlights from previous shows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ opacity: 0.7 }}>
              {past.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}