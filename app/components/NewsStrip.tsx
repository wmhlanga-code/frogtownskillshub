import type { NewsPost } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function badgeClasses(post: NewsPost) {
  if (post.pinned) return 'bg-frogtown-800 text-white'
  if (post.tag === 'Event') return 'bg-frogtown-600 text-white'
  return 'bg-frogtown-200 text-frogtown-700'
}

function accentClasses(post: NewsPost) {
  if (post.pinned) return 'border-l-frogtown-800'
  if (post.tag === 'Event') return 'border-l-frogtown-600'
  return 'border-l-frogtown-300'
}

export default function NewsStrip({ posts }: { posts: NewsPost[] }) {
  const visible = posts.slice(0, 3)
  if (visible.length === 0) return null

  return (
    <div className="px-4 py-4">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-frogtown-700 mb-3">
        Neighborhood Updates
      </h2>
      <div className="flex flex-col gap-3">
        {visible.map((post) => (
          <div
            key={post.id}
            className={`rounded-xl border border-l-4 shadow-sm p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 ${accentClasses(
              post
            )} ${post.pinned ? 'bg-frogtown-50 border-frogtown-300' : 'bg-white border-frogtown-200'}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${badgeClasses(post)}`}
              >
                {post.pinned && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                    <path
                      d="M12 2 9.5 9 3 10l5 4.5L6.5 21 12 17.5 17.5 21 16 14.5l5-4.5-6.5-1L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {post.tag}
              </span>
              <span className="text-xs text-muted-green">{formatDate(post.created_at)}</span>
            </div>
            <p className="text-base font-bold text-frogtown-900 mt-2">{post.title}</p>
            {post.body && (
              <p className="text-sm text-muted-green mt-1 line-clamp-2">{post.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
