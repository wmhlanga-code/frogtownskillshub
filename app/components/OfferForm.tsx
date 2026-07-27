'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'
import { QUADRANT_GRID, QUADRANT_COMPASS } from '@/lib/quadrants'
import { LANGUAGES, SKILL_CATEGORIES } from '@/lib/constants'
import NeighborhoodMap from './NeighborhoodMap'
import SkillsPicklist from './SkillsPicklist'
import CrossStreetSelect from './CrossStreetSelect'

const BIO_MAX = 200

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-extrabold uppercase tracking-widest text-frogtown-700 border-b-2 border-frogtown-200 pb-1.5 mb-3">
      {children}
    </h2>
  )
}

export default function OfferForm() {
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [quadrant, setQuadrant] = useState<Quadrant | null>(null)
  const [crossStreets, setCrossStreets] = useState('')
  const [skillCategories, setSkillCategories] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [consentReview, setConsentReview] = useState(false)
  const [consentPublic, setConsentPublic] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function toggleFromList(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!displayName.trim()) nextErrors.displayName = 'Display name is required.'
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (languages.length === 0) nextErrors.languages = 'Select at least one language.'
    if (!quadrant) nextErrors.quadrant = 'Select your quadrant.'
    if (skillCategories.length === 0) nextErrors.skillCategories = 'Select at least one skill category.'
    if (!consentReview) nextErrors.consentReview = 'Required to submit.'
    if (!consentPublic) nextErrors.consentPublic = 'Required to submit.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(false)
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          display_name: displayName,
          email,
          languages,
          quadrant,
          cross_streets: crossStreets || undefined,
          skill_categories: skillCategories,
          skills: skills.length > 0 ? skills : undefined,
          bio: bio || undefined,
          consent_review: consentReview,
          consent_public: consentPublic,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitted(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-8 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-frogtown-50 border border-frogtown-200 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-frogtown-700">
              <path
                d="m5 13 4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-frogtown-900 font-bold">Submission received</p>
          <p className="text-sm text-muted-green mt-2 max-w-sm">
            A community admin will review it shortly. You&rsquo;ll be notified by email once it&rsquo;s
            approved.
          </p>
        </div>
      </div>
    )
  }

  const bioRemaining = BIO_MAX - bio.length

  const inputClasses =
    'w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 placeholder:text-muted-green/60 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-5 py-8 sm:py-10 flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>About you</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-frogtown-900">Your full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
            />
            <p className="text-xs text-muted-green mt-1">Stored privately — only admins see this</p>
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maria V."
              className={inputClasses}
            />
            <p className="text-xs text-muted-green mt-1">First name and last initial recommended</p>
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
            <p className="text-xs text-muted-green mt-1">Private — used only to notify you when approved</p>
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
        </div>
      </div>

      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>Your location</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-frogtown-900">Which quadrant are you in?</span>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs text-frogtown-600 font-semibold hover:text-frogtown-800 transition-colors"
              >
                {showMap ? 'Hide map' : 'View map'}
              </button>
            </div>
            {showMap && <NeighborhoodMap className="mb-3" />}
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

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Cross streets</label>
            <div className="mt-1">
              <CrossStreetSelect value={crossStreets} onChange={setCrossStreets} />
            </div>
            <p className="text-xs text-muted-green mt-1">
              Helps neighbors find you without sharing your exact address
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>Your skills</SectionTitle>
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
            <label className="text-sm font-semibold text-frogtown-900">Specific skills (optional)</label>
            <p className="text-xs text-muted-green mt-0.5 mb-1">
              Pick the specific things you can help with within your selected categories.
            </p>
            <SkillsPicklist
              selectedCategories={skillCategories}
              value={skills}
              onChange={setSkills}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              maxLength={BIO_MAX}
              className={`${inputClasses} resize-none`}
              rows={4}
            />
            <p className={`text-xs mt-1 ${bioRemaining < 20 ? 'text-red-600' : 'text-muted-green'}`}>
              {bioRemaining} characters remaining
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-frogtown-200 shadow-sm p-5 sm:p-6">
        <SectionTitle>Consent</SectionTitle>
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-2 text-sm text-frogtown-900">
            <input
              type="checkbox"
              checked={consentReview}
              onChange={(e) => setConsentReview(e.target.checked)}
              className="mt-1"
            />
            I understand my submission will be reviewed by a community admin before appearing publicly.
          </label>
          {errors.consentReview && <p className="text-xs text-red-600">{errors.consentReview}</p>}

          <label className="flex items-start gap-2 text-sm text-frogtown-900">
            <input
              type="checkbox"
              checked={consentPublic}
              onChange={(e) => setConsentPublic(e.target.checked)}
              className="mt-1"
            />
            I agree that my display name and quadrant will be shown publicly. My full name and contact
            information will remain private.
          </label>
          {errors.consentPublic && <p className="text-xs text-red-600">{errors.consentPublic}</p>}
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-frogtown-800 text-white w-full py-3 font-bold rounded-lg shadow-sm transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100"
      >
        {submitting ? 'Submitting...' : 'Submit for review'}
      </button>
    </form>
  )
}
