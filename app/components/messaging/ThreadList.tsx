'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((thread) => {
      const name = thread.other_party_name ?? thread.skill_offerer?.display_name ?? 'Neighbor'
      return (
        name.toLowerCase().includes(q) ||
        (thread.last_message_body ?? '').toLowerCase().includes(q)
      )
    })
  }, [threads, search])

  const totalUnread = threads.reduce((sum, t) => sum + (t.unread_count ?? 0), 0)

  if (threads.length === 0) {
    return (
      <div className="w-full md:w-80 border-r border-frogtown-100 bg-white flex flex-col flex-shrink-0">
        <div className="px-5 py-4 bg-gradient-to-r from-frogtown-800 to-frogtown-700">
          <h2 className="font-bold text-base text-white">Messages</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-frogtown-100 to-frogtown-200 flex items-center justify-center text-frogtown-700 mb-1">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path
                d="M12 4C7.03 4 3 7.36 3 11.5c0 2.3 1.26 4.36 3.25 5.73-.1.98-.42 2.16-1.19 3.27a.4.4 0 0 0 .43.62c1.6-.4 3.06-1.13 4.1-1.76.75.16 1.55.24 2.41.24 4.97 0 9-3.36 9-7.5S16.97 4 12 4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-frogtown-900">No messages yet</p>
          <p className="text-sm text-muted-green">Browse the directory to find a neighbor.</p>
          <Link
            href="/"
            className="text-sm text-frogtown-700 font-semibold mt-2 hover:text-frogtown-900 transition-colors"
          >
            Go to directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-80 border-r border-frogtown-100 bg-white flex flex-col flex-shrink-0">
      <div className="px-5 py-4 bg-gradient-to-r from-frogtown-800 to-frogtown-700">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-white">Messages</h2>
          {totalUnread > 0 && (
            <span className="bg-white/15 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread} new
            </span>
          )}
        </div>
        <div className="relative mt-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/60 transition-colors focus:outline-none focus:bg-white/15 focus:border-white/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-green text-center px-6 py-8">
            No conversations match &ldquo;{search}&rdquo;.
          </p>
        ) : (
          filtered.map((thread) => {
            const isActive = thread.id === currentThreadId
            const offerer = thread.skill_offerer
            const name = thread.other_party_name ?? offerer?.display_name ?? 'Neighbor'
            const isSeekerView = thread.my_role !== 'offerer'
            const hasUnread = !!thread.unread_count && thread.unread_count > 0

            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className={`flex gap-3 mx-2 my-1 px-3 py-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-frogtown-50 ring-1 ring-frogtown-200 shadow-sm'
                    : 'hover:bg-frogtown-50/70 hover:shadow-sm'
                }`}
              >
                <div
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm bg-gradient-to-br ${
                    isActive ? 'from-frogtown-700 to-frogtown-900' : 'from-frogtown-600 to-frogtown-800'
                  }`}
                >
                  {initials(name)}
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {thread.unread_count! > 9 ? '9+' : thread.unread_count}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate ${
                        hasUnread ? 'font-bold text-frogtown-900' : 'font-semibold text-frogtown-900'
                      }`}
                    >
                      {name}
                    </span>
                    <span className="text-xs text-muted-green flex-shrink-0">
                      {timeAgo(thread.last_message_at)}
                    </span>
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
                        hasUnread ? 'text-frogtown-900 font-medium' : 'text-muted-green'
                      }`}
                    >
                      {thread.last_message_body}
                    </p>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
