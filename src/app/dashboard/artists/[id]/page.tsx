import { requireSession } from '@/lib/session'
import { getDashboardArtistById } from '@/lib/queries/artists'
import { notFound } from 'next/navigation'
import { updateArtist } from '../actions'
import Link from 'next/link'

interface ArtistDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  const { id } = await params
  await requireSession()

  const artist = await getDashboardArtistById(id)
  if (!artist) notFound()

  const updateArtistWithId = updateArtist.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{artist.name}</h1>
          <p className="text-sm text-white/30 mt-1">
            {artist.vetted ? 'Visible on Shore Pulse' : 'Roster only — not public'}
          </p>
        </div>
        <Link
          href="/dashboard/artists"
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
        <form action={updateArtistWithId} className="space-y-4">

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Name *</label>
            <input name="name" type="text" required defaultValue={artist.name}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Bio</label>
            <textarea name="bio" rows={3} defaultValue={artist.bio ?? ''}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">
              Genre tags <span className="text-white/20">(comma separated)</span>
            </label>
            <input name="genre_tags" type="text"
              defaultValue={artist.genre_tags?.join(', ') ?? ''}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Instagram URL</label>
              <input name="instagram_url" type="url" defaultValue={artist.instagram_url ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Spotify URL</label>
              <input name="spotify_url" type="url" defaultValue={artist.spotify_url ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Media / press kit URL</label>
            <input name="media_url" type="url" defaultValue={artist.media_url ?? ''}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Contact email</label>
              <input name="contact_email" type="email" defaultValue={artist.contact_email ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Contact phone</label>
              <input name="contact_phone" type="tel" defaultValue={artist.contact_phone ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Default rate ($)</label>
              <input name="default_rate" type="number" min="0" step="0.01"
                defaultValue={artist.default_rate ?? ''}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Vetted for Shore Pulse</label>
              <select name="vetted" defaultValue={artist.vetted ? 'true' : 'false'}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="false">No — roster only</option>
                <option value="true">Yes — show on Shore Pulse</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Tech rider</label>
            <textarea name="tech_rider" rows={3} defaultValue={artist.tech_rider ?? ''}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
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