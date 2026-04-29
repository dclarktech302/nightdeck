import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { SessionContext } from '@/types'

/**
 * Returns the current user's session context — userId, orgId, and role.
 * If no session exists, redirects to /login automatically.
 *
 * Call this at the top of every authenticated Server Component:
 *
 *   const session = await requireSession()
 *   // session.orgId is now available — RLS does the rest
 */
export async function requireSession(): Promise<SessionContext> {
  const supabase = await createClient()

  // getUser() validates the JWT with Supabase Auth on every call.
  // Never use getSession() in server code — it only reads the cookie
  // and can be spoofed. getUser() makes a network request to verify.
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Get the user's org membership and role.
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    // User is authenticated but has no profile yet.
    // This happens if auth was set up before the user_profiles row was created.
    redirect('/login?message=Account setup incomplete. Contact support.')
  }

  return {
    userId: user.id,
    orgId:  profile.org_id,
    role:   profile.role,
  }
}

/**
 * Returns the session if one exists, or null if not.
 * Use this on pages that are public but show different content
 * when logged in — does not redirect.
 */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  return {
    userId: user.id,
    orgId:  profile.org_id,
    role:   profile.role,
  }
}