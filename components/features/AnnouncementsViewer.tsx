'use client'

import React, { useState, useMemo } from 'react'
import { Announcement } from '@/lib/types'
import AnnouncementCard from '@/components/features/AnnouncementCard'

interface AnnouncementsViewerProps {
  initialAnnouncements: Announcement[]
}

export default function AnnouncementsViewer({ initialAnnouncements }: AnnouncementsViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'info' | 'event' | 'flyers'>('all')

  const filtered = useMemo(() => {
    return initialAnnouncements.filter((ann) => {
      // Priority / flyer filter
      if (filterPriority === 'urgent' && ann.priority !== 'urgent') return false
      if (filterPriority === 'info' && ann.priority !== 'info') return false
      if (filterPriority === 'event' && ann.priority !== 'event') return false
      if (filterPriority === 'flyers') {
        const hasFlyer = !!ann.image_url || ann.body.includes('[image:') || ann.body.includes('http')
        if (!hasFlyer) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = ann.title.toLowerCase().includes(query)
        const matchBody = ann.body.toLowerCase().includes(query)
        return matchTitle || matchBody
      }

      return true
    })
  }, [initialAnnouncements, filterPriority, searchQuery])

  const counts = useMemo(() => {
    return {
      all: initialAnnouncements.length,
      urgent: initialAnnouncements.filter((a) => a.priority === 'urgent').length,
      info: initialAnnouncements.filter((a) => a.priority === 'info').length,
      event: initialAnnouncements.filter((a) => a.priority === 'event').length,
      flyers: initialAnnouncements.filter(
        (a) => !!a.image_url || a.body.includes('[image:')
      ).length,
    }
  }, [initialAnnouncements])

  const firstUrgentIndex = filtered.findIndex((a) => a.priority === 'urgent')

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
            placeholder="Search announcements by keywords, dates, topics..."
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
            onClick={() => setFilterPriority('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              filterPriority === 'all'
                ? 'bg-gray-900 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
            }`}
          >
            All Notices ({counts.all})
          </button>
          {counts.urgent > 0 && (
            <button
              onClick={() => setFilterPriority('urgent')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterPriority === 'urgent'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100/70 border border-red-200/50'
              }`}
            >
              🚨 Urgent ({counts.urgent})
            </button>
          )}
          {counts.flyers > 0 && (
            <button
              onClick={() => setFilterPriority('flyers')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterPriority === 'flyers'
                  ? 'bg-[#660100] text-white shadow-2xs'
                  : 'bg-[#660100]/5 text-[#660100] hover:bg-[#660100]/10 border border-[#660100]/20'
              }`}
            >
              🖼️ Flyers ({counts.flyers})
            </button>
          )}
          <button
            onClick={() => setFilterPriority('info')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              filterPriority === 'info'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100/70 border border-blue-200/50'
            }`}
          >
            ℹ️ Info ({counts.info})
          </button>
          {counts.event > 0 && (
            <button
              onClick={() => setFilterPriority('event')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterPriority === 'event'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200/50'
              }`}
            >
              🎉 Events ({counts.event})
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-10 rounded-2xl text-center flex flex-col items-center gap-2">
          <span className="text-3xl">🔍</span>
          <h4 className="font-display font-bold text-gray-900 text-sm">No announcements found</h4>
          <p className="text-xs text-gray-400 max-w-sm">
            {searchQuery
              ? `No announcements match "${searchQuery}". Try a different keyword.`
              : 'There are currently no announcements under this category.'}
          </p>
          {(searchQuery || filterPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterPriority('all')
              }}
              className="mt-2 text-xs font-bold text-[#660100] hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map((ann, idx) => {
            const isPinned = idx === firstUrgentIndex
            return (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                isPinned={isPinned}
                defaultExpanded={isPinned}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

