'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Message, MessageThread } from '@/lib/types'
import ReportModal from './ReportModal'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function formatTimestamp(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const isSameDay = date.toDateString() === now.toDateString()
  if (isSameDay) return `Today ${time}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  return `${dayName} ${time}`
}

export default function ConversationView({
  thread,
  initialMessages,
  currentUserRole,
}: {
  thread: MessageThread
  initialMessages: Message[]
  currentUserRole: 'seeker' | 'offerer'
  currentUserId: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const offerer = thread.skill_offerer
  const otherName =
    currentUserRole === 'offerer'
      ? thread.seeker_name ?? 'Neighbor'
      : offerer?.display_name ?? 'Neighbor'
  const otherFirstName = otherName.split(' ')[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('thread-' + thread.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'thread_id=eq.' + thread.id,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [thread.id])

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  async function handleSend() {
    const body = draft.trim()
    if (!body || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: thread.id, body, sender_role: currentUserRole }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
        setDraft('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
      }
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-frogtown-50">
      <div className="bg-white px-3 sm:px-5 py-3 border-b border-frogtown-200 flex items-center gap-3">
        <Link
          href="/messages"
          aria-label="Back to messages"
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-frogtown-700 hover:bg-frogtown-50 flex-shrink-0 -ml-1"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div className="w-9 h-9 bg-frogtown-800 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
          {initials(otherName)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-frogtown-900 truncate">{otherName}</p>
          {currentUserRole === 'offerer' ? (
            <p className="text-xs text-frogtown-700">Message to you</p>
          ) : (
            <>
              {offerer?.skill_categories && offerer.skill_categories.length > 0 && (
                <p className="text-xs text-frogtown-700">{offerer.skill_categories.join(', ')}</p>
              )}
              {offerer && (
                <p className="text-xs text-muted-green">
                  {offerer.quadrant}
                  {offerer.cross_streets ? ` — near ${offerer.cross_streets}` : ''}
                  {offerer.languages?.length ? ` · Languages: ${offerer.languages.join(', ')}` : ''}
                </p>
              )}
            </>
          )}
        </div>
        <button
          onClick={() => setReportOpen(true)}
          className="ml-auto bg-white border border-frogtown-200 rounded-md px-3 py-1.5 text-xs text-muted-green hover:border-black hover:text-black flex-shrink-0"
        >
          Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1">
            <div className="w-12 h-12 bg-frogtown-800 rounded-full flex items-center justify-center font-bold text-white text-sm mb-2">
              {initials(otherName)}
            </div>
            <p className="text-sm font-semibold text-frogtown-900">{otherName}</p>
            <p className="text-xs text-muted-green">
              This is the start of your conversation. Say hello.
            </p>
          </div>
        )}
        {messages.map((message) => {
          const mine = message.sender_role === currentUserRole
          return (
            <div key={message.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  mine
                    ? 'bg-frogtown-800 text-white rounded-br-sm'
                    : 'bg-white border border-frogtown-200 text-black rounded-bl-sm'
                }`}
              >
                {message.body}
              </div>
              <span className="text-xs text-muted-green mt-1">{formatTimestamp(message.sent_at)}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-frogtown-200 px-4 py-3 flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${otherFirstName}...`}
          rows={1}
          className="flex-1 px-3.5 py-2.5 border-[1.5px] border-frogtown-200 rounded-2xl text-sm font-sans resize-none min-h-[40px] max-h-[120px] focus:border-frogtown-600 focus:outline-none text-frogtown-900"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="bg-frogtown-800 text-white rounded-2xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Send
        </button>
      </div>

      {reportOpen && <ReportModal threadId={thread.id} onClose={() => setReportOpen(false)} />}
    </div>
  )
}
