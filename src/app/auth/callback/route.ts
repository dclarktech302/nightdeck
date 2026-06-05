import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // Supabase appends these to the redirect URL automatically.
  const code   = searchParams.get('code')
  // Guard against open-redirect: only allow relative paths.
  const rawNext = searchParams.get('next') ?? ''
  const next    = rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/dashboard'

  if (code) {
    const supabase = await createClient()

    // Exchange the one-time code for a session.
    // This sets the session cookie so the user is now authenticated.
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check AMR to detect password-recovery flows.
      // If the user clicked a "reset password" link, amr contains 'recovery'
      // and we send them to the PIN reset page instead of the dashboard.
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user as any
      const isRecovery = user?.amr?.some(
        (entry: { method: string }) => entry.method === 'recovery'
      )

      if (isRecovery) {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // token_hash flow — used by invite links, magic links, and email confirmation.
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login.
  return NextResponse.redirect(`${origin}/login?message=Sign-in link expired. Try again.`)
}