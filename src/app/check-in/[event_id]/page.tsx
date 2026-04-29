import { requireSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckInScanner } from '@/components/dashboard/CheckInScanner'

interface CheckInPageProps {
  params: Promise<{ event_id: string }>
}

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { event_id } = await params
  await requireSession()

  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, event_date, rsvp_count')
    .eq('id', event_id)
    .single()

  if (!event) notFound()

  // Count how many have checked in so far
  const { count: checkedInCount } = await supabase
    .from('rsvps')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event_id)
    .eq('checked_in', true)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#000000' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest"
            style={{ color: '#c9a84c' }}>
            Check-in
          </p>
          <h1 className="text-base font-bold text-white mt-0.5">{event.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white tabular-nums">
            {checkedInCount ?? 0}
            <span className="text-sm font-normal text-white/30">
              /{event.rsvp_count}
            </span>
          </p>
          <p className="text-xs text-white/30">checked in</p>
        </div>
      </div>

      {/* Scanner */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <CheckInScanner eventId={event_id} initialCheckedIn={checkedInCount ?? 0} totalRsvps={event.rsvp_count} />
      </div>

      {/* Back link */}
      <div className="px-6 py-4 text-center">
        <a
          href={`/dashboard/events/${event_id}`}
          className="text-xs text-white/20 hover:text-white/40 transition-colors"
        >
          ← Back to event
        </a>
      </div>
    </div>
  )
}