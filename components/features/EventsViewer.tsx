'use client'

import React, { useState, useMemo } from 'react'
import { Event } from '@/lib/types'
import EventCard from '@/components/features/EventCard'

interface EventsViewerProps {
  initialEvents: Event[]
}

export default function EventsViewer({ initialEvents }: EventsViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  const filtered = useMemo(() => {
    return initialEvents.filter((ev) => {
      // Tag filter
      if (selectedTag !== 'all' && ev.tag !== selectedTag) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = (ev.title || '').toLowerCase().includes(query)
        const matchDesc = (ev.description || '').toLowerCase().includes(query)
        const matchLoc = (ev.location || '').toLowerCase().includes(query)
        return matchTitle || matchDesc || matchLoc
      }

      return true
    })
  }, [initialEvents, selectedTag, searchQuery])

  const counts = useMemo(() => {
    return {
      all: initialEvents.length,
      mandatory: initialEvents.filter((e) => e.tag === 'mandatory').length,
      social: initialEvents.filter((e) => e.tag === 'social').length,
      academic: initialEvents.filter((e) => e.tag === 'academic').length,
      housing: initialEvents.filter((e) => e.tag === 'housing').length,
      deadline: initialEvents.filter((e) => e.tag === 'deadline').length,
    }
  }, [initialEvents])

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        {/* Search input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name, location, or details..."
            className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#660100]/20 focus:border-[#660100] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-2.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              selectedTag === 'all'
                ? 'bg-gray-900 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
            }`}
          >
            All Events ({counts.all})
          </button>
          {counts.social > 0 && (
            <button
              onClick={() => setSelectedTag('social')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedTag === 'social'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200/50'
              }`}
            >
              🎉 Social ({counts.social})
            </button>
          )}
          {counts.academic > 0 && (
            <button
              onClick={() => setSelectedTag('academic')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedTag === 'academic'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100/70 border border-blue-200/50'
              }`}
            >
              📚 Academic ({counts.academic})
            </button>
          )}
          {counts.housing > 0 && (
            <button
              onClick={() => setSelectedTag('housing')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedTag === 'housing'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100/70 border border-purple-200/50'
              }`}
            >
              🏠 Housing ({counts.housing})
            </button>
          )}
          {counts.mandatory > 0 && (
            <button
              onClick={() => setSelectedTag('mandatory')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedTag === 'mandatory'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100/70 border border-amber-200/50'
              }`}
            >
              ⚠️ Mandatory ({counts.mandatory})
            </button>
          )}
          {counts.deadline > 0 && (
            <button
              onClick={() => setSelectedTag('deadline')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedTag === 'deadline'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100/70 border border-red-200/50'
              }`}
            >
              ⏰ Deadlines ({counts.deadline})
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-10 rounded-2xl text-center flex flex-col items-center gap-2">
          <span className="text-3xl">📅</span>
          <h4 className="font-display font-bold text-gray-900 text-sm">No events found</h4>
          <p className="text-xs text-gray-400 max-w-sm">
            {searchQuery
              ? `No events match "${searchQuery}". Try a different keyword.`
              : 'There are currently no upcoming events under this category.'}
          </p>
          {(searchQuery || selectedTag !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedTag('all')
              }}
              className="mt-2 text-xs font-bold text-[#660100] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  )
}

