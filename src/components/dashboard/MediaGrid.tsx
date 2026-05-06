'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toggleMediaVisibility, deleteMedia, updateMediaCaptions } from '@/app/dashboard/events/actions'

interface MediaItem {
  id:         string
  url:        string
  media_type: string
  context:    string
  is_public:  boolean
  size_bytes: number | null
  alt_text:   string | null
  caption:    string | null
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

function MediaCard({ item, eventId }: { item: MediaItem; eventId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [altText, setAltText] = useState(item.alt_text ?? '')
  const [caption, setCaption] = useState(item.caption ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    const formData = new FormData()
    formData.set('mediaId', item.id)
    formData.set('altText', altText)
    formData.set('caption', caption)
    
    await updateMediaCaptions(formData, eventId)
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div
      className="break-inside-avoid mb-2 rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Media preview */}
      {item.media_type === 'image' ? (
        <div className="relative">
          <Image
            src={item.url}
            alt={item.alt_text ?? ''}
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

        {/* Caption editing section */}
        {isEditing ? (
          <div className="space-y-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Alt Text Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  Alt Text
                </label>
                <span className="text-[9px] text-white/20">
                  {altText.length}/120
                </span>
              </div>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe what's visible (for screen readers)"
                maxLength={120}
                className="w-full px-3 py-2 text-xs rounded outline-none transition-colors focus:border-white/20"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
            </div>

            {/* Caption Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  Caption
                </label>
                <span className="text-[9px] text-white/20">
                  {caption.length}/200
                </span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Engaging caption for the gallery"
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded outline-none resize-none transition-colors focus:border-white/20"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 text-xs py-2 rounded font-medium transition-all disabled:opacity-50"
                style={{
                  background: isSaving ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                {isSaving ? '💾 Saving...' : '✓ Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setAltText(item.alt_text ?? '')
                  setCaption(item.caption ?? '')
                }}
                disabled={isSaving}
                className="flex-1 text-xs py-2 rounded font-medium transition-colors text-white/40 hover:text-white/60 hover:bg-white/5 disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Display captions if they exist */}
            {(item.alt_text || item.caption) && (
              <div className="space-y-1.5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {item.alt_text && (
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-white/20 uppercase tracking-wider font-medium">Alt Text</p>
                    <p className="text-[10px] text-white/50 leading-relaxed">{item.alt_text}</p>
                  </div>
                )}
                {item.caption && (
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-white/20 uppercase tracking-wider font-medium">Caption</p>
                    <p className="text-[10px] text-white/60 leading-relaxed">{item.caption}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Action buttons - stack on very small screens */}
        <div className="flex flex-wrap items-center gap-2">
          <form action={toggleMediaVisibility.bind(null, item.id, eventId, !item.is_public)} className="flex-1 min-w-[120px]">
            <button className="w-full flex items-center justify-center gap-2 py-1.5">
              <div className="relative w-9 h-5 rounded-full transition-colors"
                style={{ background: item.is_public ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>
                <div className="absolute top-0.5 transition-transform duration-200"
                  style={{ 
                    left: item.is_public ? '18px' : '2px',
                    width: '16px', height: '16px',
                    background: 'white', borderRadius: '50%'
                  }} />
              </div>
              <span className="text-xs text-white/60">
                {item.is_public ? 'Visible' : 'Hidden'}
              </span>
            </button>
          </form>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs px-3 py-1.5 rounded transition-colors text-white/40 hover:text-white/60"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            ✏️ Edit
          </button>

          <form action={deleteMedia.bind(null, item.id, eventId)}>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded transition-colors text-white/30 hover:text-red-400 hover:bg-red-400/10"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              🗑️
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function MediaGrid({ items, eventId }: MediaGridProps) {
  if (items.length === 0) {
    return <p className="text-sm text-white/20 text-center py-6">No media uploaded yet.</p>
  }

  return (
    // Single column on mobile, 2 columns on larger screens
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map(item => (
        <MediaCard key={item.id} item={item} eventId={eventId} />
      ))}
    </div>
  )
}