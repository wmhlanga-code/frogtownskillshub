'use client'

import { useState } from 'react'

export default function ForgotPasswordForm({ next }: { next: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/account/set-password?next=${encodeURIComponent(next)}`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

      if (resetError) {
        setError(resetError.message)
        return
      }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-frogtown-200 max-w-sm mx-auto mt-20 p-8">
      <h2 className="font-bold text-xl mb-2 text-frogtown-900">Reset your password</h2>

      {sent ? (
        <p className="text-sm text-frogtown-700">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-muted-green mb-4">
            Enter your email and we&rsquo;ll send you a link to set a new password.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm mb-4 text-frogtown-900 focus:outline-none focus:border-frogtown-600"
          />

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-frogtown-800 text-white w-full py-2.5 rounded-lg font-bold text-sm disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  )
}
