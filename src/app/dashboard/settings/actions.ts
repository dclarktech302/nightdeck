'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { validateString } from '@/lib/validate'

export async function updateDisplayName(formData: FormData): Promise<void> {
  const session     = await requireSession()
  const displayName = validateString(formData.get('display_name'), 80)
  const supabase    = createServiceClient()

  await (supabase as any)
    .from('user_profiles')
    .update({ display_name: displayName ?? null })
    .eq('user_id', session.userId)

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
}
