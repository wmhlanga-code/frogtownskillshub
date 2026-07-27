import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    full_name,
    display_name,
    email,
    quadrant,
    skill_categories,
    skills,
    languages,
    consent_review,
    consent_public,
    cross_streets,
    bio,
  } = body

  const missingRequired =
    !full_name ||
    !display_name ||
    !email ||
    !quadrant ||
    !Array.isArray(skill_categories) ||
    skill_categories.length === 0 ||
    !Array.isArray(languages) ||
    languages.length === 0 ||
    !consent_review ||
    !consent_public

  if (missingRequired) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      full_name,
      display_name,
      email,
      quadrant,
      skill_categories,
      skills: Array.isArray(skills) && skills.length > 0 ? skills : null,
      languages,
      cross_streets: cross_streets || null,
      bio: bio || null,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: 'Failed to submit' }, { status: 500 })
  }

  return Response.json({ success: true, id: data.id }, { status: 200 })
}
