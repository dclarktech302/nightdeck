import { requireSession } from '@/lib/session'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader session={session} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  )
}