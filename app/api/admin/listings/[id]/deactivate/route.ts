import { createServiceRoleClient, getCurrentAdmin } from '@/lib/admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  const { data: listing, error: fetchError } = await service
    .from('skill_offerers')
    .select('active')
    .eq('id', params.id)
    .single()

  if (fetchError || !listing) {
    return Response.json({ error: 'Listing not found' }, { status: 404 })
  }

  const newValue = !listing.active

  const { error: updateError } = await service
    .from('skill_offerers')
    .update({ active: newValue })
    .eq('id', params.id)

  if (updateError) {
    console.error('Failed to update listing:', updateError)
    return Response.json({ error: 'Failed to update listing' }, { status: 500 })
  }

  return Response.json({ success: true, active: newValue })
}
