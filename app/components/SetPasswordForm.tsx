'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetPasswordForm({ next }: { next: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingLink, setCheckingLink] = useState(true)
  const [linkValid, setLinkValid] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function checkSession() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      // The invite/reset link's tokens live in the URL fragment and are picked up
      // automatically by the browser client on init — getSession() awaits that.
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      setLinkValid(!!data.session)
      setCheckingLink(false)
    }
    checkSession()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      router.push(next)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (checkingLink) {
    return (
      <div className="bg-white rounded-xl border border-frogtown-200 max-w-sm mx-auto mt-20 p-8">
        <p className="text-sm text-muted-green">Verifying your link...</p>
      </div>
    )
  }

  if (!linkValid) {
    return (
      <div className="bg-white rounded-xl border border-frogtown-200 max-w-sm mx-auto mt-20 p-8">
        <h2 className="font-bold text-xl mb-2 text-frogtown-900">Link expired</h2>
        <p className="text-sm text-muted-green">
          This link is invalid or has expired. Request a new one from the sign-in page.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-frogtown-200 max-w-sm mx-auto mt-20 p-8">
      <h2 className="font-bold text-xl mb-2 text-frogtown-900">Set your password</h2>
      <p className="text-sm text-muted-green mb-4">Choose a password to finish setting up your account.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          required
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm mb-3 text-frogtown-900 focus:outline-none focus:border-frogtown-600"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm mb-4 text-frogtown-900 focus:outline-none focus:border-frogtown-600"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-frogtown-800 text-white w-full py-2.5 rounded-lg font-bold text-sm disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Set password'}
        </button>
      </form>
    </div>
  )
}
