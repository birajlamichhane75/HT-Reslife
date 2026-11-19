'use client'

import React, { useState, useMemo } from 'react'
import { FormItem } from '@/lib/types'
import { THANKSGIVING_BREAK_FORM } from '@/lib/constants'

interface FormsViewerProps {
  forms: FormItem[]
}

const EREZLIFE_ONLINE_SERVICES = [
  {
    id: 'erezlife-guest-checkin',
    title: 'Guest Registration & Visitor Pass',
    category: 'eRezLife Portal',
    description: 'Log and register overnight guests and visitors per HT Residence Life policies.',
    url: 'https://htu.erezlife.com/',
    isExternal: true,
    tag: 'Digital Submission',
  },
  {
    id: 'erezlife-housing-app',
    title: 'On-Campus Housing Application',
    category: 'eRezLife Portal',
    description: 'Submit your room selection, housing deposit confirmation, and term preferences.',
    url: 'https://htu.erezlife.com/',
    isExternal: true,
    tag: 'Portal Login',
  },
  {
    id: 'erezlife-roommate-contract',
    title: 'Roommate Agreement Form',
    category: 'eRezLife Portal',
    description: 'Establish shared room rules, study quiet hours, and personal boundaries with your roommate.',
    url: 'https://htu.erezlife.com/',
    isExternal: true,
    tag: 'Required',
  },
]

export default function FormsViewer({ forms }: FormsViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'seasonal' | 'paperwork' | 'erezlife'>('all')

  const seasonalForms = useMemo(() => {
    return forms.filter(
      (f) =>
        f.id === THANKSGIVING_BREAK_FORM.id ||
        f.title.toLowerCase().includes('thanksgiving') ||
        f.title.toLowerCase().includes('break')
    )
  }, [forms])

  const generalForms = useMemo(() => {
    return forms.filter(
      (f) =>
        f.id !== THANKSGIVING_BREAK_FORM.id &&
        !f.title.toLowerCase().includes('thanksgiving') &&
        !f.title.toLowerCase().includes('break')
    )
  }, [forms])

  // Filter based on search query
  const matchesSearch = (title?: string | null, desc?: string | null) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (title || '').toLowerCase().includes(q) || (desc || '').toLowerCase().includes(q)
  }

  const filteredSeasonal = seasonalForms.filter((f) => matchesSearch(f.title, f.description))
  const filteredGeneral = generalForms.filter((f) => matchesSearch(f.title, f.description))
  const filteredErezlife = EREZLIFE_ONLINE_SERVICES.filter((f) =>
    matchesSearch(f.title, f.description)
  )

  const totalResults =
    (activeCategory === 'all' || activeCategory === 'seasonal' ? filteredSeasonal.length : 0) +
    (activeCategory === 'all' || activeCategory === 'paperwork' ? filteredGeneral.length : 0) +
    (activeCategory === 'all' || activeCategory === 'erezlife' ? filteredErezlife.length : 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Category Filter */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
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
            placeholder="Search forms, agreements, waivers by name or keyword..."
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-gray-900 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
            }`}
          >
            All Forms
          </button>
          <button
            onClick={() => setActiveCategory('seasonal')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'seasonal'
                ? 'bg-[#660100] text-white shadow-2xs'
                : 'bg-[#660100]/5 text-[#660100] hover:bg-[#660100]/10 border border-[#660100]/20'
            }`}
          >
            🦃 Seasonal & Break Forms
          </button>
          <button
            onClick={() => setActiveCategory('paperwork')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'paperwork'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100/70 border border-blue-200/50'
            }`}
          >
            📋 Official Paperwork
          </button>
          <button
            onClick={() => setActiveCategory('erezlife')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'erezlife'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100/70 border border-amber-200/50'
            }`}
          >
            🔑 eRezLife Digital Portal
          </button>
        </div>
      </div>

      {totalResults === 0 ? (
        <div className="bg-white border border-gray-200 p-10 rounded-2xl text-center flex flex-col items-center gap-2">
          <span className="text-3xl">📄</span>
          <h4 className="font-display font-bold text-gray-900 text-sm">No forms found</h4>
          <p className="text-xs text-gray-400 max-w-sm">
            {searchQuery
              ? `No forms match "${searchQuery}". Please check your spelling or contact your Residence Hall Coordinator.`
              : 'No documents in this category.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* SECTION 1: Seasonal / Holiday Forms */}
          {(activeCategory === 'all' || activeCategory === 'seasonal') && filteredSeasonal.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🦃</span>
                  <h3 className="font-display font-bold text-gray-900 text-sm">
                    Seasonal & Priority Break Forms
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#660100] bg-[#FFCC00] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSeasonal.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white border-2 border-amber-300 ring-4 ring-amber-100/60 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-extrabold text-[#660100] tracking-wider">
                          Official Form
                        </span>
                        <span className="text-[10px] font-bold bg-[#FFCC00]/25 text-[#660100] border border-[#FFCC00]/50 px-2 py-0.5 rounded-md">
                          Fall 2026 – Spring 2027
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-gray-900 text-sm sm:text-base leading-snug">
                        {form.title}
                      </h4>
                      <p className="text-xs text-gray-600 font-normal mt-1 leading-relaxed">
                        {form.description}
                      </p>
                    </div>

                    <a
                      href={form.url || THANKSGIVING_BREAK_FORM.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-2.5 bg-[#660100] hover:bg-[#520100] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Open Thanksgiving Break Form</span>
                      <span>↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: General Paperwork */}
          {(activeCategory === 'all' || activeCategory === 'paperwork') && filteredGeneral.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="font-display font-bold text-gray-900 text-sm">
                  Official Residence Life Paperwork
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredGeneral.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white border border-gray-200/90 hover:border-gray-300 p-4 rounded-xl shadow-2xs flex flex-col justify-between gap-3.5 transition-all"
                  >
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                        HT Housing Document
                      </span>
                      <h4 className="font-display font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                        {form.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                        {form.description}
                      </p>
                    </div>

                    <a
                      href={form.url || 'https://htu.edu'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-2 bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Access Document</span>
                      <span>↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: eRezLife Portal Direct Services */}
          {(activeCategory === 'all' || activeCategory === 'erezlife') && filteredErezlife.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔑</span>
                <h3 className="font-display font-bold text-gray-900 text-sm">
                  eRezLife Portal Self-Service
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {filteredErezlife.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white border border-gray-200/90 hover:border-[#FFCC00]/60 p-4 rounded-xl shadow-2xs flex flex-col justify-between gap-3.5 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] uppercase font-bold text-[#660100] tracking-wider">
                          eRezLife
                        </span>
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                          {service.tag}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-gray-900 text-xs leading-snug">
                        {service.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-2 bg-[#FFCC00]/15 hover:bg-[#FFCC00]/25 text-[#660100] border border-[#FFCC00]/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Open eRezLife</span>
                      <span>↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

