'use client'

import { useEffect, useRef, useState } from 'react'
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
    <div className="md:hidden relative bg-black text-white" ref={rootRef}>
      <div className="h-14 flex items-center justify-between px-4">
        <div>
          <p className="font-bold text-sm text-white leading-none">Admin Panel</p>
          <p className="text-xs text-frogtown-400 mt-0.5">Frogtown Skills Hub</p>
        </div>
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
        <div className="absolute left-0 right-0 top-14 bg-black border-t border-white/10 shadow-lg z-50 flex flex-col max-h-[calc(100vh-56px)] overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4 pb-2 pt-4">
            Review
          </p>
          <AdminNavClient items={reviewItems} />

          <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4 pb-2 pt-4">
            Manage
          </p>
          <AdminNavClient items={manageItems} />

          <div className="px-4 py-4 border-t border-white/10 mt-2">
            <p className="text-xs text-white/50 mb-2">{adminName}</p>
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  )
}
