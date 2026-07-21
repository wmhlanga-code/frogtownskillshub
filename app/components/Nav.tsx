'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Directory' },
  { href: '/offer', label: 'Offer Skills' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="bg-frogtown-900 text-white h-14 sticky top-0 z-50 flex items-center justify-between px-4 border-b border-frogtown-800 shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-frogtown-400/20 text-frogtown-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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
        <span className="text-lg font-bold tracking-tight leading-none">
          Frogtown <span className="text-frogtown-400">Skills</span>
        </span>
      </Link>
      <div className="flex items-center gap-1">
        {LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors duration-150 ${
                isActive
                  ? 'bg-frogtown-700 text-white shadow-sm'
                  : 'text-frogtown-200/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
