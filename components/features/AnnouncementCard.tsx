'use client'

import React, { useState } from 'react'
import { Announcement } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'
import { parseImageFromText } from '@/lib/image-utils'

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
  const { imageUrl, cleanText } = parseImageFromText(announcement.image_url, announcement.body)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || !!isPinned || !!imageUrl)
  const [showLightbox, setShowLightbox] = useState(false)

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
    <>
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
            {imageUrl && (
              <span className="text-[10px] font-bold text-brand bg-brand-light/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Flyer Attached
              </span>
            )}
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

        {/* Flyer Image Preview if present */}
        {imageUrl && (
          <div
            className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900 group/img max-h-64 sm:max-h-80 flex items-center justify-center cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation()
              setShowLightbox(true)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={announcement.title}
              className="w-full h-full object-contain max-h-64 sm:max-h-80 transition-transform duration-200 group-hover/img:scale-[1.02]"
            />
            <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              <span>Click to Expand</span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-col gap-3 transition-all duration-300">
            <p className="text-xs text-gray-650 leading-relaxed whitespace-pre-wrap">
              {renderTextWithLinks(cleanText)}
            </p>

            {actionUrl && (
              <div className="pt-1 flex items-center justify-between gap-3">
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                  Official External Link
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

      {/* Lightbox Modal */}
      {showLightbox && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
              aria-label="Close flyer"
            >
              <span>Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={announcement.title}
              className="w-auto h-auto max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/10"
            />

            <div className="mt-3 text-center">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#FFCC00] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>Open high-res flyer image</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
