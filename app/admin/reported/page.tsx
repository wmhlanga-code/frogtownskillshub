import { createServiceRoleClient } from '@/lib/admin'
import ReportedCard from '@/app/components/admin/ReportedCard'
import type { Report } from '@/lib/types'

export default async function ReportedPage() {
  const service = createServiceRoleClient()

  const { data } = await service
    .from('reports')
    .select('*, message_threads(*)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  const reports = (data ?? []) as Report[]

  return (
    <div className="p-4 sm:p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Reported conversations</h1>
      <p className="text-sm text-muted-green mb-6">{reports.length} unresolved</p>

      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <ReportedCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  )
}
