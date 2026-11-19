'use client'

import React from 'react'
import Link from 'next/link'
import { enrichMenuItem } from '@/lib/dining/station-catalog'

interface TodayDiningWidgetProps {
  currentMealName?: string
  operatingHoursText?: string
  isOpen?: boolean
  sampleItems?: string[]
}

const DEFAULT_HIGHLIGHTS = [
  'Scrambled Eggs',
  'Biscuits and Country Gravy',
  'Meatless Vegetarian Sausage Patty',
  'Cubed Watermelon',
  'Cinnamon Roll',
]

export default function TodayDiningWidget({
  currentMealName = 'Breakfast',
  operatingHoursText = '7:30 AM – 9:00 AM',
  isOpen = true,
  sampleItems = DEFAULT_HIGHLIGHTS,
}: TodayDiningWidgetProps) {
  const enriched = sampleItems.map((item) => enrichMenuItem(item))

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs transition-all hover:border-gray-300">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#660100]/5 text-[#660100] flex items-center justify-center text-lg border border-[#660100]/15">
            🍽️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-gray-900 text-sm tracking-tight">
                Campus Dining Hall
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Serving <span className="font-semibold text-gray-800">{currentMealName}</span> • {operatingHoursText}
            </p>
          </div>
        </div>

        <Link
          href="/dining"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#660100] hover:text-[#520100] bg-[#660100]/5 hover:bg-[#660100]/10 px-3 py-1.5 rounded-lg border border-[#660100]/20 transition-colors"
        >
          <span>View Station Menu</span>
          <span>→</span>
        </Link>
      </div>

      {/* Highlights List Styled like Reference Station Table */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-2">
          <span>Station Highlights</span>
          <div className="flex items-center gap-6">
            <span>Portion</span>
            <span>Calories</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {enriched.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href="/dining"
              className="group flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="text-[9px] font-bold text-gray-500 bg-gray-150 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider flex-shrink-0">
                  {item.station}
                </span>
                <span className="text-xs font-semibold text-gray-800 group-hover:text-[#660100] transition-colors truncate">
                  {item.name}
                </span>
                {item.is_vegetarian && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    V
                  </span>
                )}
                {item.is_halal && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                    HAL
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 text-xs text-gray-500 flex-shrink-0">
                <span className="text-gray-500 font-medium">{item.portion}</span>
                <span className="font-semibold text-gray-900 w-10 text-right">
                  {item.calories}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile view full button */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 flex sm:hidden">
        <Link
          href="/dining"
          className="w-full text-center py-2 bg-[#660100] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#520100] transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Open Full Station Menu (Grill, Homestyle, Salad)</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}

