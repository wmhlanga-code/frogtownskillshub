'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Report } from '@/lib/types'

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

export default function ReportedCard({ report }: { report: Report }) {
  const router = useRouter()
  const [resolved, setResolved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleResolve() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/resolve`, { method: 'POST' })
      if (res.ok) {
        setResolved(true)
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  if (resolved) {
    return (
      <div className="bg-white border border-frogtown-200 rounded-xl p-4 text-sm text-muted-green">
        Resolved
      </div>
    )
  }

  return (
    <div className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 transition-shadow hover:shadow-md">
      <p className="text-xs text-muted-green">Reported {timeAgo(report.created_at)}</p>
      {report.reason && <p className="text-sm text-frogtown-900 mt-2">{report.reason}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleResolve}
          disabled={busy}
          className="bg-frogtown-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors hover:bg-frogtown-700 disabled:opacity-60 disabled:hover:bg-frogtown-800"
        >
          Mark resolved
        </button>
        <Link
          href={`/admin/reported/${report.thread_id}`}
          className="bg-white text-frogtown-800 border border-frogtown-200 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors hover:bg-frogtown-50"
        >
          View thread
        </Link>
      </div>
    </div>
  )
}
