'use client'

import { useState } from 'react'
import type { Admin, AboutTeamMember, SiteSettings } from '@/lib/types'

const FIELD_CLASSES =
  'border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100'
const BUTTON_CLASSES =
  'bg-frogtown-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100'

function AccountSection({ admin }: { admin: Admin }) {
  const [name, setName] = useState(admin.name)
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setNameMessage('')
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      setNameMessage(res.ok ? 'Saved.' : 'Failed to save.')
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setPasswordError(error.message)
        return
      }
      setPasswordMessage('Password updated.')
      setPassword('')
      setConfirmPassword('')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 mb-6">
      <h2 className="text-sm font-bold text-frogtown-900 mb-3">Your account</h2>

      <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end mb-5">
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-green">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full mt-1 ${FIELD_CLASSES}`}
          />
        </div>
        <button
          type="submit"
          disabled={savingName}
          className={BUTTON_CLASSES}
        >
          {savingName ? 'Saving...' : 'Save name'}
        </button>
        {nameMessage && <p className="text-xs text-muted-green sm:ml-2">{nameMessage}</p>}
      </form>

      <div className="text-xs text-muted-green mb-5 flex gap-4">
        <span>Email: {admin.email}</span>
        <span>Role: {admin.role === 'super_admin' ? 'Super admin' : 'Admin'}</span>
      </div>

      <form onSubmit={handleChangePassword} className="border-t border-frogtown-100 pt-4">
        <p className="text-xs font-semibold text-muted-green mb-2">Change password</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className={`flex-1 ${FIELD_CLASSES}`}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className={`flex-1 ${FIELD_CLASSES}`}
          />
        </div>
        {passwordError && <p className="text-xs text-red-600 mb-2">{passwordError}</p>}
        {passwordMessage && <p className="text-xs text-muted-green mb-2">{passwordMessage}</p>}
        <button
          type="submit"
          disabled={savingPassword}
          className={BUTTON_CLASSES}
        >
          {savingPassword ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}

function PlatformSection({ settings }: { settings: SiteSettings }) {
  const [heroHeading, setHeroHeading] = useState(settings.hero_heading ?? '')
  const [heroSubheading, setHeroSubheading] = useState(settings.hero_subheading ?? '')
  const [contactEmail, setContactEmail] = useState(settings.contact_email ?? '')
  const [aboutTeam, setAboutTeam] = useState<AboutTeamMember[]>(settings.about_team ?? [])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function updateTeamMember(index: number, field: keyof AboutTeamMember, value: string) {
    setAboutTeam((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  function addTeamMember() {
    setAboutTeam((prev) => [...prev, { name: '', role: '' }])
  }

  function removeTeamMember(index: number) {
    setAboutTeam((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_heading: heroHeading || undefined,
          hero_subheading: heroSubheading || undefined,
          contact_email: contactEmail || undefined,
          about_team: aboutTeam.filter((m) => m.name.trim() || m.role.trim()),
        }),
      })
      setMessage(res.ok ? 'Saved.' : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4">
      <h2 className="text-sm font-bold text-frogtown-900 mb-3">Platform content</h2>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-green">Homepage hero heading</label>
          <input
            type="text"
            value={heroHeading}
            onChange={(e) => setHeroHeading(e.target.value)}
            placeholder="Find a neighbor with the skills you need."
            className={`w-full mt-1 ${FIELD_CLASSES}`}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-green">Homepage hero subheading</label>
          <input
            type="text"
            value={heroSubheading}
            onChange={(e) => setHeroSubheading(e.target.value)}
            placeholder="Trusted, local, Frogtown."
            className={`w-full mt-1 ${FIELD_CLASSES}`}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-green">Contact email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="team@frogtownskills.org"
            className={`w-full mt-1 ${FIELD_CLASSES}`}
          />
          <p className="text-xs text-muted-green mt-1">
            Used for the &ldquo;Contact the admin team&rdquo; button on the About page.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-green">
              About page &ldquo;Who runs this&rdquo; list
            </label>
            <button
              type="button"
              onClick={addTeamMember}
              className="text-xs text-frogtown-700 font-semibold transition-colors hover:text-frogtown-900"
            >
              + Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {aboutTeam.map((member, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateTeamMember(i, 'name', e.target.value)}
                  placeholder="Name"
                  className={`flex-1 ${FIELD_CLASSES}`}
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => updateTeamMember(i, 'role', e.target.value)}
                  placeholder="Role"
                  className={`flex-1 ${FIELD_CLASSES}`}
                />
                <button
                  type="button"
                  onClick={() => removeTeamMember(i)}
                  aria-label="Remove"
                  className="text-muted-green hover:text-red-600 font-bold px-2 transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
            {aboutTeam.length === 0 && (
              <p className="text-xs text-muted-green">No team members added yet.</p>
            )}
          </div>
        </div>

        {message && <p className="text-xs text-muted-green">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={saving}
            className={BUTTON_CLASSES}
          >
            {saving ? 'Saving...' : 'Save platform settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function SettingsClient({
  admin,
  settings,
}: {
  admin: Admin
  settings: SiteSettings
}) {
  return (
    <div>
      <AccountSection admin={admin} />
      <PlatformSection settings={settings} />
    </div>
  )
}
