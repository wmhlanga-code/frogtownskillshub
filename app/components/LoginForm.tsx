'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Invalid email or password')
        return
      }

      router.push(redirectTo)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-frogtown-200 max-w-sm mx-auto mt-20 p-8">
      <h2 className="font-bold text-xl mb-2 text-frogtown-900">Sign in to message neighbors</h2>
      <p className="text-sm text-muted-green mb-4">
        You need an account to send messages. It only takes a moment.
      </p>

      <form onSubmit={handleSubmit}>
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
          placeholder="Password"
          required
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm mb-4 text-frogtown-900 focus:outline-none focus:border-frogtown-600"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-frogtown-800 text-white w-full py-2.5 rounded-lg font-bold text-sm disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-frogtown-200" />
        <span className="text-xs text-muted-green">or</span>
        <div className="flex-1 h-px bg-frogtown-200" />
      </div>

      <Link href="/signup" className="block text-sm text-frogtown-700 font-semibold text-center">
        Create an account
      </Link>

      <p className="text-xs text-muted-green text-center mt-6">
        Admins sign in <Link href="/admin/login" className="underline">here</Link>.
      </p>
    </div>
  )
}
