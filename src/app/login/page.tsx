import { login } from './actions'

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ongho Ops
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a sign-in link.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            formAction={login}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Send sign-in link
          </button>
        </form>

        {message && (
          <p className="text-sm text-center text-muted-foreground border border-border rounded-md p-3">
            {message}
          </p>
        )}

      </div>
    </div>
  )
}