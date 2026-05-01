'use client'

import { useState, useRef } from 'react'
import { saveMediaRecord } from '@/app/dashboard/events/actions'

interface MediaUploaderProps {
  eventId: string
  orgId: string
  context: 'promotional' | 'gallery'
  currentCount: number
  maxImages: number
  maxVideos: number
  imageCount: number
  videoCount: number
}

interface UploadFile {
  file:     File
  id:       string
  progress: number
  status:   'pending' | 'uploading' | 'done' | 'error'
  error?:   string
}

export function MediaUploader({
  eventId, orgId, context,
  maxImages, maxVideos,
  imageCount, videoCount,
}: MediaUploaderProps) {
  const [files, setFiles]     = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)

  const remainingImages = maxImages - imageCount
  const remainingVideos = maxVideos - videoCount

  function updateFile(id: string, patch: Partial<UploadFile>) {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f))
  }

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas  = document.createElement('canvas')
      const ctx     = canvas.getContext('2d')!
      const img     = new window.Image()
      const url     = URL.createObjectURL(file)

      img.onload = () => {
        // Max dimension 2400px — keeps quality high for gallery display
        const MAX = 2400
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width);  width = MAX }
          else                { width  = Math.round(width  * MAX / height); height = MAX }
        }
        canvas.width  = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.82)
      }
      img.src = url
    })
  }

  async function uploadFile(uploadFile: UploadFile) {
    const { file, id } = uploadFile
    updateFile(id, { status: 'uploading', progress: 5 })

    try {
      const isImage = file.type.startsWith('image/')

      // Compress images before upload
      const uploadBlob = isImage ? await compressImage(file) : file
      const uploadSize = uploadBlob.size

      updateFile(id, { progress: 15 })

      // Get presigned URL from our API
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: isImage ? 'image/jpeg' : file.type,
          fileSize: uploadSize,
          eventId,
          context,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to get upload URL')
      }

      const { presignedUrl, publicUrl, mediaType } = await res.json()

      updateFile(id, { progress: 30 })

      // Upload directly to S3
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: uploadBlob,
        headers: { 'Content-Type': isImage ? 'image/jpeg' : file.type },
      })

      if (!uploadRes.ok) throw new Error('S3 upload failed')

      updateFile(id, { progress: 85 })

      // Save record to database via Server Action
      const formData = new FormData()
      formData.set('event_id',   eventId)
      formData.set('url',        publicUrl)
      formData.set('media_type', mediaType)
      formData.set('context',    context)
      formData.set('size_bytes', String(uploadSize))
      // Save record and get the media ID
      const saveRes = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          url:        publicUrl,
          mediaType,
          context,
          sizeBytes:  uploadSize,
          orgId,
        }),
      })

      if (!saveRes.ok) throw new Error('Failed to save media record')
      const { id: mediaId } = await saveRes.json()

      updateFile(id, { progress: 92 })

      // Generate captions for images asynchronously
      if (isImage && mediaId) {
        fetch('/api/caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId, imageUrl: publicUrl }),
        }).catch(console.error)
      }

      updateFile(id, { status: 'done', progress: 100 })

    } catch (err: any) {
      updateFile(id, { status: 'error', error: err.message })
    }
  }

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return
    const toAdd: UploadFile[] = []

    Array.from(incoming).forEach(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type === 'video/mp4' || file.type === 'video/quicktime'

      if (!isImage && !isVideo) return
      if (isImage && imageCount + toAdd.filter(f => f.file.type.startsWith('image/')).length >= maxImages) return
      if (isVideo && videoCount + toAdd.filter(f => !f.file.type.startsWith('image/')).length >= maxVideos) return

      toAdd.push({
        file, id: `${Date.now()}-${Math.random()}`,
        progress: 0, status: 'pending',
      })
    })

    setFiles(prev => [...prev, ...toAdd])
    toAdd.forEach(f => uploadFile(f))
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error')

  return (
    <div className="space-y-3">

      {/* Drop zone */}
      <div
        className="relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer"
        style={{
          borderColor: dragging ? 'oklch(0.78 0.15 85 / 0.6)' : 'rgba(255,255,255,0.1)',
          background:  dragging ? 'oklch(0.78 0.15 85 / 0.04)' : 'rgba(255,255,255,0.02)',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      >
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-white/40">
            Drop files here or <span style={{ color: '#c9a84c' }}>browse</span>
          </p>
          <p className="text-xs text-white/20 mt-1">
            JPG · PNG · WebP · MP4 · MOV
          </p>
          <p className="text-xs text-white/20 mt-0.5">
            {remainingImages} photos · {remainingVideos} videos remaining
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 truncate">{f.file.name}</p>
                {f.status === 'uploading' && (
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${f.progress}%`, background: '#c9a84c' }}
                    />
                  </div>
                )}
                {f.status === 'error' && (
                  <p className="text-xs mt-0.5" style={{ color: '#f43f5e' }}>{f.error}</p>
                )}
              </div>
              <span className="text-xs shrink-0" style={{
                color: f.status === 'done'  ? '#22c55e' :
                       f.status === 'error' ? '#f43f5e' :
                       f.status === 'uploading' ? '#c9a84c' : 'rgba(255,255,255,0.3)'
              }}>
                {f.status === 'done'      ? '✓' :
                 f.status === 'error'     ? '✗' :
                 f.status === 'uploading' ? `${f.progress}%` : '—'}
              </span>
            </div>
          ))}

          {/* Clear completed */}
          {allDone && (
            <button
              onClick={() => { setFiles([]); window.location.reload() }}
              className="text-xs transition-colors"
              style={{ color: '#c9a84c' }}
            >
              Done — refresh to see uploads
            </button>
          )}
        </div>
      )}
    </div>
  )
}