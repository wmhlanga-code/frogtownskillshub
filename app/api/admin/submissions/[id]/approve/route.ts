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

  // Invite the offerer to set a password so they can log in and read
  // messages sent to their listing. A 422 here just means an account with
  // this email already exists (e.g. they signed up separately) - not a
  // real failure. Any other invite error is logged but doesn't block
  // approval, since the public directory listing shouldn't hinge on
  // transactional email delivery.
  const { origin } = new URL(request.url)
  const { error: inviteError } = await service.auth.admin.inviteUserByEmail(submission.email, {
    redirectTo: `${origin}/account/set-password?next=/messages`,
  })

  if (inviteError && inviteError.status !== 422) {
    console.error('Failed to send offerer invite email:', inviteError)
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
