'use client'

import { useActionState } from 'react'
import { updateDisplayName, type DisplayNameState } from '@/app/dashboard/settings/actions'

interface DisplayNameFormProps {
  defaultValue: string
}

export function DisplayNameForm({ defaultValue }: DisplayNameFormProps) {
  const [state, action, pending] = useActionState<DisplayNameState, FormData>(
    updateDisplayName,
    null,
  )

  return (
    <form action={action} className="space-y-2">
      <label className="text-xs font-medium text-white/60">Display name</label>
      <div className="flex gap-2">
        <input
          name="display_name"
          type="text"
          defaultValue={defaultValue}
          placeholder="e.g. Alex"
          maxLength={80}
          className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          style={{ color: '#c9a84c', border: '1px solid oklch(0.78 0.15 85 / 0.2)' }}
        >
          {pending ? 'Saving...' : 'Save'}
        </button>
      </div>
      {state?.ok && (
        <p className="text-xs" style={{ color: '#22c55e' }}>Name saved</p>
      )}
    </form>
  )
}
