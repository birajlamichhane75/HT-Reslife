'use client'

import React, { useState } from 'react'
import { CalendarEntry } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'

interface StudentCalendarListProps {
  initialEntries: CalendarEntry[]
}

const CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'holiday', label: 'Holiday / Break' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'housing', label: 'Housing' },
  { value: 'registration', label: 'Registration' }
]

export default function StudentCalendarList({ initialEntries }: StudentCalendarListProps) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const filteredEntries = initialEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) ||
      (entry.description && entry.description.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Programmatic Month Grouping (e.g., "August 2026")
  const groupedEntries: { [key: string]: CalendarEntry[] } = {}
  filteredEntries.forEach(entry => {
    const date = new Date(entry.start_date + 'T00:00:00')
    const monthYear = format(date, 'MMMM yyyy')
    if (!groupedEntries[monthYear]) {
      groupedEntries[monthYear] = []
    }
    groupedEntries[monthYear].push(entry)
  })

  // Get keys sorted chronologically
  const sortedMonths = Object.keys(groupedEntries).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'academic': 
        return {
          bg: 'bg-blue-50/50 border-blue-100',
          dot: 'bg-blue-500 ring-blue-100',
          badge: 'info',
          label: 'Academic'
        }
      case 'holiday':
        return {
          bg: 'bg-green-50/50 border-green-100',
          dot: 'bg-green-500 ring-green-100',
          badge: 'success',
          label: 'Holiday / Break'
        }
      case 'deadline':
        return {
          bg: 'bg-red-50/50 border-red-100',
          dot: 'bg-red-500 ring-red-100',
          badge: 'error',
          label: 'Deadline'
        }
      case 'housing':
        return {
          bg: 'bg-amber-50/50 border-amber-100',
          dot: 'bg-amber-500 ring-amber-100',
          badge: 'warning',
          label: 'Housing Specific'
        }
      case 'registration':
        return {
          bg: 'bg-gray-50/50 border-gray-100',
          dot: 'bg-gray-500 ring-gray-100',
          badge: 'neutral',
          label: 'Registration'
        }
      default:
        return {
          bg: 'bg-gray-50/50 border-gray-100',
          dot: 'bg-gray-500 ring-gray-100',
          badge: 'neutral',
          label: 'Event'
        }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search calendar dates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E5E8EF] rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-brand text-white shadow-sm' : 'bg-white border border-gray-150 text-gray-500 hover:bg-gray-50'}`}
          >
            All Dates
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === cat.value ? 'bg-brand text-white shadow-sm' : 'bg-white border border-gray-150 text-gray-500 hover:bg-gray-50'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Month Timeline */}
      {sortedMonths.length === 0 ? (
        <div className="bg-white border border-[#E5E8EF] p-10 rounded-2xl text-center text-xs text-gray-400">
          No calendar events match the current search or filters.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedMonths.map((month) => (
            <div key={month} className="flex flex-col gap-3.5">
              <h3 className="font-display font-bold text-gray-900 text-xs tracking-wider uppercase pl-1.5 border-l-2 border-brand">
                {month}
              </h3>
              
              <div className="flex flex-col gap-3">
                {groupedEntries[month].map((entry) => {
                  const styles = getCategoryStyles(entry.category)
                  const hasEndDate = entry.end_date && entry.end_date !== entry.start_date
                  const dateStr = hasEndDate
                    ? `${format(new Date(entry.start_date + 'T00:00:00'), 'EEE, MMM d')} - ${format(new Date(entry.end_date + 'T00:00:00'), 'EEE, MMM d, yyyy')}`
                    : format(new Date(entry.start_date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')

                  return (
                    <Card key={entry.id} className={`flex items-start gap-4 p-4 border transition-all duration-200 hover:scale-[1.005] ${styles.bg}`}>
                      {/* Left Dot Indicator */}
                      <div className="pt-1 flex-shrink-0">
                        <span className={`w-3 h-3 rounded-full block border-2 border-white ring-4 ${styles.dot}`} />
                      </div>
                      
                      {/* Info Panel */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-bold text-brand">{dateStr}</span>
                          <Badge variant={styles.badge as any}>{styles.label}</Badge>
                        </div>
                        <h4 className="font-display font-semibold text-gray-900 text-sm">{entry.title}</h4>
                        {entry.description && (
                          <p className="text-xs text-gray-500 leading-relaxed font-medium mt-0.5">{entry.description}</p>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
