'use client'

import React, { useState } from 'react'
import { Announcement } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

interface AnnouncementCardProps {
  announcement: Announcement
  isPinned?: boolean
  actionUrl?: string
  actionLabel?: string
  defaultExpanded?: boolean
}

function renderTextWithLinks(text: string) {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-brand font-semibold underline hover:text-[#520100] transition-colors break-all"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default function AnnouncementCard({
  announcement,
  isPinned,
  actionUrl,
  actionLabel = 'Access Form',
  defaultExpanded = false,
}: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || !!isPinned)

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

  let formattedDate = ''
  try {
    formattedDate = format(new Date(announcement.created_at), 'MMM d, h:mm a')
  } catch {
    formattedDate = 'Recently'
  }

  return (
    <Card
      onClick={() => setIsExpanded(!isExpanded)}
      className={`border-l-4 ${priorityColors[announcement.priority] || priorityColors.info} ${
        isPinned ? 'ring-1 ring-amber-300/60 shadow-md bg-amber-50/20' : ''
      } hover:scale-[1.01] transition-all duration-200 cursor-pointer select-none`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isPinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#660100] bg-[#FFCC00] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              📌 Pinned Notice
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColors[announcement.priority] || dotColors.info}`} />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {announcement.priority}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {formattedDate}
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
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-col gap-3 transition-all duration-300">
          <p className="text-xs text-gray-650 leading-relaxed whitespace-pre-wrap">
            {renderTextWithLinks(announcement.body)}
          </p>

          {actionUrl && (
            <div className="pt-1 flex items-center justify-between gap-3">
              <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                External Microsoft Form
              </span>
              <a
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-[#520100] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <span>{actionLabel}</span>
                <span className="text-sm leading-none">↗</span>
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
