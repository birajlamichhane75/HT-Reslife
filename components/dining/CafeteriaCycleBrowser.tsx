'use client'

import React, { useState, useEffect } from 'react'
import { 
  CAFETERIA_28_DAY_MENU, 
  DailyMenuCycle,
  getCyclePeriods,
  CycleWeekPeriod,
  CycleDayInfo
} from '@/lib/dining/cafeteria-data'
import { Badge } from '@/components/ui/Badge'

interface CafeteriaCycleBrowserProps {
  onAskAboutDay?: (question: string) => void
}

export function CafeteriaCycleBrowser({ onAskAboutDay }: CafeteriaCycleBrowserProps) {
  const [periods, setPeriods] = useState<CycleWeekPeriod[]>([])
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0)
  const [selectedDayDateStr, setSelectedDayDateStr] = useState<string>('')
  const [menuData, setMenuData] = useState<DailyMenuCycle[]>(CAFETERIA_28_DAY_MENU)

  useEffect(() => {
    // Generate the 4 consecutive 7-day cycle periods based on today's calendar date
    const calculatedPeriods = getCyclePeriods(new Date())
    setPeriods(calculatedPeriods)

    // Default select today if in current period, otherwise first day of period
    const todayStr = new Date().toISOString().split('T')[0]
    const currentPeriod = calculatedPeriods[0]
    const todayDay = currentPeriod?.days.find(d => d.dateStr === todayStr)
    if (todayDay) {
      setSelectedDayDateStr(todayDay.dateStr)
    } else if (currentPeriod && currentPeriod.days.length > 0) {
      setSelectedDayDateStr(currentPeriod.days[0].dateStr)
    }

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

  const currentPeriod = periods[selectedPeriodIndex] || periods[0]
  const currentDayInfo: CycleDayInfo | undefined = currentPeriod?.days.find(
    d => d.dateStr === selectedDayDateStr
  ) || currentPeriod?.days[0]

  const currentMenu = currentPeriod && currentDayInfo ? menuData.find(
    (m) => m.week_number === currentPeriod.cycleWeekNumber && 
           m.day_of_week.toLowerCase() === currentDayInfo.name.toLowerCase()
  ) : undefined

  const isToday = currentDayInfo?.isToday ?? false

  return (
    <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header with date range selector */}
      <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-gray-900 text-base">Cafeteria Menu Schedule</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#660100]/10 text-[#660100] text-[10px] font-bold uppercase tracking-wider">
              HTU Dining
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Daily Breakfast, Lunch, Dinner, Soup & Grill Station offerings
          </p>
        </div>

        {/* Date Range Selector Tabs (This Week, Next Week, etc.) */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar">
          {periods.map((p, pIdx) => {
            const isSelected = pIdx === selectedPeriodIndex
            return (
              <button
                key={pIdx}
                onClick={() => {
                  setSelectedPeriodIndex(pIdx)
                  // Select first day or today when switching period
                  const firstDay = p.days[0]
                  const todayInPeriod = p.days.find(d => d.isToday)
                  setSelectedDayDateStr((todayInPeriod || firstDay)?.dateStr || '')
                }}
                className={`shrink-0 relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-[#660100] shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{p.label}</span>
                {p.isCurrentPeriod && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse" title="Current Week" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day Selector Pills with exact month and date (e.g. Thu, Sep 17) */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {currentPeriod?.days.map((day) => {
          const isSelected = day.dateStr === currentDayInfo?.dateStr
          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDayDateStr(day.dateStr)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#660100] text-white shadow-sm scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{day.shortLabel}</span>
              {day.isToday && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
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
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📅</span>
            <div>
              <h4 className="font-display font-bold text-gray-900 text-base">
                {currentDayInfo?.fullLabel || 'Menu Offerings'}
              </h4>
            </div>
            {isToday && (
              <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider ml-1">
                Today
              </Badge>
            )}
          </div>

          {onAskAboutDay && currentDayInfo && (
            <button
              onClick={() => onAskAboutDay(`What is being served on ${currentDayInfo.fullLabel}?`)}
              className="text-xs font-semibold text-[#660100] hover:underline flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 transition-colors"
            >
              <span>💬 Ask Assistant about this day</span>
            </button>
          )}
        </div>

        {!currentMenu ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Menu details for this date are not available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Breakfast / Brunch Card */}
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs uppercase tracking-wider">
                  <span>🍳</span>
                  <span>{currentMenu.breakfast_type}</span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                  Breakfast Bar
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
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-xs uppercase tracking-wider">
                  <span>🍗</span>
                  <span>Lunch</span>
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
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 flex flex-col gap-2.5 shadow-2xs">
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
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col gap-3 shadow-2xs">
              {/* Daily Soup */}
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-rose-200/60 mb-2">
                  <div className="flex items-center gap-2 font-bold text-rose-950 text-xs uppercase tracking-wider">
                    <span>🥣</span>
                    <span>Daily Soup</span>
                  </div>
                </div>
                {currentMenu.soup ? (
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200/70 text-xs font-semibold text-rose-950 flex items-center justify-between shadow-2xs">
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

        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 italic flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>* Menu items are subject to change based on daily ingredient availability.</span>
          <span>Huston-Tillotson University Dining</span>
        </div>
      </div>
    </div>
  )
}
