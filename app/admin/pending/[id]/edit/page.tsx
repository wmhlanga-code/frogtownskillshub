import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/admin'
import EditSubmissionForm from '@/app/components/admin/EditSubmissionForm'
import type { Submission } from '@/lib/types'

export default async function EditSubmissionPage({ params }: { params: { id: string } }) {
  const service = createServiceRoleClient()

  const { data } = await service
    .from('submissions')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (!data) {
    notFound()
  }

  const submission = data as Submission

  return (
    <div className="p-4 sm:p-7 max-w-2xl">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Edit submission</h1>
      <p className="text-sm text-muted-green mb-6">
        Review and correct details, then approve. {submission.full_name}
      </p>
      <EditSubmissionForm submission={submission} />
    </div>
  )
}
