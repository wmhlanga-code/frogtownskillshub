import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { title, body: postBody, tag, pinned } = body as {
    title?: string
    body?: string
    tag?: string
    pinned?: boolean
  }

  if (!title || !tag) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { data, error } = await service
    .from('news_posts')
    .insert({
      title,
      body: postBody,
      tag,
      pinned: !!pinned,
      published: true,
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: 'Failed to publish post' }, { status: 500 })
  }

  return Response.json({ success: true, id: data.id })
}
