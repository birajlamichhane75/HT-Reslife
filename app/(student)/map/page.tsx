'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const HALLS = {
  'Allen-Frazier Hall': {
    address: '900 Chicon Street, Austin, TX 78702',
    mapSrc: 'https://maps.google.com/maps?q=Huston-Tillotson+University+Austin+TX+Allen-Frazier+Hall&output=embed',
    population: 'Women Only',
    type: 'Traditional Residence Hall',
    features: 'Suite-style living, community lounges, study areas',
    details: 'Laundry facilities, high-speed Wi-Fi',
  },
  'Beard-Burrowes Hall': {
    address: '900 Chicon Street, Austin, TX 78702',
    mapSrc: 'https://maps.google.com/maps?q=Huston-Tillotson+University+Austin+TX+Beard-Burrowes+Hall&output=embed',
    population: 'Men Only',
    type: 'Traditional Residence Hall',
    features: 'Community bathrooms, programming spaces',
    details: 'Resident Assistant support, laundry, Wi-Fi',
  },
  'Teresa Hall': {
    address: '3001 South Congress Avenue, Building TERE, Austin, TX 78704',
    mapSrc: 'https://maps.google.com/maps?q=3001+South+Congress+Avenue+Austin+TX+78704&output=embed',
    population: 'Co-ed (Upperclassmen, Returning, Staff)',
    type: 'Partnered Campus Housing',
    features: 'Furnished rooms, secure card-access, lounges, study spaces',
    details: 'St. Edward\'s University campus partnership, shuttle transit, kitchen, laundry',
  },
}

type HallName = keyof typeof HALLS

export default function CampusMapPage() {
  const [selectedHall, setSelectedHall] = useState<HallName>('Allen-Frazier Hall')
  const hall = HALLS[selectedHall]

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 text-gray-400 hover:text-brand hover:bg-gray-150/50 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-semibold text-lg text-gray-900 leading-tight">Campus Map</h1>
          <p className="text-[10px] text-gray-400 font-medium">Explore residence halls & locations</p>
        </div>
      </div>

      {/* Hall Selector Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(HALLS) as HallName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelectedHall(name)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
              selectedHall === name
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white border-[#E5E8EF] text-gray-500 hover:text-gray-900'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Maps Iframe Wrapper */}
      <div className="w-full h-56 rounded-2xl overflow-hidden border border-[#E5E8EF] shadow-sm bg-white relative">
        <iframe
          title={`${selectedHall} Location`}
          src={hall.mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Hall Details panel */}
      <div className="bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="font-display font-semibold text-gray-900 text-sm mb-1">{selectedHall}</h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">{hall.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Population</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.population}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Housing Type</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.type}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Living Features</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.features}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Amenities & Highlights</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.details}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
