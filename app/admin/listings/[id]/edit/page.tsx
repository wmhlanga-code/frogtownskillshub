import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/admin'
import EditListingForm from '@/app/components/admin/EditListingForm'
import type { SkillOfferer } from '@/lib/types'

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const service = createServiceRoleClient()

  const { data } = await service
    .from('skill_offerers')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) {
    notFound()
  }

  const offerer = data as SkillOfferer

  return (
    <div className="p-4 sm:p-7 max-w-2xl">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Edit listing</h1>
      <p className="text-sm text-muted-green mb-6">{offerer.display_name}</p>
      <EditListingForm offerer={offerer} />
    </div>
  )
}
