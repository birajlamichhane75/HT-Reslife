'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Event } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

export default function EventEditor({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const toasts = useToast()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [tag, setTag] = useState('social')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !eventDate) {
      toasts.error('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location: location.trim() || null,
          event_date: new Date(eventDate).toISOString(),
          tag,
          description: description.trim() || null,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create event.')
      }

      toasts.success('Event created successfully!')
      setTitle('')
      setLocation('')
      setEventDate('')
      setTag('social')
      setDescription('')

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
      <h3 className="font-display font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">New Event</h3>

      <Input
        label="Event Title *"
        placeholder="e.g. Welcome Back BBQ"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date & Time *"
          type="datetime-local"
          required
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />

        <Select
          label="Event Tag *"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          options={[
            { value: 'social', label: 'Social (Green)' },
            { value: 'mandatory', label: 'Mandatory (Amber)' },
            { value: 'academic', label: 'Academic (Blue)' },
            { value: 'deadline', label: 'Deadline (Red)' },
            { value: 'housing', label: 'Housing (Purple)' },
          ]}
        />
      </div>

      <Input
        label="Location"
        placeholder="e.g. Lawson Hall Lobby"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <Textarea
        label="Description"
        placeholder="Add details, requirements, or descriptions..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Event'}
      </Button>
    </form>
  )
}

export function EventManager({ initialEvents }: { initialEvents: Event[] }) {
  const [showForm, setShowForm] = useState(false)

  const tagColors = {
    mandatory: 'bg-amber-500 text-white',
    social: 'bg-green-500 text-white',
    academic: 'bg-blue-50 text-white',
    deadline: 'bg-red-500 text-white',
    housing: 'bg-purple-500 text-white',
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Events</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Publish and manage campus housing activities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Editor' : 'New Event'}
        </Button>
      </div>

      {/* Editor Form */}
      {showForm && (
        <div className="animate-[slideDown_0.2s_ease-out]">
          <EventEditor onComplete={() => setShowForm(false)} />
        </div>
      )}

      {/* Events List */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display font-semibold text-gray-800 text-sm">All Housing Events</h2>
        {initialEvents.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-450">
            No events scheduled. Click "New Event" to post one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialEvents.map((ev) => (
              <Card key={ev.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${tagColors[ev.tag] || 'bg-gray-100 text-gray-700'}`}>
                    {ev.tag}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {format(new Date(ev.event_date), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-sm">{ev.title}</h3>
                  {ev.location && (
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{ev.location}</span>
                    </p>
                  )}
                </div>
                {ev.description && (
                  <p className="text-xs text-gray-500 border-t border-gray-50 pt-2 leading-relaxed whitespace-pre-wrap">{ev.description}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
