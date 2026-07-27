'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'
import { QUADRANT_GRID, QUADRANT_COMPASS } from '@/lib/quadrants'
import { LANGUAGES, SKILL_CATEGORIES } from '@/lib/constants'
import NeighborhoodMap from '../NeighborhoodMap'
import SkillsPicklist from '../SkillsPicklist'
import CrossStreetSelect from '../CrossStreetSelect'

const BIO_MAX = 200

export type OffererFieldsValue = {
  full_name: string
  display_name: string
  email: string
  quadrant: Quadrant | null
  cross_streets: string
  skill_categories: string[]
  skills: string[]
  languages: string[]
  bio: string
  active: boolean
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-extrabold uppercase tracking-widest text-frogtown-700 border-b-2 border-frogtown-200 pb-1.5 mb-3">
      {children}
    </h2>
  )
}

export default function OffererFieldsForm({
  initial,
  showFullName,
  showActiveToggle,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  initial: OffererFieldsValue
  showFullName: boolean
  showActiveToggle: boolean
  submitLabel: string
  submitting: boolean
  error?: string
  onSubmit: (value: OffererFieldsValue) => void
  onCancel?: () => void
}) {
  const [fullName, setFullName] = useState(initial.full_name)
  const [displayName, setDisplayName] = useState(initial.display_name)
  const [email, setEmail] = useState(initial.email)
  const [quadrant, setQuadrant] = useState<Quadrant | null>(initial.quadrant)
  const [crossStreets, setCrossStreets] = useState(initial.cross_streets)
  const [skillCategories, setSkillCategories] = useState<string[]>(initial.skill_categories)
  const [skills, setSkills] = useState<string[]>(initial.skills)
  const [languages, setLanguages] = useState<string[]>(initial.languages)
  const [bio, setBio] = useState(initial.bio)
  const [active, setActive] = useState(initial.active)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleFromList(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (showFullName && !fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!displayName.trim()) nextErrors.displayName = 'Display name is required.'
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!quadrant) nextErrors.quadrant = 'Select a quadrant.'
    if (languages.length === 0) nextErrors.languages = 'Select at least one language.'
    if (skillCategories.length === 0) nextErrors.skillCategories = 'Select at least one skill category.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      full_name: fullName,
      display_name: displayName,
      email,
      quadrant,
      cross_streets: crossStreets,
      skill_categories: skillCategories,
      skills,
      languages,
      bio,
      active,
    })
  }

  const bioRemaining = BIO_MAX - bio.length
  const inputClasses =
    'w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>About</SectionTitle>
        <div className="flex flex-col gap-4">
          {showFullName && (
            <div>
              <label className="text-sm font-semibold text-frogtown-900">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClasses}
            />
            {errors.displayName && <p className="text-xs text-red-600 mt-1">{errors.displayName}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Languages</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center gap-2 text-sm text-frogtown-900">
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={() => toggleFromList(languages, lang, setLanguages)}
                  />
                  {lang}
                </label>
              ))}
            </div>
            {errors.languages && <p className="text-xs text-red-600 mt-1">{errors.languages}</p>}
          </div>

          {showActiveToggle && (
            <label className="flex items-center gap-2 text-sm text-frogtown-900">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Active (visible in directory)
            </label>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>Location</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <div className="grid grid-cols-4 gap-2">
              {QUADRANT_GRID.flat().map((code, i) => {
                if (!code) return <div key={`empty-${i}`} />
                const selected = quadrant === code
                return (
                  <button
                    type="button"
                    key={code}
                    onClick={() => setQuadrant(selected ? null : code)}
                    className={`rounded-lg p-3 text-center transition-colors ${
                      selected
                        ? 'bg-frogtown-800 text-white'
                        : 'bg-frogtown-50 border border-frogtown-200 text-frogtown-800 hover:border-frogtown-400'
                    }`}
                  >
                    <div className="font-bold">{code}</div>
                    <div className="text-xs">{QUADRANT_COMPASS[code]}</div>
                  </button>
                )
              })}
            </div>
            {errors.quadrant && <p className="text-xs text-red-600 mt-1">{errors.quadrant}</p>}
          </div>
          <NeighborhoodMap />
          <div>
            <label className="text-sm font-semibold text-frogtown-900">Cross streets</label>
            <div className="mt-1">
              <CrossStreetSelect value={crossStreets} onChange={setCrossStreets} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>Skills</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-col gap-2">
              {SKILL_CATEGORIES.map((cat) => (
                <label key={cat.value} className="flex items-center gap-2 text-sm text-frogtown-900">
                  <input
                    type="checkbox"
                    checked={skillCategories.includes(cat.value)}
                    onChange={() => toggleFromList(skillCategories, cat.value, setSkillCategories)}
                  />
                  {cat.label}
                </label>
              ))}
            </div>
            {errors.skillCategories && <p className="text-xs text-red-600 mt-1">{errors.skillCategories}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Specific skills</label>
            <div className="mt-1">
              <SkillsPicklist selectedCategories={skillCategories} value={skills} onChange={setSkills} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              maxLength={BIO_MAX}
              rows={4}
              className={`${inputClasses} resize-none`}
            />
            <p className={`text-xs mt-1 ${bioRemaining < 20 ? 'text-red-600' : 'text-muted-green'}`}>
              {bioRemaining} characters remaining
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-frogtown-800 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-frogtown-200 text-frogtown-900 font-semibold px-4 py-2.5 rounded-lg transition-colors hover:bg-frogtown-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
