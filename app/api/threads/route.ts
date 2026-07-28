import { createServiceRoleClient } from '@/lib/admin'
import { getAuthUser } from '@/lib/messaging'

export async function POST(request: Request) {
  const authUser = await getAuthUser()
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { offerer_id } = body as { offerer_id?: string }

  if (!offerer_id) {
    return Response.json({ error: 'Missing offerer_id' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  // Some existing accounts have an Auth user but no matching `users` row
  // (the row-creation call in SignupForm.tsx is fire-and-forget), which
  // makes this insert fail on the seeker_id foreign key below. Self-heal
  // by creating it here if missing, without touching it if it already
  // exists (ignoreDuplicates keeps whatever real name signup set).
  await service
    .from('users')
    .upsert(
      { id: authUser.id, email: authUser.email, name: authUser.email.split('@')[0] },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  const { data: existing } = await service
    .from('message_threads')
    .select('id')
    .eq('offerer_id', offerer_id)
    .eq('seeker_id', authUser.id)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return Response.json({ thread_id: existing.id })
  }

  const { data: created, error } = await service
    .from('message_threads')
    .insert({ offerer_id, seeker_id: authUser.id })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: 'Failed to create thread' }, { status: 500 })
  }

  return Response.json({ thread_id: created.id })
}
