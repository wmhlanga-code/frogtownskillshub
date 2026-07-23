'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Message, MessageThread } from '@/lib/types'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function timeAgo(iso?: string) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ThreadList({
  initialThreads,
  currentThreadId,
}: {
  initialThreads: MessageThread[]
  currentThreadId?: string
}) {
  const [threads, setThreads] = useState(initialThreads)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message

          setThreads((prev) => {
            const index = prev.findIndex((t) => t.id === newMessage.thread_id)
            if (index === -1) return prev

            const updated = [...prev]
            const thread = updated[index]
            const isCurrentThread = newMessage.thread_id === currentThreadId

            updated[index] = {
              ...thread,
              last_message_body: newMessage.body,
              last_message_at: newMessage.sent_at,
              unread_count: isCurrentThread
                ? thread.unread_count ?? 0
                : (thread.unread_count ?? 0) + 1,
            }

            return updated.sort((a, b) => {
              const aTime = a.last_message_at ?? a.created_at
              const bTime = b.last_message_at ?? b.created_at
              return new Date(bTime).getTime() - new Date(aTime).getTime()
            })
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentThreadId])

  if (threads.length === 0) {
    return (
      <div className="w-full md:w-72 border-r border-frogtown-200 bg-white flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-frogtown-200 bg-frogtown-50">
          <h2 className="font-bold text-base text-frogtown-900">Messages</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-1">
          <p className="text-sm text-muted-green">No messages yet.</p>
          <p className="text-sm text-muted-green">Browse the directory to find a neighbor.</p>
          <Link href="/" className="text-sm text-frogtown-700 font-semibold mt-2">
            Go to directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-72 border-r border-frogtown-200 bg-white flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-frogtown-200 bg-frogtown-50">
        <h2 className="font-bold text-base text-frogtown-900">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => {
          const isActive = thread.id === currentThreadId
          const offerer = thread.skill_offerer
          const name = thread.other_party_name ?? offerer?.display_name ?? 'Neighbor'
          const isSeekerView = thread.my_role !== 'offerer'

          return (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className={`flex gap-3 px-4 py-3 border-b border-frogtown-100 cursor-pointer hover:bg-frogtown-50 transition-colors ${
                isActive ? 'bg-frogtown-100 border-l-3 border-l-frogtown-800 pl-3' : ''
              }`}
            >
              <div className="w-10 h-10 bg-frogtown-800 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {initials(name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm truncate ${
                      thread.unread_count ? 'font-bold text-frogtown-900' : 'font-semibold text-frogtown-900'
                    }`}
                  >
                    {name}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-muted-green">{timeAgo(thread.last_message_at)}</span>
                    {!!thread.unread_count && thread.unread_count > 0 && (
                      <span className="w-2 h-2 bg-frogtown-700 rounded-full" />
                    )}
                  </div>
                </div>
                {isSeekerView && (offerer?.skill_categories?.[0] || offerer?.quadrant) && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {offerer?.skill_categories?.[0] && (
                      <span className="text-xs text-frogtown-700 font-semibold">
                        {offerer.skill_categories[0]}
                      </span>
                    )}
                    {offerer?.quadrant && (
                      <span className="text-xs text-muted-green">· {offerer.quadrant}</span>
                    )}
                  </div>
                )}
                {!isSeekerView && (
                  <p className="text-xs text-frogtown-700 font-semibold mt-0.5">Message to you</p>
                )}
                {thread.last_message_body && (
                  <p
                    className={`text-xs mt-1 truncate ${
                      thread.unread_count ? 'text-frogtown-900 font-medium' : 'text-muted-green'
                    }`}
                  >
                    {thread.last_message_body}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
