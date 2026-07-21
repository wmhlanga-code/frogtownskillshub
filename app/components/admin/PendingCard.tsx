'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Submission } from '@/lib/types'

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function PendingCard({ submission }: { submission: Submission }) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'removed'>('pending')
  const [rejecting, setRejecting] = useState(false)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const isRecent = Date.now() - new Date(submission.submitted_at).getTime() < 60 * 60 * 1000

  async function handleApprove() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/approve`, { method: 'POST' })
      if (res.ok) setStatus('approved')
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || undefined }),
      })
      if (res.ok) setStatus('rejected')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'approved' || status === 'rejected') {
    return (
      <div className="bg-white border border-frogtown-200 rounded-lg p-4 text-sm text-muted-green">
        {status === 'approved' ? 'Approved' : 'Rejected'} — {submission.full_name}
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-frogtown-200 rounded-lg p-4 ${
        isRecent ? 'border-l-4 border-l-frogtown-700' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-frogtown-900">{submission.full_name}</span>
        <span className="text-xs text-muted-green">{timeAgo(submission.submitted_at)}</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {submission.skill_categories.map((tag) => (
          <span
            key={tag}
            className="bg-frogtown-50 border border-frogtown-200 text-frogtown-700 text-xs rounded-full px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs text-muted-green flex gap-3 flex-wrap mt-2">
        <span>Quadrant: {submission.quadrant}</span>
        <span>Languages: {submission.languages.join(', ')}</span>
        {submission.cross_streets && <span>{submission.cross_streets}</span>}
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <button
          onClick={handleApprove}
          disabled={busy}
          className="bg-frogtown-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md disabled:opacity-60"
        >
          Approve
        </button>
        <Link
          href={`/admin/pending/${submission.id}/edit`}
          className="bg-frogtown-50 text-frogtown-800 border border-frogtown-400 text-xs font-semibold px-3 py-1.5 rounded-md"
        >
          Edit then approve
        </Link>
        <button
          onClick={() => setRejecting(!rejecting)}
          className="bg-white text-black border border-frogtown-200 text-xs font-semibold px-3 py-1.5 rounded-md hover:border-black"
        >
          Reject
        </button>
      </div>

      {rejecting && (
        <div className="mt-3 border-t border-frogtown-100 pt-3">
          <p className="text-xs text-frogtown-900 mb-2">
            Reject this submission? The person will not be notified.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
            rows={2}
            className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={busy}
              className="bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md disabled:opacity-60"
            >
              Confirm reject
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="bg-white text-frogtown-900 border border-frogtown-200 text-xs font-semibold px-3 py-1.5 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
