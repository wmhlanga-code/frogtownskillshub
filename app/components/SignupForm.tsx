'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!name.trim()) return 'Name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirmPassword) return 'Passwords do not match.'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNotice('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (!data.user) {
        setError('Something went wrong. Please try again.')
        return
      }

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.user.id, name, email }),
      })

      if (!data.session) {
        setNotice('Check your email to confirm your account, then sign in.')
        return
      }

      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-frogtown-200 max-w-sm mx-auto mt-20 p-8">
      <h2 className="font-bold text-xl mb-2 text-frogtown-900">Create an account</h2>
      <p className="text-sm text-muted-green mb-4">
        Join the Frogtown Skills directory to connect with your neighbors.
      </p>

      {notice ? (
        <p className="text-sm text-frogtown-700">{notice}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm mb-3 text-frogtown-900 focus:outline-none focus:border-frogtown-600"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm mb-3 text-frogtown-900 focus:outline-none focus:border-frogtown-600"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}

      <p className="text-sm text-frogtown-700 text-center mt-4">
        Already have an account? <Link href="/login" className="font-semibold underline">Sign in</Link>
      </p>
    </div>
  )
}
