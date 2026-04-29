import Image from 'next/image'
import Link from 'next/link'
import type { EventWithVenue } from '@/types'

interface EventCardProps {
  event: EventWithVenue
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return {
    day:     date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    date:    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time:    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export function EventCard({ event }: EventCardProps) {
  const { day, date, time } = formatDate(event.event_date)
  const venue = event.venues

  return (
    <Link href={`/events/${event.slug ?? event.id}`} className="group block">
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Hover gold glow border */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: '0 0 20px oklch(0.78 0.15 85 / 0.2), inset 0 0 20px oklch(0.78 0.15 85 / 0.03)',
            border: '1px solid oklch(0.78 0.15 85 / 0.4)',
          }}
        />

        {/* Event flyer */}
        <div className="relative aspect-[4/3] w-full bg-[#111] overflow-hidden">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Placeholder when no flyer uploaded yet */
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }}
              />
            </div>
          )}

          {/* Featured badge */}
          {event.featured && (
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-semibold tracking-widest uppercase"
              style={{
                background: 'oklch(0.78 0.15 85 / 0.15)',
                border: '1px solid oklch(0.78 0.15 85 / 0.4)',
                color: '#c9a84c',
              }}
            >
              Featured
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">

          {/* Date row */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#c9a84c' }}>
              {day}
            </span>
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[11px] text-white/50">{date} · {time}</span>
          </div>

          {/* Event name */}
          <h3 className="text-base font-semibold text-white leading-tight group-hover:text-[#c9a84c] transition-colors duration-200">
            {event.name}
          </h3>

          {/* Venue */}
          {venue && (
            <p className="text-xs text-white/40">
              {venue.name}{venue.city ? ` · ${venue.city}` : ''}
            </p>
          )}

          {/* Footer row — RSVP count + door price */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-white/30">
              {event.rsvp_count > 0 ? `${event.rsvp_count} attending` : 'Be the first'}
            </span>
            <span className="text-xs font-medium" style={{ color: '#c9a84c' }}>
              {event.door_price ? `$${event.door_price} door` : 'Free'}
            </span>
          </div>

        </div>
      </div>
    </Link>
  )
}