'use client'

import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Video from 'yet-another-react-lightbox/plugins/video'
import Image from 'next/image'

interface MediaItem {
  id:         string
  url:        string
  media_type: string
  alt_text:   string | null
  caption:    string | null
}

interface GalleryLightboxProps {
  items: MediaItem[]
}

export function GalleryLightbox({ items }: GalleryLightboxProps) {
  const [index, setIndex] = useState(-1)

  const slides = items.map(item => {
    if (item.media_type === 'video') {
      return {
        type: 'video' as const,
        sources: [{ src: item.url, type: 'video/mp4' }],
        title:       item.caption ?? undefined,
        description: item.alt_text ?? undefined,
      }
    }
    return {
      src:         item.url,
      alt:         item.alt_text ?? item.caption ?? '',
      title:       item.caption ?? undefined,
      description: undefined,
      width:       1920,
      height:      1080,
    }
  })

  return (
    <>
      {/* Masonry grid — 2/3/4 columns */}
      <div
        className="md:columns-3 lg:columns-4"
        style={{ columns: '2', gap: '8px' }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="break-inside-avoid mb-2 rounded-xl overflow-hidden cursor-pointer group relative"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={() => setIndex(i)}
          >
            {item.media_type === 'image' ? (
              <Image
                src={item.url}
                alt={item.alt_text ?? ''}
                width={600}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                unoptimized
              />
            ) : (
              <div className="relative">
                <video
                  src={item.url}
                  className="w-full"
                  preload="metadata"
                  playsInline
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(201,168,76,0.9)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Captions, Video]}
        styles={{
          container: { backgroundColor: 'rgba(0,0,0,0.95)' },
        }}
        captions={{
          showToggle: false,
          descriptionTextAlign: 'center',
        }}
      />
    </>
  )
}