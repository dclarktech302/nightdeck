import { requireSession } from '@/lib/session'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Toaster } from 'sonner'
import { Suspense } from 'react'
import { SavedBanner } from '@/components/dashboard/SavedBanner'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // requireSession() redirects to /login if not authenticated
  const session = await requireSession()

  return (
    <div className="min-h-screen flex" style={{ background: '#000000' }}>

      {/* Sidebar */}
      <DashboardSidebar />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid rgba(34,197,94,0.4)',
            color: '#22c55e',
            backdropFilter: 'blur(12px)',
          },
        }}
        offset="76px"
      />
      <Suspense fallback={null}>
        <SavedBanner />
      </Suspense>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader session={session} />
        <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  )
}