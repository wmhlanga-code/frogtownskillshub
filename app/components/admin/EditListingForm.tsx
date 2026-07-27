'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OffererFieldsForm, { type OffererFieldsValue } from './OffererFieldsForm'
import type { SkillOfferer } from '@/lib/types'

export default function EditListingForm({ offerer }: { offerer: SkillOfferer }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const initial: OffererFieldsValue = {
    full_name: '',
    display_name: offerer.display_name,
    email: offerer.email ?? '',
    quadrant: offerer.quadrant,
    cross_streets: offerer.cross_streets ?? '',
    skill_categories: offerer.skill_categories,
    skills: offerer.skills ?? [],
    languages: offerer.languages,
    bio: offerer.bio ?? '',
    active: offerer.active,
  }

  async function handleSubmit(value: OffererFieldsValue) {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/listings/${offerer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to save changes.')
        return
      }
      router.push('/admin/listings')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OffererFieldsForm
      initial={initial}
      showFullName={false}
      showActiveToggle
      submitLabel="Save changes"
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/listings')}
    />
  )
}
