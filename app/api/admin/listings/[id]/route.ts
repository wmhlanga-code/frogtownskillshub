import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const {
    display_name,
    email,
    quadrant,
    cross_streets,
    skill_categories,
    skills,
    languages,
    bio,
    active,
  } = body as {
    display_name?: string
    email?: string
    quadrant?: string
    cross_streets?: string
    skill_categories?: string[]
    skills?: string[]
    languages?: string[]
    bio?: string
    active?: boolean
  }

  if (!display_name || !email || !quadrant || !Array.isArray(skill_categories) || !Array.isArray(languages)) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { error } = await service
    .from('skill_offerers')
    .update({
      display_name,
      email,
      quadrant,
      cross_streets: cross_streets || null,
      skill_categories,
      skills: Array.isArray(skills) && skills.length > 0 ? skills : null,
      languages,
      bio: bio || null,
      active: active ?? true,
    })
    .eq('id', params.id)

  if (error) {
    console.error('Failed to update listing:', error)
    return Response.json({ error: 'Failed to update listing' }, { status: 500 })
  }

  return Response.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  const { data: threads } = await service
    .from('message_threads')
    .select('id')
    .eq('offerer_id', params.id)

  const threadIds = (threads ?? []).map((t) => t.id)

  if (threadIds.length > 0) {
    const { error: messagesError } = await service
      .from('messages')
      .delete()
      .in('thread_id', threadIds)

    if (messagesError) {
      console.error('Failed to delete messages for listing:', messagesError)
      return Response.json({ error: 'Failed to delete listing' }, { status: 500 })
    }

    const { error: reportsError } = await service
      .from('reports')
      .delete()
      .in('thread_id', threadIds)

    if (reportsError) {
      console.error('Failed to delete reports for listing:', reportsError)
      return Response.json({ error: 'Failed to delete listing' }, { status: 500 })
    }

    const { error: threadsError } = await service
      .from('message_threads')
      .delete()
      .eq('offerer_id', params.id)

    if (threadsError) {
      console.error('Failed to delete threads for listing:', threadsError)
      return Response.json({ error: 'Failed to delete listing' }, { status: 500 })
    }
  }

  const { error } = await service.from('skill_offerers').delete().eq('id', params.id)

  if (error) {
    console.error('Failed to delete listing:', error)
    return Response.json({ error: 'Failed to delete listing' }, { status: 500 })
  }

  return Response.json({ success: true })
}
