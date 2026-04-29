import { requireSession } from '@/lib/session'
import { createVenue } from '../actions'

export default async function NewVenuePage() {
  await requireSession()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add venue</h1>
        <p className="text-sm text-white/30 mt-1">Add a new venue to the directory.</p>
      </div>

      <form action={createVenue} className="space-y-5">

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Venue name *</label>
          <input name="name" type="text" required placeholder="e.g. The Bottle & Cork"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Address</label>
          <input name="address" type="text" placeholder="123 Rehoboth Ave"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">City</label>
            <input name="city" type="text" placeholder="Rehoboth Beach"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">State</label>
            <input name="state" type="text" placeholder="DE"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Capacity</label>
            <input name="capacity" type="number" min="1" placeholder="500"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">
              Vibe tags <span className="text-white/20">(comma separated)</span>
            </label>
            <input name="vibe_tags" type="text" placeholder="bar, outdoor, intimate"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Google Maps embed URL</label>
          <input name="google_maps_embed" type="url" placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Instagram URL</label>
            <input name="instagram_url" type="url" placeholder="https://instagram.com/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Active</label>
            <select name="active"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="true">Yes — visible on Shore Pulse</option>
              <option value="false">No — hidden</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.1)',
              border: '1px solid oklch(0.78 0.15 85 / 0.3)',
              color: '#c9a84c',
            }}>
            Add venue
          </button>
          <a href="/dashboard/venues"
            className="px-4 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Cancel
          </a>
        </div>

      </form>
    </div>
  )
}