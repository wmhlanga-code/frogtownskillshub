'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Directory' },
  { href: '/offer', label: 'Offer Skills' },
  { href: '/#about', label: 'About' },
]

export default function MobileNav({
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
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="md:hidden flex items-center gap-1" ref={rootRef}>
      {signedIn && (
        <Link
          href="/messages"
          aria-label="Messages"
          className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 ${
            pathname.startsWith('/messages')
              ? 'bg-gradient-to-br from-frogtown-700 to-frogtown-600 text-white shadow-sm'
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
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-frogtown-200/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          {open ? (
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="animate-message-in absolute left-0 right-0 top-14 bg-gradient-to-b from-frogtown-900 to-frogtown-800 border-t border-frogtown-800 shadow-lg py-2 flex flex-col z-50">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mx-2 my-0.5 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150 ${
                pathname === link.href
                  ? 'bg-gradient-to-r from-frogtown-700 to-frogtown-600 text-white shadow-sm'
                  : 'text-frogtown-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-white/10 mt-1 pt-2">
            {signedIn ? (
              <>
                <div className="px-5 py-2">
                  <p className="text-sm font-semibold text-white truncate">{name ?? 'Neighbor'}</p>
                  {email && <p className="text-xs text-frogtown-200/70 truncate">{email}</p>}
                </div>
                <button
                  onClick={handleSignOut}
                  className="mx-2 block w-[calc(100%-1rem)] text-left px-4 py-3 text-sm text-red-300 rounded-xl transition-colors hover:bg-white/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-5 py-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-frogtown-200/80 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-center px-4 py-2.5 rounded-full bg-gradient-to-r from-frogtown-400 to-frogtown-200 text-frogtown-900 shadow-sm transition-transform active:scale-[0.98]"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
