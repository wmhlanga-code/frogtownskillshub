import { createServiceRoleClient } from '@/lib/admin'
import ListingsClient from '@/app/components/admin/ListingsClient'
import type { SkillOfferer } from '@/lib/types'

export default async function ListingsPage() {
  const service = createServiceRoleClient()

  const { data } = await service
    .from('skill_offerers')
    .select('*')
    .order('created_at', { ascending: false })

  const offerers = (data ?? []) as SkillOfferer[]

  return (
    <div className="p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">All listings</h1>
      <p className="text-sm text-muted-green mb-6">{offerers.length} total</p>

      <ListingsClient offerers={offerers} />
    </div>
  )
}
