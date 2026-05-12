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
      // Session established — send them to the dashboard.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login.
  return NextResponse.redirect(`${origin}/login?message=Sign-in link expired. Try again.`)
}