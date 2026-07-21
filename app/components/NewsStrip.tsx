'use client'

import type { NewsPost } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function badgeClasses(post: NewsPost) {
  if (post.pinned) return 'bg-frogtown-800 text-white'
  if (post.tag === 'Event') return 'bg-frogtown-600 text-white'
  return 'bg-frogtown-200 text-frogtown-700'
}

export default function NewsStrip({ posts }: { posts: NewsPost[] }) {
  const visible = posts.slice(0, 3)

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-frogtown-700">
          Neighborhood Updates
        </h2>
        <button className="text-xs text-frogtown-600 font-semibold">See all</button>
      </div>
      <div className="flex flex-col gap-2">
        {visible.map((post) => (
          <div
            key={post.id}
            className={`rounded-md border-l-4 p-3 cursor-pointer ${
              post.pinned ? 'border-l-frogtown-800 bg-frogtown-100' : 'border-l-frogtown-200 bg-frogtown-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeClasses(post)}`}>
                {post.tag}
              </span>
              <span className="text-xs text-muted-green">{formatDate(post.created_at)}</span>
            </div>
            <p className="text-sm font-semibold text-black mt-1">{post.title}</p>
            {post.body && (
              <p className="text-xs text-muted-green mt-1 line-clamp-2">{post.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
