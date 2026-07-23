import { createServiceRoleClient } from '@/lib/admin'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import type { MessageThread } from '@/lib/types'

export type AuthUser = {
  id: string
  email: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null
  return { id: user.id, email: user.email }
}

export async function getRoleInThread(
  thread: Pick<MessageThread, 'seeker_id' | 'offerer_id'>,
  authUser: AuthUser
): Promise<'seeker' | 'offerer' | null> {
  if (thread.seeker_id === authUser.id) return 'seeker'

  const service = createServiceRoleClient()
  const { data: offerer } = await service
    .from('skill_offerers')
    .select('id')
    .eq('id', thread.offerer_id)
    .eq('email', authUser.email)
    .maybeSingle()

  if (offerer) return 'offerer'
  return null
}
