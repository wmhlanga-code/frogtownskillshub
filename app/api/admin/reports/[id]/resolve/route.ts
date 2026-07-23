import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  const { error } = await service
    .from('reports')
    .update({ resolved: true })
    .eq('id', params.id)

  if (error) {
    console.error('Failed to resolve report:', error)
    return Response.json({ error: 'Failed to resolve report' }, { status: 500 })
  }

  return Response.json({ success: true })
}
