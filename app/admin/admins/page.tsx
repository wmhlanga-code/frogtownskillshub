import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'
import AdminsClient from '@/app/components/admin/AdminsClient'
import type { Admin } from '@/lib/types'

export default async function AdminsPage() {
  const currentAdmin = await getCurrentAdmin()

  if (currentAdmin?.role !== 'super_admin') {
    return (
      <div className="p-7">
        <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Admin accounts</h1>
        <p className="text-sm text-muted-green">
          You do not have permission to view this page.
        </p>
      </div>
    )
  }

  const service = createServiceRoleClient()
  const { data } = await service.from('admins').select('*').order('created_at', { ascending: true })
  const admins = (data ?? []) as Admin[]

  return (
    <div className="p-7">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-6">Admin accounts</h1>
      <AdminsClient admins={admins} currentAdminId={currentAdmin.id} isSuperAdmin />
    </div>
  )
}
