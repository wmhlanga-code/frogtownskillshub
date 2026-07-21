'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'
import { QUADRANT_GRID, QUADRANT_COMPASS } from '@/lib/quadrants'
import NeighborhoodMap from './NeighborhoodMap'

const LANGUAGES = ['English', 'Spanish', 'Hmong', 'Somali', 'Other']
const SKILL_CATEGORIES = [
  { value: 'Practical', label: 'Practical / Hands-On' },
  { value: 'Knowledge', label: 'Professional / Knowledge' },
  { value: 'Care', label: 'Care and Community' },
  { value: 'Emergency', label: 'Emergency / Resilience' },
  { value: 'Social', label: 'Social and Cultural' },
]
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
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <p className="text-frogtown-800 font-semibold">
          Your submission has been received. A community admin will review it shortly.
        </p>
      </div>
    )
  }

  const bioRemaining = BIO_MAX - bio.length

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8">
      <div>
        <SectionTitle>About you</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-frogtown-900">Your full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 placeholder:text-muted-green/60"
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
              className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 placeholder:text-muted-green/60"
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
              className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 placeholder:text-muted-green/60"
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

      <div>
        <SectionTitle>Your location</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-frogtown-900">Which quadrant are you in?</span>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs text-frogtown-600 font-semibold"
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
            {errors.quadrant && <p className="text-xs text-red-600 mt-1">{errors.quadrant}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-frogtown-900">Cross streets</label>
            <input
              type="text"
              value={crossStreets}
              onChange={(e) => setCrossStreets(e.target.value)}
              className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 placeholder:text-muted-green/60"
            />
            <p className="text-xs text-muted-green mt-1">
              Helps neighbors find you without sharing your exact address
            </p>
          </div>
        </div>
      </div>

      <div>
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
            <label className="text-sm font-semibold text-frogtown-900">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              maxLength={BIO_MAX}
              className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-1 text-frogtown-900 placeholder:text-muted-green/60"
              rows={4}
            />
            <p className={`text-xs mt-1 ${bioRemaining < 20 ? 'text-red-600' : 'text-muted-green'}`}>
              {bioRemaining} characters remaining
            </p>
          </div>
        </div>
      </div>

      <div>
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
        className="bg-frogtown-800 text-white w-full py-3 font-bold rounded-lg disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit for review'}
      </button>
    </form>
  )
}
