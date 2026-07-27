'use client'

import { useEffect, useState } from 'react'
import { SKILL_CATEGORIES, SKILL_OPTIONS } from '@/lib/constants'

const ALL_LISTED_SKILLS = new Set(Object.values(SKILL_OPTIONS).flat())

export default function SkillsPicklist({
  selectedCategories,
  value,
  onChange,
}: {
  selectedCategories: string[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  const [otherDraft, setOtherDraft] = useState('')

  // Drop skills that belong to a category the user has since unchecked.
  // Custom (unlisted) skills are never auto-removed.
  useEffect(() => {
    const allowed = new Set(selectedCategories.flatMap((cat) => SKILL_OPTIONS[cat] ?? []))
    const pruned = value.filter((skill) => allowed.has(skill) || !ALL_LISTED_SKILLS.has(skill))
    if (pruned.length !== value.length) onChange(pruned)
  }, [selectedCategories, value, onChange])

  function toggleSkill(skill: string) {
    onChange(value.includes(skill) ? value.filter((s) => s !== skill) : [...value, skill])
  }

  function addOther() {
    const skill = otherDraft.trim()
    if (!skill || value.includes(skill)) {
      setOtherDraft('')
      return
    }
    onChange([...value, skill])
    setOtherDraft('')
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill))
  }

  const customSkills = value.filter((skill) => !ALL_LISTED_SKILLS.has(skill))

  return (
    <div>
      {selectedCategories.length === 0 && (
        <p className="text-xs text-muted-green">Select a category above to see specific skills.</p>
      )}

      {selectedCategories.map((catValue) => {
        const catDef = SKILL_CATEGORIES.find((c) => c.value === catValue)
        const options = SKILL_OPTIONS[catValue] ?? []
        if (!catDef || options.length === 0) return null

        return (
          <div key={catValue} className="mb-3">
            <p className="text-xs font-bold text-frogtown-700 uppercase tracking-wide mb-1.5">
              {catDef.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {options.map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm text-frogtown-900">
                  <input
                    type="checkbox"
                    checked={value.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
          </div>
        )
      })}

      <div className="mt-1">
        <label className="text-xs font-semibold text-frogtown-900">Other (please specify)</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={otherDraft}
            onChange={(e) => setOtherDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addOther()
              }
            }}
            placeholder="Something not on the list"
            className="flex-1 border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 placeholder:text-muted-green/60"
          />
          <button
            type="button"
            onClick={addOther}
            className="bg-frogtown-50 border border-frogtown-200 text-frogtown-800 text-sm font-semibold px-3 py-2 rounded-lg"
          >
            Add
          </button>
        </div>
        {customSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {customSkills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 bg-frogtown-50 border border-frogtown-200 text-frogtown-700 text-xs rounded-full pl-2.5 pr-1.5 py-0.5"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="text-muted-green hover:text-black font-bold leading-none px-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
