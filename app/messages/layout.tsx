import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/admin'
import { getAuthUser } from '@/lib/messaging'
import Nav from '../components/Nav'
import ThreadList from '../components/messaging/ThreadList'
import type { Message, MessageThread } from '@/lib/types'

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthUser()
  if (!authUser) {
    redirect('/login?redirect=/messages')
  }

  const pathname = headers().get('x-pathname') ?? ''
  const currentThreadId = pathname.startsWith('/messages/')
    ? pathname.slice('/messages/'.length).split('/')[0] || undefined
    : undefined

  const service = createServiceRoleClient()

  const { data: myOffererRows } = await service
    .from('skill_offerers')
    .select('id')
    .eq('email', authUser.email)

  const myOffererIds = (myOffererRows ?? []).map((o) => o.id)

  const orFilter =
    myOffererIds.length > 0
      ? `seeker_id.eq.${authUser.id},offerer_id.in.(${myOffererIds.join(',')})`
      : `seeker_id.eq.${authUser.id}`

  const { data: threadsData } = await service
    .from('message_threads')
    .select('*, skill_offerers(*)')
    .or(orFilter)

  const threadIds = (threadsData ?? []).map((t) => t.id)

  const { data: messagesData } =
    threadIds.length > 0
      ? await service
          .from('messages')
          .select('*')
          .in('thread_id', threadIds)
          .order('sent_at', { ascending: true })
      : { data: [] as Message[] }

  const messagesByThread = new Map<string, Message[]>()
  for (const message of messagesData ?? []) {
    const arr = messagesByThread.get(message.thread_id) ?? []
    arr.push(message)
    messagesByThread.set(message.thread_id, arr)
  }

  const threads: MessageThread[] = (threadsData ?? [])
    .map((t) => {
      const msgs = messagesByThread.get(t.id) ?? []
      const last = msgs[msgs.length - 1]
      const myRole: 'seeker' | 'offerer' = t.seeker_id === authUser.id ? 'seeker' : 'offerer'
      const unreadCount = msgs.filter((m) => !m.read_at && m.sender_role !== myRole).length
      const otherPartyName =
        myRole === 'seeker' ? t.skill_offerers?.display_name ?? 'Neighbor' : t.seeker_name ?? 'Neighbor'

      return {
        ...t,
        skill_offerer: t.skill_offerers ?? undefined,
        last_message_body: last?.body,
        last_message_at: last?.sent_at,
        unread_count: unreadCount,
        my_role: myRole,
        other_party_name: otherPartyName,
      } as MessageThread
    })
    .sort((a, b) => {
      const aTime = a.last_message_at ?? a.created_at
      const bTime = b.last_message_at ?? b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

  const hasThread = !!currentThreadId

  return (
    <div className="min-h-screen bg-off-white">
      <Nav />
      <div className="flex flex-row h-[calc(100vh-56px)]">
        <div className={`${hasThread ? 'hidden' : 'flex'} md:flex flex-shrink-0`}>
          <ThreadList initialThreads={threads} currentThreadId={currentThreadId} />
        </div>
        <div className={`${hasThread ? 'flex' : 'hidden'} md:flex flex-1 min-w-0`}>{children}</div>
      </div>
    </div>
  )
}
