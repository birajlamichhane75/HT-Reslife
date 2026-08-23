'use client'

import React, { useState, useEffect } from 'react'
import { CalendarEntry } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { format } from 'date-fns'

const CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'holiday', label: 'Holiday / Break' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'housing', label: 'Housing Specific' },
  { value: 'registration', label: 'Registration' }
]

export default function AdminCalendarPage() {
  const toasts = useToast()
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Form Editor States
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [category, setCategory] = useState('academic')

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCalendar = async () => {
    try {
      const res = await fetch('/api/calendar')
      const data = await res.json()
      if (res.ok) {
        setEntries(data)
      }
    } catch (err) {
      console.error('Error fetching calendar entries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendar()
  }, [])

  const handleAddClick = () => {
    setEditingEntry(null)
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setCategory('academic')
    setShowForm(true)
  }

  const handleEditClick = (entry: CalendarEntry) => {
    setEditingEntry(entry)
    setTitle(entry.title)
    setDescription(entry.description || '')
    setStartDate(entry.start_date)
    setEndDate(entry.end_date || '')
    setCategory(entry.category)
    setShowForm(true)
  }

  const handleCancelClick = () => {
    setEditingEntry(null)
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setCategory('academic')
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startDate || !category) {
      toasts.error('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const isEdit = !!editingEntry
      const url = isEdit ? `/api/calendar/${editingEntry.id}` : '/api/calendar'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          start_date: startDate,
          end_date: endDate || null,
          category,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save calendar entry.')
      }

      toasts.success(isEdit ? 'Calendar entry updated successfully!' : 'Calendar entry added successfully!')
      handleCancelClick()
      fetchCalendar()
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/calendar/${deleteConfirmId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        throw new Error('Failed to delete calendar entry.')
      }
      toasts.success('Calendar entry deleted successfully!')
      setDeleteConfirmId(null)
      fetchCalendar()
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setDeleting(false)
    }
  }

  // Filter and Search entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) ||
      (entry.description && entry.description.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Format category badge variants
  const getBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'academic': return 'info'
      case 'holiday': return 'success'
      case 'deadline': return 'error'
      case 'housing': return 'warning'
      case 'registration': return 'neutral'
      default: return 'neutral'
    }
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Academic Calendar</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Manage academic terms, housing checkouts, and deadlines</p>
        </div>
        {!showForm ? (
          <Button onClick={handleAddClick}>Add Calendar Event</Button>
        ) : (
          <Button variant="outline" onClick={handleCancelClick}>Close Editor</Button>
        )}
      </div>

      {/* Form Editor */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-[#E5E8EF] shadow-sm animate-[slideDown_0.2s_ease-out]">
          <h3 className="font-display font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">
            {editingEntry ? 'Edit Calendar Event' : 'New Calendar Event'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Event Title *"
              placeholder="e.g. Midterm Exams, Thanksgiving Break"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Provide context or instructions for this calendar date..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={handleCancelClick} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : 'Save Event'}
            </Button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search calendar events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-brand text-white' : 'bg-white border border-gray-150 text-gray-500 hover:bg-gray-50'}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filterCategory === cat.value ? 'bg-brand text-white' : 'bg-white border border-gray-150 text-gray-500 hover:bg-gray-50'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading academic calendar...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xs font-semibold">No calendar events found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-4">Event Date</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredEntries.map((entry) => {
                  const hasEndDate = entry.end_date && entry.end_date !== entry.start_date
                  const formattedDate = hasEndDate 
                    ? `${format(new Date(entry.start_date + 'T00:00:00'), 'MMM d')} - ${format(new Date(entry.end_date + 'T00:00:00'), 'MMM d, yyyy')}`
                    : format(new Date(entry.start_date + 'T00:00:00'), 'MMMM d, yyyy')

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">{entry.title}</td>
                      <td className="px-5 py-4">
                        <Badge variant={getBadgeVariant(entry.category)}>
                          {CATEGORIES.find(c => c.value === entry.category)?.label || entry.category}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-xs truncate leading-normal" title={entry.description || ''}>
                        {entry.description || <span className="text-gray-300 italic">No description</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => handleEditClick(entry)}
                            className="p-1 text-gray-400 hover:text-brand transition-colors"
                            title="Edit Event"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(entry.id)}
                            className="p-1 text-gray-400 hover:text-red-650 transition-colors"
                            title="Delete Event"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col gap-5 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete Calendar Event</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Are you sure you want to permanently delete this academic calendar entry?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-650 text-white font-semibold text-xs hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
