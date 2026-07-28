import { cache } from 'react'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import type { Admin } from '@/lib/types'

export function createServiceRoleClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      // Without this, Next's patched `fetch` can serve these REST calls out
      // of its server-side Data Cache, so admin pages kept showing
      // pre-mutation data (e.g. deleted rows) after router.refresh().
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) },
    }
  )
}

// Memoized per-request: the admin layout and every admin page each call
// this, and each call would otherwise be a separate network round trip to
// Supabase Auth plus a DB lookup. cache() collapses repeat calls within one render.
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

  const service = createServiceRoleClient()
  const { data } = await service
    .from('admins')
    .select('*')
    .eq('email', user.email)
    .eq('active', true)
    .maybeSingle()

  return (data as Admin) ?? null
})
