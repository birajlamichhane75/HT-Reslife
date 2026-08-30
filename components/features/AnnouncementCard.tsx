'use client'

import React, { useState } from 'react'
import { Announcement } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const priorityColors = {
    urgent: 'border-l-red-500 bg-red-50/10',
    event: 'border-l-green-500 bg-green-50/10',
    info: 'border-l-blue-500 bg-blue-50/10',
  }

  const dotColors = {
    urgent: 'bg-red-500',
    event: 'bg-green-500',
    info: 'bg-blue-500',
  }

  return (
    <Card 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`border-l-4 ${priorityColors[announcement.priority]} hover:scale-[1.01] transition-all duration-200 cursor-pointer select-none`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[announcement.priority]}`} />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {announcement.priority}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {format(new Date(announcement.created_at), 'MMM d, h:mm a')}
        </span>
      </div>
      
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-display font-semibold text-gray-900 text-sm leading-tight flex-1">
          {announcement.title}
        </h3>
        <span className="text-gray-400 hover:text-brand transition-colors flex-shrink-0">
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </div>

      {isExpanded && (
        <p className="text-xs text-gray-650 leading-relaxed mt-2.5 pt-2.5 border-t border-gray-100 whitespace-pre-wrap transition-all duration-300">
          {announcement.body}
        </p>
      )}
    </Card>
  )
}

