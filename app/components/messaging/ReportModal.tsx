'use client'

import { useState } from 'react'

export default function ReportModal({
  threadId,
  onClose,
}: {
  threadId: string
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleReport() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, reason: reason || undefined }),
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(onClose, 2000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-message-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        {submitted ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-frogtown-50 border border-frogtown-200 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-frogtown-700">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-frogtown-900">Thank you. The admin team has been notified.</p>
          </div>
        ) : (
          <>
            <h2 className="font-bold text-base mb-2 text-frogtown-900">Report this conversation</h2>
            <p className="text-sm text-muted-green mb-4">
              Flag this conversation for admin review. Use this for safety concerns only.
            </p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your concern (optional)"
              rows={3}
              className="border border-frogtown-200 rounded-lg p-2.5 w-full text-sm mb-4 text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="border border-frogtown-200 rounded-lg px-4 py-2 text-sm text-frogtown-900 transition-colors hover:bg-frogtown-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={submitting}
                className="bg-frogtown-800 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-frogtown-700 disabled:opacity-60 disabled:hover:bg-frogtown-800"
              >
                {submitting ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
