'use client'

import React, { useState, useEffect } from 'react'
import { StaffMember } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function AdminStaffPage() {
  const toasts = useToast()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [hall, setHall] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarInitials, setAvatarInitials] = useState('')
  const [sortOrder, setSortOrder] = useState('0')

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      const data = await res.json()
      if (res.ok) {
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching staff directory:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleAddClick = () => {
    setEditingStaff(null)
    setFullName('')
    setRole('')
    setHall('')
    setPhone('')
    setEmail('')
    setAvatarInitials('')
    setSortOrder('0')
    setShowForm(true)
  }

  const handleEditClick = (member: StaffMember) => {
    setEditingStaff(member)
    setFullName(member.full_name)
    setRole(member.role)
    setHall(member.hall || '')
    setPhone(member.phone || '')
    setEmail(member.email || '')
    setAvatarInitials(member.avatar_initials || '')
    setSortOrder(String(member.sort_order || 0))
    setShowForm(true)
  }

  const handleCancelClick = () => {
    setEditingStaff(null)
    setFullName('')
    setRole('')
    setHall('')
    setPhone('')
    setEmail('')
    setAvatarInitials('')
    setSortOrder('0')
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !role.trim()) {
      toasts.error('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const isEdit = !!editingStaff
      const url = isEdit ? `/api/staff/${editingStaff.id}` : '/api/staff'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          role: role.trim(),
          hall: hall.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          avatar_initials: avatarInitials.trim() || null,
          sort_order: parseInt(sortOrder) || 0,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save staff profile.')
      }

      toasts.success(isEdit ? 'Staff member updated successfully!' : 'Staff member added successfully!')
      handleCancelClick()
      fetchStaff()
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
      const res = await fetch(`/api/staff/${deleteConfirmId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        throw new Error('Failed to remove staff profile.')
      }
      toasts.success('Staff member removed successfully!')
      setDeleteConfirmId(null)
      fetchStaff()
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Staff Directory</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Manage Residence Assistants (RAs) & Coordinators</p>
        </div>
        {!showForm ? (
          <Button onClick={handleAddClick}>Add Staff Member</Button>
        ) : (
          <Button variant="outline" onClick={handleCancelClick}>Close Editor</Button>
        )}
      </div>

      {/* Editor Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-[#E5E8EF] shadow-sm animate-[slideDown_0.2s_ease-out]">
          <h3 className="font-display font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">
            {editingStaff ? 'Edit Staff Profile' : 'New Staff Profile'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Sarah Jenkins"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Role *"
              placeholder="e.g. Resident Assistant (RA)"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hall Assignment"
              placeholder="e.g. Heritage Hall (leave blank for housing office)"
              value={hall}
              onChange={(e) => setHall(e.target.value)}
            />
            <Input
              label="Sort Order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. (512) 555-0143"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. sjenkins@htu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="Avatar Initials (Optional)"
            placeholder="e.g. SJ"
            maxLength={2}
            value={avatarInitials}
            onChange={(e) => setAvatarInitials(e.target.value)}
          />

          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={handleCancelClick} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : 'Save Staff Profile'}
            </Button>
          </div>
        </form>
      )}

      {/* Staff directory listings */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display font-semibold text-gray-800 text-sm">Directory Listings</h2>

        {loading ? (
          <div className="text-center py-10 text-xs text-gray-400">Loading directory...</div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-455">
            No staff profiles registered. Click "Add Staff Member" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((s) => (
              <Card key={s.id} className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow relative group">
                <div className="w-10 h-10 rounded-full bg-brand-light/75 flex items-center justify-center text-brand font-bold text-sm font-display flex-shrink-0">
                  {s.avatar_initials || s.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-gray-900 text-sm truncate">{s.full_name}</h4>
                  <p className="text-xs text-gray-400 font-medium truncate">{s.role}</p>
                  {s.hall && (
                    <p className="text-[9px] font-bold text-brand uppercase mt-0.5 tracking-wider">{s.hall}</p>
                  )}
                </div>
                
                {/* Actions overlay / Right container */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-[10px] text-gray-400 font-semibold bg-gray-50 border border-gray-150 rounded px-2.5 py-1">
                    Sort: {s.sort_order}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-1 text-gray-450 hover:text-brand transition-colors rounded-lg hover:bg-gray-50"
                      title="Edit Staff Member"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(s.id)}
                      className="p-1 text-gray-455 hover:text-red-650 transition-colors rounded-lg hover:bg-red-50"
                      title="Remove Staff Member"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
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
                <h3 className="text-sm font-bold text-gray-900">Remove Staff Member</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Are you sure you want to remove this staff profile from the directory?
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
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
