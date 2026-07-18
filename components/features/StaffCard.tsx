'use client'

import React, { useState } from 'react'
import { StaffMember } from '@/lib/types'
import { Card } from '@/components/ui/Card'

export function StaffCard({ staff }: { staff: StaffMember }) {
  const initials = staff.avatar_initials || staff.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Card className="flex items-center gap-4 hover:scale-[1.01] transition-transform duration-200 p-4">
      {/* Initials Avatar */}
      <div className="w-11 h-11 rounded-full bg-brand-light/70 flex items-center justify-center text-brand font-bold text-sm font-display flex-shrink-0">
        {initials}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-gray-900 text-sm truncate">{staff.full_name}</h4>
        <p className="text-xs text-gray-400 font-medium truncate">{staff.role}</p>
        {staff.hall && (
          <p className="text-[10px] font-bold text-brand uppercase mt-0.5 tracking-wider">{staff.hall}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {staff.phone && (
          <a
            href={`tel:${staff.phone}`}
            title="Call Phone"
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-brand-light hover:text-brand flex items-center justify-center text-gray-400 transition-colors border border-gray-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        )}
        {staff.email && (
          <a
            href={`mailto:${staff.email}`}
            title="Email Staff"
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-brand-light hover:text-brand flex items-center justify-center text-gray-400 transition-colors border border-gray-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        )}
      </div>
    </Card>
  )
}

export function StaffList({ initialStaff }: { initialStaff: StaffMember[] }) {
  const [search, setSearch] = useState('')

  const filteredStaff = initialStaff.filter((s) => {
    const term = search.toLowerCase()
    return (
      s.full_name.toLowerCase().includes(term) ||
      s.role.toLowerCase().includes(term) ||
      (s.hall && s.hall.toLowerCase().includes(term))
    )
  })

  // Grouping: Your building (hall is not null), Housing office (hall is null)
  const buildingStaff = filteredStaff.filter((s) => s.hall !== null && s.hall !== '')
  const officeStaff = filteredStaff.filter((s) => s.hall === null || s.hall === '')

  return (
    <div className="flex flex-col gap-5">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search staff by name, role, or hall..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30 shadow-sm"
        />
      </div>

      {/* Your Building Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-gray-900 text-xs uppercase tracking-wider">
          Your Building Staff
        </h3>
        {buildingStaff.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-1">No building staff found matching search.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {buildingStaff.map((staff) => (
              <StaffCard key={staff.id} staff={staff} />
            ))}
          </div>
        )}
      </div>

      {/* Housing Office Section */}
      <div className="flex flex-col gap-3 mt-2">
        <h3 className="font-display font-semibold text-gray-900 text-xs uppercase tracking-wider">
          Housing Office Staff
        </h3>
        {officeStaff.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-1">No office staff found matching search.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {officeStaff.map((staff) => (
              <StaffCard key={staff.id} staff={staff} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
