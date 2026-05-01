import Image from 'next/image'
import { toggleMediaVisibility, deleteMedia } from '@/app/dashboard/events/actions'

interface MediaItem {
  id:         string
  url:        string
  media_type: string
  context:    string
  is_public:  boolean
  size_bytes: number | null
}

interface MediaGridProps {
  items:   MediaItem[]
  eventId: string
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function MediaGrid({ items, eventId }: MediaGridProps) {
  if (items.length === 0) {
    return <p className="text-sm text-white/20 text-center py-6">No media uploaded yet.</p>
  }

  return (
    <div style={{ columns: '2', gap: '8px' }}>
      {items.map(item => (
        <div
          key={item.id}
          className="break-inside-avoid mb-2 rounded-lg overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Media preview */}
          {item.media_type === 'image' ? (
            <div className="relative">
              <Image
                src={item.url}
                alt=""
                width={400}
                height={300}
                className="w-full h-auto object-cover"
                unoptimized
              />
            </div>
          ) : (
            <video
              src={item.url}
              className="w-full"
              controls
              preload="metadata"
            />
          )}

          {/* Always-visible controls bar */}
          <div className="p-2 space-y-2">
            {/* Status badge + metadata */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30">
                {item.media_type} · {formatBytes(item.size_bytes)}
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
                style={{
                  background: item.is_public ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                  color: item.is_public ? '#22c55e' : 'rgba(255,255,255,0.3)',
                }}
              >
                {item.is_public ? 'Public' : 'Private'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <form action={toggleMediaVisibility.bind(null, item.id, eventId, !item.is_public)} className="flex-1">
                <button
                  type="submit"
                  className="w-full text-xs px-2 py-1.5 rounded transition-colors font-medium"
                  style={{
                    background: item.is_public ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                    color: item.is_public ? '#f59e0b' : '#22c55e',
                    border: `1px solid ${item.is_public ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                  }}
                >
                  {item.is_public ? ' Private' : ' Public'}
                </button>
              </form>
              <form action={deleteMedia.bind(null, item.id, eventId)}>
                <button
                  type="submit"
                  className="text-xs px-2 py-1.5 rounded transition-colors text-white/30 hover:text-red-400 hover:bg-red-400/10"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  🗑️
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}