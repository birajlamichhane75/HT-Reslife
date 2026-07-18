'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

const ISSUE_TYPES = [
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Pest control', label: 'Pest control' },
  { value: 'Door/Lock', label: 'Door/Lock' },
  { value: 'Appliance', label: 'Appliance' },
  { value: 'Internet', label: 'Internet' },
  { value: 'Other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'routine', label: 'Routine — within 48hrs' },
  { value: 'urgent', label: 'Urgent — same day' },
  { value: 'emergency', label: 'Emergency — call now' },
]

export default function MaintenanceForm({ initialRoom }: { initialRoom: string }) {
  const router = useRouter()
  const toasts = useToast()
  const [roomNumber, setRoomNumber] = useState(initialRoom || '')
  const [issueType, setIssueType] = useState('Plumbing')
  const [priority, setPriority] = useState('routine')
  const [description, setDescription] = useState('')
  const [allowEntry, setAllowEntry] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim().length < 20) {
      toasts.error('Description must be at least 20 characters long.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: roomNumber,
          issue_type: issueType,
          priority,
          description,
          allow_entry: allowEntry,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ticket.')
      }

      toasts.success('Maintenance ticket submitted successfully!')
      setSubmittedTicket(data.ticketId)
      setDescription('')
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (submittedTicket) {
    return (
      <div className="text-center py-8 px-4 bg-white rounded-2xl border border-[#E5E8EF] shadow-sm">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-1">Request Submitted!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Your maintenance request has been recorded. Ticket ID:
          <span className="block font-bold text-gray-800 uppercase mt-1">
            #{submittedTicket.slice(0, 8)}
          </span>
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/maintenance/history" className="w-full">
            <Button variant="primary" className="w-full">View Ticket History</Button>
          </Link>
          <Button variant="ghost" onClick={() => setSubmittedTicket(null)} className="w-full">
            Submit Another Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-5 rounded-2xl border border-[#E5E8EF] shadow-sm">
      <Input
        label="Room Number"
        type="text"
        required
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      />

      <Select
        label="Issue Type"
        value={issueType}
        onChange={(e) => setIssueType(e.target.value)}
        options={ISSUE_TYPES}
      />

      <Select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        options={PRIORITIES}
      />

      {priority === 'emergency' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            ⚠️ <strong>Emergency requests:</strong> For safety hazards, flooding, gas leaks, or fires, please call the Housing Office emergency line immediately at <strong>(512) 505-3000</strong>.
          </p>
        </div>
      )}

      <Textarea
        label="Description of the Issue"
        placeholder="Please describe the issue in detail (min 20 characters)..."
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={description.length > 0 && description.length < 20 ? 'Requires at least 20 characters.' : undefined}
      />

      <label className="flex items-center gap-3 cursor-pointer group py-1">
        <input
          type="checkbox"
          checked={allowEntry}
          onChange={(e) => setAllowEntry(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <span className="text-xs text-gray-500 font-medium select-none group-hover:text-gray-700 transition-colors">
          Allow staff to enter room if I am not present
        </span>
      </label>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  )
}
