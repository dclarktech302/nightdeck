import { PINSetup } from '@/components/dashboard/PINSetup'
import { requireSession } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  await requireSession()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: '#c9a84c' }}>Account</p>
          <p className="text-sm text-white/40">{user?.email}</p>
        </div>

        <div
          className="h-px"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />

        <PINSetup />
      </div>
    </div>
  )
}