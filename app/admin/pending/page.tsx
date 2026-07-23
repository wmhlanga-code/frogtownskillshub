import { createServiceRoleClient } from '@/lib/admin'
import PendingCard from '@/app/components/admin/PendingCard'
import type { Submission } from '@/lib/types'

export default async function PendingPage() {
  const service = createServiceRoleClient()

  const { data } = await service
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  const submissions = (data ?? []) as Submission[]

  return (
    <div className="p-4 sm:p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Pending submissions</h1>
      <p className="text-sm text-muted-green mb-6">{submissions.length} waiting for review</p>

      <div className="flex flex-col gap-3">
        {submissions.map((submission) => (
          <PendingCard key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  )
}
