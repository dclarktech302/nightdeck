import { PINLogin } from '@/components/auth/PINLogin'
import { PasswordLogin } from '@/components/auth/PasswordLogin'

interface LoginPageProps {
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message, error } = await searchParams
  // Re-open the password form automatically when an error is present
  // (e.g. after a failed password attempt redirects back here)
  const hasError = Boolean(error)

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#000000' }}
    >
      <div className="w-full max-w-sm space-y-6 p-8">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ongho <span style={{ color: '#c9a84c' }}>Ops</span>
          </h1>
          <p className="text-sm text-white/30">Sign in to continue</p>
        </div>

        {/* Default: PIN login for returning users */}
        <PINLogin />

        {/* Fallback: password login for first login or forgot PIN */}
        <PasswordLogin defaultOpen={hasError} />

        {message && (
          <p
            className="text-xs text-center text-white/30 border rounded-lg p-3"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {message}
          </p>
        )}

      </div>
    </div>
  )
}
