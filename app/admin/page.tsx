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
    { label: 'Active listings', value: activeCount, href: '/admin/listings', highlight: true },
    { label: 'Pending review', value: pendingCount, href: '/admin/pending', highlight: false },
    { label: 'Reported', value: flaggedCount, href: '/admin/reported', highlight: false },
    { label: 'Messages this week', value: messagesCount, href: undefined, highlight: false },
  ]

  const manageLinks = [
    {
      label: 'All listings',
      description: `${listingsTotalCount} total`,
      href: '/admin/listings',
    },
    {
      label: 'News and updates',
      description: `${newsPublishedCount} published`,
      href: '/admin/news',
    },
    {
      label: 'Admin accounts',
      description: `${adminsActiveCount} active`,
      href: '/admin/admins',
    },
    {
      label: 'Settings',
      description: 'Platform configuration',
      href: '/admin/settings',
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
          const cardClass = `rounded-lg p-4 sm:flex-1 min-w-0 border block ${
            stat.highlight ? 'bg-frogtown-800 border-frogtown-800' : 'bg-white border-frogtown-200'
          } ${stat.href ? 'hover:border-frogtown-600 transition-colors' : ''}`

          const content = (
            <>
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
            <Link href="/admin/pending" className="text-xs text-frogtown-700 font-semibold">
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
            <Link href="/admin/reported" className="text-xs text-frogtown-700 font-semibold">
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
            className="bg-white border border-frogtown-200 rounded-lg p-4 hover:border-frogtown-600 transition-colors"
          >
            <p className="text-sm font-bold text-frogtown-900">{link.label}</p>
            <p className="text-xs text-muted-green mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
