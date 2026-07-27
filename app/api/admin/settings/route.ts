import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { hero_heading, hero_subheading, contact_email, about_team } = body as {
    hero_heading?: string
    hero_subheading?: string
    contact_email?: string
    about_team?: { name: string; role: string }[]
  }

  const service = createServiceRoleClient()

  const { error } = await service.from('site_settings').upsert({
    id: 1,
    hero_heading: hero_heading || null,
    hero_subheading: hero_subheading || null,
    contact_email: contact_email || null,
    about_team: Array.isArray(about_team) ? about_team : [],
    updated_at: new Date().toISOString(),
    updated_by: admin.id,
  })

  if (error) {
    console.error('Failed to update site settings:', error)
    return Response.json({ error: 'Failed to update settings' }, { status: 500 })
  }

  return Response.json({ success: true })
}
