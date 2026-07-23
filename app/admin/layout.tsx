import { headers } from 'next/headers'
import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'
import AdminNavClient from '../components/admin/AdminNavClient'
import AdminMobileNav from '../components/admin/AdminMobileNav'
import SignOutButton from '../components/admin/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get('x-pathname') ?? ''

  if (pathname.includes('/admin/login')) {
    return <>{children}</>
  }

  const service = createServiceRoleClient()

  const [admin, pendingResult, reportedResult] = await Promise.all([
    getCurrentAdmin(),
    service.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    service.from('reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
  ])

  const pendingCount = pendingResult.count ?? 0
  const reportedCount = reportedResult.count ?? 0
  const adminName = admin?.name ?? 'Admin'

  const reviewItems = [
    { href: '/admin/pending', label: 'Pending', badge: pendingCount, badgeStyle: 'urgent' as const },
    { href: '/admin/listings', label: 'All Listings' },
  ]
  const manageItems = [
    { href: '/admin/news', label: 'News and Updates' },
    { href: '/admin/admins', label: 'Admins' },
    { href: '/admin/reported', label: 'Reported', badge: reportedCount, badgeStyle: 'normal' as const },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminMobileNav reviewItems={reviewItems} manageItems={manageItems} adminName={adminName} />

      <aside className="hidden md:flex w-52 bg-black text-white flex-col flex-shrink-0">
        <div className="px-4 pb-4 border-b border-white/10 mb-4 pt-5">
          <p className="font-bold text-sm text-white">Admin Panel</p>
          <p className="text-xs text-frogtown-400 mt-0.5">Frogtown Skills Hub</p>
        </div>

        <nav className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4 pb-2">
            Review
          </p>
          <AdminNavClient items={reviewItems} />

          <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4 pb-2 pt-4">
            Manage
          </p>
          <AdminNavClient items={manageItems} />
        </nav>

        <div className="mt-auto px-4 pb-5 border-t border-white/10 pt-4">
          <p className="text-xs text-white/50 mb-2">{adminName}</p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 bg-off-white overflow-y-auto">{children}</main>
    </div>
  )
}
