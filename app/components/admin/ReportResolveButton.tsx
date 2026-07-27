'use client'

import { useState } from 'react'

export default function ReportResolveButton({ reportId }: { reportId: string }) {
  const [resolved, setResolved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleResolve() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, { method: 'POST' })
      if (res.ok) setResolved(true)
    } finally {
      setBusy(false)
    }
  }

  if (resolved) {
    return <span className="text-xs text-muted-green">Resolved</span>
  }

  return (
    <button
      onClick={handleResolve}
      disabled={busy}
      className="bg-frogtown-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md disabled:opacity-60"
    >
      Mark resolved
    </button>
  )
}
