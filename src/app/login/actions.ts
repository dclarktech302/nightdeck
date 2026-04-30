'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // After clicking the magic link, Supabase redirects here.
      // The callback route (Part 3) exchanges the token for a session.
      emailRedirectTo: `${process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    // In production, be vague — don't expose auth error details publicly.
    redirect('/login?message=Could not send sign-in link. Try again.')
  }

  // No error — email sent. Redirect to confirmation page.
  redirect('/login?message=Check your email for a sign-in link.')
}