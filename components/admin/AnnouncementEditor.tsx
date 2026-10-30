'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Announcement } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

export default function AnnouncementEditor({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const toasts = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [priority, setPriority] = useState('info')
  const [sendPush, setSendPush] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toasts.error('Please fill in title and body.')
      return
    }

    setLoading(true)
    try {
      let finalBody = body.trim()
      if (formUrl.trim()) {
        const trimmedUrl = formUrl.trim()
        if (!finalBody.includes(trimmedUrl)) {
          finalBody = `${finalBody}\n\nAccess Form:\n${trimmedUrl}`
        }
      }

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: finalBody, priority }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create announcement.')
      }

      if (sendPush) {
        const pushRes = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `[${priority.toUpperCase()}] ${title}`,
            body: finalBody,
            url: '/announcements',
          }),
        })

        if (pushRes.ok) {
          const pushData = await pushRes.json()
          toasts.success(`Announcement posted & push notification sent to ${pushData.sentCount} devices!`)
        } else {
          toasts.info('Announcement posted, but push notifications failed.')
        }
      } else {
        toasts.success('Announcement posted successfully!')
      }

      setTitle('')
      setBody('')
      setFormUrl('')
      setPriority('info')
      setSendPush(false)

      router.refresh()
      if (onComplete) onComplete()
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-[#E5E8EF] shadow-sm">
      <h3 className="font-display font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">New Announcement</h3>
      
      <Input
        label="Title"
        placeholder="e.g. Thanksgiving Break Housing Form or Halloween Reminder"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        options={[
          { value: 'info', label: 'Info (Blue)' },
          { value: 'urgent', label: 'Urgent (Red)' },
          { value: 'event', label: 'Event (Green)' },
        ]}
      />

      <Textarea
        label="Announcement Body"
        placeholder="Write details here..."
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <Input
        label="Optional Form or External Link"
        placeholder="https://forms.cloud.microsoft/... or https://htu.edu/..."
        value={formUrl}
        onChange={(e) => setFormUrl(e.target.value)}
      />

      <label className="flex items-center gap-3 cursor-pointer group py-1">
        <input
          type="checkbox"
          checked={sendPush}
          onChange={(e) => setSendPush(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <span className="text-xs text-gray-600 font-semibold select-none group-hover:text-gray-800 transition-colors">
          Send push notification to all students
        </span>
      </label>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Post Announcement'}
      </Button>
    </form>
  )
}

export function AnnouncementManager({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const router = useRouter()
  const toasts = useToast()
  const [showForm, setShowForm] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sync state if initialAnnouncements updates
  React.useEffect(() => {
    setAnnouncements(initialAnnouncements)
  }, [initialAnnouncements])

  const priorityBadgeColors = {
    urgent: 'bg-red-50 text-red-700 border-red-150',
    event: 'bg-green-50 text-green-700 border-green-150',
    info: 'bg-blue-50 text-blue-700 border-blue-150',
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the announcement "${title}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete announcement.')
      }

      toasts.success('Announcement deleted.')
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch (err: any) {
      toasts.error(err.message || 'Could not delete announcement.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Announcements</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Manage alerts, notices, and student forms from the admin side</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Editor' : 'New Announcement'}
        </Button>
      </div>

      {/* Editor Form */}
      {showForm && (
        <div className="animate-[slideDown_0.2s_ease-out]">
          <AnnouncementEditor onComplete={() => setShowForm(false)} />
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display font-semibold text-gray-800 text-sm">Active & Past Announcements</h2>
        {announcements.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-450">
            No announcements found. Click "New Announcement" to publish your first update.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="flex flex-col gap-2.5 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${priorityBadgeColors[ann.priority] || priorityBadgeColors.info}`}>
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {format(new Date(ann.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    disabled={deletingId === ann.id}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium"
                    title="Delete announcement"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{deletingId === ann.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>

                <h3 className="font-display font-bold text-gray-900 text-sm leading-snug">{ann.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.body}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
