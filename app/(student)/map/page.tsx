'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const HALLS = {
  'Heritage Hall': {
    address: '1820 East 8th Street, Austin, TX 78702',
    mapSrc: 'https://maps.google.com/maps?q=Huston-Tillotson+University+Austin+TX+Heritage+Hall&output=embed',
    rooms: '120 rooms — co-ed by floor',
    laundry: 'Floors 1 and 3',
    wifi: 'ResNet Wi-Fi throughout',
    amenity: 'Lounge on each floor',
  },
  'Lawson Hall': {
    address: '900 Chicon Street, Austin, TX 78702',
    mapSrc: 'https://maps.google.com/maps?q=Huston-Tillotson+University+Austin+TX+Lawson+Hall&output=embed',
    rooms: '150 rooms — freshman residency',
    laundry: 'Ground floor laundry room',
    wifi: 'ResNet Wi-Fi throughout',
    amenity: 'Study rooms & computer lab',
  },
  'Allen Hall': {
    address: '900 Chicon Street, Austin, TX 78702',
    mapSrc: 'https://maps.google.com/maps?q=Huston-Tillotson+University+Austin+TX+Allen+Hall&output=embed',
    rooms: '100 rooms — male-only residency',
    laundry: 'First floor lobby',
    wifi: 'ResNet Wi-Fi throughout',
    amenity: 'Game room & common lounge',
  },
  'University Suites': {
    address: '1001 Chicon Street, Austin, TX 78702',
    mapSrc: 'https://maps.google.com/maps?q=Huston-Tillotson+University+Austin+TX+Suites&output=embed',
    rooms: '80 suite-style rooms — upperclassmen',
    laundry: 'Laundry room on floor 2',
    wifi: 'ResNet Wi-Fi & ethernet ports',
    amenity: 'Kitchenette in each suite',
  },
}

type HallName = keyof typeof HALLS

export default function CampusMapPage() {
  const [selectedHall, setSelectedHall] = useState<HallName>('Heritage Hall')
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
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Capacity / Layout</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.rooms}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">WiFi Network</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.wifi}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Laundry Facilities</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.laundry}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Premium Amenity</span>
            <p className="font-semibold text-gray-800 mt-0.5">{hall.amenity}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
