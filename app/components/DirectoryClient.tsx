'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { NewsPost, Quadrant, SkillOfferer } from '@/lib/types'
import { QUADRANT_GRID, QUADRANT_COMPASS } from '@/lib/quadrants'
import NeighborhoodMap from './NeighborhoodMap'
import NewsStrip from './NewsStrip'

const CATEGORIES = ['Practical', 'Knowledge', 'Care', 'Emergency', 'Social']

export default function DirectoryClient({
  offerers,
  newsPosts,
}: {
  offerers: SkillOfferer[]
  newsPosts: NewsPost[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [quadrant, setQuadrant] = useState<Quadrant | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [messagingId, setMessagingId] = useState<string | null>(null)

  async function handleMessage(offererId: string) {
    setMessagingId(offererId)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/messages')
        return
      }

      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerer_id: offererId }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/messages/${data.thread_id}`)
      }
    } finally {
      setMessagingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return offerers.filter((offerer) => {
      if (category && !offerer.skill_categories.includes(category)) return false
      if (quadrant && offerer.quadrant !== quadrant) return false
      if (q) {
        const haystack = [
          offerer.display_name,
          offerer.skill_categories.join(' '),
          (offerer.skills ?? []).join(' '),
          offerer.languages.join(' '),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [offerers, search, category, quadrant])

  return (
    <div>
      {/* -mt must equal HeroBanner's reserved bottom gap exactly — see HeroBanner.tsx */}
      <div className="relative z-20 -mt-60 sm:-mt-56 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-frogtown-100 p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-frogtown-600 mb-2">
            Find help near you
          </p>
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-green"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or language"
              className="w-full border border-frogtown-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-frogtown-900 placeholder:text-muted-green/60 focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3.5">
            <button
              onClick={() => setCategory(null)}
              className={`text-xs px-3 py-1.5 rounded-full ${
                category === null
                  ? 'bg-frogtown-800 text-white'
                  : 'bg-white border border-frogtown-200 text-frogtown-700'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={`text-xs px-3 py-1.5 rounded-full ${
                  category === c
                    ? 'bg-frogtown-800 text-white'
                    : 'bg-white border border-frogtown-200 text-frogtown-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-4">
        <NewsStrip posts={newsPosts} />

        <div
          onClick={() => setMapOpen(!mapOpen)}
          className="bg-white border-b border-frogtown-200 cursor-pointer flex items-center justify-between px-4 py-2"
        >
          <span className="text-sm text-frogtown-800">Filter by quadrant</span>
          <span className="text-xs text-frogtown-600 font-semibold">
            {mapOpen ? 'Close map' : 'Open map'}
          </span>
        </div>

        {mapOpen && (
          <div className="bg-white border-b border-frogtown-200 p-4">
            <p className="text-xs text-muted-green mb-3">Select a quadrant to filter results.</p>
            <NeighborhoodMap className="mb-3" />
            <div className="grid grid-cols-4 gap-2">
              {QUADRANT_GRID.flat().map((code, i) => {
                if (!code) return <div key={`empty-${i}`} />
                const selected = quadrant === code
                return (
                  <button
                    key={code}
                    onClick={() => setQuadrant(selected ? null : code)}
                    className={`rounded-lg p-3 text-center ${
                      selected
                        ? 'bg-frogtown-800 text-white'
                        : 'bg-frogtown-50 border border-frogtown-200 text-frogtown-800'
                    }`}
                  >
                    <div className="font-bold">{code}</div>
                    <div className="text-xs">{QUADRANT_COMPASS[code]}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-muted-green text-sm">{filtered.length} neighbors available</span>
          <Link
            href="/offer"
            className="bg-frogtown-700 text-white text-sm font-bold px-3 py-1.5 rounded"
          >
            + Offer your skills
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-muted-green py-10 px-4">
            <p>No neighbors found matching your search.</p>
            <Link href="/offer" className="text-frogtown-700 font-semibold underline">
              Want to offer your skills?
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 pb-24">
            {filtered.map((offerer) => (
              <div
                key={offerer.id}
                className="bg-white rounded-lg border border-frogtown-200 p-4 hover:border-frogtown-600 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">{offerer.display_name}</span>
                  <span className="bg-frogtown-800 text-white text-xs font-extrabold px-2 py-0.5 rounded">
                    {offerer.quadrant}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {offerer.skill_categories.map((tag) => (
                    <span
                      key={tag}
                      className="bg-frogtown-50 border border-frogtown-200 text-frogtown-700 text-xs rounded-full px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {offerer.skills && offerer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {offerer.skills.map((skill) => (
                      <span key={skill} className="text-xs text-frogtown-700">
                        #{skill}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-green mt-2 flex flex-col gap-0.5">
                  <span>Languages: {offerer.languages.join(', ')}</span>
                  {offerer.cross_streets && <span>Near {offerer.cross_streets}</span>}
                </div>
                <button
                  onClick={() => handleMessage(offerer.id)}
                  disabled={messagingId === offerer.id}
                  className="block text-center w-full bg-black text-white mt-3 py-2 rounded disabled:opacity-60"
                >
                  {messagingId === offerer.id
                    ? 'Starting...'
                    : `Message ${offerer.display_name.split(' ')[0]}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
