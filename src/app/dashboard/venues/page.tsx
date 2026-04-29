import { requireSession } from '@/lib/session'
import { getDashboardVenues } from '@/lib/queries/venues'
import Link from 'next/link'

export default async function VenuesListPage() {
  await requireSession()
  const venues = await getDashboardVenues()

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Venues</h1>
          <p className="text-sm text-white/30 mt-1">{venues.length} in directory</p>
        </div>
        <Link
          href="/dashboard/venues/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'oklch(0.78 0.15 85 / 0.1)',
            border: '1px solid oklch(0.78 0.15 85 / 0.3)',
            color: '#c9a84c',
          }}
        >
          + Add venue
        </Link>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {venues.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a' }}>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider hidden md:table-cell">Capacity</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue, i) => (
                <tr
                  key={venue.id}
                  style={{
                    borderBottom: i < venues.length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : 'none',
                  }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/venues/${venue.id}`}
                      className="text-sm font-medium text-white hover:text-[#c9a84c] transition-colors"
                    >
                      {venue.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/40 hidden md:table-cell">
                    {venue.city ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/40 hidden md:table-cell">
                    {venue.capacity?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
                      style={{
                        background: venue.active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                        color: venue.active ? '#22c55e' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {venue.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-white/20 mb-3">No venues yet.</p>
            <Link
              href="/dashboard/venues/new"
              className="text-sm transition-colors"
              style={{ color: '#c9a84c' }}
            >
              Add your first venue →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}