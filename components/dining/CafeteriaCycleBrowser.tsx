'use client'

import React, { useState, useEffect } from 'react'
import { 
  CAFETERIA_28_DAY_MENU, 
  CAFETERIA_CYCLE_DAYS, 
  DayOfWeekName, 
  DailyMenuCycle,
  calculateCycleWeek,
  JS_DAY_TO_NAME
} from '@/lib/dining/cafeteria-data'
import { Badge } from '@/components/ui/Badge'

interface CafeteriaCycleBrowserProps {
  onAskAboutDay?: (question: string) => void
}

export function CafeteriaCycleBrowser({ onAskAboutDay }: CafeteriaCycleBrowserProps) {
  const today = new Date()
  const realCurrentDay = (JS_DAY_TO_NAME[today.getDay()] || 'Thursday') as DayOfWeekName
  const realCurrentWeek = calculateCycleWeek(today)

  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | 3 | 4>(realCurrentWeek)
  const [selectedDay, setSelectedDay] = useState<DayOfWeekName>(realCurrentDay)
  const [menuData, setMenuData] = useState<DailyMenuCycle[]>(CAFETERIA_28_DAY_MENU)

  useEffect(() => {
    // Optionally fetch dynamic cycle menu from API if updated in DB
    async function loadCycle() {
      try {
        const res = await fetch('/api/dining/cycle')
        if (res.ok) {
          const data = await res.json()
          if (data.menus && data.menus.length >= 28) {
            setMenuData(data.menus)
          }
        }
      } catch (e) {
        // Fall back to static source of truth
      }
    }
    loadCycle()
  }, [])

  const currentMenu = menuData.find(
    (m) => m.week_number === selectedWeek && m.day_of_week.toLowerCase() === selectedDay.toLowerCase()
  )

  const isToday = selectedWeek === realCurrentWeek && selectedDay === realCurrentDay

  return (
    <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header with cycle info */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-gray-900 text-base">4-Week Cafeteria Menu Cycle</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#660100]/10 text-[#660100] text-[10px] font-bold uppercase tracking-wider">
              28 Days Total
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Menu cycle starts every Thursday • Current active week: <strong>Week {realCurrentWeek} ({realCurrentDay})</strong>
          </p>
        </div>

        {/* Week Selector Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
          {([1, 2, 3, 4] as const).map((w) => {
            const isCurrent = w === realCurrentWeek
            const isSelected = w === selectedWeek
            return (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-[#660100] shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Week {w}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse" title="Current Week" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day Selector Pills (Starts on Thursday per Rule 2) */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {CAFETERIA_CYCLE_DAYS.map((day) => {
          const isSelected = day === selectedDay
          const isDayToday = selectedWeek === realCurrentWeek && day === realCurrentDay
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#660100] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{day}</span>
              {isDayToday && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                    isSelected ? 'bg-[#FFCC00] text-black' : 'bg-[#660100] text-white'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Day Menu Content */}
      <div className="p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h4 className="font-display font-bold text-gray-900 text-sm">
              Week {selectedWeek} • {selectedDay} Menu
            </h4>
            {isToday && (
              <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
                Current Day
              </Badge>
            )}
          </div>

          {onAskAboutDay && (
            <button
              onClick={() => onAskAboutDay(`What is being served Week ${selectedWeek} ${selectedDay}?`)}
              className="text-xs font-semibold text-[#660100] hover:underline flex items-center gap-1"
            >
              <span>💬 Ask Assistant</span>
            </button>
          )}
        </div>

        {!currentMenu ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Menu details for this day are not available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Breakfast / Brunch Card */}
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wider">
                  <span>🍳</span>
                  <span>{currentMenu.breakfast_type}</span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                  Standard Buffet
                </span>
              </div>
              <ul className="space-y-1 text-xs text-gray-700 font-medium">
                {currentMenu.breakfast_items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lunch Card */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-xs uppercase tracking-wider">
                  <span>🍗</span>
                  <span>Lunch Entrées & Sides</span>
                </div>
                <span className="text-[10px] text-blue-800 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                  Main Dining
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 font-medium">
                {currentMenu.lunch_items.map((item, i) => {
                  const isVeg = item.toLowerCase().includes('veggie') ||
                                item.toLowerCase().includes('vegan') ||
                                item.toLowerCase().includes('meatless')
                  return (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>{item}</span>
                      </div>
                      {isVeg && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                          🌱 Veg
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Dinner Card */}
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                <div className="flex items-center gap-2 font-bold text-purple-950 text-xs uppercase tracking-wider">
                  <span>🍽️</span>
                  <span>Dinner</span>
                </div>
                <span className="text-[10px] text-purple-800 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                  Evening Meal
                </span>
              </div>
              {currentMenu.dinner_items === null || currentMenu.dinner_items.length === 0 ? (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500 italic">
                  ℹ️ The menu does not list the dinner items for this day.
                </div>
              ) : (
                <ul className="space-y-1.5 text-xs text-gray-700 font-medium">
                  {currentMenu.dinner_items.map((item, i) => {
                    const isVeg = item.toLowerCase().includes('veggie') ||
                                  item.toLowerCase().includes('vegan') ||
                                  item.toLowerCase().includes('meatless')
                    return (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>{item}</span>
                        </div>
                        {isVeg && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                            🌱 Veg
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Soup & Grill Station Card */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col gap-3">
              {/* Daily Soup */}
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-rose-200/60 mb-2">
                  <div className="flex items-center gap-2 font-bold text-rose-950 text-xs uppercase tracking-wider">
                    <span>🥣</span>
                    <span>Daily Soup</span>
                  </div>
                </div>
                {currentMenu.soup ? (
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200/70 text-xs font-semibold text-rose-950 flex items-center justify-between">
                    <span>{currentMenu.soup}</span>
                    {currentMenu.soup.toLowerCase().includes('vegetarian') && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        🌱 Veg
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No soup listed for this day.</p>
                )}
              </div>

              {/* Grill Station */}
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-rose-200/60 mb-2">
                  <div className="flex items-center gap-2 font-bold text-rose-950 text-xs uppercase tracking-wider">
                    <span>🍔</span>
                    <span>Grill Station & Pizza</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentMenu.grill_station_items.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 shadow-2xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 italic flex items-center justify-between">
          <span>* Menu items are subject to change based on daily ingredient availability.</span>
          <span>Huston-Tillotson University Residence Life</span>
        </div>
      </div>
    </div>
  )
}
