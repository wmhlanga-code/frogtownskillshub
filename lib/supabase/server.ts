import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
      // Without this, Next's patched `fetch` can serve these REST calls out
      // of its server-side Data Cache instead of hitting Supabase, showing
      // stale/deleted rows until the cache entry happens to expire.
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) },
    }
  )
}
