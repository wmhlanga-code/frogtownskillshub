'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Admin } from '@/lib/types'

export default function AdminsClient({
  admins: initialAdmins,
  currentAdminId,
  isSuperAdmin,
}: {
  admins: Admin[]
  currentAdminId: string
  isSuperAdmin: boolean
}) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initialAdmins)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const activeSuperAdmins = admins.filter((a) => a.role === 'super_admin' && a.active)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }
    setError('')
    setMessage('')
    setSending(true)
    try {
      const res = await fetch('/api/admin/admins/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to send invitation.')
        return
      }
      setMessage(`Invitation sent to ${email}`)
      setAdmins((prev) => [
        {
          id: data.id,
          name,
          email,
          role,
          active: true,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
      setName('')
      setEmail('')
      setRole('admin')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  async function handleDeactivate(admin: Admin) {
    setBusyId(admin.id)
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}/deactivate`, { method: 'POST' })
      if (res.ok) {
        setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, active: false } : a)))
        router.refresh()
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <form
        onSubmit={handleInvite}
        className="bg-white border border-frogtown-200 rounded-xl shadow-sm p-4 mb-6"
      >
        <h2 className="text-sm font-bold text-frogtown-900 mb-3">Invite a new admin</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="flex-1 border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}
            className="border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900 transition-colors focus:outline-none focus:border-frogtown-600 focus:ring-2 focus:ring-frogtown-100"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {message && <p className="text-sm text-frogtown-700 mb-3">{message}</p>}

        <button
          type="submit"
          disabled={sending}
          className="bg-frogtown-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all hover:bg-frogtown-700 active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-frogtown-800 disabled:active:scale-100"
        >
          {sending ? 'Sending...' : 'Send invitation'}
        </button>
      </form>

      <div className="bg-white border border-frogtown-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide text-muted-green border-b border-frogtown-200">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Added</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isSelf = admin.id === currentAdminId
              const isLastSuperAdmin =
                admin.role === 'super_admin' && admin.active && activeSuperAdmins.length <= 1
              const canDeactivate = isSuperAdmin && !isSelf && admin.active && !isLastSuperAdmin

              return (
                <tr
                  key={admin.id}
                  className="text-sm border-b border-frogtown-100 last:border-b-0 transition-colors hover:bg-frogtown-50/60"
                >
                  <td className="px-3 py-3 text-frogtown-900">{admin.name}</td>
                  <td className="px-3 py-3 text-frogtown-900">{admin.email}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        admin.role === 'super_admin'
                          ? 'bg-frogtown-800 text-white'
                          : 'bg-frogtown-100 text-frogtown-700'
                      }`}
                    >
                      {admin.role === 'super_admin' ? 'Super admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        admin.active ? 'bg-frogtown-100 text-frogtown-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {admin.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-frogtown-900">
                    {new Date(admin.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-3">
                    {isSuperAdmin && admin.active && (
                      <button
                        onClick={() => handleDeactivate(admin)}
                        disabled={!canDeactivate || busyId === admin.id}
                        className="text-xs text-black font-semibold transition-colors hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-black"
                        title={
                          isSelf
                            ? 'Cannot deactivate yourself'
                            : isLastSuperAdmin
                              ? 'Cannot deactivate the last super admin'
                              : undefined
                        }
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
