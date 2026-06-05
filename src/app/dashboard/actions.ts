'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'

export async function markPinSetupSeen(): Promise<void> {
  const session = await requireSession()
  const supabase = createServiceClient()

  await (supabase as any)
    .from('user_profiles')
    .update({ has_set_pin: true })
    .eq('user_id', session.userId)
}
