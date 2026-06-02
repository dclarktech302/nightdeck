'use client'

import { useState } from 'react'

type AttendeeType    = 'attendee' | 'performer'
type ReferralSource  = 'friend' | 'performer' | 'venue' | 'social_media' | 'other'
type PrimaryReason   = 'performer' | 'venue' | 'friends' | 'supporting_local_scene' | 'looking_for_something_to_do'

interface Props {
  eventId: string
}

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-4 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        minHeight: '56px',
        background: selected ? 'oklch(0.78 0.15 85 / 0.08)' : 'rgba(255,255,255,0.04)',
        border: selected ? '1.5px solid #c9a84c' : '1px solid rgba(255,255,255,0.08)',
        color: selected ? '#c9a84c' : 'rgba(255,255,255,0.7)',
      }}
    >
      {label}
    </button>
  )
}

export function AttendForm({ eventId }: Props) {
  const [attendeeType,   setAttendeeType]   = useState<AttendeeType | null>(null)
  const [firstTime,      setFirstTime]      = useState<boolean | null>(null)
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(null)
  const [primaryReason,  setPrimaryReason]  = useState<PrimaryReason | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [done,           setDone]           = useState(false)

  const allAnswered = attendeeType !== null && firstTime !== null && referralSource !== null && primaryReason !== null

  async function handleSubmit() {
    if (!allAnswered || loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id:       eventId,
          attendee_type:  attendeeType,
          first_time:     firstTime,
          referral_source: referralSource,
          primary_reason:  primaryReason,
        }),
      })

      if (res.ok || res.status === 429) {
        setDone(true)
      }
    } catch {
      // network failure — still show thank you rather than confusing the user
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-6"
          style={{ background: 'oklch(0.78 0.15 85 / 0.1)', border: '1px solid oklch(0.78 0.15 85 / 0.3)' }}
        >
          ✓
        </div>
        <p className="text-xl font-semibold text-white mb-2">Thanks for checking in.</p>
        <p className="text-sm text-white/40">Enjoy the night.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">

      {/* Q1 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          Are you here as a...
        </p>
        <div className="space-y-2">
          <OptionCard label="Attendee"  selected={attendeeType === 'attendee'}  onClick={() => setAttendeeType('attendee')} />
          <OptionCard label="Performer" selected={attendeeType === 'performer'} onClick={() => setAttendeeType('performer')} />
        </div>
      </div>

      {/* Q2 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          Is this your first time at one of our events?
        </p>
        <div className="space-y-2">
          <OptionCard label="Yes, first time"   selected={firstTime === true}  onClick={() => setFirstTime(true)} />
          <OptionCard label="No, I've been before" selected={firstTime === false} onClick={() => setFirstTime(false)} />
        </div>
      </div>

      {/* Q3 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          How did you hear about tonight?
        </p>
        <div className="space-y-2">
          <OptionCard label="A friend told me"         selected={referralSource === 'friend'}       onClick={() => setReferralSource('friend')} />
          <OptionCard label="A performer invited me"   selected={referralSource === 'performer'}    onClick={() => setReferralSource('performer')} />
          <OptionCard label="I follow the venue"       selected={referralSource === 'venue'}        onClick={() => setReferralSource('venue')} />
          <OptionCard label="Social media"             selected={referralSource === 'social_media'} onClick={() => setReferralSource('social_media')} />
          <OptionCard label="Other"                    selected={referralSource === 'other'}        onClick={() => setReferralSource('other')} />
        </div>
      </div>

      {/* Q4 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          What brought you out tonight?
        </p>
        <div className="space-y-2">
          <OptionCard label="The performers"              selected={primaryReason === 'performer'}                  onClick={() => setPrimaryReason('performer')} />
          <OptionCard label="The venue"                   selected={primaryReason === 'venue'}                     onClick={() => setPrimaryReason('venue')} />
          <OptionCard label="My friends"                  selected={primaryReason === 'friends'}                   onClick={() => setPrimaryReason('friends')} />
          <OptionCard label="Supporting the local scene"  selected={primaryReason === 'supporting_local_scene'}    onClick={() => setPrimaryReason('supporting_local_scene')} />
          <OptionCard label="I was looking for something to do" selected={primaryReason === 'looking_for_something_to_do'} onClick={() => setPrimaryReason('looking_for_something_to_do')} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
        className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
        style={{
          background: allAnswered && !loading
            ? 'oklch(0.78 0.15 85 / 0.15)'
            : 'rgba(255,255,255,0.04)',
          border: allAnswered && !loading
            ? '1.5px solid #c9a84c'
            : '1px solid rgba(255,255,255,0.08)',
          color: allAnswered && !loading ? '#c9a84c' : 'rgba(255,255,255,0.2)',
          cursor: allAnswered && !loading ? 'pointer' : 'not-allowed',
        }}
      >
        {loading ? 'Submitting…' : 'Check in'}
      </button>

    </div>
  )
}
