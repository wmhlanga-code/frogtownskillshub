import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { notes } = body as { notes?: string }

  const service = createServiceRoleClient()

  const { error } = await service
    .from('submissions')
    .update({
      status: 'rejected',
      reviewer_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq('id', params.id)

  if (error) {
    return Response.json({ error: 'Failed to reject submission' }, { status: 500 })
  }

  return Response.json({ success: true })
}
