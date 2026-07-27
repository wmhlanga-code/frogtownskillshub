'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OffererFieldsForm, { type OffererFieldsValue } from './OffererFieldsForm'
import type { Submission } from '@/lib/types'

export default function EditSubmissionForm({ submission }: { submission: Submission }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const initial: OffererFieldsValue = {
    full_name: submission.full_name,
    display_name: submission.display_name,
    email: submission.email,
    quadrant: submission.quadrant,
    cross_streets: submission.cross_streets ?? '',
    skill_categories: submission.skill_categories,
    skills: submission.skills ?? [],
    languages: submission.languages,
    bio: submission.bio ?? '',
    active: true,
  }

  async function handleSubmit(value: OffererFieldsValue) {
    setSubmitting(true)
    setError('')
    try {
      const patchRes = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      })
      if (!patchRes.ok) {
        const data = await patchRes.json().catch(() => ({}))
        setError(data.error ?? 'Failed to save changes.')
        return
      }

      const approveRes = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
        method: 'POST',
      })
      if (!approveRes.ok) {
        const data = await approveRes.json().catch(() => ({}))
        setError(data.error ?? 'Saved, but failed to approve.')
        return
      }

      router.push('/admin/pending')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OffererFieldsForm
      initial={initial}
      showFullName
      showActiveToggle={false}
      submitLabel="Save and approve"
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/pending')}
    />
  )
}
