import { requireSession } from '@/lib/session'
import { getDashboardEventById } from '@/lib/queries/events'
import { getDashboardArtists } from '@/lib/queries/artists'
import { getDashboardVenues } from '@/lib/queries/venues'
import { getRSVPsByEvent } from '@/lib/queries/rsvps'
import { getEventPnL, getExpensesByEvent, getRevenueByEvent } from '@/lib/queries/financials'
import { notFound } from 'next/navigation'
import {
  updateEvent,
  addArtistToLineup,
  removeArtistFromLineup,
  markArtistPaid,
  addExpense,
  addRevenue,
} from '../actions'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider mb-4"
      style={{ color: '#c9a84c' }}>
      {children}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 space-y-4"
      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </div>
  )
}

function InputField({ label, name, type = 'text', defaultValue, placeholder, required }: {
  label: string
  name: string
  type?: string
  defaultValue?: string | number | null
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/60">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          colorScheme: type === 'datetime-local' ? 'dark' : undefined,
        }}
      />
    </div>
  )
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  await requireSession()

  const [event, artists, venues, rsvps, pnl, expenses, revenue] = await Promise.all([
    getDashboardEventById(id),
    getDashboardArtists(),
    getDashboardVenues(),
    getRSVPsByEvent(id),
    getEventPnL(id),
    getExpensesByEvent(id),
    getRevenueByEvent(id),
  ])

  if (!event) notFound()

  const lineup = (event as any).event_artists ?? []
  const lineupArtistIds = lineup.map((ea: any) => ea.artist_id)
  const availableArtists = artists.filter(a => !lineupArtistIds.includes(a.id))

  // Format datetime-local value from ISO string
  function toDatetimeLocal(iso: string | null) {
    if (!iso) return ''
    return new Date(iso).toISOString().slice(0, 16)
  }

  const updateEventWithId = updateEvent.bind(null, id)

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{event.name}</h1>
          <p className="text-sm text-white/30 mt-1">
            {new Date(event.event_date).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
        <a
          href={event.slug ? `/events/${event.slug}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors px-3 py-1.5 rounded-lg"
          style={{
            color: event.status === 'confirmed' ? '#c9a84c' : 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          View public page ↗
        </a>
      </div>

      {/* -- EVENT INFO -- */}
      <div>
        <SectionTitle>Event details</SectionTitle>
        <Card>
          <form action={updateEventWithId} className="space-y-4">

            <InputField label="Event name *" name="name" defaultValue={event.name} required />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={event.description ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Event date & time *"
                name="event_date"
                type="datetime-local"
                defaultValue={toDatetimeLocal(event.event_date)}
                required
              />
              <InputField
                label="Doors open"
                name="doors_open"
                type="datetime-local"
                defaultValue={toDatetimeLocal(event.doors_open)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Venue</label>
              <select
                name="venue_id"
                defaultValue={event.venue_id ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="">No venue</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputField
                label="Door price ($)"
                name="door_price"
                type="number"
                defaultValue={event.door_price ?? ''}
                placeholder="0 for free"
              />
              <InputField
                label="RSVP limit"
                name="rsvp_limit"
                type="number"
                defaultValue={event.rsvp_limit ?? ''}
                placeholder="No limit"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Status</label>
                <select
                  name="status"
                  defaultValue={event.status}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Featured on homepage</label>
              <select
                name="featured"
                defaultValue={event.featured ? 'true' : 'false'}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="false">No</option>
                <option value="true">Yes — show on homepage</option>
              </select>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'oklch(0.78 0.15 85 / 0.1)',
                  border: '1px solid oklch(0.78 0.15 85 / 0.3)',
                  color: '#c9a84c',
                }}
              >
                Save changes
              </button>
            </div>

          </form>
        </Card>
      </div>

      {/* -- LINEUP -- */}
      <div>
        <SectionTitle>Lineup ({lineup.length})</SectionTitle>
        <Card>

          {/* Current lineup */}
          {lineup.length > 0 && (
            <div className="space-y-2 mb-4">
              {lineup
                .sort((a: any, b: any) => (b.set_order ?? 0) - (a.set_order ?? 0))
                .map((slot: any) => (
                  <div key={slot.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{slot.artists?.name}</p>
                      <p className="text-xs text-white/30">
                        {slot.set_order != null ? `Set ${slot.set_order}` : 'Order TBD'}
                        {slot.agreed_pay != null ? ` · $${slot.agreed_pay}` : ''}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide"
                      style={{
                        background: slot.pay_status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                        color: slot.pay_status === 'paid' ? '#22c55e' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {slot.pay_status}
                    </span>
                    {slot.pay_status === 'pending' && slot.agreed_pay && (
                      <form action={markArtistPaid.bind(null, slot.id, id)}>
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 rounded transition-colors"
                          style={{ color: '#c9a84c', border: '1px solid oklch(0.78 0.15 85 / 0.2)' }}
                        >
                          Mark paid
                        </button>
                      </form>
                    )}
                    <form action={removeArtistFromLineup.bind(null, slot.id, id)}>
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 rounded transition-colors text-white/20 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
            </div>
          )}

          {/* Add artist to lineup */}
          {availableArtists.length > 0 && (
            <form action={addArtistToLineup} className="space-y-3">
              <input type="hidden" name="event_id" value={id} />
              <p className="text-xs text-white/30">Add artist to lineup</p>
              <div className="grid grid-cols-3 gap-3">
                <select
                  name="artist_id"
                  required
                  className="col-span-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <option value="">Select artist</option>
                  {availableArtists.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <input
                  name="agreed_pay"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Pay ($)"
                  className="px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <input
                  name="set_order"
                  type="number"
                  min="1"
                  placeholder="Set order"
                  className="px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              <button
                type="submit"
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: '#c9a84c', border: '1px solid oklch(0.78 0.15 85 / 0.2)' }}
              >
                + Add to lineup
              </button>
            </form>
          )}

        </Card>
      </div>

      {/* -- FINANCIALS -- */}
      <div>
        <SectionTitle>Financials</SectionTitle>

        {/* P&L summary */}
        {pnl && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Revenue',   value: pnl.total_revenue,  color: '#22c55e' },
              { label: 'Expenses',  value: pnl.total_expenses, color: '#f43f5e' },
              { label: 'Artist pay', value: pnl.artist_costs,  color: '#f59e0b' },
              { label: 'Net',        value: pnl.net,           color: pnl.net >= 0 ? '#22c55e' : '#f43f5e' },
            ].map(item => (
              <div key={item.label}
                className="rounded-lg p-3 text-center"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: item.color }}>
                  ${item.value.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Revenue */}
          <Card>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Revenue</p>
            {revenue.length > 0 && (
              <div className="space-y-2">
                {revenue.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/60 capitalize">{r.source.replace('_', ' ')}</span>
                    <span className="text-white font-medium tabular-nums">${r.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <form action={addRevenue} className="space-y-2 pt-2">
              <input type="hidden" name="event_id" value={id} />
              <select
                name="source"
                required
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="">Source</option>
                <option value="door">Door</option>
                <option value="bar_split">Bar split</option>
                <option value="sponsorship">Sponsorship</option>
                <option value="merch">Merch</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2">
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  + Add
                </button>
              </div>
            </form>
          </Card>

          {/* Expenses */}
          <Card>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Expenses</p>
            {expenses.length > 0 && (
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/60 capitalize">{e.description || e.category}</span>
                    <span className="text-white font-medium tabular-nums">${e.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <form action={addExpense} className="space-y-2 pt-2">
              <input type="hidden" name="event_id" value={id} />
              <select
                name="category"
                required
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="">Category</option>
                <option value="venue">Venue</option>
                <option value="artist">Artist</option>
                <option value="promo">Promo</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
              <input
                name="description"
                type="text"
                placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <div className="flex gap-2">
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}
                >
                  + Add
                </button>
              </div>
            </form>
          </Card>

        </div>
      </div>

      {/* -- RSVP LIST -- */}
      <div>
        <SectionTitle>RSVPs ({rsvps.length} confirmed · {event.rsvp_count} attendees)</SectionTitle>
        <Card>
          {rsvps.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left py-2 text-[11px] font-medium text-white/30 uppercase tracking-wider">Name</th>
                  <th className="text-left py-2 text-[11px] font-medium text-white/30 uppercase tracking-wider">Email</th>
                  <th className="text-center py-2 text-[11px] font-medium text-white/30 uppercase tracking-wider">Party</th>
                  <th className="text-center py-2 text-[11px] font-medium text-white/30 uppercase tracking-wider">Checked in</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp, i) => (
                  <tr
                    key={rsvp.id}
                    style={{ borderBottom: i < rsvps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <td className="py-2.5 text-sm text-white">{rsvp.attendees?.first_name}</td>
                    <td className="py-2.5 text-sm text-white/40">{rsvp.attendees?.email}</td>
                    <td className="py-2.5 text-sm text-white/60 text-center">{rsvp.party_size}</td>
                    <td className="py-2.5 text-center">
                      <span className="text-xs"
                        style={{ color: rsvp.checked_in ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>
                        {rsvp.checked_in ? '✓' : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-white/20 text-center py-4">No RSVPs yet.</p>
          )}
        </Card>
      </div>

    </div>
  )
}