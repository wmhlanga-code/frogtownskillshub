'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type AdminNavItem = {
  href: string
  label: string
  badge?: number
  badgeStyle?: 'urgent' | 'normal'
}

export default function AdminNavClient({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname()

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
              isActive
                ? 'bg-frogtown-800 text-white border-l-3 border-frogtown-400 pl-3.5'
                : 'text-white/65 hover:bg-white/6 hover:text-white'
            }`}
          >
            <span>{item.label}</span>
            {!!item.badge && item.badge > 0 && (
              <span
                className={`text-xs font-extrabold px-1.5 py-0.5 rounded-full ${
                  item.badgeStyle === 'urgent' ? 'bg-white text-black' : 'bg-frogtown-600 text-white'
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )
}
