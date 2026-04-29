import { requireSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getDashboardEvents } from '@/lib/queries/events'
import { RSVPCounter } from '@/components/dashboard/RSVPCounter'
import Link from 'next/link'

// Helper to get stats for the overview cards
async function getDashboardStats() {
  const supabase = await createClient()

  const now = new Date().toISOString()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const [upcomingRes, rsvpsRes, artistsRes, thisWeekRes] = await Promise.all([
    // Upcoming confirmed events
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('event_date', now),

    // Total RSVPs this month across all events
    supabase
      .from('rsvps')
      .select('party_size')
      .eq('status', 'confirmed')
      .gte('created_at', startOfMonth),

    // Total artists on roster
    supabase
      .from('artists')
      .select('id', { count: 'exact', head: true }),

    // Events this week
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('event_date', now)
      .lte('event_date', oneWeekFromNow),
  ])

  const rsvpTotal = rsvpsRes.data?.reduce((sum, r) => sum + (r.party_size ?? 0), 0) ?? 0

  return {
    upcomingEvents: upcomingRes.count ?? 0,
    rsvpsThisMonth: rsvpTotal,
    totalArtists:   artistsRes.count ?? 0,
    eventsThisWeek: thisWeekRes.count ?? 0,
  }
}

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

function StatCard({ label, value, sublabel }: { label: string; value: number; sublabel?: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-xs text-white/30 mb-2 tracking-wide uppercase">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value.toLocaleString()}</p>
      {sublabel && <p className="text-xs text-white/20 mt-1">{sublabel}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const [session, stats, events] = await Promise.all([
    requireSession(),
    getDashboardStats(),
    getDashboardEvents(),
  ])

  const recentEvents = events.slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-white/30 mt-1">
          Welcome back — here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Upcoming events"
          value={stats.upcomingEvents}
        />
        <StatCard
          label="RSVPs this month"
          value={stats.rsvpsThisMonth}
          sublabel="total attendees"
        />
        <StatCard
          label="Artists"
          value={stats.totalArtists}
          sublabel="on roster"
        />
        <StatCard
          label="This week"
          value={stats.eventsThisWeek}
          sublabel="confirmed shows"
        />
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3">
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
        <Link
          href="/dashboard/artists/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          + Add artist
        </Link>
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Recent events
          </h2>
          <Link
            href="/dashboard/events"
            className="text-xs transition-colors"
            style={{ color: '#c9a84c' }}
          >
            View all →
          </Link>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {recentEvents.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
                {recentEvents.map((event, i) => (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom: i < recentEvents.length - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : 'none',
                      background: 'rgba(255,255,255,0.01)',
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
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/40 hidden md:table-cell">
                      {(event as any).venues?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RSVPCounter eventId={event.id} initialCount={event.rsvp_count} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-white/20">No events yet.</p>
              <Link
                href="/dashboard/events/new"
                className="inline-block mt-3 text-sm transition-colors"
                style={{ color: '#c9a84c' }}
              >
                Create your first event →
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}