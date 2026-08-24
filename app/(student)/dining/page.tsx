'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  CafeteriaInfo, 
  DiningHour, 
  MealSlot, 
  DayType, 
  DailyMenu, 
  MenuItem, 
  MealImage 
} from '@/lib/types'

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

// Helper: Get fallback icon and color for categories
function getCategoryStyle(category: string) {
  const cat = category.toLowerCase().trim()
  if (cat.includes('entrée') || cat.includes('entree') || cat.includes('main')) {
    return { icon: '🍽️', bg: 'bg-blue-50 border-blue-100 text-blue-700' }
  }
  if (cat.includes('side') || cat.includes('salad') || cat.includes('soup')) {
    return { icon: '🥗', bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' }
  }
  if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('cake') || cat.includes('fruit')) {
    return { icon: '🍰', bg: 'bg-pink-50 border-pink-100 text-pink-700' }
  }
  if (cat.includes('beverage') || cat.includes('drink') || cat.includes('coffee') || cat.includes('tea')) {
    return { icon: '☕', bg: 'bg-amber-50 border-amber-100 text-amber-700' }
  }
  return { icon: '🍴', bg: 'bg-gray-50 border-gray-150 text-gray-600' }
}

const DAYS_OF_WEEK = [
  { shortName: 'Mon', fullName: 'Monday' },
  { shortName: 'Tue', fullName: 'Tuesday' },
  { shortName: 'Wed', fullName: 'Wednesday' },
  { shortName: 'Thu', fullName: 'Thursday' },
  { shortName: 'Fri', fullName: 'Friday' },
  { shortName: 'Sat', fullName: 'Saturday' },
  { shortName: 'Sun', fullName: 'Sunday' }
]

export default function StudentDiningPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [cafeteria, setCafeteria] = useState<CafeteriaInfo | null>(null)
  const [hours, setHours] = useState<DiningHour[]>([])
  const [images, setImages] = useState<MealImage[]>([])
  const [weeklyDays, setWeeklyDays] = useState<any[]>([])

  // UI state
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [nowMinutes, setNowMinutes] = useState(0)

  useEffect(() => {
    // Set initial time and update minutes since midnight every minute
    const updateTime = () => {
      const now = new Date()
      setNowMinutes(now.getHours() * 60 + now.getMinutes())
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)

    // Set default tab to current day of the week
    const jsDay = new Date().getDay()
    const todayIndex = jsDay === 0 ? 6 : jsDay - 1
    setSelectedDayIndex(todayIndex)

    // Fetch the weekly menu data
    async function fetchData() {
      try {
        const res = await fetch('/api/dining/menu/week')
        if (!res.ok) {
          throw new Error('Failed to load dining menu data')
        }
        const data = await res.json()
        setCafeteria(data.cafeteria)
        setHours(data.hours || [])
        setImages(data.images || [])
        setWeeklyDays(data.days || [])
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => clearInterval(timer)
  }, [])

  // Helper to check if a specific hour slot is active right now
  const isPeriodActive = (dayType: DayType, slot: MealSlot) => {
    const matchingHour = hours.find(h => h.day_type === dayType && h.meal_slot === slot)
    if (!matchingHour || !matchingHour.is_active) return false

    const openMin = timeToMinutes(matchingHour.open_time)
    const closeMin = timeToMinutes(matchingHour.close_time)

    return nowMinutes >= openMin && nowMinutes <= closeMin
  }

  // Get current day type (weekday/saturday/sunday)
  const getTodayDayType = (): DayType => {
    const jsDay = new Date().getDay()
    if (jsDay === 0) return 'sunday'
    if (jsDay === 6) return 'saturday'
    return 'weekday'
  }

  // Find image matching item_name (case insensitive)
  const getItemImage = (itemName: string): string | null => {
    const trimmed = itemName.toLowerCase().trim()
    const match = images.find(img => img.item_name.toLowerCase().trim() === trimmed)
    return match ? match.image_url : null
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner className="w-10 h-10 text-brand" />
        <p className="text-sm text-gray-500 font-medium">Loading dining menu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 text-xl mb-3">⚠️</div>
        <h3 className="font-semibold text-gray-900 mb-1">Failed to Load Menu</h3>
        <p className="text-xs text-gray-500 max-w-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-brand text-white font-semibold text-sm rounded-xl hover:bg-[#520100] transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Calculate if cafeteria is open right now
  const todayDayType = getTodayDayType()
  const activeSlots = (todayDayType === 'weekday' ? ['breakfast', 'lunch', 'dinner'] : ['brunch', 'dinner']) as MealSlot[]
  const isCurrentlyOpen = activeSlots.some(slot => isPeriodActive(todayDayType, slot))

  const selectedDayData = weeklyDays[selectedDayIndex]
  const todayDateStr = new Date().toISOString().split('T')[0]
  const isSelectedDayToday = selectedDayData?.date === todayDateStr

  return (
    <div className="p-5 flex flex-col gap-6">
      
      {/* Amber Announcement Banner */}
      {cafeteria?.announcement && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed shadow-sm flex gap-3 items-start">
          <span className="text-base leading-none">📢</span>
          <div>
            <p className="font-bold mb-0.5">Special Announcement</p>
            <p className="font-normal opacity-90">{cafeteria.announcement}</p>
          </div>
        </div>
      )}

      {/* Section 1 — Cafeteria Info Card */}
      <div className="bg-white border border-[#E5E8EF] rounded-2xl shadow-sm overflow-hidden">
        {cafeteria?.image_url && (
          <div className="h-32 w-full relative bg-gray-150">
            <img src={cafeteria.image_url} alt={cafeteria.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <h2 className="absolute bottom-3 left-4 text-white text-lg font-bold font-display">{cafeteria.name}</h2>
          </div>
        )}
        <div className="p-5 flex flex-col gap-4">
          {!cafeteria?.image_url && (
            <div className="flex flex-col gap-1">
              <h2 className="text-gray-900 text-lg font-bold font-display">{cafeteria?.name || 'HTU Union Cafeteria'}</h2>
              <p className="text-xs text-gray-500">Campus Dining Hall</p>
            </div>
          )}
          
          <div className="flex flex-col gap-2.5 text-xs text-gray-600 font-medium">
            {cafeteria?.location && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📍</span>
                <span>{cafeteria.location}</span>
              </div>
            )}
            {cafeteria?.email && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">✉️</span>
                <a href={`mailto:${cafeteria.email}`} className="hover:underline text-brand">{cafeteria.email}</a>
              </div>
            )}
            {cafeteria?.phone && (
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>
                  <span>{cafeteria.phone}</span>
                </div>
                <a 
                  href={`tel:${cafeteria.phone}`}
                  className="px-3 py-1 bg-brand-light text-brand hover:bg-brand/20 transition-colors rounded-lg font-bold text-[10px]"
                >
                  Call Cafeteria
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 — Today's Hours & Status */}
      <div className="bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Dining Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCurrentlyOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <h3 className="font-bold text-gray-900 text-sm">
              {isCurrentlyOpen ? 'Open Now' : 'Closed'}
            </h3>
          </div>
        </div>

        {/* Highlight current active slot */}
        <div className="flex gap-2">
          {activeSlots.map((slot) => {
            const active = isPeriodActive(todayDayType, slot)
            if (!active) return null
            const matchingHour = hours.find(h => h.day_type === todayDayType && h.meal_slot === slot)
            return (
              <Badge key={slot} variant="success" className="px-3 py-1 font-bold text-xs uppercase tracking-wide border-green-200">
                Serving {slot}: {matchingHour?.open_time} - {matchingHour?.close_time}
              </Badge>
            )
          })}
          {!isCurrentlyOpen && (
            <Badge variant="neutral" className="px-3 py-1 font-bold text-xs uppercase tracking-wide bg-gray-50 border-gray-200 text-gray-500">
              No Active Meals
            </Badge>
          )}
        </div>
      </div>

      {/* Section 3 — Weekly Menu Coming Soon */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-gray-900 text-sm">Weekly Dining Menus</h3>
        <div className="bg-gradient-to-br from-[#660100] to-[#3B0000] rounded-2xl p-8 text-center shadow-lg border border-[#660100]/20 relative overflow-hidden flex flex-col items-center gap-4 group">
          {/* Decorative backdrop gradients */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFCC00]/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

          {/* Cloche SVG Icon Container */}
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <svg className="w-10 h-10 text-[#FFCC00]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 0a7 7 0 017 7v1H5v-1a7 7 0 017-7zm-9 10h18a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1a1 1 0 011-1zm9-12a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>

          {/* Update Badge */}
          <span className="px-3 py-1 bg-[#FFCC00]/15 border border-[#FFCC00]/35 text-[#FFCC00] rounded-full text-[10px] font-bold uppercase tracking-wider">
            Menu Update
          </span>

          {/* Message */}
          <div className="flex flex-col gap-2 max-w-sm">
            <h3 className="font-display font-bold text-white text-base">Weekly Menu Coming Soon</h3>
            <p className="text-xs text-white/80 font-medium leading-relaxed">
              Our culinary team is updating the meal plans for the upcoming week. The complete schedule with breakfast, lunch, and dinner menus will be available here soon.
            </p>
          </div>

          <div className="w-16 h-0.5 rounded-full bg-[#FFCC00]/80 mt-1"></div>

          <p className="text-[10px] text-white/60 font-semibold italic">
            Please refer to the standard operating hours listed below in the meantime.
          </p>
        </div>
      </div>

      {/* Section 4 — Cafeteria Hours Table */}
      <div className="bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm">
        <h3 className="font-display font-semibold text-gray-900 text-sm mb-3">Complete Cafeteria Hours</h3>
        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                <th className="px-4 py-2.5">Day Category</th>
                <th className="px-4 py-2.5">Meal Slot</th>
                <th className="px-4 py-2.5">Serving Hours</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {(['weekday', 'saturday', 'sunday'] as DayType[]).map((dayType) => {
                const daySlots = hours.filter(h => h.day_type === dayType)
                return daySlots.map((h, slotIdx) => (
                  <tr key={h.id} className="hover:bg-gray-50/50">
                    {slotIdx === 0 && (
                      <td className="px-4 py-2.5 font-bold text-gray-900 capitalize border-r border-gray-100" rowSpan={daySlots.length}>
                        {dayType}s
                      </td>
                    )}
                    <td className="px-4 py-2.5 capitalize">{h.meal_slot}</td>
                    <td className="px-4 py-2.5 font-mono">{h.open_time} - {h.close_time}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${h.is_active ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    </td>
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
