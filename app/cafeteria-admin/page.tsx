'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import { 
  CafeteriaInfo, 
  DiningHour, 
  MealSlot, 
  DayType, 
  MenuItem, 
  MealImage,
  MenuTemplate,
  DailyMenu
} from '@/lib/types'

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

const MEAL_CATEGORIES = [
  'Entrée', 'Side', 'Dessert', 'Beverage', 'Other'
]

export default function CafeteriaAdminPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'template' | 'daily' | 'images'>('info')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Cafeteria Info & Hours State
  const [cafeteria, setCafeteria] = useState<CafeteriaInfo>({
    id: '',
    name: 'HTU Cafeteria',
    location: '',
    phone: '',
    email: '',
    announcement: '',
    image_url: '',
    updated_at: ''
  })
  const [announcementPush, setAnnouncementPush] = useState(false)
  const [hours, setHours] = useState<DiningHour[]>([])

  // Weekly Template State
  const [templateDay, setTemplateDay] = useState<number>(0)
  const [templateSlot, setTemplateSlot] = useState<MealSlot>('breakfast')
  const [templateItems, setTemplateItems] = useState<MenuItem[]>([])
  
  // Daily Overrides State
  const [overrideDate, setOverrideDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [overrideSlot, setOverrideSlot] = useState<MealSlot>('breakfast')
  const [overrideItems, setOverrideItems] = useState<MenuItem[]>([])
  const [specialNote, setSpecialNote] = useState<string>('')
  const [isCancelled, setIsCancelled] = useState<boolean>(false)
  const [cancelReason, setCancelReason] = useState<string>('')
  const [dailyPush, setDailyPush] = useState<boolean>(false)

  // Food Images State
  const [mealImages, setMealImages] = useState<MealImage[]>([])
  const [uploadItemName, setUploadItemName] = useState<string>('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  // Item Form Helper State (for adding menu items to templates/overrides)
  const [newItem, setNewItem] = useState<MenuItem>({
    name: '',
    description: '',
    category: 'Entrée',
    is_vegetarian: false,
    is_vegan: false,
    is_halal: false,
    allergens: []
  })
  const [allergenInput, setAllergenInput] = useState<string>('')

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load all base data
  useEffect(() => {
    async function loadData() {
      try {
        const [cafeteriaRes, hoursRes, imagesRes] = await Promise.all([
          fetch('/api/dining/cafeteria'),
          fetch('/api/dining/hours'),
          fetch('/api/dining/images')
        ])

        if (cafeteriaRes.ok) {
          const cafData = await cafeteriaRes.json()
          if (cafData) setCafeteria(cafData)
        }
        if (hoursRes.ok) {
          const hoursData = await hoursRes.json()
          setHours(hoursData || [])
        }
        // Fetching images
        const imagesFetch = await fetch('/api/dining/menu/week')
        if (imagesFetch.ok) {
          const weekData = await imagesFetch.json()
          setMealImages(weekData.images || [])
        }
      } catch (err: any) {
        showToast('Failed to load initial settings', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Load template items when day/slot changes
  useEffect(() => {
    if (loading) return
    async function fetchTemplate() {
      try {
        const res = await fetch('/api/dining/template')
        if (res.ok) {
          const templates: MenuTemplate[] = await res.json()
          const matched = templates.find(
            t => t.day_of_week === templateDay && t.meal_slot === templateSlot
          )
          setTemplateItems(matched?.items || [])
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchTemplate()
  }, [templateDay, templateSlot, loading])

  // Load override items when date/slot changes
  useEffect(() => {
    if (loading) return
    async function fetchOverride() {
      try {
        const res = await fetch(`/api/dining/daily?date=${overrideDate}`)
        if (res.ok) {
          const overrides: DailyMenu[] = await res.json()
          const matched = overrides.find(o => o.meal_slot === overrideSlot)
          if (matched) {
            setOverrideItems(matched.items || [])
            setSpecialNote(matched.special_note || '')
            setIsCancelled(matched.is_cancelled || false)
            setCancelReason(matched.cancel_reason || '')
          } else {
            // Load template items as starting point
            const tRes = await fetch('/api/dining/template')
            if (tRes.ok) {
              const templates: MenuTemplate[] = await tRes.json()
              const dateObj = new Date(overrideDate + 'T00:00:00')
              const jsDay = dateObj.getDay()
              const customDayOfWeek = jsDay === 0 ? 6 : jsDay - 1
              const matchedTemplate = templates.find(
                t => t.day_of_week === customDayOfWeek && t.meal_slot === overrideSlot
              )
              setOverrideItems(matchedTemplate?.items || [])
            }
            setSpecialNote('')
            setIsCancelled(false)
            setCancelReason('')
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchOverride()
  }, [overrideDate, overrideSlot, loading])

  // Save Cafeteria Info
  const handleSaveCafeteriaInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/dining/cafeteria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cafeteria,
          send_push: announcementPush
        })
      })
      if (!res.ok) throw new Error('Failed to update cafeteria details')
      const result = await res.json()
      setCafeteria(result.data)
      setAnnouncementPush(false)
      showToast(`Cafeteria info updated. ${result.sentCount || 0} notifications sent.`, 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Update Dining Hours row inline
  const handleUpdateHour = async (h: DiningHour, open: string, close: string, active: boolean) => {
    try {
      const res = await fetch('/api/dining/hours', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: h.id,
          open_time: open,
          close_time: close,
          is_active: active
        })
      })
      if (!res.ok) throw new Error('Failed to update hours')
      const updated = await res.json()
      setHours(prev => prev.map(item => item.id === h.id ? updated : item))
      showToast(`${h.day_type} ${h.meal_slot} hours updated.`, 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Save Template items
  const handleSaveTemplate = async () => {
    try {
      const res = await fetch('/api/dining/template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: templateDay,
          meal_slot: templateSlot,
          items: templateItems
        })
      })
      if (!res.ok) throw new Error('Failed to update template')
      showToast('Weekly template saved successfully.', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Save Daily Override
  const handleSaveOverride = async () => {
    try {
      const res = await fetch('/api/dining/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_date: overrideDate,
          meal_slot: overrideSlot,
          items: overrideItems,
          special_note: specialNote,
          is_cancelled: isCancelled,
          cancel_reason: cancelReason,
          send_push: dailyPush
        })
      })
      if (!res.ok) throw new Error('Failed to save override')
      const result = await res.json()
      setDailyPush(false)
      showToast(`Daily override saved. ${result.sentCount || 0} notifications sent.`, 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // Upload Meal Image mapping
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !uploadItemName) {
      showToast('Item name and file are required', 'error')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('item_name', uploadItemName)

      const res = await fetch('/api/dining/images', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Image upload failed')
      const result = await res.json()

      // Refresh images state
      setMealImages(prev => {
        const filtered = prev.filter(img => img.item_name.toLowerCase() !== uploadItemName.toLowerCase())
        return [...filtered, result.data]
      })
      setUploadItemName('')
      setUploadFile(null)
      const fileInput = document.getElementById('image-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      showToast('Meal image uploaded successfully!', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  // Delete/remove mapped image row
  const handleDeleteImageMapping = async (id: string) => {
    // Note: Standard Supabase delete image row. Since there is no API route for DELETE /api/dining/images, we skip or use standard service client,
    // but we can just filter it locally or provide simple deletion if desired. We don't strictly need delete endpoint but showing list is nice!
    showToast('Deleting mappings can be done via Supabase dashboard.', 'info')
  }

  // Add Item to active list (either template items or override items)
  const handleAddItem = (type: 'template' | 'daily') => {
    if (!newItem.name) {
      showToast('Food Item Name is required', 'error')
      return
    }
    const itemToAdd: MenuItem = {
      ...newItem,
      allergens: allergenInput
        .split(',')
        .map(a => a.trim().toLowerCase())
        .filter(a => a.length > 0)
    }

    if (type === 'template') {
      setTemplateItems(prev => [...prev, itemToAdd])
    } else {
      setOverrideItems(prev => [...prev, itemToAdd])
    }

    // Reset item form
    setNewItem({
      name: '',
      description: '',
      category: 'Entrée',
      is_vegetarian: false,
      is_vegan: false,
      is_halal: false,
      allergens: []
    })
    setAllergenInput('')
  }

  // Remove item by index
  const handleRemoveItem = (type: 'template' | 'daily', index: number) => {
    if (type === 'template') {
      setTemplateItems(prev => prev.filter((_, i) => i !== index))
    } else {
      setOverrideItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-[#FFFAEB]">
        <LoadingSpinner className="w-10 h-10 text-brand" />
        <p className="text-sm text-gray-500 font-medium">Loading Cafeteria Settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFAEB] py-8 px-4 lg:px-8">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl border shadow-md font-semibold text-xs transition-all ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 pb-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
              <span>🍳</span> Campus Dining Admin Panel
            </h1>
            <p className="text-xs text-gray-500 font-medium">Manage hours, default menus, daily overrides, and meal images</p>
          </div>
          <div className="flex gap-2">
            <a 
              href="/dining" 
              className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700 rounded-xl"
            >
              View Dining Page
            </a>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-gray-200 gap-1 bg-white p-1 rounded-xl shadow-sm max-w-lg">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              activeTab === 'info' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Info & Hours
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              activeTab === 'template' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Weekly Template
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              activeTab === 'daily' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Overrides
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              activeTab === 'images' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Meal Images
          </button>
        </div>

        {/* TAB CONTENTS */}

        {/* Tab 1: Cafeteria Settings (Info & Hours) */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-gray-900 text-sm border-b pb-2">Cafeteria Contact & Info</h3>
              <form onSubmit={handleSaveCafeteriaInfo} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cafeteria Name</label>
                  <Input 
                    type="text" 
                    value={cafeteria.name} 
                    onChange={e => setCafeteria(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location Details</label>
                  <Input 
                    type="text" 
                    value={cafeteria.location || ''} 
                    onChange={e => setCafeteria(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                    <Input 
                      type="text" 
                      value={cafeteria.phone || ''} 
                      onChange={e => setCafeteria(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <Input 
                      type="email" 
                      value={cafeteria.email || ''} 
                      onChange={e => setCafeteria(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cafeteria Banner Image URL (Optional)</label>
                  <Input 
                    type="text" 
                    value={cafeteria.image_url || ''} 
                    onChange={e => setCafeteria(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/cafeteria-hall.jpg"
                  />
                </div>
                <div className="pt-2 border-t mt-2 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">General Announcement Banner</label>
                    <Textarea 
                      value={cafeteria.announcement || ''} 
                      onChange={e => setCafeteria(prev => ({ ...prev, announcement: e.target.value }))}
                      placeholder="e.g. Closed for spring break May 1-5"
                      rows={2}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={announcementPush} 
                      onChange={e => setAnnouncementPush(e.target.checked)} 
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span>Send Announcement Push Notification to All Students</span>
                  </label>
                </div>
                <Button type="submit" variant="primary" className="mt-2">
                  Save General Details
                </Button>
              </form>
            </div>

            {/* Operating Hours */}
            <div className="bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-gray-900 text-sm border-b pb-2">Operating Hours Slots</h3>
              <div className="flex flex-col gap-3">
                {hours.map((h) => {
                  return (
                    <HourRow 
                      key={h.id} 
                      hour={h} 
                      onSave={(open, close, active) => handleUpdateHour(h, open, close, active)} 
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Weekly Menu Template */}
        {activeTab === 'template' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Template Selection & Add Item Form */}
            <div className="md:col-span-1 bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-gray-900 text-sm border-b pb-2">Select Template & Add Food</h3>
              
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Day of Week</label>
                  <Select 
                    value={templateDay.toString()} 
                    onChange={e => setTemplateDay(parseInt(e.target.value, 10))}
                  >
                    {DAYS_OF_WEEK.map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meal Period</label>
                  <Select 
                    value={templateSlot} 
                    onChange={e => setTemplateSlot(e.target.value as MealSlot)}
                  >
                    {templateDay === 5 || templateDay === 6 ? (
                      <>
                        <option value="brunch">Brunch</option>
                        <option value="dinner">Dinner</option>
                      </>
                    ) : (
                      <>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                      </>
                    )}
                  </Select>
                </div>
              </div>

              {/* Add menu item details */}
              <div className="border-t pt-3 flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-bold text-gray-900">Add New Food Item</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Food Name</label>
                  <Input 
                    type="text" 
                    value={newItem.name} 
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Scrambled Eggs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <Textarea 
                    value={newItem.description} 
                    onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Farm fresh organic cage free eggs"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                    <Select 
                      value={newItem.category} 
                      onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {MEAL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Allergens</label>
                    <Input 
                      type="text" 
                      value={allergenInput} 
                      onChange={e => setAllergenInput(e.target.value)}
                      placeholder="gluten, dairy, soy"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 py-1.5 border rounded-lg p-2 bg-gray-50/50">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newItem.is_vegetarian} 
                      onChange={e => setNewItem(prev => ({ ...prev, is_vegetarian: e.target.checked }))} 
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span>Vegetarian (V)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newItem.is_vegan} 
                      onChange={e => setNewItem(prev => ({ ...prev, is_vegan: e.target.checked }))} 
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span>Vegan (VG)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newItem.is_halal} 
                      onChange={e => setNewItem(prev => ({ ...prev, is_halal: e.target.checked }))} 
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span>Halal (H)</span>
                  </label>
                </div>

                <Button variant="secondary" size="sm" onClick={() => handleAddItem('template')}>
                  + Append Food Item
                </Button>
              </div>

            </div>

            {/* Template List & Action */}
            <div className="md:col-span-2 bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-display font-semibold text-gray-900 text-sm">
                    {DAYS_OF_WEEK[templateDay]} - {templateSlot.toUpperCase()} List
                  </h3>
                  <Badge variant="neutral">
                    {templateItems.length} items
                  </Badge>
                </div>

                {templateItems.length === 0 ? (
                  <div className="py-20 text-center text-xs text-gray-400">
                    No items in this template slot yet. Add items on the left side panel.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {templateItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50/50"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{item.name}</span>
                            <Badge variant="neutral" className="text-[9px] px-1 py-0 border-gray-100">
                              {item.category}
                            </Badge>
                          </div>
                          {item.description && (
                            <span className="text-[10px] text-gray-500 line-clamp-1">{item.description}</span>
                          )}
                          <div className="flex gap-1.5 flex-wrap pt-0.5 text-[8px] font-bold">
                            {item.is_vegetarian && <span className="text-green-700 bg-green-50 px-1 rounded">V</span>}
                            {item.is_vegan && <span className="text-emerald-800 bg-emerald-50 px-1 rounded">VG</span>}
                            {item.is_halal && <span className="text-teal-700 bg-teal-50 px-1 rounded">H</span>}
                            {item.allergens && item.allergens.length > 0 && (
                              <span className="text-amber-800 bg-amber-50 px-1 rounded">Contains: {item.allergens.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem('template', index)}
                          className="text-red-500 hover:text-red-700 p-1 font-semibold text-xs text-center"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-end">
                <Button onClick={handleSaveTemplate} variant="primary">
                  Save Template for {DAYS_OF_WEEK[templateDay]}
                </Button>
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: Daily Overrides */}
        {activeTab === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Override Configurations */}
            <div className="md:col-span-1 bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-gray-900 text-sm border-b pb-2">Override Control</h3>
              
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Target Date</label>
                  <Input 
                    type="date" 
                    value={overrideDate} 
                    onChange={e => setOverrideDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meal Period</label>
                  <Select 
                    value={overrideSlot} 
                    onChange={e => setOverrideSlot(e.target.value as MealSlot)}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="brunch">Brunch</option>
                  </Select>
                </div>

                <div className="pt-2 border-t mt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-red-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isCancelled} 
                      onChange={e => setIsCancelled(e.target.checked)} 
                      className="rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span>Cancel This Meal Period</span>
                  </label>
                  {isCancelled && (
                    <div className="mt-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cancellation Reason</label>
                      <Input 
                        type="text" 
                        value={cancelReason} 
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="e.g. Closed for Thanksgiving"
                      />
                    </div>
                  )}
                </div>

                {!isCancelled && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Special Header Banner Note (Optional)</label>
                    <Input 
                      type="text" 
                      value={specialNote} 
                      onChange={e => setSpecialNote(e.target.value)}
                      placeholder="e.g. Thanksgiving turkey & pumpkin pie!"
                    />
                  </div>
                )}

                <div className="border-t pt-3 flex flex-col gap-3 mt-1">
                  <h4 className="text-xs font-bold text-gray-900">Add Override Food Item</h4>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Food Name</label>
                    <Input 
                      type="text" 
                      value={newItem.name} 
                      onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Roasted Turkey"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                    <Textarea 
                      value={newItem.description} 
                      onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Herb-crusted turkey with gravy"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                      <Select 
                        value={newItem.category} 
                        onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {MEAL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Allergens</label>
                      <Input 
                        type="text" 
                        value={allergenInput} 
                        onChange={e => setAllergenInput(e.target.value)}
                        placeholder="dairy, soy"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 py-1.5 border rounded-lg p-2 bg-gray-50/50">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newItem.is_vegetarian} 
                        onChange={e => setNewItem(prev => ({ ...prev, is_vegetarian: e.target.checked }))} 
                        className="rounded border-gray-300 text-brand focus:ring-brand"
                      />
                      <span>Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newItem.is_vegan} 
                        onChange={e => setNewItem(prev => ({ ...prev, is_vegan: e.target.checked }))} 
                        className="rounded border-gray-300 text-brand focus:ring-brand"
                      />
                      <span>Vegan</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newItem.is_halal} 
                        onChange={e => setNewItem(prev => ({ ...prev, is_halal: e.target.checked }))} 
                        className="rounded border-gray-300 text-brand focus:ring-brand"
                      />
                      <span>Halal</span>
                    </label>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => handleAddItem('daily')}>
                    + Append Override Item
                  </Button>
                </div>

              </div>

            </div>

            {/* Override Items Preview & Push Trigger */}
            <div className="md:col-span-2 bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-display font-semibold text-gray-900 text-sm">
                    Menu Override for {overrideDate} ({overrideSlot.toUpperCase()})
                  </h3>
                  <Badge variant="warning">
                    {isCancelled ? 'Cancelled' : `${overrideItems.length} items`}
                  </Badge>
                </div>

                {isCancelled ? (
                  <div className="p-10 text-center bg-red-50/50 rounded-xl flex flex-col items-center gap-2">
                    <span className="text-xl">🚫</span>
                    <h5 className="font-bold text-red-800 text-xs">Meal Period Cancelled</h5>
                    <p className="text-[10px] text-red-600 font-semibold">{cancelReason || 'No cancellation reason provided.'}</p>
                  </div>
                ) : (
                  <>
                    {specialNote && (
                      <div className="p-3 bg-teal-50 text-teal-800 text-xs font-semibold rounded-xl">
                        ✨ Special Header Banner: "{specialNote}"
                      </div>
                    )}

                    {overrideItems.length === 0 ? (
                      <div className="py-20 text-center text-xs text-gray-400">
                        No food items in this override menu yet. Load template automatically or add items manually.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {overrideItems.map((item, index) => (
                          <div 
                            key={index} 
                            className="p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50/50"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-gray-900">{item.name}</span>
                                <Badge variant="neutral" className="text-[9px] px-1 py-0 border-gray-100">
                                  {item.category}
                                </Badge>
                              </div>
                              {item.description && (
                                <span className="text-[10px] text-gray-500 line-clamp-1">{item.description}</span>
                              )}
                              <div className="flex gap-1.5 flex-wrap pt-0.5 text-[8px] font-bold">
                                {item.is_vegetarian && <span className="text-green-700 bg-green-50 px-1 rounded">V</span>}
                                {item.is_vegan && <span className="text-emerald-800 bg-emerald-50 px-1 rounded">VG</span>}
                                {item.is_halal && <span className="text-teal-700 bg-teal-50 px-1 rounded">H</span>}
                                {item.allergens && item.allergens.length > 0 && (
                                  <span className="text-amber-800 bg-amber-50 px-1 rounded">Contains: {item.allergens.join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveItem('daily', index)}
                              className="text-red-500 hover:text-red-700 p-1 font-semibold text-xs text-center"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dailyPush} 
                    onChange={e => setDailyPush(e.target.checked)} 
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span>Send Menu Override/Cancellation Notification to All Students</span>
                </label>
                <Button onClick={handleSaveOverride} variant="primary">
                  Save Override for {overrideDate}
                </Button>
              </div>

            </div>

          </div>
        )}

        {/* Tab 4: Food Images Mapping */}
        {activeTab === 'images' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Upload File Form */}
            <div className="md:col-span-1 bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-semibold text-gray-900 text-sm border-b pb-2">Upload Meal Image</h3>
              <form onSubmit={handleUploadImage} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Food Item Name (Exact Match)</label>
                  <Input 
                    type="text" 
                    value={uploadItemName} 
                    onChange={e => setUploadItemName(e.target.value)} 
                    placeholder="e.g. Scrambled Eggs"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                    This maps image to any food item with this name (case-insensitive) on the student portal.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Select Image File</label>
                  <input 
                    id="image-file-input"
                    type="file" 
                    accept="image/*"
                    onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-light file:text-brand hover:file:bg-brand/20 cursor-pointer"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" disabled={uploadingImage} className="mt-2">
                  {uploadingImage ? 'Uploading...' : 'Upload & Link Image'}
                </Button>
              </form>
            </div>

            {/* Uploaded Images List */}
            <div className="md:col-span-2 bg-white border border-[#E5E8EF] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-display font-semibold text-gray-900 text-sm">Image Mappings Directory</h3>
                <Badge variant="neutral">
                  {mealImages.length} images mapped
                </Badge>
              </div>

              {mealImages.length === 0 ? (
                <div className="py-20 text-center text-xs text-gray-400">
                  No images uploaded yet. Upload a food image on the left.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto pr-1">
                  {mealImages.map((img) => (
                    <div 
                      key={img.id}
                      className="border border-gray-150 rounded-xl overflow-hidden bg-gray-50 flex flex-col shadow-sm relative group"
                    >
                      <div className="h-24 w-full relative">
                        <img src={img.image_url} alt={img.item_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex flex-col justify-between flex-1 gap-1.5 bg-white">
                        <span className="font-bold text-[10px] text-gray-800 line-clamp-2">{img.item_name}</span>
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-50">
                          <a 
                            href={img.image_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[9px] font-semibold text-brand hover:underline"
                          >
                            Open File
                          </a>
                          <button 
                            onClick={() => handleDeleteImageMapping(img.id)}
                            className="text-[9px] text-red-500 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

// Inline component: Hours Row Editor
interface HourRowProps {
  hour: DiningHour
  onSave: (open: string, close: string, active: boolean) => void
}

function HourRow({ hour, onSave }: HourRowProps) {
  const [openTime, setOpenTime] = useState(hour.open_time)
  const [closeTime, setCloseTime] = useState(hour.close_time)
  const [isActive, setIsActive] = useState(hour.is_active)

  return (
    <div className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/30 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="font-bold text-xs text-gray-850 capitalize">
          {hour.day_type}s - <span className="text-gray-500 font-medium">{hour.meal_slot}</span>
        </span>
        <Badge variant={isActive ? 'success' : 'neutral'} className="text-[9px] uppercase tracking-wide px-1.5 py-0.5">
          {isActive ? 'Active' : 'Disabled'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 block">Opens</label>
          <Input 
            type="text" 
            value={openTime} 
            onChange={e => setOpenTime(e.target.value)} 
            placeholder="e.g. 7:00 AM"
            className="h-8 text-xs px-2 rounded-lg"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 block">Closes</label>
          <Input 
            type="text" 
            value={closeTime} 
            onChange={e => setCloseTime(e.target.value)} 
            placeholder="e.g. 9:30 AM"
            className="h-8 text-xs px-2 rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={e => setIsActive(e.target.checked)} 
            className="rounded border-gray-300 text-brand focus:ring-brand w-3.5 h-3.5"
          />
          <span className="font-medium text-[10px]">Active slot</span>
        </label>

        <button 
          onClick={() => onSave(openTime, closeTime, isActive)}
          className="px-2.5 py-1 bg-brand text-white hover:bg-[#520100] transition-colors rounded-lg font-bold text-[10px] shadow-sm"
        >
          Update Hours
        </button>
      </div>
    </div>
  )
}
