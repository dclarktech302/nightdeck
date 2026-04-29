import { getUpcomingEvents } from '@/lib/queries/events'
import { SiteNav } from '@/components/ui/SiteNav'
import { EventCard } from '@/components/ui/EventCard'
import { ParticleField } from '@/components/canvas/ParticleField'

export default async function EventsPage() {
  const events = await getUpcomingEvents()

  return (
    <>
      <ParticleField density={40} />
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-32">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.4em] uppercase font-medium mb-3" style={{ color: '#c9a84c' }}>
            Shore Pulse
          </p>
          <h1 className="text-4xl font-bold text-white">Upcoming events</h1>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-white/20 text-sm">No upcoming events. Check back soon.</p>
          </div>
        )}

      </div>
    </>
  )
}