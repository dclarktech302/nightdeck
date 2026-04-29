import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Always runs as anon — no session cookie, no authenticated context.
// Use for all public Shore Pulse queries: events, artists, venues.
// Guarantees consistent RLS behavior regardless of visitor auth state.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

// Bypasses RLS entirely — for trusted server-side write operations only.
// Use in Route Handlers and Server Actions that need to write data
// on behalf of unauthenticated users (RSVP submissions, etc.).
// NEVER import this in Client Components or expose to the browser.
// Evidence: https://supabase.com/docs/guides/api/api-keys
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession:     false, // server-only client — no session storage
        autoRefreshToken:   false, // no refresh needed server-side
        detectSessionInUrl: false, // not a browser context
      },
    }
  )
}