'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminNavClient, { type AdminNavItem } from './AdminNavClient'
import SignOutButton from './SignOutButton'

export default function AdminMobileNav({
  reviewItems,
  manageItems,
  adminName,
}: {
  reviewItems: AdminNavItem[]
  manageItems: AdminNavItem[]
  adminName: string
}) {
  const pathname = usePathname()
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

  return (
    <div className="md:hidden relative bg-gradient-to-r from-black to-frogtown-900 text-white shadow-md" ref={rootRef}>
      <div className="h-14 flex items-center justify-between px-4">
        <Link href="/admin" className="group flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-frogtown-400/30 to-frogtown-400/10 text-frogtown-400 flex-shrink-0 shadow-sm transition-transform duration-150 group-active:scale-95">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 3c-3 2-5 5-5 8.5a5 5 0 0 0 10 0C17 8 15 5 12 3Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M12 12v6M9 21c0-1.5 1-3 3-3s3 1.5 3 3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white leading-none truncate">Admin Panel</p>
            <p className="text-xs text-frogtown-400 mt-0.5 truncate">Frogtown Skills Hub</p>
          </div>
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10"
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
      </div>

      {open && (
        <div className="animate-message-in absolute left-0 right-0 top-14 bg-gradient-to-b from-black to-frogtown-900 border-t border-white/10 shadow-lg z-50 flex flex-col max-h-[calc(100vh-56px)] overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4 pb-2 pt-4">
            Review
          </p>
          <AdminNavClient items={reviewItems} />

          <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4 pb-2 pt-4">
            Manage
          </p>
          <AdminNavClient items={manageItems} />

          <div className="px-4 py-4 border-t border-white/10 mt-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-3"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M15 6 9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View site
            </Link>
            <p className="text-xs text-white/50 mb-2">{adminName}</p>
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  )
}
