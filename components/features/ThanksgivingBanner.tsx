'use client'

import React, { useState, useEffect } from 'react'
import { THANKSGIVING_BREAK_FORM } from '@/lib/constants'

export default function ThanksgivingBanner() {
  const [isDismissed, setIsDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const dismissed = sessionStorage.getItem('dismiss_thanksgiving_banner')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      sessionStorage.setItem('dismiss_thanksgiving_banner', 'true')
    } catch {
      // Ignore sessionStorage errors
    }
  }

  if (mounted && isDismissed) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#660100] via-[#7d0808] to-[#4a0000] text-white p-5 sm:p-6 shadow-md border border-[#FFCC00]/30 transition-all">
      {/* Decorative background glow & shapes */}
      <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#FFCC00]/10 blur-xl pointer-events-none" />
      <div className="absolute right-12 -top-12 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute top-3.5 right-3.5 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-20"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FFCC00]/20 border border-[#FFCC00]/40 flex items-center justify-center text-xl shadow-inner mt-0.5">
            🦃
          </div>
          <div className="flex flex-col gap-1 pr-6 md:pr-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#660100] bg-[#FFCC00] px-2.5 py-0.5 rounded-full shadow-sm">
                Housing Notice
              </span>
              <span className="text-[10px] text-[#F7E3B8] font-medium">
                Action Required for Break Stay
              </span>
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
              {THANKSGIVING_BREAK_FORM.title}
            </h3>
            <p className="text-xs text-white/80 font-normal leading-relaxed max-w-xl">
              Planning to stay on campus during Thanksgiving Break? All residential students must submit the official request form to guarantee building access and housing accommodations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto pl-[54px] md:pl-0 flex-shrink-0">
          <a
            href={THANKSGIVING_BREAK_FORM.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-[#ebd255] text-[#660100] font-bold text-xs shadow-md transition-all active:scale-95 group"
          >
            <span>Complete Form</span>
            <svg 
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

