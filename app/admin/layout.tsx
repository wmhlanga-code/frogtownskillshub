import { headers } from 'next/headers'
import Link from 'next/link'
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

      <aside className="hidden md:flex w-52 bg-gradient-to-b from-black to-frogtown-900 text-white flex-col flex-shrink-0 shadow-xl">
        <Link
          href="/admin"
          className="group flex items-center gap-2 px-4 pb-4 border-b border-white/10 mb-4 pt-5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-frogtown-400/30 to-frogtown-400/10 text-frogtown-400 flex-shrink-0 shadow-sm transition-transform duration-150 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 3c-3 2-5 5-5 8.5a5 5 0 0 0 10 0C17 8 15 5 12 3Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M12 12v6M9 21c0-1.5 1-3 3-3s3 1.5 3 3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white leading-tight truncate">Admin Panel</p>
            <p className="text-xs text-frogtown-400 truncate">Frogtown Skills Hub</p>
          </div>
        </Link>

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
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-3"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View site
          </Link>
          <p className="text-xs text-white/50 mb-2">{adminName}</p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 bg-off-white overflow-y-auto">{children}</main>
    </div>
  )
}
