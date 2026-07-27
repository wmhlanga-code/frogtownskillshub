import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/admin'
import PendingCard from '../components/admin/PendingCard'
import ReportedCard from '../components/admin/ReportedCard'
import type { Report, Submission } from '@/lib/types'

export default async function AdminDashboardPage() {
  const service = createServiceRoleClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    activeResult,
    pendingResult,
    flaggedResult,
    messagesResult,
    recentPendingResult,
    recentReportedResult,
    listingsTotalResult,
    newsPublishedResult,
    adminsActiveResult,
  ] = await Promise.all([
    service.from('skill_offerers').select('*', { count: 'exact', head: true }).eq('active', true),
    service.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    service.from('reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
    service.from('messages').select('*', { count: 'exact', head: true }).gte('sent_at', sevenDaysAgo),
    service
      .from('submissions')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(3),
    service
      .from('reports')
      .select('*, message_threads(*)')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(2),
    service.from('skill_offerers').select('*', { count: 'exact', head: true }),
    service.from('news_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    service.from('admins').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  const activeCount = activeResult.count ?? 0
  const pendingCount = pendingResult.count ?? 0
  const flaggedCount = flaggedResult.count ?? 0
  const messagesCount = messagesResult.count ?? 0
  const recentPending = (recentPendingResult.data ?? []) as Submission[]
  const recentReported = (recentReportedResult.data ?? []) as Report[]
  const listingsTotalCount = listingsTotalResult.count ?? 0
  const newsPublishedCount = newsPublishedResult.count ?? 0
  const adminsActiveCount = adminsActiveResult.count ?? 0

  const stats = [
    {
      label: 'Active listings',
      value: activeCount,
      href: '/admin/listings',
      highlight: true,
      icon: (
        <>
          <rect x="3.5" y="4" width="17" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="10.5" width="17" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="17" width="17" height="3" rx="1" stroke="currentColor" strokeWidth="1.6" />
        </>
      ),
    },
    {
      label: 'Pending review',
      value: pendingCount,
      href: '/admin/pending',
      highlight: false,
      icon: (
        <>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
    {
      label: 'Reported',
      value: flaggedCount,
      href: '/admin/reported',
      highlight: false,
      icon: (
        <path
          d="M6 3.5v17M6 4.5h10.5l-2 3.5 2 3.5H6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      label: 'Messages this week',
      value: messagesCount,
      href: undefined,
      highlight: false,
      icon: (
        <path
          d="M12 4C7.03 4 3 7.36 3 11.5c0 2.3 1.26 4.36 3.25 5.73-.1.98-.42 2.16-1.19 3.27a.4.4 0 0 0 .43.62c1.6-.4 3.06-1.13 4.1-1.76.75.16 1.55.24 2.41.24 4.97 0 9-3.36 9-7.5S16.97 4 12 4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ),
    },
  ]

  const manageLinks = [
    {
      label: 'All listings',
      description: `${listingsTotalCount} total`,
      href: '/admin/listings',
      icon: (
        <>
          <rect x="3.5" y="4" width="17" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="10.5" width="17" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="17" width="17" height="3" rx="1" stroke="currentColor" strokeWidth="1.6" />
        </>
      ),
    },
    {
      label: 'News and updates',
      description: `${newsPublishedCount} published`,
      href: '/admin/news',
      icon: (
        <path
          d="M4 10v4a1 1 0 0 0 1 1h1l2.5 3.5V5.5L6 9H5a1 1 0 0 0-1 1Z M11 8.5c2.5 0 4.5 1.6 4.5 3.5s-2 3.5-4.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ),
    },
    {
      label: 'Admin accounts',
      description: `${adminsActiveCount} active`,
      href: '/admin/admins',
      icon: (
        <>
          <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5M15.5 8a3 3 0 0 1 0 6M17 14.5c2 .4 3.3 1.7 3.7 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ),
    },
    {
      label: 'Settings',
      description: 'Platform configuration',
      href: '/admin/settings',
      icon: (
        <>
          <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M17.7 17.7l-1.4-1.4M7.7 7.7 6.3 6.3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Dashboard</h1>
      <p className="text-sm text-muted-green mb-6">
        {pendingCount > 0 ? `${pendingCount} submissions waiting for review` : 'Everything is up to date.'}
      </p>

      <div className="grid grid-cols-2 sm:flex gap-3 mb-8">
        {stats.map((stat) => {
          const cardClass = `rounded-xl p-4 sm:flex-1 min-w-0 border shadow-sm block transition-all ${
            stat.highlight
              ? 'bg-gradient-to-br from-frogtown-700 to-frogtown-900 border-frogtown-800'
              : 'bg-white border-frogtown-200'
          } ${stat.href ? 'hover:shadow-md hover:border-frogtown-300' : ''}`

          const content = (
            <>
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${
                  stat.highlight ? 'bg-white/15 text-white' : 'bg-frogtown-50 text-frogtown-700'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
                  {stat.icon}
                </svg>
              </div>
              <p
                className={`text-3xl font-extrabold leading-none ${
                  stat.highlight ? 'text-white' : 'text-frogtown-800'
                }`}
              >
                {stat.value}
              </p>
              <p className={`text-xs mt-1 ${stat.highlight ? 'text-frogtown-200' : 'text-muted-green'}`}>
                {stat.label}
              </p>
            </>
          )

          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={cardClass}>
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={cardClass}>
              {content}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-frogtown-900">Pending submissions</h2>
            <Link
              href="/admin/pending"
              className="text-xs text-frogtown-700 font-semibold transition-colors hover:text-frogtown-900"
            >
              See all
            </Link>
          </div>
          {recentPending.length === 0 ? (
            <p className="text-sm text-muted-green">No pending submissions.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentPending.map((submission) => (
                <PendingCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-frogtown-900">Reported conversations</h2>
            <Link
              href="/admin/reported"
              className="text-xs text-frogtown-700 font-semibold transition-colors hover:text-frogtown-900"
            >
              See all
            </Link>
          </div>
          {recentReported.length === 0 ? (
            <p className="text-sm text-muted-green">No unresolved reports.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentReported.map((report) => (
                <ReportedCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-base font-bold text-frogtown-900 mb-3">Manage</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {manageLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 transition-all hover:shadow-md hover:border-frogtown-300"
          >
            <div className="h-8 w-8 rounded-lg bg-frogtown-50 text-frogtown-700 flex items-center justify-center mb-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
                {link.icon}
              </svg>
            </div>
            <p className="text-sm font-bold text-frogtown-900">{link.label}</p>
            <p className="text-xs text-muted-green mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
