'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { validateEmail, validateString } from '@/lib/validate'

export async function loginWithPassword(formData: FormData): Promise<void> {
  const email    = validateEmail(formData.get('email'))
  const password = validateString(formData.get('password'), 100)

  if (!email || !password) {
    redirect('/login?error=1&message=Email and password are required.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=1&message=Invalid email or password.')
  }

  redirect('/dashboard')
}
