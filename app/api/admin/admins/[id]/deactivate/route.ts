import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (admin.role !== 'super_admin') {
    return Response.json({ error: 'Only super admins can deactivate admins' }, { status: 403 })
  }
  if (admin.id === params.id) {
    return Response.json({ error: 'Cannot deactivate yourself' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { data: target, error: fetchError } = await service
    .from('admins')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !target) {
    return Response.json({ error: 'Admin not found' }, { status: 404 })
  }

  if (target.role === 'super_admin') {
    const { count } = await service
      .from('admins')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin')
      .eq('active', true)

    if ((count ?? 0) <= 1) {
      return Response.json({ error: 'Cannot deactivate the last super admin' }, { status: 400 })
    }
  }

  const { error: updateError } = await service
    .from('admins')
    .update({ active: false })
    .eq('id', params.id)

  if (updateError) {
    console.error('Failed to deactivate admin:', updateError)
    return Response.json({ error: 'Failed to deactivate admin' }, { status: 500 })
  }

  return Response.json({ success: true })
}
