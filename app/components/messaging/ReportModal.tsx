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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
        {submitted ? (
          <p className="text-sm text-frogtown-900">
            Thank you. The admin team has been notified.
          </p>
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
              className="border border-frogtown-200 rounded-lg p-2.5 w-full text-sm mb-4 text-frogtown-900"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="border border-frogtown-200 rounded-md px-4 py-2 text-sm text-frogtown-900"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={submitting}
                className="bg-frogtown-800 text-white rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
