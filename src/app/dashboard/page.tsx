import { requireSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getDashboardEvents } from '@/lib/queries/events'
import { RSVPCounter } from '@/components/dashboard/RSVPCounter'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = await createClient()

  const now            = new Date().toISOString()
  const startOfMonth   = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    upcomingRes,
    rsvpsRes,
    artistsRes,
    thisWeekRes,
    revenueRes,
    checkInRes,
  ] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('event_date', now),

    supabase
      .from('rsvps')
      .select('party_size')
      .eq('status', 'confirmed')
      .gte('created_at', startOfMonth),

    supabase
      .from('artists')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('event_date', now)
      .lte('event_date', oneWeekFromNow),

    // Revenue logged this month
    supabase
      .from('revenue')
      .select('amount')
      .gte('created_at', startOfMonth),

    // Check-in progress across all confirmed RSVPs
    supabase
      .from('rsvps')
      .select('checked_in, party_size')
      .eq('status', 'confirmed'),
  ])

  const rsvpTotal    = rsvpsRes.data?.reduce((s, r) => s + (r.party_size ?? 0), 0) ?? 0
  const revenueTotal = revenueRes.data?.reduce((s, r) => s + (r.amount ?? 0), 0) ?? 0

  const allRsvps        = checkInRes.data ?? []
  const totalAttendees  = allRsvps.reduce((s, r) => s + (r.party_size ?? 0), 0)
  const checkedInCount  = allRsvps
    .filter(r => r.checked_in)
    .reduce((s, r) => s + (r.party_size ?? 0), 0)
  const checkInRate = totalAttendees > 0
    ? Math.round((checkedInCount / totalAttendees) * 100)
    : 0

  return {
    upcomingEvents:   upcomingRes.count ?? 0,
    rsvpsThisMonth:   rsvpTotal,
    totalArtists:     artistsRes.count  ?? 0,
    eventsThisWeek:   thisWeekRes.count ?? 0,
    revenueThisMonth: revenueTotal,
    checkInRate,
    checkedInCount,
    totalAttendees,
  }
}

async function getRecentActivity() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('rsvps')
    .select(`
      id,
      created_at,
      party_size,
      checked_in,
      attendees ( first_name ),
      events ( id, name )
    `)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(8)

  return data ?? []
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

function StatCard({
  label,
  value,
  sublabel,
  prefix = '',
  suffix = '',
  accent,
}: {
  label: string
  value: number
  sublabel?: string
  prefix?: string
  suffix?: string
  accent?: string
}) {
  const display = prefix === '$'
    ? value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : value.toLocaleString()

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs text-white/30 mb-2 tracking-wide uppercase">{label}</p>
      <p
        className="text-3xl font-bold tracking-tight"
        style={{ color: accent ?? 'white' }}
      >
        {prefix}{display}{suffix}
      </p>
      {sublabel && <p className="text-xs text-white/20 mt-1">{sublabel}</p>}
    </div>
  )
}

function CheckInGauge({
  rate,
  checked,
  total,
}: {
  rate: number
  checked: number
  total: number
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs text-white/30 mb-2 tracking-wide uppercase">Check-in rate</p>
      <p className="text-3xl font-bold tracking-tight text-white">{rate}%</p>
      <div
        className="mt-3 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${rate}%`,
            background: rate > 0 ? '#22c55e' : 'transparent',
          }}
        />
      </div>
      <p className="text-xs text-white/20 mt-1.5">
        {checked.toLocaleString()} of {total.toLocaleString()} attendees
      </p>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default async function DashboardPage() {
  const [, stats, events, activity] = await Promise.all([
    requireSession(),
    getDashboardStats(),
    getDashboardEvents(),
    getRecentActivity(),
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

      {/* Stat cards — row 1: operational */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Upcoming events"   value={stats.upcomingEvents} />
        <StatCard label="RSVPs this month"  value={stats.rsvpsThisMonth} sublabel="total attendees" />
        <StatCard label="Artists on roster" value={stats.totalArtists} />
        <StatCard label="Shows this week"   value={stats.eventsThisWeek} sublabel="confirmed" />
      </div>

      {/* Stat cards — row 2: financial + check-in + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <StatCard
          label="Revenue this month"
          value={stats.revenueThisMonth}
          prefix="$"
          sublabel="from logged revenue entries"
          accent="#22c55e"
        />
        <CheckInGauge
          rate={stats.checkInRate}
          checked={stats.checkedInCount}
          total={stats.totalAttendees}
        />
        <div
          className="rounded-xl p-5 flex flex-col gap-2"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-white/30 mb-1 tracking-wide uppercase">Quick actions</p>
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.01]"
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            + Add artist
          </Link>
          <Link
            href="/dashboard/venues/new"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            + Add venue
          </Link>
        </div>
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
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">Venue</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">RSVPs</th>
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

      {/* Recent RSVP activity feed */}
      {activity.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Recent RSVPs
            </h2>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(activity as any[]).map((rsvp, i) => (
              <div
                key={rsvp.id}
                className="flex items-center gap-4 px-4 py-3"
                style={{
                  borderBottom: i < activity.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                {/* Avatar initial */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: 'oklch(0.78 0.15 85 / 0.12)', color: '#c9a84c' }}
                >
                  {(rsvp.attendees?.first_name?.[0] ?? '?').toUpperCase()}
                </div>

                {/* Name + event */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {rsvp.attendees?.first_name ?? 'Unknown'}
                    {rsvp.party_size > 1 && (
                      <span className="text-white/30 font-normal"> +{rsvp.party_size - 1}</span>
                    )}
                  </p>
                  {rsvp.events && (
                    <Link
                      href={`/dashboard/events/${rsvp.events.id}`}
                      className="text-xs text-white/30 hover:text-white/50 transition-colors truncate block"
                    >
                      {rsvp.events.name}
                    </Link>
                  )}
                </div>

                {/* Checked-in badge */}
                {rsvp.checked_in && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 hidden sm:inline-flex"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
                  >
                    Checked in
                  </span>
                )}

                {/* Timestamp */}
                <span className="text-xs text-white/20 shrink-0 tabular-nums">
                  {timeAgo(rsvp.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
