'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

function initials(name?: string, email?: string) {
  const source = name?.trim() || email || ''
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function NavAuthClient({
  signedIn,
  name,
  email,
  unreadCount,
}: {
  signedIn: boolean
  name?: string
  email?: string
  unreadCount?: number
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!signedIn) {
    return (
      <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-full text-frogtown-200/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="text-sm font-semibold px-4 py-2 rounded-full bg-frogtown-400 text-frogtown-900 hover:bg-frogtown-200 transition-colors duration-150"
        >
          Create account
        </Link>
      </div>
    )
  }

  const isMessagesActive = pathname.startsWith('/messages')

  return (
    <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
      <Link
        href="/messages"
        aria-label="Messages"
        title="Messages"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ${
          isMessagesActive
            ? 'bg-frogtown-700 text-white'
            : 'text-frogtown-200/80 hover:text-white hover:bg-white/10'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M12 4C7.03 4 3 7.36 3 11.5c0 2.3 1.26 4.36 3.25 5.73-.1.98-.42 2.16-1.19 3.27a.4.4 0 0 0 .43.62c1.6-.4 3.06-1.13 4.1-1.76.75.16 1.55.24 2.41.24 4.97 0 9-3.36 9-7.5S16.97 4 12 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {!!unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-extrabold bg-red-500 text-white rounded-full min-w-[16px] h-4 px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-frogtown-400/20 text-frogtown-400 font-bold text-xs hover:bg-frogtown-400/30 transition-colors duration-150"
        >
          {initials(name, email)}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 w-56 bg-white rounded-lg border border-frogtown-200 shadow-lg py-2 text-left z-50">
            <div className="px-4 py-2 border-b border-frogtown-100">
              <p className="text-sm font-semibold text-frogtown-900 truncate">{name ?? 'Neighbor'}</p>
              {email && <p className="text-xs text-muted-green truncate">{email}</p>}
            </div>
            <Link
              href="/messages"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-frogtown-900 hover:bg-frogtown-50"
            >
              Messages
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-frogtown-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
