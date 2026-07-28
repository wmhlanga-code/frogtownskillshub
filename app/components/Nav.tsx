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
    <nav className="relative bg-gradient-to-r from-frogtown-900 to-frogtown-800 text-white h-14 sticky top-0 z-50 flex items-center justify-between px-4 border-b border-frogtown-800/80 shadow-md">
      <Link href="/" className="group flex items-center gap-2 min-w-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-frogtown-400/30 to-frogtown-400/10 text-frogtown-400 flex-shrink-0 shadow-sm transition-transform duration-150 group-hover:scale-105">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="16" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="8" cy="8" r="0.6" fill="currentColor" />
            <circle cx="16" cy="8" r="0.6" fill="currentColor" />
            <path
              d="M4 13.5C4 11.2 7 9.7 12 9.7C17 9.7 20 11.2 20 13.5C20 17.8 16.6 21 12 21C7.4 21 4 17.8 4 13.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 16C9.7 17.2 14.3 17.2 15.5 16"
              stroke="currentColor"
              strokeWidth="1.4"
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
