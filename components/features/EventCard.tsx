'use client'

import React, { useState } from 'react'
import { Event } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'
import { parseImageFromText } from '@/lib/image-utils'

export default function EventCard({ event }: { event: Event }) {
  const { imageUrl, cleanText } = parseImageFromText(event.image_url, event.description)
  const [showLightbox, setShowLightbox] = useState(false)

  const tagColors = {
    mandatory: 'bg-amber-500 text-white',
    social: 'bg-green-500 text-white',
    academic: 'bg-blue-500 text-white',
    deadline: 'bg-red-500 text-white',
    housing: 'bg-purple-500 text-white',
  }

  const dateColors = {
    mandatory: 'bg-amber-50 text-amber-700 border-amber-200',
    social: 'bg-green-50 text-green-700 border-green-200',
    academic: 'bg-blue-50 text-blue-700 border-blue-200',
    deadline: 'bg-red-50 text-red-700 border-red-200',
    housing: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  let month = ''
  let day = ''
  let time = ''
  try {
    const eventDate = new Date(event.event_date)
    month = format(eventDate, 'MMM')
    day = format(eventDate, 'd')
    time = format(eventDate, 'h:mm a')
  } catch {
    month = 'Event'
    day = '•'
    time = 'TBD'
  }

  return (
    <>
      <Card className="hover:scale-[1.01] transition-transform duration-200 p-4 flex flex-col gap-3">
        <div className="flex gap-4 items-center">
          {/* Date Column */}
          <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${dateColors[event.tag] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
            <span className="text-[9px] uppercase font-bold tracking-wider leading-none mb-0.5">{month}</span>
            <span className="text-xl font-bold font-display leading-none">{day}</span>
          </div>

          {/* Info Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[event.tag] || 'bg-gray-200 text-gray-800'}`}>
                {event.tag}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">{time}</span>
            </div>
            <h3 className="font-display font-semibold text-gray-900 text-sm truncate">{event.title}</h3>
            {event.location && (
              <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{event.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Flyer Image Preview if present */}
        {imageUrl && (
          <div
            className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900 max-h-56 flex items-center justify-center cursor-zoom-in group/img"
            onClick={() => setShowLightbox(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-full object-contain max-h-56 transition-transform duration-200 group-hover/img:scale-[1.02]"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 text-white text-[9px] font-bold rounded-md flex items-center gap-1">
              <span>View Flyer</span>
              <span>↗</span>
            </div>
          </div>
        )}

        {cleanText && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed whitespace-pre-wrap border-t border-gray-50 pt-2">
            {cleanText}
          </p>
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
              alt={event.title}
              className="w-auto h-auto max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  )
}
