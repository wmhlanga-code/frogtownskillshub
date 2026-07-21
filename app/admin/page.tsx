import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/admin'
import PendingCard from '../components/admin/PendingCard'
import type { Submission } from '@/lib/types'

export default async function AdminDashboardPage() {
  const service = createServiceRoleClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [activeResult, pendingResult, flaggedResult, messagesResult, recentPendingResult] =
    await Promise.all([
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
    ])

  const activeCount = activeResult.count ?? 0
  const pendingCount = pendingResult.count ?? 0
  const flaggedCount = flaggedResult.count ?? 0
  const messagesCount = messagesResult.count ?? 0
  const recentPending = (recentPendingResult.data ?? []) as Submission[]

  const stats = [
    { label: 'Active listings', value: activeCount, highlight: true },
    { label: 'Pending review', value: pendingCount, highlight: false },
    { label: 'Messages this week', value: messagesCount, highlight: false },
    { label: 'Flagged', value: flaggedCount, highlight: false },
  ]

  return (
    <div className="p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Dashboard</h1>
      <p className="text-sm text-muted-green mb-6">
        {pendingCount > 0 ? `${pendingCount} submissions waiting for review` : 'Everything is up to date.'}
      </p>

      <div className="flex gap-3 mb-8 flex-wrap">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg p-4 flex-1 min-w-24 border ${
              stat.highlight
                ? 'bg-frogtown-800 border-frogtown-800'
                : 'bg-white border-frogtown-200'
            }`}
          >
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
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold text-frogtown-900">Pending submissions</h2>
        <Link href="/admin/pending" className="text-xs text-frogtown-700 font-semibold">
          See all
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {recentPending.map((submission) => (
          <PendingCard key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  )
}
