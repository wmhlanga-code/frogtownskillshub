import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'
import SettingsClient from '@/app/components/admin/SettingsClient'
import type { SiteSettings } from '@/lib/types'

export default async function SettingsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return (
      <div className="p-4 sm:p-7">
        <h1 className="text-xl font-extrabold text-frogtown-900 mb-1">Settings</h1>
        <p className="text-sm text-muted-green">You must be signed in as an admin to view this page.</p>
      </div>
    )
  }

  const service = createServiceRoleClient()
  const { data } = await service.from('site_settings').select('*').eq('id', 1).maybeSingle()

  const settings: SiteSettings = data ?? { id: 1, about_team: [] }

  return (
    <div className="p-4 sm:p-7 max-w-2xl">
      <h1 className="text-xl font-extrabold text-frogtown-900 mb-6">Settings</h1>
      <SettingsClient admin={admin} settings={settings} />
    </div>
  )
}
