'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
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

      router.push('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const fieldClasses =
    'w-full border border-frogtown-200 rounded-lg px-3 py-2.5 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100'

  return (
    <div className="min-h-screen bg-gradient-to-br from-frogtown-900 via-frogtown-800 to-frogtown-700 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-white font-bold text-lg">
            Frogtown <span className="text-frogtown-400">Skills</span>
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border border-white/10 p-8">
          <h2 className="font-bold text-xl mb-1 text-frogtown-900">Admin login</h2>
          <p className="text-sm text-muted-green mb-6">Sign in to manage the directory.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={fieldClasses}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={fieldClasses}
            />
            <Link
              href="/forgot-password?next=/admin"
              className="text-xs text-frogtown-700 font-semibold hover:text-frogtown-900 transition-colors -mt-1"
            >
              Forgot password?
            </Link>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-frogtown-800 text-white w-full py-2.5 rounded-lg font-bold text-sm mt-2 transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
