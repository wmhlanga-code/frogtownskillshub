'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NewsPost, NewsTag } from '@/lib/types'

const TAGS: NewsTag[] = ['Notice', 'Event', 'Update', 'Pinned']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NewsManager({ posts: initialPosts }: { posts: NewsPost[] }) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)

  // Re-sync when router.refresh() brings in fresh server data - otherwise
  // this component's local copy stays stale until a full reload remounts it.
  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState<NewsTag>('Notice')
  const [pinned, setPinned] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editTag, setEditTag] = useState<NewsTag>('Notice')
  const [editPinned, setEditPinned] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  function startEdit(post: NewsPost) {
    setEditingId(post.id)
    setEditTitle(post.title)
    setEditBody(post.body ?? '')
    setEditTag(post.tag)
    setEditPinned(post.pinned)
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function handleSaveEdit(post: NewsPost) {
    if (!editTitle.trim()) {
      setEditError('Title is required.')
      return
    }
    setSavingEdit(true)
    setEditError('')
    try {
      const res = await fetch(`/api/admin/news/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          body: editBody || undefined,
          tag: editTag,
          pinned: editPinned,
          published: post.published,
        }),
      })
      if (!res.ok) {
        setEditError('Failed to save changes.')
        return
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, title: editTitle, body: editBody || undefined, tag: editTag, pinned: editPinned }
            : p
        )
      )
      setEditingId(null)
      router.refresh()
    } finally {
      setSavingEdit(false)
    }
  }

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
      router.refresh()
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
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    }
  }

  return (
    <div>
      <form
        onSubmit={handlePublish}
        className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 mb-6"
      >
        <h2 className="text-sm font-bold text-frogtown-900 mb-3">Post a new update</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-3 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body (optional)"
          rows={3}
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-3 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
        />

        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as NewsTag)}
            className="border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
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
          className="bg-frogtown-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100"
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
      </form>

      <div>
        {posts.map((post) => {
          if (editingId === post.id) {
            return (
              <div key={post.id} className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 mb-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-3 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Body (optional)"
                  rows={3}
                  className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 mb-3 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
                />
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value as NewsTag)}
                    className="border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
                  >
                    {TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-frogtown-900">
                    <input
                      type="checkbox"
                      checked={editPinned}
                      onChange={(e) => setEditPinned(e.target.checked)}
                    />
                    Pin to top of updates
                  </label>
                </div>
                {editError && <p className="text-sm text-red-600 mb-3">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(post)}
                    disabled={savingEdit}
                    className="bg-frogtown-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100"
                  >
                    {savingEdit ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-white border border-frogtown-200 text-frogtown-900 text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-frogtown-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={post.id}
              className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-3 mb-2 flex items-start gap-3 transition-shadow hover:shadow-md"
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
                <button
                  onClick={() => startEdit(post)}
                  className="text-xs text-frogtown-700 font-semibold transition-colors hover:text-frogtown-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleUnpublish(post)}
                  className="text-xs text-black font-semibold transition-colors hover:text-frogtown-700"
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs text-red-600 font-semibold transition-colors hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
