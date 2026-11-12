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
import ImageUploadField from '@/components/admin/ImageUploadField'
import { parseImageFromText } from '@/lib/image-utils'

export default function EventEditor({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const toasts = useToast()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [tag, setTag] = useState('social')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
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
          title: title.trim(),
          location: location.trim() || null,
          event_date: new Date(eventDate).toISOString(),
          tag,
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create event.')
      }

      toasts.success('Event created successfully!')
      setTitle('')
      setLocation('')
      setEventDate('')
      setTag('social')
      setDescription('')
      setImageUrl('')

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
        placeholder="e.g. Battle of the Halls or Spring Kickoff"
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
        placeholder="e.g. Campus Wide / Residence Halls"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <Textarea
        label="Description"
        placeholder="Add details, challenge rules, prize info, etc..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Image / Flyer Upload */}
      <ImageUploadField
        value={imageUrl}
        onChange={setImageUrl}
        folder="events"
        label="Event Flyer / Poster Image (Stored in Supabase)"
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Event'}
      </Button>
    </form>
  )
}

export function EventManager({ initialEvents }: { initialEvents: Event[] }) {
  const router = useRouter()
  const toasts = useToast()
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  React.useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  const tagColors = {
    mandatory: 'bg-amber-500 text-white',
    social: 'bg-green-500 text-white',
    academic: 'bg-blue-500 text-white',
    deadline: 'bg-red-500 text-white',
    housing: 'bg-purple-500 text-white',
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete event.')
      }

      toasts.success('Event deleted.')
      setEvents((prev) => prev.filter((ev) => ev.id !== id))
      router.refresh()
    } catch (err: any) {
      toasts.error(err.message || 'Could not delete event.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Events</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Publish and manage campus housing activities with flyers</p>
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
        {events.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-450">
            No events scheduled. Click "New Event" to post one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const { imageUrl, cleanText } = parseImageFromText(ev.image_url, ev.description)

              return (
                <Card key={ev.id} className="flex flex-col gap-3 relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${tagColors[ev.tag] || 'bg-gray-100 text-gray-700'}`}>
                        {ev.tag}
                      </span>
                      {imageUrl && (
                        <span className="text-[10px] font-semibold bg-brand-light/60 text-brand px-2 py-0.5 rounded-full flex items-center gap-1">
                          🖼️ Flyer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {format(new Date(ev.event_date), 'MMM d, yyyy • h:mm a')}
                      </span>
                      <button
                        onClick={() => handleDelete(ev.id, ev.title)}
                        disabled={deletingId === ev.id}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Delete event"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {imageUrl && (
                    <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover max-h-48 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    </div>
                  )}

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

                  {cleanText && (
                    <p className="text-xs text-gray-500 border-t border-gray-50 pt-2 leading-relaxed whitespace-pre-wrap">{cleanText}</p>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
