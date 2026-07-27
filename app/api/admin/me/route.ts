import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { name } = body as { name?: string }

  if (!name?.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { error } = await service.from('admins').update({ name: name.trim() }).eq('id', admin.id)

  if (error) {
    console.error('Failed to update admin name:', error)
    return Response.json({ error: 'Failed to update name' }, { status: 500 })
  }

  return Response.json({ success: true })
}
