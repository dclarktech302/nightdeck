import { login } from './actions'
import { PINLogin } from '@/components/auth/PINLogin'

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#000000' }}>
      <div className="w-full max-w-sm space-y-6 p-8">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ongho <span style={{ color: '#c9a84c' }}>Ops</span>
          </h1>
          <p className="text-sm text-white/30">Sign in to continue</p>
        </div>

        {/* PIN login */}
        <PINLogin />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-xs text-white/20">or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Magic link */}
        <form className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email for magic link"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button
            formAction={login}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Send magic link
          </button>
        </form>

        {message && (
          <p className="text-xs text-center text-white/30 border rounded-lg p-3"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {message}
          </p>
        )}

      </div>
    </div>
  )
}