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
