import Link from 'next/link'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/admin'
import NavLinksClient from './NavLinksClient'
import NavAuthClient from './NavAuthClient'
import MobileNav from './MobileNav'

export default async function Nav() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let name: string | undefined
  let unreadCount = 0

  if (user?.email) {
    const service = createServiceRoleClient()

    const [userResult, myOffererRows] = await Promise.all([
      service.from('users').select('name').eq('email', user.email).maybeSingle(),
      service.from('skill_offerers').select('id').eq('email', user.email),
    ])

    name = userResult.data?.name
    const myOffererIds = (myOffererRows.data ?? []).map((o) => o.id)

    const [seekerThreadsResult, offererThreadsResult] = await Promise.all([
      service.from('message_threads').select('id').eq('seeker_id', user.id),
      myOffererIds.length > 0
        ? service.from('message_threads').select('id').in('offerer_id', myOffererIds)
        : Promise.resolve({ data: [] as { id: string }[] }),
    ])

    const seekerThreadIds = (seekerThreadsResult.data ?? []).map((t) => t.id)
    const offererThreadIds = (offererThreadsResult.data ?? []).map((t) => t.id)

    const [seekerUnread, offererUnread] = await Promise.all([
      seekerThreadIds.length > 0
        ? service
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('thread_id', seekerThreadIds)
            .is('read_at', null)
            .neq('sender_role', 'seeker')
        : Promise.resolve({ count: 0 }),
      offererThreadIds.length > 0
        ? service
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('thread_id', offererThreadIds)
            .is('read_at', null)
            .neq('sender_role', 'offerer')
        : Promise.resolve({ count: 0 }),
    ])

    unreadCount = (seekerUnread.count ?? 0) + (offererUnread.count ?? 0)
  }

  return (
    <nav className="relative bg-frogtown-900 text-white h-14 sticky top-0 z-50 flex items-center justify-between px-4 border-b border-frogtown-800 shadow-sm">
      <Link href="/" className="flex items-center gap-2 min-w-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-frogtown-400/20 text-frogtown-400 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M12 3c-3 2-5 5-5 8.5a5 5 0 0 0 10 0C17 8 15 5 12 3Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M12 12v6M9 21c0-1.5 1-3 3-3s3 1.5 3 3"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="text-lg font-bold tracking-tight leading-none truncate">
          Frogtown <span className="text-frogtown-400">Skills</span>
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <NavLinksClient />
        <NavAuthClient signedIn={!!user} name={name} email={user?.email} unreadCount={unreadCount} />
        <MobileNav signedIn={!!user} name={name} email={user?.email} unreadCount={unreadCount} />
      </div>
    </nav>
  )
}
