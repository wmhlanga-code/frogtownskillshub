import { createServiceRoleClient } from '@/lib/admin'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { id, name, email } = body as { id?: string; name?: string; email?: string }

  if (!id || !name || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  // This route is called right after signup, before the user has confirmed
  // their email and while no session exists yet — so we can't gate this on
  // an authenticated session. Instead, verify id/email against a real,
  // just-created Supabase Auth user so an unauthenticated caller can't
  // insert arbitrary rows under someone else's id.
  const { data: authUserData, error: authLookupError } = await service.auth.admin.getUserById(id)
  if (authLookupError || !authUserData.user || authUserData.user.email?.toLowerCase() !== email.toLowerCase()) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await service
    .from('users')
    .insert({ id, name, email })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create user:', error)
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }

  return Response.json({ success: true, id: data.id })
}
