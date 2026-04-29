import { requireSession } from '@/lib/session'
import { getDashboardVenues } from '@/lib/queries/venues'
import { notFound } from 'next/navigation'
import { updateVenue } from '../actions'
import Link from 'next/link'

interface VenueDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = await params
  await requireSession()

  const venues = await getDashboardVenues()
  const venue = venues.find(v => v.id === id)
  if (!venue) notFound()

  const updateVenueWithId = updateVenue.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{venue.name}</h1>
          <p className="text-sm text-white/30 mt-1">
            {venue.city}{venue.state ? `, ${venue.state}` : ''}
          </p>
        </div>
        <Link
          href="/dashboard/venues"
          className="text-xs transition-colors px-3 py-1.5 rounded-lg"
          style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          ← Back
        </Link>
      </div>

      <div
        className="rounded-xl p-5"
        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <form action={updateVenueWithId} className="space-y-4">

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Venue name *</label>
            <input name="name" type="text" required defaultValue={venue.name}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Address</label>
            <input name="address" type="text" defaultValue={venue.address ?? ''}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">City</label>
              <input name="city" type="text" defaultValue={venue.city ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">State</label>
              <input name="state" type="text" defaultValue={venue.state ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Capacity</label>
              <input name="capacity" type="number" min="1" defaultValue={venue.capacity ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">
                Vibe tags <span className="text-white/20">(comma separated)</span>
              </label>
              <input name="vibe_tags" type="text"
                defaultValue={venue.vibe_tags?.join(', ') ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Google Maps embed URL</label>
            <input name="google_maps_embed" type="url" defaultValue={venue.google_maps_embed ?? ''}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Instagram URL</label>
              <input name="instagram_url" type="url" defaultValue={venue.instagram_url ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Active</label>
              <select name="active" defaultValue={venue.active ? 'true' : 'false'}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="true">Yes — visible on Shore Pulse</option>
                <option value="false">No — hidden</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'oklch(0.78 0.15 85 / 0.1)',
                border: '1px solid oklch(0.78 0.15 85 / 0.3)',
                color: '#c9a84c',
              }}>
              Save changes
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}