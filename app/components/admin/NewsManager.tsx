'use client'

import { useState } from 'react'
import type { NewsPost, NewsTag } from '@/lib/types'

const TAGS: NewsTag[] = ['Notice', 'Event', 'Update', 'Pinned']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NewsManager({ posts: initialPosts }: { posts: NewsPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState<NewsTag>('Notice')
  const [pinned, setPinned] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setError('')
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body: body || undefined, tag, pinned }),
      })
      if (!res.ok) throw new Error('Failed to publish')
      const data = await res.json()
      setPosts((prev) => [
        {
          id: data.id,
          title,
          body: body || undefined,
          tag,
          pinned,
          published: true,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
      setTitle('')
      setBody('')
      setTag('Notice')
      setPinned(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish(post: NewsPost) {
    const res = await fetch(`/api/admin/news/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: !post.published }),
    })
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div>
      <form
        onSubmit={handlePublish}
        className="bg-white border border-frogtown-200 rounded-lg p-4 mb-6"
      >
        <h2 className="text-sm font-bold text-frogtown-900 mb-3">Post a new update</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-3"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body (optional)"
          rows={3}
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-3"
        />

        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as NewsTag)}
            className="border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900"
          >
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-frogtown-900">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            Pin to top of updates
          </label>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={publishing}
          className="bg-frogtown-800 text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
      </form>

      <div>
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-frogtown-200 rounded-lg p-3 mb-2 flex items-start gap-3"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="bg-frogtown-200 text-frogtown-700 text-xs font-semibold px-2 py-0.5 rounded">
                {post.tag}
              </span>
              {post.pinned && (
                <span className="bg-frogtown-800 text-white text-xs font-semibold px-2 py-0.5 rounded">
                  Pinned
                </span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-frogtown-900">{post.title}</p>
              {post.body && <p className="text-xs text-muted-green mt-1">{post.body}</p>}
              <p className="text-xs text-muted-green mt-1">{formatDate(post.created_at)}</p>
            </div>

            <div className="flex gap-3">
              <button className="text-xs text-frogtown-700 font-semibold">Edit</button>
              <button
                onClick={() => handleUnpublish(post)}
                className="text-xs text-black font-semibold"
              >
                {post.published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-xs text-red-600 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
