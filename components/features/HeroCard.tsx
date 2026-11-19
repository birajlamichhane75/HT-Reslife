import React from 'react'
import Link from 'next/link'

export default function HeroCard({
  studentName,
  hallName,
  roomNumber,
}: {
  studentName: string
  hallName: string | null
  roomNumber: string | null
}) {
  return (
    <div className="w-full bg-gradient-to-br from-[#660100] via-[#520100] to-[#380100] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-white/10 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-14 -top-12 w-28 h-28 rounded-full bg-[#FFCC00]/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#660100] bg-[#FFCC00] px-2.5 py-0.5 rounded-full shadow-2xs">
            On-Campus Resident
          </span>
          <span className="text-[11px] text-white/70 font-medium hidden sm:inline">
            Huston-Tillotson University
          </span>
        </div>

        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white">
            {studentName}
          </h2>
          <p className="text-xs text-white/80 font-normal mt-0.5">
            Residence Life & Housing Portal
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-[9px] text-[#F7E3B8] uppercase font-bold tracking-wider block">
              Residence Hall
            </span>
            <p className="text-sm font-bold text-white mt-0.5 truncate">
              {hallName || 'Not Assigned'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-[9px] text-[#F7E3B8] uppercase font-bold tracking-wider block">
              Room Number
            </span>
            <p className="text-sm font-bold text-white mt-0.5 truncate">
              {roomNumber || 'N/A'}
            </p>
          </div>
        </div>

        {/* Quick shortcut pills */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <Link
            href="/dining"
            className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>🍽️</span>
            <span>Today's Dining Menu</span>
          </Link>
          <Link
            href="/maintenance"
            className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>🛠️</span>
            <span>Submit Maintenance</span>
          </Link>
          <Link
            href="/announcements"
            className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>📢</span>
            <span>View All Notices</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
