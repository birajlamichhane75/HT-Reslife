'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { EnrichedMenuItem, enrichMenuItem } from '@/lib/dining/station-catalog'

interface StationMenuViewerProps {
  items: string[]
  mealSlotName?: string
}

const STATION_ORDER: Array<EnrichedMenuItem['station']> = [
  'GRILL',
  'HOMESTYLE',
  'SALAD',
  'BAKERY',
  'SOUP & SIDES',
]

export default function StationMenuViewer({ items, mealSlotName }: StationMenuViewerProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedNutritionItem, setSelectedNutritionItem] = useState<EnrichedMenuItem | null>(null)
  const [showLegendModal, setShowLegendModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Filters
  const [activeDietFilter, setActiveDietFilter] = useState<'all' | 'veg' | 'vegan' | 'halal' | 'favorites'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('htu_dining_favorites')
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage error
    }
  }, [])

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
      try {
        localStorage.setItem('htu_dining_favorites', JSON.stringify(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  // Enrich all items
  const enrichedItems = useMemo(() => {
    return items.map((raw) => enrichMenuItem(raw))
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    return enrichedItems.filter((item) => {
      // Diet filter
      if (activeDietFilter === 'veg' && !item.is_vegetarian) return false
      if (activeDietFilter === 'vegan' && !item.is_vegan) return false
      if (activeDietFilter === 'halal' && !item.is_halal) return false
      if (activeDietFilter === 'favorites' && !favorites.includes(item.id)) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(query)
        const matchesDesc = item.description.toLowerCase().includes(query)
        const matchesStation = item.station.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc && !matchesStation) return false
      }

      return true
    })
  }, [enrichedItems, activeDietFilter, searchQuery, favorites])

  // Group by station
  const stationGroups = useMemo(() => {
    const groups: Record<string, EnrichedMenuItem[]> = {}
    STATION_ORDER.forEach((st) => {
      groups[st] = []
    })

    filteredItems.forEach((item) => {
      if (!groups[item.station]) {
        groups[item.station] = []
      }
      groups[item.station].push(item)
    })

    return groups
  }, [filteredItems])

  const totalFilteredCount = filteredItems.length
  const isAnyFilterActive = activeDietFilter !== 'all' || searchQuery.trim().length > 0

  return (
    <div className="relative flex flex-col gap-6 text-gray-900 bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-150">
      
      {/* Floating / Sticky Control Bar: [ Icon Legend | Filter ] */}
      <div className="sticky top-16 z-20 flex justify-center py-2 pointer-events-none">
        <div className="pointer-events-auto bg-gray-900/90 hover:bg-gray-900 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-3 text-xs font-semibold transition-all">
          <button
            onClick={() => setShowLegendModal(true)}
            className="hover:text-[#FFCC00] transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <span>Icon Legend</span>
          </button>
          <span className="w-px h-3.5 bg-gray-600" />
          <button
            onClick={() => setShowFilterModal(true)}
            className="hover:text-[#FFCC00] transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
            {isAnyFilterActive && (
              <span className="w-2 h-2 rounded-full bg-[#FFCC00]" />
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar (if active) */}
      {isAnyFilterActive && (
        <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/60 rounded-xl px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-amber-950">Active Filters:</span>
            {activeDietFilter !== 'all' && (
              <span className="bg-white px-2 py-0.5 rounded-md border border-amber-300 text-amber-900 font-bold uppercase text-[10px]">
                {activeDietFilter === 'veg' ? 'Vegetarian' : activeDietFilter === 'vegan' ? 'Vegan' : activeDietFilter === 'halal' ? 'Halal' : 'Favorites'}
              </span>
            )}
            {searchQuery && (
              <span className="bg-white px-2 py-0.5 rounded-md border border-amber-300 text-amber-900 font-medium text-[10px]">
                "{searchQuery}"
              </span>
            )}
            <span className="text-gray-500 text-[11px]">({totalFilteredCount} items found)</span>
          </div>
          <button
            onClick={() => {
              setActiveDietFilter('all')
              setSearchQuery('')
            }}
            className="text-[11px] font-bold text-brand hover:underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Zero Results State */}
      {totalFilteredCount === 0 && (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🥗</span>
          <h4 className="font-bold text-gray-800 text-sm">No menu items match your filter</h4>
          <p className="text-xs text-gray-400 max-w-xs">
            Try adjusting your search or clearing the dietary filters to see all available station selections.
          </p>
          <button
            onClick={() => {
              setActiveDietFilter('all')
              setSearchQuery('')
            }}
            className="mt-2 text-xs font-bold text-brand hover:underline"
          >
            Show All Menu Items
          </button>
        </div>
      )}

      {/* Stations and Tables */}
      {STATION_ORDER.map((stationName) => {
        const stationItems = stationGroups[stationName] || []
        if (stationItems.length === 0) return null

        return (
          <div key={stationName} className="flex flex-col gap-3">
            
            {/* Centered Station Header on Divider */}
            <div className="relative my-6 first:mt-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex flex-col items-center justify-center">
                <span className="bg-white px-5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold tracking-widest text-gray-800 uppercase shadow-2xs flex items-center gap-1.5">
                  <span>{stationName}</span>
                  <span className="text-[10px] text-amber-500">★</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium mt-1 bg-white px-2">
                  Click any item for nutritional information
                </span>
              </div>
            </div>

            {/* Station Table */}
            <div className="flex flex-col border-t border-gray-200">
              
              {/* Column Headers */}
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider py-2 px-2 border-b border-gray-200 bg-gray-50/50">
                <span className="flex-1">Menu Item</span>
                <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                  <span className="w-16 sm:w-20">Portion</span>
                  <span className="w-14 sm:w-16">Calories</span>
                  <span className="w-6 text-center"></span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {stationItems.map((item) => {
                  const isFav = favorites.includes(item.id)

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNutritionItem(item)}
                      className="py-3 px-2 hover:bg-gray-50/90 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      {/* Left: Item Name, Badges, and Description */}
                      <div className="flex-1 min-w-0 pr-3 sm:pr-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-brand transition-colors flex items-center gap-1">
                            <span>{item.name}</span>
                            <span className="text-gray-400 group-hover:text-brand group-hover:translate-x-0.5 transition-transform text-xs">
                              &gt;
                            </span>
                          </span>

                          {/* Dietary Badges */}
                          {item.is_vegetarian && (
                            <span
                              title="Vegetarian"
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-300 text-gray-700 bg-white"
                            >
                              V
                            </span>
                          )}
                          {item.is_vegan && (
                            <span
                              title="Vegan"
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-800 bg-emerald-50"
                            >
                              VG
                            </span>
                          )}
                          {item.is_plant_protein && (
                            <span
                              title="Plant Protein"
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-300 text-purple-800 bg-purple-50"
                            >
                              PR
                            </span>
                          )}
                          {item.is_halal && (
                            <span
                              title="Halal Selection"
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-300 text-amber-800 bg-amber-50"
                            >
                              HAL
                            </span>
                          )}
                          {item.is_sustainable && (
                            <span title="Sustainable / Farm to Fork" className="text-xs">
                              🌍
                            </span>
                          )}
                        </div>

                        {/* Subtitle description */}
                        {item.description && (
                          <p className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5 line-clamp-1 group-hover:text-gray-700">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Right: Portion, Calories, Favorite Heart */}
                      <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                        <span className="w-16 sm:w-20 text-xs text-gray-600 font-medium">
                          {item.portion}
                        </span>
                        <span className="w-14 sm:w-16 text-xs sm:text-sm text-gray-900 font-bold">
                          {item.calories}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(item.id, e)}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          className="w-6 flex items-center justify-center text-sm transition-transform active:scale-125 hover:opacity-80"
                        >
                          {isFav ? (
                            <span className="text-red-500">❤️</span>
                          ) : (
                            <span className="text-gray-300 hover:text-gray-400">🤍</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* --- Nutrition Modal (Triggered by clicking an item row) --- */}
      {selectedNutritionItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setSelectedNutritionItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-150 flex flex-col gap-4 relative animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedNutritionItem(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand bg-brand-light/70 px-2 py-0.5 rounded">
                {selectedNutritionItem.station}
              </span>
              <h3 className="font-display font-bold text-gray-900 text-lg mt-1.5 leading-tight">
                {selectedNutritionItem.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {selectedNutritionItem.description}
              </p>
            </div>

            {/* Calorie & Portion Strip */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Serving Size</span>
                <p className="text-xs font-semibold text-gray-800">{selectedNutritionItem.portion}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Calories</span>
                <p className="text-base font-extrabold text-gray-900">{selectedNutritionItem.calories} kcal</p>
              </div>
            </div>

            {/* Nutrition Breakdown Grid */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nutritional Information</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-gray-100 bg-white flex justify-between">
                  <span className="text-gray-500">Protein</span>
                  <span className="font-bold text-gray-900">{selectedNutritionItem.nutrition.protein}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-gray-100 bg-white flex justify-between">
                  <span className="text-gray-500">Total Carbs</span>
                  <span className="font-bold text-gray-900">{selectedNutritionItem.nutrition.carbs}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-gray-100 bg-white flex justify-between">
                  <span className="text-gray-500">Total Fat</span>
                  <span className="font-bold text-gray-900">{selectedNutritionItem.nutrition.fat}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-gray-100 bg-white flex justify-between">
                  <span className="text-gray-500">Dietary Fiber</span>
                  <span className="font-bold text-gray-900">{selectedNutritionItem.nutrition.fiber}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-gray-100 bg-white flex justify-between col-span-2">
                  <span className="text-gray-500">Sodium</span>
                  <span className="font-bold text-gray-900">{selectedNutritionItem.nutrition.sodium}</span>
                </div>
              </div>
            </div>

            {/* Allergens & Dietary */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dietary & Allergens</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedNutritionItem.is_vegetarian && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Vegetarian (V)
                  </span>
                )}
                {selectedNutritionItem.is_vegan && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-green-50 text-green-800 font-bold border border-green-200">
                    Vegan (VG)
                  </span>
                )}
                {selectedNutritionItem.is_halal && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    Halal (HAL)
                  </span>
                )}
                {selectedNutritionItem.is_gluten_free && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    Gluten-Friendly (GF)
                  </span>
                )}
                {selectedNutritionItem.nutrition.allergens.length > 0 ? (
                  selectedNutritionItem.nutrition.allergens.map((alg) => (
                    <span key={alg} className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 font-semibold border border-rose-200">
                      Contains: {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200">
                    No major allergens reported
                  </span>
                )}
              </div>
            </div>

            {/* Footer Favorite Toggle */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Save to your favorites:</span>
              <button
                type="button"
                onClick={(e) => toggleFavorite(selectedNutritionItem.id, e)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors"
              >
                <span>{favorites.includes(selectedNutritionItem.id) ? '❤️ In Favorites' : '🤍 Add to Favorites'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Icon Legend Modal --- */}
      {showLegendModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowLegendModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 flex flex-col gap-4 relative animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900 text-sm">Dietary & Icon Legend</h3>
              <button
                onClick={() => setShowLegendModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-8 shrink-0 text-center font-bold px-1.5 py-0.5 rounded border border-gray-300 text-gray-700 bg-white">V</span>
                <div>
                  <p className="font-bold text-gray-800">Vegetarian</p>
                  <p className="text-gray-500 text-[11px]">Contains no meat, poultry, fish, or shellfish.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 shrink-0 text-center font-bold px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-800 bg-emerald-50">VG</span>
                <div>
                  <p className="font-bold text-gray-800">Vegan</p>
                  <p className="text-gray-500 text-[11px]">Prepared without any animal products, milk, eggs, or honey.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 shrink-0 text-center font-bold px-1.5 py-0.5 rounded border border-purple-300 text-purple-800 bg-purple-50">PR</span>
                <div>
                  <p className="font-bold text-gray-800">Plant Protein</p>
                  <p className="text-gray-500 text-[11px]">High protein meal powered by wholesome plant ingredients.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 shrink-0 text-center font-bold px-1.5 py-0.5 rounded border border-amber-300 text-amber-800 bg-amber-50">HAL</span>
                <div>
                  <p className="font-bold text-gray-800">Halal Friendly</p>
                  <p className="text-gray-500 text-[11px]">Prepared in accordance with dietary guidelines.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 shrink-0 text-center text-sm">🌍</span>
                <div>
                  <p className="font-bold text-gray-800">Sustainable / Farm to Fork</p>
                  <p className="text-gray-500 text-[11px]">Locally grown produce or sustainably sourced seafood.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLegendModal(false)}
              className="w-full mt-2 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* --- Filter Modal --- */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 flex flex-col gap-4 relative animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900 text-sm">Filter Menu Items</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Search Food or Ingredients</label>
              <input
                type="text"
                placeholder="e.g. eggs, chicken, stir fry, biscuit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-brand"
              />
            </div>

            {/* Dietary Preference Buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700">Dietary Preferences</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'veg', label: 'Vegetarian (V)' },
                  { id: 'vegan', label: 'Vegan (VG)' },
                  { id: 'halal', label: 'Halal (HAL)' },
                  { id: 'favorites', label: '❤️ Favorites Only' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveDietFilter(opt.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      activeDietFilter === opt.id
                        ? 'bg-brand text-white border-brand'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setActiveDietFilter('all')
                  setSearchQuery('')
                }}
                className="text-xs font-bold text-gray-500 hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="py-2 px-5 bg-brand text-white font-bold text-xs rounded-xl hover:bg-[#520100] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

