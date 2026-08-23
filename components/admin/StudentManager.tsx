'use client'

import React, { useState } from 'react'
import { Student, Role } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

interface StudentManagerProps {
  initialStudents: Student[]
  toggleActive: (studentId: string, isActive: boolean) => Promise<{ success: boolean }>
}

export default function StudentManager({ initialStudents, toggleActive }: StudentManagerProps) {
  const toasts = useToast()
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Modals / Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentIdField, setStudentIdField] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [session, setSession] = useState('Fall 2026')
  const [cohort, setCohort] = useState('')
  const [building, setBuilding] = useState('')
  const [suite, setSuite] = useState('')
  const [room, setRoom] = useState('')
  const [bed, setBed] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [isActive, setIsActive] = useState(true)
  const [isRa, setIsRa] = useState(false)
  const [password, setPassword] = useState('')

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase()
    return (
      s.full_name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (s.hall_name && s.hall_name.toLowerCase().includes(term)) ||
      (s.room_number && s.room_number.includes(term))
    )
  })

  // Open modal for Adding a student
  const handleAddClick = () => {
    setEditingStudent(null)
    setEmail('')
    setFullName('')
    setStudentIdField('')
    setFirstName('')
    setLastName('')
    setSession('Fall 2026')
    setCohort('')
    setBuilding('')
    setSuite('')
    setRoom('')
    setBed('')
    setRole('student')
    setIsActive(true)
    setIsRa(false)
    setPassword('')
    setIsModalOpen(true)
  }

  // Open modal for Editing a student
  const handleEditClick = (student: Student) => {
    setEditingStudent(student)
    setEmail(student.email)
    setFullName(student.full_name)
    setStudentIdField(student.student_id || '')
    setFirstName(student.first_name || '')
    setLastName(student.last_name || '')
    setSession(student.session || 'Fall 2026')
    setCohort(student.cohort || '')
    setBuilding(student.building || '')
    setSuite(student.suite || '')
    setRoom(student.room || '')
    setBed(student.bed || '')
    setRole(student.role)
    setIsActive(student.is_active)
    setIsRa(student.is_ra || false)
    setPassword('')
    setIsModalOpen(true)
  }

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !fullName.trim()) {
      toasts.error('Email and Full Name are required.')
      return
    }

    setSubmitting(true)
    try {
      const isEdit = !!editingStudent
      const url = '/api/students'
      const method = isEdit ? 'PUT' : 'POST'
      
      const payload: any = {
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role,
        is_active: isActive,
        student_id: studentIdField.trim() || null,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        session: session.trim() || null,
        cohort: cohort.trim() || null,
        building: building.trim() || null,
        suite: suite.trim() || null,
        room: room.trim() || null,
        bed: bed.trim() || null,
        is_ra: isRa
      }

      if (isEdit) {
        payload.id = editingStudent.id
      } else if (password) {
        payload.password = password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save student record.')
      }

      toasts.success(isEdit ? 'Student updated successfully!' : 'Student added successfully!')
      setIsModalOpen(false)
      
      // Update local state list
      if (isEdit) {
        setStudents(prev => prev.map(s => s.id === data.id ? data : s))
      } else {
        setStudents(prev => [data, ...prev])
      }
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/students?id=${deleteConfirmId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to delete student.')
      }

      toasts.success('Student deleted successfully!')
      setStudents(prev => prev.filter(s => s.id !== deleteConfirmId))
      setDeleteConfirmId(null)
    } catch (err: any) {
      toasts.error(err.message || 'An error occurred.')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (studentId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    setUpdatingId(studentId)
    
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, is_active: nextStatus } : s))
    )

    try {
      const res = await toggleActive(studentId, nextStatus)
      if (res.success) {
        toasts.success(`Student access ${nextStatus ? 'activated' : 'deactivated'} successfully.`)
      } else {
        throw new Error('Action failed')
      }
    } catch (err: any) {
      toasts.error('Failed to update student access.')
      // Rollback
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, is_active: currentStatus } : s))
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search students by name, email, or hall..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            className="bg-brand text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#520100] active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xs font-semibold">No students found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Hall / Room</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">RA status</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{student.full_name}</td>
                    <td className="px-5 py-4 text-gray-500">{student.email}</td>
                    <td className="px-5 py-4">
                      {student.building ? `${student.building} • Room ${student.room || 'N/A'}` : 'Not Assigned'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={student.role === 'admin' ? 'info' : student.role === 'cafeteria_admin' ? 'warning' : 'neutral'}>
                        {student.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {student.is_ra ? (
                        <Badge variant="success">Resident Assistant</Badge>
                      ) : (
                        <span className="text-gray-400 italic">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium">
                      <Badge variant={student.is_active ? 'success' : 'error'}>
                        {student.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {/* Toggle active switch */}
                        <label className="inline-flex items-center cursor-pointer select-none relative" title="Toggle active status">
                          <input
                            type="checkbox"
                            disabled={updatingId === student.id}
                            checked={student.is_active}
                            onChange={() => handleToggleActive(student.id, student.is_active)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand relative"></div>
                        </label>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(student)}
                          className="p-1 text-gray-400 hover:text-brand transition-colors"
                          title="Edit Student"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmId(student.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Student"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-display font-semibold text-gray-900 text-sm">
                {editingStudent ? 'Edit Student Profile' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sjenkins@htu.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Student ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 172380"
                    value={studentIdField}
                    onChange={(e) => setStudentIdField(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jenkins"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Session</label>
                  <input
                    type="text"
                    placeholder="e.g. Fall 2026"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cohort</label>
                  <input
                    type="text"
                    placeholder="e.g. Returning Student"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Building / Hall Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Teresa Hall"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Suite</label>
                  <input
                    type="text"
                    placeholder="e.g. B"
                    value={suite}
                    onChange={(e) => setSuite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Room</label>
                  <input
                    type="text"
                    placeholder="e.g. 106"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Bed Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1"
                    value={bed}
                    onChange={(e) => setBed(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 outline-none focus:border-brand"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Housing Admin</option>
                    <option value="cafeteria_admin">Cafeteria Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_ra_check"
                    checked={isRa}
                    onChange={(e) => setIsRa(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand border-gray-300"
                  />
                  <label htmlFor="is_ra_check" className="text-xs font-bold text-gray-700 select-none cursor-pointer">Resident Assistant (RA)</label>
                </div>
              </div>

              {!editingStudent && (role === 'admin' || role === 'cafeteria_admin') && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password for Auth Account (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank for default password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-brand"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 py-2 border-t border-gray-50 mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-700">Account Enabled (Active)</span>
                </label>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-705 font-semibold text-xs hover:bg-gray-55 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-[#520100] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <h3 className="text-sm font-bold text-gray-900">Delete Student</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Are you sure you want to permanently delete this student record and their associated Supabase Auth credentials? This action is irreversible.
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
