import React from 'react'

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
    <div className="w-full bg-gradient-to-br from-brand via-[#245899] to-[#123663] text-white rounded-2xl p-6 shadow-md border border-white/10 relative overflow-hidden">
      {/* Decorative backdrop shapes */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-12 -top-12 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10">
        <span className="text-[9px] uppercase font-bold tracking-wider text-brand-light bg-white/15 px-2.5 py-1 rounded-full">
          On-Campus Resident
        </span>
        <h2 className="font-display font-bold text-xl mt-3.5 tracking-tight">{studentName}</h2>
        <p className="text-xs text-brand-light/85 mt-0.5">Huston-Tillotson University</p>

        <div className="flex gap-8 mt-5 pt-4 border-t border-white/10">
          <div>
            <span className="text-[9px] text-brand-light/70 uppercase font-bold tracking-wider">Residence Hall</span>
            <p className="text-sm font-bold mt-0.5">{hallName || 'Not Assigned'}</p>
          </div>
          <div>
            <span className="text-[9px] text-brand-light/70 uppercase font-bold tracking-wider">Room Number</span>
            <p className="text-sm font-bold mt-0.5">{roomNumber || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
