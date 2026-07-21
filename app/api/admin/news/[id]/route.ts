import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { title, body: postBody, tag, pinned, published } = body as {
    title?: string
    body?: string
    tag?: string
    pinned?: boolean
    published?: boolean
  }

  const service = createServiceRoleClient()

  const { error } = await service
    .from('news_posts')
    .update({
      title,
      body: postBody,
      tag,
      pinned,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) {
    return Response.json({ error: 'Failed to update post' }, { status: 500 })
  }

  return Response.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  const { error } = await service.from('news_posts').delete().eq('id', params.id)

  if (error) {
    return Response.json({ error: 'Failed to delete post' }, { status: 500 })
  }

  return Response.json({ success: true })
}
