'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  CafeteriaInfo, 
  DiningHour, 
  MealSlot, 
  DayType 
} from '@/lib/types'
import { 
  CAFETERIA_28_DAY_MENU, 
  calculateCycleWeek, 
  JS_DAY_TO_NAME, 
  STANDARD_BREAKFAST_ITEMS 
} from '@/lib/dining/cafeteria-data'
import StationMenuViewer from '@/components/dining/StationMenuViewer'
import { CafeteriaChatbot } from '@/components/dining/CafeteriaChatbot'

// Helper: Convert "7:00 AM" to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

const WEEKDAYS = [
  { key: 'Monday', short: 'Mon' },
  { key: 'Tuesday', short: 'Tue' },
  { key: 'Wednesday', short: 'Wed' },
  { key: 'Thursday', short: 'Thu' },
  { key: 'Friday', short: 'Fri' },
  { key: 'Saturday', short: 'Sat' },
  { key: 'Sunday', short: 'Sun' },
]

export default function StudentDiningPage() {
  const [loading, setLoading] = useState(true)
  const [cafeteria, setCafeteria] = useState<CafeteriaInfo | null>(null)
  const [hours, setHours] = useState<DiningHour[]>([])
  const [selectedDayName, setSelectedDayName] = useState<string>('Thursday')
  const [selectedMealSlot, setSelectedMealSlot] = useState<MealSlot>('lunch')
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [nowMinutes, setNowMinutes] = useState(0)

  // Current calendar cycle week
  const cycleWeekNumber = useMemo(() => calculateCycleWeek(new Date()), [])

  useEffect(() => {
    // Current time
    const updateTime = () => {
      const now = new Date()
      setNowMinutes(now.getHours() * 60 + now.getMinutes())
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)

    // Set today's day of week
    const currentJsDay = new Date().getDay()
    const todayName = JS_DAY_TO_NAME[currentJsDay] || 'Thursday'
    setSelectedDayName(todayName)

    // Set default meal slot depending on time of day
    const hourNow = new Date().getHours()
    if (hourNow < 10) {
      setSelectedMealSlot(currentJsDay === 0 || currentJsDay === 6 ? 'brunch' : 'breakfast')
    } else if (hourNow < 15) {
      setSelectedMealSlot('lunch')
    } else {
      setSelectedMealSlot('dinner')
    }

    // Fetch cafeteria info & hours
    async function fetchData() {
      try {
        const res = await fetch('/api/dining/menu/week')
        if (res.ok) {
          const data = await res.json()
          setCafeteria(data.cafeteria)
          setHours(data.hours || [])
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => clearInterval(timer)
  }, [])

  // Helper to check if a specific hour slot is active right now
  const isPeriodActive = (dayType: DayType, slot: MealSlot) => {
    const matchingHour = hours.find((h) => h.day_type === dayType && h.meal_slot === slot)
    if (!matchingHour || !matchingHour.is_active) return false
    const openMin = timeToMinutes(matchingHour.open_time)
    const closeMin = timeToMinutes(matchingHour.close_time)
    return nowMinutes >= openMin && nowMinutes <= closeMin
  }

  const getTodayDayType = (): DayType => {
    const jsDay = new Date().getDay()
    if (jsDay === 0) return 'sunday'
    if (jsDay === 6) return 'saturday'
    return 'weekday'
  }

  const todayDayType = getTodayDayType()
  const activeSlots = (todayDayType === 'weekday' ? ['breakfast', 'lunch', 'dinner'] : ['brunch', 'dinner']) as MealSlot[]
  const currentlyOpenSlot = activeSlots.find((slot) => isPeriodActive(todayDayType, slot))
  const isCurrentlyOpen = !!currentlyOpenSlot
  const currentSlotHours = hours.find((h) => h.day_type === todayDayType && h.meal_slot === currentlyOpenSlot)

  // Find menu items for selected day & slot from 28-day cycle
  const currentDayMenu = useMemo(() => {
    return CAFETERIA_28_DAY_MENU.find(
      (m) => m.week_number === cycleWeekNumber && m.day_of_week.toLowerCase() === selectedDayName.toLowerCase()
    )
  }, [cycleWeekNumber, selectedDayName])

  // Aggregate items for selected slot
  const currentSlotItems = useMemo(() => {
    if (!currentDayMenu) return []

    if (selectedMealSlot === 'breakfast' || selectedMealSlot === 'brunch') {
      return [
        ...currentDayMenu.breakfast_items,
        'Omelet Bar',
        'Eggs',
        'Egg Whites',
        'Low Fat Vanilla Yogurt',
        'Low Fat Strawberry Yogurt',
        'Granola',
        'Fruit',
        'Chocolate Chip Monkey Bread',
        'Raspberry Muffin',
        'Cinnamon Roll',
      ]
    }

    if (selectedMealSlot === 'lunch') {
      const items = [...currentDayMenu.lunch_items, ...currentDayMenu.grill_station_items]
      if (currentDayMenu.soup) items.push(currentDayMenu.soup)
      items.push('Low Fat Vanilla Yogurt', 'Fruit', 'Salad Greens', 'Dinner Rolls', 'Cornbread')
      return Array.from(new Set(items))
    }

    if (selectedMealSlot === 'dinner') {
      const dinnerList = currentDayMenu.dinner_items && currentDayMenu.dinner_items.length > 0
        ? currentDayMenu.dinner_items
        : ['Homestyle Roasted Entree', 'Steamed Rice', 'Garlic Green Beans', 'Dinner Rolls']
      const items = [...dinnerList, ...currentDayMenu.grill_station_items]
      if (currentDayMenu.soup) items.push(currentDayMenu.soup)
      items.push('Fruit', 'Chocolate Chip Monkey Bread', 'Cornbread')
      return Array.from(new Set(items))
    }

    return []
  }, [currentDayMenu, selectedMealSlot])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner className="w-9 h-9 text-brand" />
        <p className="text-xs text-gray-400 font-medium tracking-wide">Loading daily dining station menus...</p>
      </div>
    )
  }

  const jsDay = new Date().getDay()
  const todayDayName = JS_DAY_TO_NAME[jsDay] || 'Thursday'

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12">
      
      {/* Top Banner / Special Announcement */}
      {cafeteria?.announcement && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-base">📢</span>
            <div>
              <span className="font-bold mr-1">Dining Notice:</span>
              <span className="text-amber-900">{cafeteria.announcement}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Clean Header Card */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
              {cafeteria?.name || 'HTU Union Dining Hall'}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-light/70 px-2.5 py-0.5 rounded-full">
              Week {cycleWeekNumber} Cycle
            </span>
          </div>
          
          {/* Live Status indicator */}
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isCurrentlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-bold text-gray-800">
              {isCurrentlyOpen
                ? `Open Now • Serving ${currentlyOpenSlot} (${currentSlotHours?.open_time} - ${currentSlotHours?.close_time})`
                : 'Currently Closed • Check serving schedule below'}
            </span>
          </div>
        </div>

        {/* Quick action buttons: Hours & AI Assistant */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHoursModal(true)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 bg-gray-50/50 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Hours</span>
          </button>

          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="px-3.5 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-[#520100] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>💬</span>
            <span>{showChatbot ? 'Hide Assistant' : 'Dining AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Chatbot Drawer if requested */}
      {showChatbot && (
        <div className="animate-[slideDown_0.2s_ease-out]">
          <CafeteriaChatbot
            currentWeek={cycleWeekNumber}
            currentDay={todayDayName}
          />
        </div>
      )}

      {/* Date & Meal Slot Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs flex flex-col gap-3">
        
        {/* Day Selector Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
          {WEEKDAYS.map((day) => {
            const isSelected = selectedDayName.toLowerCase() === day.key.toLowerCase()
            const isToday = todayDayName.toLowerCase() === day.key.toLowerCase()

            return (
              <button
                key={day.key}
                onClick={() => setSelectedDayName(day.key)}
                className={`shrink-0 flex-1 min-w-[70px] py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-sm scale-[1.02]'
                    : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border border-gray-200/60'
                }`}
              >
                <span>{day.short}</span>
                {isToday ? (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${isSelected ? 'bg-[#FFCC00] text-black' : 'bg-brand text-white'}`}>
                    Today
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-400 font-normal">Active</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Meal Slot Tabs (Breakfast, Lunch, Dinner) */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-xl">
          {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((slot) => {
            const isSelected = selectedMealSlot === slot
            const isSlotActive = isPeriodActive(todayDayType, slot)

            return (
              <button
                key={slot}
                onClick={() => setSelectedMealSlot(slot)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-brand shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{slot}</span>
                {isSlotActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Serving Now" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Station Menu Layout (Matches User Reference Image) */}
      <StationMenuViewer
        items={currentSlotItems}
        mealSlotName={selectedMealSlot}
      />

      {/* Hours Modal */}
      {showHoursModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowHoursModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-150 flex flex-col gap-4 relative animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900 text-sm">Cafeteria Operating Hours</h3>
              <button
                onClick={() => setShowHoursModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="overflow-hidden border border-gray-150 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-semibold">
                    <th className="px-3.5 py-2">Days</th>
                    <th className="px-3.5 py-2">Meal Slot</th>
                    <th className="px-3.5 py-2">Serving Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {(['weekday', 'saturday', 'sunday'] as DayType[]).map((dType) => {
                    const dSlots = hours.filter((h) => h.day_type === dType)
                    return dSlots.map((h, sIdx) => (
                      <tr key={h.id}>
                        {sIdx === 0 && (
                          <td className="px-3.5 py-2 font-bold text-gray-900 capitalize border-r border-gray-100 bg-gray-50/30" rowSpan={dSlots.length}>
                            {dType}s
                          </td>
                        )}
                        <td className="px-3.5 py-2 capitalize">{h.meal_slot}</td>
                        <td className="px-3.5 py-2 font-mono text-[11px]">{h.open_time} – {h.close_time}</td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowHoursModal(false)}
              className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
