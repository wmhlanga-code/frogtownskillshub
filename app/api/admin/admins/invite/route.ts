import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (admin.role !== 'super_admin') {
    return Response.json({ error: 'Only super admins can invite new admins' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { name, email, role } = body as { name?: string; email?: string; role?: string }

  if (!name || !email || !role) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { data: existing } = await service
    .from('admins')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return Response.json({ error: 'An admin with this email already exists' }, { status: 400 })
  }

  const { data: inserted, error: insertError } = await service
    .from('admins')
    .insert({ name, email, role, active: true })
    .select('id')
    .single()

  if (insertError) {
    return Response.json({ error: 'Failed to create admin record' }, { status: 500 })
  }

  const { error: inviteError } = await service.auth.admin.inviteUserByEmail(email)

  if (inviteError) {
    return Response.json({ error: 'Failed to send invitation email' }, { status: 500 })
  }

  return Response.json({ success: true, id: inserted.id })
}
