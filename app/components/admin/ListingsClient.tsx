'use client'

import { useMemo, useState } from 'react'
import type { SkillOfferer } from '@/lib/types'

export default function ListingsClient({ offerers }: { offerers: SkillOfferer[] }) {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(offerers)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (offerer) =>
        offerer.display_name.toLowerCase().includes(q) ||
        offerer.quadrant.toLowerCase().includes(q)
    )
  }, [items, search])

  async function handleToggleActive(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}/deactivate`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, active: data.active } : item))
        )
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or quadrant"
        className="w-full max-w-sm border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-4"
      />

      <div className="bg-white border border-frogtown-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide text-muted-green border-b border-frogtown-200">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Quadrant</th>
              <th className="px-3 py-2">Skills</th>
              <th className="px-3 py-2">Languages</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((offerer) => (
              <tr key={offerer.id} className="text-sm border-b border-frogtown-100">
                <td className="px-3 py-3 text-frogtown-900">{offerer.display_name}</td>
                <td className="px-3 py-3 text-frogtown-900">{offerer.quadrant}</td>
                <td className="px-3 py-3 text-frogtown-900">{offerer.skill_categories.join(', ')}</td>
                <td className="px-3 py-3 text-frogtown-900">{offerer.languages.join(', ')}</td>
                <td className="px-3 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      offerer.active
                        ? 'bg-frogtown-100 text-frogtown-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {offerer.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-3">
                    <button className="text-xs text-frogtown-700 font-semibold">Edit</button>
                    <button
                      onClick={() => handleToggleActive(offerer.id)}
                      disabled={busyId === offerer.id}
                      className="text-xs text-black font-semibold disabled:opacity-60"
                    >
                      {offerer.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
