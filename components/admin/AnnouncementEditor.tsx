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
  const [priority, setPriority] = useState('info')
  const [sendPush, setSendPush] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toasts.error('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, priority }),
      })

      if (!res.ok) {
        throw new Error('Failed to create announcement.')
      }

      if (sendPush) {
        const pushRes = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `[${priority.toUpperCase()}] ${title}`,
            body,
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
        placeholder="e.g. Scheduled Water Maintenance"
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
  const [showForm, setShowForm] = useState(false)

  const priorityBadgeColors = {
    urgent: 'bg-red-50 text-red-700 border-red-150',
    event: 'bg-green-50 text-green-700 border-green-150',
    info: 'bg-blue-50 text-blue-700 border-blue-150',
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Announcements</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Manage alerts and notifications</p>
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
        <h2 className="font-display font-semibold text-gray-800 text-sm">Past Announcements</h2>
        {initialAnnouncements.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-450">
            No announcements found. Click "New Announcement" to publish your first update.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {initialAnnouncements.map((ann) => (
              <Card key={ann.id} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${priorityBadgeColors[ann.priority]}`}>
                    {ann.priority}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {format(new Date(ann.created_at), 'MMM d, yyyy • h:mm a')}
                  </span>
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
