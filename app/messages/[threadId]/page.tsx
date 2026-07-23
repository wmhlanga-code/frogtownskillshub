import { notFound, redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/admin'
import { getAuthUser, getRoleInThread } from '@/lib/messaging'
import ConversationView from '../../components/messaging/ConversationView'
import type { Message, MessageThread } from '@/lib/types'

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const authUser = await getAuthUser()
  if (!authUser) {
    redirect('/login?redirect=/messages')
  }

  const service = createServiceRoleClient()

  const { data: threadData } = await service
    .from('message_threads')
    .select('*, skill_offerers(*)')
    .eq('id', params.threadId)
    .maybeSingle()

  if (!threadData) {
    notFound()
  }

  const thread: MessageThread = {
    ...threadData,
    skill_offerer: threadData.skill_offerers ?? undefined,
  }

  const role = await getRoleInThread(thread, authUser)
  if (!role) {
    notFound()
  }

  const { data: messagesData } = await service
    .from('messages')
    .select('*')
    .eq('thread_id', params.threadId)
    .order('sent_at', { ascending: true })

  const messages = (messagesData ?? []) as Message[]

  const unreadIds = messages
    .filter((m) => !m.read_at && m.sender_role !== role)
    .map((m) => m.id)

  if (unreadIds.length > 0) {
    await service.from('messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds)
  }

  return (
    <ConversationView
      thread={thread}
      initialMessages={messages}
      currentUserRole={role}
      currentUserId={authUser.id}
    />
  )
}
