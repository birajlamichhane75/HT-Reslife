// Cafeteria AI Agent Core Engine
// Formats responses using exact Calendar Month, Date, and Day (no "Week 1", "Week 2" in student output)

import { 
  CAFETERIA_28_DAY_MENU, 
  CAFETERIA_CYCLE_DAYS, 
  DailyMenuCycle, 
  DayOfWeekName,
  getMenuForDay,
  calculateCycleWeek,
  JS_DAY_TO_NAME,
  formatDateMonthDay,
  getPrecedingThursday,
  formatMonthDayRange
} from './cafeteria-data'

export interface AgentInput {
  current_date?: string
  current_day?: string
  current_week?: number
  meal_times?: Record<string, { start: string; end: string } | null> | null
  user_question: string
}

export interface AgentResponse {
  answer: string
  week_number: number
  day_of_week: DayOfWeekName
  formatted_date: string
  meal_context?: string
  suggestions?: string[]
}

// Format serving time string
function getServingTimeStr(
  mealSlot: 'breakfast' | 'brunch' | 'lunch' | 'dinner',
  mealTimes?: Record<string, { start: string; end: string } | null> | null
): string | null {
  if (!mealTimes) return null
  const slotTime = mealTimes[mealSlot]
  if (slotTime?.start && slotTime?.end) {
    return `${slotTime.start} to ${slotTime.end}`
  }
  return null
}

// Helper: Check if an item is strictly vegetarian based on Rule 8
function isStrictlyVegetarian(itemName: string): boolean {
  const lower = itemName.toLowerCase()
  const explicitTerms = [
    'veggie',
    'vegan',
    'meatless',
    'vegetarian',
    'tofu',
    'portobello',
    'portobella',
    'pasta primavera',
    'zucchini',
    'stuffed squash'
  ]
  const isExcludedMeat = (lower.includes('chicken') && !lower.includes('meatless chicken')) ||
                         (lower.includes('beef') && !lower.includes('meatless beef') && !lower.includes('vegan beef')) ||
                         lower.includes('pork') ||
                         lower.includes('fish') ||
                         lower.includes('shrimp') ||
                         lower.includes('turkey') ||
                         lower.includes('bacon') ||
                         lower.includes('sausage') && !lower.includes('vegetarian sausage') ||
                         lower.includes('ribs') ||
                         lower.includes('catfish') ||
                         lower.includes('tilapia') ||
                         lower.includes('salmon') ||
                         lower.includes('ham')

  if (isExcludedMeat) return false
  return explicitTerms.some(term => lower.includes(term))
}

export class CafeteriaAgent {
  /**
   * Process a student's question and generate response with exact month, date, and day
   */
  public static async processMessage(input: AgentInput): Promise<AgentResponse> {
    const today = input.current_date ? new Date(input.current_date + 'T12:00:00') : new Date()
    const currentDayName = (input.current_day || JS_DAY_TO_NAME[today.getDay()] || 'Thursday') as DayOfWeekName
    const mealTimes = input.meal_times || null
    const question = input.user_question.trim()

    return this.evaluateWithRules(question, today, currentDayName, mealTimes)
  }

  /**
   * Deterministic rule-based evaluation engine
   */
  private static evaluateWithRules(
    question: string,
    today: Date,
    currentDayName: DayOfWeekName,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const qLower = question.toLowerCase()

    // 1. Resolve Target Date & Day
    const targetDate = new Date(today)
    targetDate.setHours(0, 0, 0, 0)
    let isToday = true
    let isTomorrow = false

    // Relative day: "tomorrow"
    if (qLower.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1)
      isToday = false
      isTomorrow = true
    } else {
      // Check if a specific day name is requested e.g. "friday", "monday"
      for (const d of CAFETERIA_CYCLE_DAYS) {
        const regex = new RegExp(`\\b${d.toLowerCase()}\\b`, 'i')
        if (regex.test(qLower)) {
          // Find the upcoming date for this day of week from today
          const currentJsDay = today.getDay()
          const targetJsDay = Object.entries(JS_DAY_TO_NAME).find(
            ([_, name]) => name.toLowerCase() === d.toLowerCase()
          )
          if (targetJsDay) {
            const targetNum = parseInt(targetJsDay[0], 10)
            let diff = targetNum - currentJsDay
            if (diff < 0) diff += 7
            if (diff === 0 && !qLower.includes('today')) {
              // Same day of week mentioned
            }
            targetDate.setDate(today.getDate() + diff)
            isToday = diff === 0
            isTomorrow = diff === 1
          }
          break
        }
      }
    }

    // Explicit week check: "week 1", "week 2", "week 3", "week 4" (if user asks e.g. "Week 2 Tuesday")
    let targetWeek: 1 | 2 | 3 | 4 = calculateCycleWeek(targetDate)
    const weekMatch = qLower.match(/week\s*([1-4])/i)
    if (weekMatch) {
      targetWeek = parseInt(weekMatch[1], 10) as 1 | 2 | 3 | 4
      // Advance targetDate to that cycle week's occurrence
      const currentCycleWeek = calculateCycleWeek(today)
      const weekDiff = (targetWeek - currentCycleWeek + 4) % 4
      if (weekDiff > 0) {
        targetDate.setDate(targetDate.getDate() + weekDiff * 7)
        isToday = false
        isTomorrow = false
      }
    }

    const targetDayName = (JS_DAY_TO_NAME[targetDate.getDay()] || 'Thursday') as DayOfWeekName
    const formattedDate = formatDateMonthDay(targetDate)

    // Fetch menu
    const menu = getMenuForDay(targetWeek, targetDayName)
    if (!menu) {
      return {
        answer: `Menu information for ${formattedDate} is not available.`,
        week_number: targetWeek,
        day_of_week: targetDayName,
        formatted_date: formattedDate
      }
    }

    // 2. Check for Vegetarian query (Rule 8)
    if (qLower.includes('vegetarian') || qLower.includes('vegan') || qLower.includes('meatless')) {
      return this.handleVegetarianQuery(menu, targetWeek, targetDayName, formattedDate, isToday)
    }

    // 3. Check for specific food search (Rule 7, e.g. "is chicken being served", "is there pizza")
    const searchResult = this.handleFoodSearchQuery(qLower, menu, targetWeek, targetDayName, formattedDate, isToday)
    if (searchResult) {
      return searchResult
    }

    // 4. Check for specific meal slot queries (Rule 6)
    if (qLower.includes('soup') || qLower.includes('chowder') || qLower.includes('gumbo') || qLower.includes('chili')) {
      return this.handleSoupQuery(menu, targetWeek, targetDayName, formattedDate, isToday)
    }

    if (qLower.includes('grill') || qLower.includes('grill station') || qLower.includes('burger') || qLower.includes('fries')) {
      return this.handleGrillStationQuery(menu, targetWeek, targetDayName, formattedDate, mealTimes)
    }

    if (qLower.includes('breakfast') || qLower.includes('brunch')) {
      return this.handleBreakfastQuery(menu, targetWeek, targetDayName, formattedDate, isToday, mealTimes)
    }

    if (qLower.includes('lunch')) {
      return this.handleLunchQuery(menu, targetWeek, targetDayName, formattedDate, isToday, mealTimes)
    }

    if (qLower.includes('dinner')) {
      return this.handleDinnerQuery(menu, targetWeek, targetDayName, formattedDate, isToday, mealTimes)
    }

    // Weekly overview query
    if (qLower.includes('this week') || qLower.includes('weekly')) {
      return this.handleWeeklyOverview(today, targetWeek)
    }

    // Default: full day menu
    return this.handleFullDayMenu(menu, targetWeek, targetDayName, formattedDate, isToday, isTomorrow, mealTimes)
  }

  /**
   * Handler for Full Day Menu
   */
  private static handleFullDayMenu(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean,
    isTomorrow: boolean,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    if (isToday) {
      lines.push(`Today is ${formattedDate}.`)
    } else if (isTomorrow) {
      lines.push(`Tomorrow is ${formattedDate}.`)
    } else {
      lines.push(`Menu for ${formattedDate}:`)
    }
    lines.push('')

    // Breakfast or Brunch
    lines.push(menu.breakfast_type)
    const bTime = getServingTimeStr(menu.breakfast_type.toLowerCase() as any, mealTimes)
    if (bTime) lines.push(bTime)
    menu.breakfast_items.forEach(item => lines.push(`• ${item}`))
    lines.push('')

    // Lunch
    lines.push('Lunch')
    const lTime = getServingTimeStr('lunch', mealTimes)
    if (lTime) lines.push(lTime)
    menu.lunch_items.forEach(item => lines.push(`• ${item}`))
    lines.push('')

    // Dinner
    lines.push('Dinner')
    if (menu.dinner_items === null || menu.dinner_items.length === 0) {
      lines.push('The menu does not list the dinner items for this day.')
    } else {
      const dTime = getServingTimeStr('dinner', mealTimes)
      if (dTime) lines.push(dTime)
      menu.dinner_items.forEach(item => lines.push(`• ${item}`))
    }
    lines.push('')

    // Soup
    if (menu.soup) {
      lines.push('Soup')
      lines.push(`• ${menu.soup}`)
      lines.push('')
    }

    // Grill Station
    if (menu.grill_station_items.length > 0) {
      lines.push('Grill Station')
      menu.grill_station_items.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    const hasAnyTime = !!(
      getServingTimeStr('breakfast', mealTimes) ||
      getServingTimeStr('lunch', mealTimes) ||
      getServingTimeStr('dinner', mealTimes)
    )
    if (!hasAnyTime) {
      lines.push('Serving time is not currently listed.')
    }

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      suggestions: ["What's for lunch?", "What's at the Grill Station?", "Today's soup", "Vegetarian options"]
    }
  }

  /**
   * Handler for Lunch
   */
  private static handleLunchQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    if (isToday) {
      lines.push(`Today is ${formattedDate}.`)
      lines.push('')
      lines.push('Lunch:')
    } else {
      lines.push(`${formattedDate} Lunch:`)
      lines.push('')
    }

    const lTime = getServingTimeStr('lunch', mealTimes)
    if (lTime) {
      lines.push(lTime)
      lines.push('')
    }
    menu.lunch_items.forEach(item => lines.push(`• ${item}`))
    lines.push('')

    if (!lTime) {
      lines.push('Serving time is not currently listed.')
    }

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      meal_context: 'Lunch',
      suggestions: ["What's for dinner?", "What's at the Grill Station?", "What soup is available?"]
    }
  }

  /**
   * Handler for Dinner
   */
  private static handleDinnerQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    if (isToday) {
      lines.push(`Today is ${formattedDate}.`)
      lines.push('')
      lines.push('Dinner:')
    } else {
      lines.push(`${formattedDate} Dinner:`)
      lines.push('')
    }

    if (menu.dinner_items === null || menu.dinner_items.length === 0) {
      lines.push('The menu does not list the dinner items for this day.')
      return {
        answer: lines.join('\n').trim(),
        week_number: week,
        day_of_week: day,
        formatted_date: formattedDate,
        meal_context: 'Dinner',
        suggestions: ["What's at the Grill Station?", "What soup is available?", "What's for lunch?"]
      }
    }

    const dTime = getServingTimeStr('dinner', mealTimes)
    if (dTime) {
      lines.push(dTime)
      lines.push('')
    }
    menu.dinner_items.forEach(item => lines.push(`• ${item}`))
    lines.push('')

    if (!dTime) {
      lines.push('Serving time is not currently listed.')
    }

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      meal_context: 'Dinner',
      suggestions: ["What's for lunch?", "What's at the Grill Station?"]
    }
  }

  /**
   * Handler for Breakfast / Brunch
   */
  private static handleBreakfastQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    if (isToday) {
      lines.push(`Today is ${formattedDate}.`)
      lines.push('')
      lines.push(`${menu.breakfast_type}:`)
    } else {
      lines.push(`${formattedDate} ${menu.breakfast_type}:`)
      lines.push('')
    }

    const bTime = getServingTimeStr(menu.breakfast_type.toLowerCase() as any, mealTimes)
    if (bTime) {
      lines.push(bTime)
      lines.push('')
    }
    menu.breakfast_items.forEach(item => lines.push(`• ${item}`))
    lines.push('')

    if (!bTime) {
      lines.push('Serving time is not currently listed.')
    }

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      meal_context: menu.breakfast_type,
      suggestions: ["What's for lunch?", "What's for dinner?"]
    }
  }

  /**
   * Handler for Soup
   */
  private static handleSoupQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean
  ): AgentResponse {
    if (!menu.soup) {
      return {
        answer: `There is no soup listed on the menu for ${formattedDate}.`,
        week_number: week,
        day_of_week: day,
        formatted_date: formattedDate,
        meal_context: 'Soup',
        suggestions: ["What's for lunch?", "What's at the Grill Station?"]
      }
    }

    const header = isToday ? "Today's soup is:" : `${formattedDate} soup:`
    return {
      answer: `${header}\n\n• ${menu.soup}`,
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      meal_context: 'Soup',
      suggestions: ["What's for lunch?", "What's for dinner?", "What's at the Grill Station?"]
    }
  }

  /**
   * Handler for Grill Station
   */
  private static handleGrillStationQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    lines.push('Grill Station:')
    menu.grill_station_items.forEach(item => lines.push(`• ${item}`))

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      meal_context: 'Grill Station',
      suggestions: ["Is there pizza today?", "What's for lunch?", "What soup is available?"]
    }
  }

  /**
   * Handler for Vegetarian options
   */
  private static handleVegetarianQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean
  ): AgentResponse {
    const lines: string[] = []
    const vegBreakfast = menu.breakfast_items.filter(isStrictlyVegetarian)
    const vegLunch = menu.lunch_items.filter(isStrictlyVegetarian)
    const vegDinner = (menu.dinner_items || []).filter(isStrictlyVegetarian)
    const vegSoup = menu.soup && isStrictlyVegetarian(menu.soup) ? [menu.soup] : []
    const vegGrill = menu.grill_station_items.filter(isStrictlyVegetarian)

    const hasAny = vegBreakfast.length || vegLunch.length || vegDinner.length || vegSoup.length || vegGrill.length

    if (!hasAny) {
      return {
        answer: `There are no items explicitly labeled or identified as vegetarian for ${formattedDate}.`,
        week_number: week,
        day_of_week: day,
        formatted_date: formattedDate,
        suggestions: ["What's for lunch?", "What's at the Grill Station?"]
      }
    }

    const title = isToday ? 'Vegetarian options for today:' : `Vegetarian options for ${formattedDate}:`
    lines.push(title)
    lines.push('')

    if (vegBreakfast.length > 0) {
      lines.push(`${menu.breakfast_type}:`)
      vegBreakfast.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (vegLunch.length > 0) {
      lines.push('Lunch:')
      vegLunch.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (vegDinner.length > 0) {
      lines.push('Dinner:')
      vegDinner.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (vegSoup.length > 0) {
      lines.push('Soup:')
      vegSoup.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (vegGrill.length > 0) {
      lines.push('Grill Station:')
      vegGrill.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      suggestions: ["What's for lunch?", "What soup is available?"]
    }
  }

  /**
   * Handler for Food Search
   */
  private static handleFoodSearchQuery(
    question: string,
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    formattedDate: string,
    isToday: boolean
  ): AgentResponse | null {
    const foodKeywords = [
      'pizza', 'chicken', 'fish', 'catfish', 'tilapia', 'salmon',
      'beef', 'pork', 'taco', 'tacos', 'shrimp', 'turkey',
      'burger', 'burgers', 'fries', 'french fries', 'pasta', 'lasagna',
      'wings', 'wing bar', 'rice', 'ribs', 'egg rolls', 'po boy',
      'sub', 'sandwich', 'philly', 'cornbread'
    ]

    let matchedKeyword: string | null = null
    for (const kw of foodKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i')
      if (regex.test(question)) {
        matchedKeyword = kw
        break
      }
    }

    if (!matchedKeyword) return null

    if (matchedKeyword === 'pizza') {
      const pizzaItems = menu.grill_station_items.filter(i => i.toLowerCase().includes('pizza'))
      if (pizzaItems.length > 0) {
        const lines = ['Yes. The Grill Station has:', '']
        pizzaItems.forEach(item => lines.push(`• ${item}`))
        return {
          answer: lines.join('\n').trim(),
          week_number: week,
          day_of_week: day,
          formatted_date: formattedDate,
          meal_context: 'Grill Station',
          suggestions: ["What's at the Grill Station?", "What's for lunch?"]
        }
      } else {
        return {
          answer: `No pizza is listed on the menu for ${formattedDate}.`,
          week_number: week,
          day_of_week: day,
          formatted_date: formattedDate
        }
      }
    }

    const kw = matchedKeyword.toLowerCase()
    const matchesBreakfast = menu.breakfast_items.filter(i => i.toLowerCase().includes(kw))
    const matchesLunch = menu.lunch_items.filter(i => i.toLowerCase().includes(kw))
    const matchesDinner = (menu.dinner_items || []).filter(i => i.toLowerCase().includes(kw))
    const matchesSoup = menu.soup && menu.soup.toLowerCase().includes(kw) ? [menu.soup] : []
    const matchesGrill = menu.grill_station_items.filter(i => i.toLowerCase().includes(kw))

    const totalMatches = matchesBreakfast.length + matchesLunch.length + matchesDinner.length + matchesSoup.length + matchesGrill.length

    if (totalMatches === 0) {
      return {
        answer: `No, ${matchedKeyword} is not listed on the menu for ${formattedDate}.`,
        week_number: week,
        day_of_week: day,
        formatted_date: formattedDate,
        suggestions: ["What's being served today?", "What's for lunch?"]
      }
    }

    const capKw = matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1)
    const lines: string[] = []
    lines.push(isToday ? `Yes. ${capKw} is available today.` : `Yes. ${capKw} is available on ${formattedDate}.`)
    lines.push('')

    if (matchesBreakfast.length > 0) {
      lines.push(`${menu.breakfast_type}:`)
      matchesBreakfast.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (matchesLunch.length > 0) {
      lines.push('Lunch:')
      matchesLunch.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (matchesDinner.length > 0) {
      lines.push('Dinner:')
      matchesDinner.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (matchesSoup.length > 0) {
      lines.push('Soup:')
      matchesSoup.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    if (matchesGrill.length > 0) {
      lines.push('Grill Station:')
      matchesGrill.forEach(item => lines.push(`• ${item}`))
      lines.push('')
    }

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      formatted_date: formattedDate,
      suggestions: ["What's for lunch?", "What's for dinner?", "What's at the Grill Station?"]
    }
  }

  /**
   * Handler for weekly overview with calendar dates
   */
  private static handleWeeklyOverview(baseDate: Date, cycleWeekNum: number): AgentResponse {
    const thursday = getPrecedingThursday(baseDate)
    const wednesday = new Date(thursday)
    wednesday.setDate(thursday.getDate() + 6)
    const rangeLabel = formatMonthDayRange(thursday, wednesday)

    const lines: string[] = []
    lines.push(`Here is the menu schedule for This Week (${rangeLabel}):`)
    lines.push('')

    CAFETERIA_CYCLE_DAYS.forEach((day, idx) => {
      const dayDate = new Date(thursday)
      dayDate.setDate(thursday.getDate() + idx)
      const dayFormatted = formatDateMonthDay(dayDate)

      const menu = getMenuForDay(cycleWeekNum, day)
      if (menu) {
        lines.push(`**${dayFormatted}**`)
        lines.push(`• Lunch: ${menu.lunch_items.slice(0, 3).join(', ')}...`)
        if (menu.dinner_items && menu.dinner_items.length > 0) {
          lines.push(`• Dinner: ${menu.dinner_items.slice(0, 3).join(', ')}...`)
        } else {
          lines.push('• Dinner: Not listed in source data')
        }
        lines.push('')
      }
    })

    return {
      answer: lines.join('\n').trim(),
      week_number: cycleWeekNum,
      day_of_week: 'Thursday',
      formatted_date: rangeLabel,
      suggestions: ["What's for lunch today?", "What's at the Grill Station?"]
    }
  }
}
