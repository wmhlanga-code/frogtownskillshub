import { createServiceRoleClient } from '@/lib/admin'
import { getAuthUser, getRoleInThread } from '@/lib/messaging'

export async function POST(request: Request) {
  const authUser = await getAuthUser()
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { thread_id, body: messageBody, sender_role } = body as {
    thread_id?: string
    body?: string
    sender_role?: string
  }

  if (!thread_id || !messageBody?.trim() || !sender_role) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
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
  if (!role || role !== sender_role) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: message, error } = await service
    .from('messages')
    .insert({
      thread_id,
      body: messageBody.trim(),
      sender_role: role,
      sent_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) {
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return Response.json({ success: true, message })
}
