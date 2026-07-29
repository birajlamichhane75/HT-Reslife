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

      {/* Section 3 — Weekly Menu (7-day tab strip) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-semibold text-gray-900 text-sm">Weekly Dining Menus</h3>
          <p className="text-xs text-gray-500">Choose a day to see menu listings</p>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-200">
          {DAYS_OF_WEEK.map((day, idx) => {
            const isSelected = selectedDayIndex === idx
            const dayData = weeklyDays[idx]
            const isToday = dayData?.date === todayDateStr
            
            return (
              <button
                key={day.shortName}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl border flex flex-col items-center gap-0.5 min-w-[56px] transition-all ${
                  isSelected 
                    ? 'bg-brand border-brand text-white shadow-sm font-bold' 
                    : 'bg-white border-[#E5E8EF] text-gray-700 hover:border-gray-300 font-semibold'
                }`}
              >
                <span className="text-[10px] uppercase opacity-75">{day.shortName}</span>
                <span className="text-sm leading-none">{dayData?.date ? new Date(dayData.date + 'T00:00:00').getDate() : ''}</span>
                {isToday && (
                  <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-brand'}`}></span>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Day Meals Grid */}
        <div className="flex flex-col gap-5 mt-2">
          {selectedDayData?.meals.length === 0 ? (
            <div className="bg-white border border-[#E5E8EF] p-12 rounded-2xl text-center text-xs text-gray-400">
              No meals scheduled for this day.
            </div>
          ) : (
            selectedDayData?.meals.map((meal: any) => {
              const matchingHour = hours.find(
                h => h.day_type === (selectedDayIndex === 5 ? 'saturday' : selectedDayIndex === 6 ? 'sunday' : 'weekday') && h.meal_slot === meal.slot
              )
              const isActiveNow = isSelectedDayToday && isPeriodActive(todayDayType, meal.slot)

              return (
                <div 
                  key={meal.slot}
                  className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
                    isActiveNow ? 'border-green-300 ring-1 ring-green-100 shadow-md' : 'border-[#E5E8EF]'
                  }`}
                >
                  {/* Meal Slot Header */}
                  <div className={`px-5 py-4 border-b flex justify-between items-center ${
                    isActiveNow ? 'bg-green-50/40 border-green-100' : 'bg-gray-50/50 border-[#E5E8EF]'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="font-bold text-sm text-gray-900 capitalize font-display flex items-center gap-2">
                        {meal.slot}
                        {isActiveNow && (
                          <Badge variant="success" className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider border-green-200">
                            Serving Now
                          </Badge>
                        )}
                      </h4>
                      <span className="text-xs text-gray-500 font-medium">
                        {matchingHour ? `${matchingHour.open_time} - ${matchingHour.close_time}` : 'Hours not set'}
                      </span>
                    </div>
                    {meal.source === 'daily_override' && (
                      <Badge variant="info" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Special Menu
                      </Badge>
                    )}
                  </div>

                  {/* Cancelled Banner */}
                  {meal.is_cancelled ? (
                    <div className="p-6 text-center bg-red-50/50 flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl">🚫</span>
                      <h5 className="font-bold text-red-800 text-sm">Meal Period Cancelled</h5>
                      {meal.cancel_reason && (
                        <p className="text-xs text-red-600 max-w-md">{meal.cancel_reason}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Special Note Banner */}
                      {meal.special_note && (
                        <div className="px-5 py-3 bg-teal-50 border-b border-teal-100 text-teal-800 text-xs font-semibold flex gap-2 items-center">
                          <span>✨</span>
                          <span>{meal.special_note}</span>
                        </div>
                      )}

                      {/* Items Grid */}
                      {meal.items.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400">
                          Menu items are not announced yet.
                        </div>
                      ) : (
                        <div className="p-5 grid grid-cols-2 gap-4">
                          {meal.items.map((item: MenuItem, itemIdx: number) => {
                            const imageUrl = getItemImage(item.name)
                            const catStyle = getCategoryStyle(item.category)

                            return (
                              <div 
                                key={itemIdx} 
                                className="border border-gray-100 rounded-xl overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-sm transition-all"
                              >
                                {/* Item Image or Icon Box */}
                                <div className="h-28 w-full relative bg-gray-50 flex items-center justify-center">
                                  {imageUrl ? (
                                    <img 
                                      src={imageUrl} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className={`w-full h-full flex flex-col items-center justify-center border-b ${catStyle.bg}`}>
                                      <span className="text-3xl mb-1">{catStyle.icon}</span>
                                      <span className="text-[9px] uppercase tracking-wider font-bold opacity-75">{item.category || 'Food'}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Item Info */}
                                <div className="p-3 flex flex-col flex-1 gap-2 justify-between">
                                  <div className="flex flex-col gap-1">
                                    <h5 className="font-bold text-xs text-gray-900 leading-snug line-clamp-1">
                                      {item.name}
                                    </h5>
                                    {item.description && (
                                      <p className="text-[10px] text-gray-500 leading-normal line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-50">
                                    {/* Diet Badges */}
                                    <div className="flex gap-1 flex-wrap">
                                      {item.is_vegetarian && (
                                        <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 font-bold text-[8px]">
                                          V
                                        </span>
                                      )}
                                      {item.is_vegan && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold text-[8px]">
                                          VG
                                        </span>
                                      )}
                                      {item.is_halal && (
                                        <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 font-bold text-[8px]">
                                          H
                                        </span>
                                      )}
                                    </div>

                                    {/* Allergens warning */}
                                    {item.allergens && item.allergens.length > 0 && (
                                      <div className="text-[9px] text-amber-700 font-medium flex items-center gap-1">
                                        <span>⚠️</span>
                                        <span className="line-clamp-1 italic">
                                          Contains: {item.allergens.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
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
