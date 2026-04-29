import { requireSession } from '@/lib/session'
import { getDashboardVenues } from '@/lib/queries/venues'
import { createEvent } from '../actions'

export default async function NewEventPage() {
  await requireSession()
  const venues = await getDashboardVenues()

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">New event</h1>
        <p className="text-sm text-white/30 mt-1">Fill in the details to create a new event.</p>
      </div>

      <form action={createEvent} className="space-y-5">

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Event name *</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Late Night Sessions Vol. 3"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="What's this event about?"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Date + Doors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Event date & time *</label>
            <input
              name="event_date"
              type="datetime-local"
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Doors open</label>
            <input
              name="doors_open"
              type="datetime-local"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Venue</label>
          <select
            name="venue_id"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="">Select a venue</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
        </div>

        {/* Door price + RSVP limit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Door price ($)</label>
            <input
              name="door_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0 for free"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">RSVP limit</label>
            <input
              name="rsvp_limit"
              type="number"
              min="1"
              placeholder="No limit"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        {/* Status + Featured */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Status</label>
            <select
              name="status"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Featured on homepage</label>
            <select
              name="featured"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.1)',
              border: '1px solid oklch(0.78 0.15 85 / 0.3)',
              color: '#c9a84c',
            }}
          >
            Create event
          </button>
          <a
            href="/dashboard/events"
            className="px-4 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Cancel
          </a>
        </div>

      </form>
    </div>
  )
}