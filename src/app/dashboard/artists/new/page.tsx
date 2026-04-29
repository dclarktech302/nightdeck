import { requireSession } from '@/lib/session'
import { createArtist } from '../actions'

export default async function NewArtistPage() {
  await requireSession()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add artist</h1>
        <p className="text-sm text-white/30 mt-1">Add a new artist to the roster.</p>
      </div>

      <form action={createArtist} className="space-y-5">

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Name *</label>
          <input name="name" type="text" required placeholder="Artist name"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Bio</label>
          <textarea name="bio" rows={3} placeholder="Short bio..."
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">
            Genre tags <span className="text-white/20">(comma separated)</span>
          </label>
          <input name="genre_tags" type="text" placeholder="hip-hop, r&b, afrobeats"
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
            <label className="text-xs font-medium text-white/60">Spotify URL</label>
            <input name="spotify_url" type="url" placeholder="https://open.spotify.com/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Media / press kit URL</label>
          <input name="media_url" type="url" placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Contact email</label>
            <input name="contact_email" type="email" placeholder="artist@email.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Contact phone</label>
            <input name="contact_phone" type="tel" placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Default rate ($)</label>
            <input name="default_rate" type="number" min="0" step="0.01" placeholder="500"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Vetted for Shore Pulse</label>
            <select name="vetted"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="false">No — roster only</option>
              <option value="true">Yes — show on Shore Pulse</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">Tech rider</label>
          <textarea name="tech_rider" rows={3} placeholder="Equipment needs, stage plot, hospitality..."
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.1)',
              border: '1px solid oklch(0.78 0.15 85 / 0.3)',
              color: '#c9a84c',
            }}>
            Add artist
          </button>
          <a href="/dashboard/artists"
            className="px-4 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Cancel
          </a>
        </div>

      </form>
    </div>
  )
}