'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RSVPCounterProps {
  eventId:      string
  initialCount: number
}

export function RSVPCounter({ eventId, initialCount }: RSVPCounterProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to INSERT and UPDATE events on the rsvps table
    // filtered to this specific event_id.
    // When a new RSVP comes in, re-fetch the current rsvp_count
    // from the events table rather than trying to calculate it locally.
    const channel = supabase
      .channel(`rsvps:${eventId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',           // INSERT, UPDATE, DELETE
          schema: 'public',
          table:  'rsvps',
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          // Re-fetch the authoritative count from the events table.
          // The trigger keeps this accurate — we just read it.
          const { data } = await supabase
            .from('events')
            .select('rsvp_count')
            .eq('id', eventId)
            .single()

          if (data) setCount(data.rsvp_count)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return (
    <span className="text-sm font-semibold tabular-nums"
      style={{ color: count > 0 ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>
      {count.toLocaleString()}
    </span>
  )
}