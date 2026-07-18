'use client'

import React, { useState } from 'react'
import { Student } from '@/lib/types'
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

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase()
    return (
      s.full_name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (s.hall_name && s.hall_name.toLowerCase().includes(term)) ||
      (s.room_number && s.room_number.includes(term))
    )
  })

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
      {/* Search & Notice */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search students by name, email, or hall..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="p-3 bg-blue-50/60 border border-blue-150 rounded-xl max-w-md">
          <p className="text-[10px] text-blue-700 leading-normal font-medium">
            ℹ️ <strong>Roles:</strong> Access roles ('student' or 'admin') are read-only here for security. To modify a user's role, please update the role field in the Supabase Table Editor.
          </p>
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Access Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{student.full_name}</td>
                    <td className="px-5 py-4 text-gray-500">{student.email}</td>
                    <td className="px-5 py-4">
                      {student.hall_name ? `${student.hall_name} • Room ${student.room_number || 'N/A'}` : 'Not Assigned'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={student.role === 'admin' ? 'info' : 'neutral'}>
                        {student.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium">
                      <Badge variant={student.is_active ? 'success' : 'error'}>
                        {student.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center">
                        <label className="inline-flex items-center cursor-pointer select-none relative">
                          <input
                            type="checkbox"
                            disabled={updatingId === student.id}
                            checked={student.is_active}
                            onChange={() => handleToggleActive(student.id, student.is_active)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand relative"></div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
