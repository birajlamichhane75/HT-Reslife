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

  // Form states
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [hall, setHall] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarInitials, setAvatarInitials] = useState('')
  const [sortOrder, setSortOrder] = useState('0')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !role.trim()) {
      toasts.error('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          role,
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

      toasts.success('Staff member added successfully!')
      setFullName('')
      setRole('')
      setHall('')
      setPhone('')
      setEmail('')
      setAvatarInitials('')
      setSortOrder('0')
      setShowForm(false)
      fetchStaff()
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 leading-tight">Staff Directory</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Manage Residence Assistants (RAs) & Coordinators</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Editor' : 'Add Staff Member'}
        </Button>
      </div>

      {/* Editor Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-[#E5E8EF] shadow-sm animate-[slideDown_0.2s_ease-out]">
          <h3 className="font-display font-semibold text-gray-900 text-sm border-b border-gray-100 pb-3">New Staff Profile</h3>

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

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Saving...' : 'Save Staff Profile'}
          </Button>
        </form>
      )}

      {/* Staff directory listings */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display font-semibold text-gray-800 text-sm">Directory Listings</h2>

        {loading ? (
          <div className="text-center py-10 text-xs text-gray-400">Loading directory...</div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-450">
            No staff profiles registered. Click "Add Staff Member" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((s) => (
              <Card key={s.id} className="flex items-center gap-4 p-4">
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
                <div className="text-[10px] text-gray-400 font-semibold bg-gray-50 border border-gray-150 rounded px-2.5 py-1">
                  Sort: {s.sort_order}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
