import { getDashboardEvents } from '@/lib/queries/events'
import { requireSession } from '@/lib/session'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft:     { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
    pending:   { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b' },
    confirmed: { bg: 'rgba(34,197,94,0.1)',    color: '#22c55e' },
    completed: { bg: 'rgba(59,130,246,0.1)',   color: '#3b82f6' },
    cancelled: { bg: 'rgba(244,63,94,0.1)',    color: '#f43f5e' },
  }
  const c = colors[status] ?? colors.draft
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
      style={{ background: c.bg, color: c.color }}
    >
      {status}
    </span>
  )
}

function EventsTable({ events }: { events: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a' }}>
          <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            Event
          </th>
          <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">
            Date
          </th>
          <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">
            Venue
          </th>
          <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            Status
          </th>
          <th className="text-right px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            RSVPs
          </th>
        </tr>
      </thead>
      <tbody>
        {events.map((event, i) => (
          <tr
            key={event.id}
            style={{
              borderBottom: i < events.length - 1
                ? '1px solid rgba(255,255,255,0.04)'
                : 'none',
            }}
          >
            <td className="px-4 py-3">
              <Link
                href={`/dashboard/events/${event.id}`}
                className="text-sm font-medium text-white hover:text-[#c9a84c] transition-colors"
              >
                {event.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-sm text-white/40 hidden md:table-cell">
              {new Date(event.event_date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </td>
            <td className="px-4 py-3 text-sm text-white/40 hidden md:table-cell">
              {(event as any).venues?.name ?? '—'}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={event.status} />
            </td>
            <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums"
              style={{ color: event.rsvp_count > 0 ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>
              {event.rsvp_count}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default async function EventsListPage() {
  await requireSession()
  const allEvents = await getDashboardEvents()

  // Separate active and completed events
  const activeEvents = allEvents.filter(e => e.status !== 'completed' && e.status !== 'cancelled')
  const pastEvents = allEvents.filter(e => e.status === 'completed' || e.status === 'cancelled')

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Events</h1>
          <p className="text-sm text-white/30 mt-1">
            {activeEvents.length} active · {pastEvents.length} past
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'oklch(0.78 0.15 85 / 0.1)',
            border: '1px solid oklch(0.78 0.15 85 / 0.3)',
            color: '#c9a84c',
          }}
        >
          + New event
        </Link>
      </div>

      {/* Active Events Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Active Events
          </h2>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {activeEvents.length > 0 ? (
            <EventsTable events={activeEvents} />
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-white/20 mb-3">No active events.</p>
              <Link
                href="/dashboard/events/new"
                className="text-sm transition-colors"
                style={{ color: '#c9a84c' }}
              >
                Create your first event →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Past Events
            </h2>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-white/20 tabular-nums">
              {pastEvents.length} {pastEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ 
              border: '1px solid rgba(255,255,255,0.06)',
              opacity: 0.6
            }}
          >
            <EventsTable events={pastEvents} />
          </div>
        </div>
      )}

    </div>
  )
}