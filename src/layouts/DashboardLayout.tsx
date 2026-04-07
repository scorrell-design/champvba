import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { ToastProvider } from '../components/feedback/Toast'
import { ErrorBoundary } from '../components/feedback/ErrorBoundary'

export function DashboardLayout() {
  return (
    <div className="flex min-h-svh bg-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <ToastProvider />
    </div>
  )
}
