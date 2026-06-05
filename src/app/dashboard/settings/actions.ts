'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { validateString } from '@/lib/validate'

export type DisplayNameState = { ok: boolean } | null

export async function updateDisplayName(
  _prev: DisplayNameState,
  formData: FormData,
): Promise<DisplayNameState> {
  const session     = await requireSession()
  const displayName = validateString(formData.get('display_name'), 80)
  const supabase    = createServiceClient()

  await (supabase as any)
    .from('user_profiles')
    .update({ display_name: displayName ?? null })
    .eq('user_id', session.userId)

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')

  return { ok: true }
}
