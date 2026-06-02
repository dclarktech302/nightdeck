import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AttendForm } from '@/components/attend/AttendForm'

interface Props {
  params: Promise<{ event_id: string }>
}

export default async function AttendPage({ params }: Props) {
  const { event_id } = await params
  const supabase = createPublicClient()

  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', event_id)
    .single()

  if (!event) notFound()

  return (
    <div
      className="min-h-screen w-full px-5 py-10"
      style={{ background: '#000000' }}
    >
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: '#c9a84c' }}
          >
            Nightdeck
          </p>
          <h1 className="text-2xl font-bold text-white leading-tight">{event.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Quick check-in — takes 20 seconds.
          </p>
        </div>

        <AttendForm eventId={event_id} />

      </div>
    </div>
  )
}
