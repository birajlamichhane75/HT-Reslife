export type Role = 'student' | 'admin' | 'cafeteria_admin'
export type Priority = 'info' | 'urgent' | 'event'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type TicketPriority = 'routine' | 'urgent' | 'emergency'
export type EventTag = 'social' | 'mandatory' | 'academic' | 'deadline' | 'housing'

export interface Student {
  id: string
  email: string
  full_name: string
  room_number: string | null
  hall_name: string | null
  role: Role
  is_active: boolean
  push_subscription: object | null
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  priority: Priority
  created_by: string
  created_at: string
}

export interface MaintenanceTicket {
  id: string
  student_id: string
  room_number: string
  issue_type: string
  priority: TicketPriority
  description: string
  allow_entry: boolean
  status: TicketStatus
  staff_notes: string | null
  created_at: string
  updated_at: string
  student?: Pick<Student, 'full_name' | 'email' | 'hall_name'>
}

export interface Event {
  id: string
  title: string
  location: string | null
  event_date: string
  tag: EventTag
  description: string | null
  created_by: string
  created_at: string
}

export interface StaffMember {
  id: string
  full_name: string
  role: string
  hall: string | null
  phone: string | null
  email: string | null
  avatar_initials: string
  sort_order: number
}

export interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
}

export interface ChecklistItem {
  id: string
  label: string
  sort_order: number
}

export interface ChecklistProgress {
  item_id: string
  completed: boolean
}

export type DayType = 'weekday' | 'saturday' | 'sunday'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'brunch'

export interface MenuItem {
  name: string
  description: string
  category: string           // e.g. "Entrée", "Side", "Dessert", "Beverage"
  is_vegetarian: boolean
  is_vegan: boolean
  is_halal: boolean
  allergens: string[]        // e.g. ["gluten", "dairy", "nuts"]
}

export interface DiningHour {
  id: string
  day_type: DayType
  meal_slot: MealSlot
  open_time: string
  close_time: string
  is_active: boolean
}

export interface MenuTemplate {
  id: string
  day_of_week: number
  meal_slot: MealSlot
  items: MenuItem[]
  updated_at: string
}

export interface DailyMenu {
  id: string
  menu_date: string
  meal_slot: MealSlot
  items: MenuItem[]
  special_note: string | null
  is_cancelled: boolean
  cancel_reason: string | null
  updated_at: string
}

export interface MealImage {
  id: string
  item_name: string
  image_url: string
}

export interface CafeteriaInfo {
  id: string
  name: string
  location: string | null
  phone: string | null
  email: string | null
  announcement: string | null
  image_url: string | null
  updated_at: string
}

