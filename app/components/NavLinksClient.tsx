'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Directory' },
  { href: '/offer', label: 'Offer Skills' },
  { href: '/#about', label: 'About' },
]

export default function NavLinksClient() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex items-center gap-1">
      {LINKS.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-150 ${
              isActive
                ? 'bg-gradient-to-r from-frogtown-700 to-frogtown-600 text-white shadow-sm'
                : 'text-frogtown-200/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
