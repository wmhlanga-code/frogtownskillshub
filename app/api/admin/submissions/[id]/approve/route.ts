import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  const { data: submission, error: fetchError } = await service
    .from('submissions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 })
  }

  const { error: insertError } = await service.from('skill_offerers').insert({
    submission_id: submission.id,
    display_name: submission.display_name,
    email: submission.email,
    quadrant: submission.quadrant,
    cross_streets: submission.cross_streets,
    skill_categories: submission.skill_categories,
    skills: submission.skills,
    bio: submission.bio,
    languages: submission.languages,
    active: true,
    approved_by: admin.id,
    approved_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('Failed to approve submission:', insertError)
    return Response.json({ error: 'Failed to approve submission' }, { status: 500 })
  }

  const { error: updateError } = await service
    .from('submissions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq('id', params.id)

  if (updateError) {
    return Response.json({ error: 'Failed to update submission' }, { status: 500 })
  }

  return Response.json({ success: true })
}
