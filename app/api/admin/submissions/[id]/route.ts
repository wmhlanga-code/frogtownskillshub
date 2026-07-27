import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const {
    full_name,
    display_name,
    email,
    quadrant,
    cross_streets,
    skill_categories,
    skills,
    languages,
    bio,
  } = body as {
    full_name?: string
    display_name?: string
    email?: string
    quadrant?: string
    cross_streets?: string
    skill_categories?: string[]
    skills?: string[]
    languages?: string[]
    bio?: string
  }

  if (
    !full_name ||
    !display_name ||
    !email ||
    !quadrant ||
    !Array.isArray(skill_categories) ||
    !Array.isArray(languages)
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const { error } = await service
    .from('submissions')
    .update({
      full_name,
      display_name,
      email,
      quadrant,
      cross_streets: cross_streets || null,
      skill_categories,
      skills: Array.isArray(skills) && skills.length > 0 ? skills : null,
      languages,
      bio: bio || null,
    })
    .eq('id', params.id)

  if (error) {
    console.error('Failed to update submission:', error)
    return Response.json({ error: 'Failed to update submission' }, { status: 500 })
  }

  return Response.json({ success: true })
}
