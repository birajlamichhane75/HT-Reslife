'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MaintenanceTicket } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { format } from 'date-fns'

export default function TicketManager({ initialTickets }: { initialTickets: MaintenanceTicket[] }) {
  const router = useRouter()
  const toasts = useToast()
  const [tickets, setTickets] = useState(initialTickets)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null)
  
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved'>('open')
  const [staffNotes, setStaffNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const openTicketDetails = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket)
    setStatus(ticket.status)
    setStaffNotes(ticket.staff_notes || '')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/maintenance/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, staff_notes: staffNotes }),
      })

      if (!res.ok) {
        throw new Error('Failed to update ticket.')
      }

      toasts.success('Ticket updated successfully!')
      
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicket.id) {
          return { ...t, status, staff_notes: staffNotes, updated_at: new Date().toISOString() }
        }
        return t
      })
      setTickets(updatedTickets)
      
      setSelectedTicket(null)
      router.refresh()
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setUpdating(false)
    }
  }

  const priorityColors = {
    routine: 'bg-gray-50 text-gray-600 border-gray-200',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
    emergency: 'bg-red-50 text-red-700 border-red-200',
  }

  const statusVariants: Record<string, 'warning' | 'info' | 'success'> = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
  }

  return (
    <div className="flex flex-col gap-6 relative min-h-[500px]">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all capitalize whitespace-nowrap ${
              filter === tab
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white border-[#E5E8EF] text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.replace('_', ' ')} ({tab === 'all' ? tickets.length : tickets.filter(t => t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Tickets Table / List */}
      <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-semibold">No maintenance tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Room</th>
                  <th className="px-5 py-4">Issue</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicketDetails(ticket)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {ticket.student?.full_name || 'Unknown Student'}
                    </td>
                    <td className="px-5 py-4">
                      {ticket.room_number} {ticket.student?.hall_name ? `(${ticket.student.hall_name})` : ''}
                    </td>
                    <td className="px-5 py-4 font-medium">{ticket.issue_type}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariants[ticket.status]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" className="text-brand hover:underline font-bold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Side Panel */}
      {selectedTicket && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 bg-black/35 z-[100]"
          />
          {/* Slide panel */}
          <aside className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-white shadow-2xl border-l border-[#E5E8EF] flex flex-col justify-between animate-[slideLeft_0.3s_ease-out]">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="font-display font-semibold text-gray-900 text-base">Ticket Details</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">#{selectedTicket.id.slice(0, 8)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ticket Details Info */}
              <div className="flex flex-col gap-5 text-xs text-gray-700 border-b border-gray-100 pb-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Student Name</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedTicket.student?.full_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Student Email</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedTicket.student?.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Location</span>
                    <p className="font-semibold text-gray-900 mt-0.5">Room {selectedTicket.room_number} {selectedTicket.student?.hall_name ? `• ${selectedTicket.student.hall_name}` : ''}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Issue Type</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedTicket.issue_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Priority</span>
                    <p className="mt-1">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[selectedTicket.priority]}`}>
                        {selectedTicket.priority}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Entry Allowed?</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedTicket.allow_entry ? '✅ Yes' : '❌ No (Call/Wait)'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Student Description</span>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <Select
                  label="Update Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'resolved', label: 'Resolved' },
                  ]}
                />

                <Textarea
                  label="Staff Notes (Emailed to student)"
                  placeholder="Describe details of the resolve or status update..."
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                />

                <Button type="submit" disabled={updating} className="w-full">
                  {updating ? 'Updating...' : 'Save Ticket Updates'}
                </Button>
              </form>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
