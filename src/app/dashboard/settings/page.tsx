import { PINSetup } from '@/components/dashboard/PINSetup'
import { requireSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { updateDisplayName } from './actions'

export default async function SettingsPage() {
  const session  = await requireSession()
  const supabase = await createClient()

  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    (supabase as any)
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', session.userId)
      .single(),
  ])

  const displayName: string | null = profile?.display_name ?? null

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/30 mt-1">Manage your account preferences.</p>
      </div>

      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Account email */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: '#c9a84c' }}>Account</p>
          <p className="text-sm text-white/40">{user?.email}</p>
        </div>

        {/* Display name */}
        <form action={updateDisplayName} className="space-y-2">
          <label className="text-xs font-medium text-white/60">Display name</label>
          <div className="flex gap-2">
            <input
              name="display_name"
              type="text"
              defaultValue={displayName ?? ''}
              placeholder="e.g. Alex"
              maxLength={80}
              className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ color: '#c9a84c', border: '1px solid oklch(0.78 0.15 85 / 0.2)' }}
            >
              Save
            </button>
          </div>
        </form>

        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <PINSetup />
      </div>
    </div>
  )
}
