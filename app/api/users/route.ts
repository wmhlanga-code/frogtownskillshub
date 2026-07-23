import { createServiceRoleClient } from '@/lib/admin'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { id, name, email } = body as { id?: string; name?: string; email?: string }

  if (!id || !name || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceRoleClient()

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
