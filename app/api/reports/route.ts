import { createServiceRoleClient } from '@/lib/admin'
import { getAuthUser, getRoleInThread } from '@/lib/messaging'

export async function POST(request: Request) {
  const authUser = await getAuthUser()
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { thread_id, reason } = body as { thread_id?: string; reason?: string }

  if (!thread_id) {
    return Response.json({ error: 'Missing thread_id' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { data: thread } = await service
    .from('message_threads')
    .select('id, seeker_id, offerer_id')
    .eq('id', thread_id)
    .maybeSingle()

  if (!thread) {
    return Response.json({ error: 'Thread not found' }, { status: 404 })
  }

  const role = await getRoleInThread(thread, authUser)
  if (!role) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await service.from('reports').insert({
    thread_id,
    reported_by_role: role,
    reason: reason || undefined,
    resolved: false,
  })

  if (error) {
    console.error('Failed to submit report:', error)
    return Response.json({ error: 'Failed to submit report' }, { status: 500 })
  }

  return Response.json({ success: true })
}
