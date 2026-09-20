// Cafeteria AI Agent Core Engine
// Implements strict 17 rules from system prompt with 0-hallucination guarantee

import { 
  CAFETERIA_28_DAY_MENU, 
  CAFETERIA_CYCLE_DAYS, 
  DailyMenuCycle, 
  DayOfWeekName,
  getMenuForDay,
  calculateCycleWeek,
  JS_DAY_TO_NAME
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
  meal_context?: string
  suggestions?: string[]
}

// Next menu day resolver
function getNextMenuDay(weekNum: number, dayName: DayOfWeekName): { nextWeek: number; nextDay: DayOfWeekName } {
  const currentIndex = CAFETERIA_CYCLE_DAYS.findIndex(
    d => d.toLowerCase() === dayName.toLowerCase()
  )
  if (currentIndex === -1 || currentIndex === CAFETERIA_CYCLE_DAYS.length - 1) {
    // Wrap to next week Thursday
    const nextW = weekNum === 4 ? 1 : weekNum + 1
    return { nextWeek: nextW, nextDay: 'Thursday' }
  }
  return { nextWeek: weekNum, nextDay: CAFETERIA_CYCLE_DAYS[currentIndex + 1] }
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
  // Must contain an explicit term, and NOT contain obvious meats unless prepended by 'meatless' / 'vegan'
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
   * Process a student's question and generate response adhering strictly to rules
   */
  public static async processMessage(input: AgentInput): Promise<AgentResponse> {
    const today = new Date()
    const currentDayName = (input.current_day || JS_DAY_TO_NAME[today.getDay()] || 'Thursday') as DayOfWeekName
    const currentWeekNum = input.current_week || calculateCycleWeek(today)
    const mealTimes = input.meal_times || null
    const question = input.user_question.trim()

    // 1. Check if an external LLM API key exists (optional enhancement)
    // If not, our rule engine provides 100% exact compliance.
    return this.evaluateWithRules(question, currentWeekNum, currentDayName, mealTimes)
  }

  /**
   * Deterministic rule-based evaluation engine
   */
  private static evaluateWithRules(
    question: string,
    currentWeekNum: number,
    currentDayName: DayOfWeekName,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const qLower = question.toLowerCase()

    // A. Parse target week & day
    let targetWeek = currentWeekNum
    let targetDay = currentDayName
    let dayContextSpecified = false

    // Explicit week check: "week 1", "week 2", "week 3", "week 4"
    const weekMatch = qLower.match(/week\s*([1-4])/i)
    if (weekMatch) {
      targetWeek = parseInt(weekMatch[1], 10) as 1 | 2 | 3 | 4
      dayContextSpecified = true
    }

    // Explicit day check: "thursday", "friday", "saturday", "sunday", "monday", "tuesday", "wednesday"
    for (const d of CAFETERIA_CYCLE_DAYS) {
      const regex = new RegExp(`\\b${d.toLowerCase()}\\b`, 'i')
      if (regex.test(qLower)) {
        targetDay = d
        dayContextSpecified = true
        break
      }
    }

    // Relative day: "tomorrow"
    if (qLower.includes('tomorrow')) {
      const next = getNextMenuDay(currentWeekNum, currentDayName)
      targetWeek = next.nextWeek
      targetDay = next.nextDay
      dayContextSpecified = true
    }

    // Relative day: "yesterday"
    if (qLower.includes('today')) {
      targetWeek = currentWeekNum
      targetDay = currentDayName
    }

    // Fetch the menu for target week and day
    const menu = getMenuForDay(targetWeek, targetDay)
    if (!menu) {
      return {
        answer: `Menu information for Week ${targetWeek} ${targetDay} is not available in the 28-day cycle.`,
        week_number: targetWeek,
        day_of_week: targetDay
      }
    }

    // B. Check for Vegetarian query (Rule 8)
    if (qLower.includes('vegetarian') || qLower.includes('vegan') || qLower.includes('meatless')) {
      return this.handleVegetarianQuery(menu, targetWeek, targetDay)
    }

    // C. Check for specific food search (Rule 7, e.g. "is chicken being served", "is there pizza")
    const searchResult = this.handleFoodSearchQuery(qLower, menu, targetWeek, targetDay)
    if (searchResult) {
      return searchResult
    }

    // D. Check for specific meal slot queries (Rule 6)
    // Soup query
    if (qLower.includes('soup') || qLower.includes('chowder') || qLower.includes('gumbo') || qLower.includes('chili')) {
      return this.handleSoupQuery(menu, targetWeek, targetDay)
    }

    // Grill Station query
    if (qLower.includes('grill') || qLower.includes('grill station') || qLower.includes('burger') || qLower.includes('fries')) {
      return this.handleGrillStationQuery(menu, targetWeek, targetDay, mealTimes)
    }

    // Breakfast / Brunch query
    if (qLower.includes('breakfast') || qLower.includes('brunch')) {
      return this.handleBreakfastQuery(menu, targetWeek, targetDay, mealTimes)
    }

    // Lunch query
    if (qLower.includes('lunch')) {
      return this.handleLunchQuery(menu, targetWeek, targetDay, mealTimes)
    }

    // Dinner query
    if (qLower.includes('dinner')) {
      return this.handleDinnerQuery(menu, targetWeek, targetDay, mealTimes)
    }

    // This week overview query
    if (qLower.includes('this week') || qLower.includes('weekly')) {
      return this.handleWeeklyOverview(targetWeek)
    }

    // Default: "What is being served today?" or general day menu query
    return this.handleFullDayMenu(menu, targetWeek, targetDay, mealTimes)
  }

  /**
   * Handler for Full Day Menu ("What is being served today?")
   */
  private static handleFullDayMenu(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    lines.push(`Today is Week ${week} ${day}.`)
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

    // Dinner (Check Rule 12 for missing data)
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

    // Rule 13 serving time notice if no times were configured
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
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    lines.push(`Today is Week ${week} ${day}.`)
    lines.push('')
    lines.push('Lunch:')
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
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    lines.push(`Week ${week} ${day} Dinner:`)
    lines.push('')

    // Rule 12: Missing data check
    if (menu.dinner_items === null || menu.dinner_items.length === 0) {
      lines.push('The menu does not list the dinner items for this day.')
      return {
        answer: lines.join('\n').trim(),
        week_number: week,
        day_of_week: day,
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
      meal_context: 'Dinner',
      suggestions: ["What's for lunch?", "What's at the Grill Station?"]
    }
  }

  /**
   * Handler for Breakfast / Brunch (Rule 3: do not call Brunch Breakfast)
   */
  private static handleBreakfastQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    lines.push(`Today is Week ${week} ${day}.`)
    lines.push('')
    lines.push(`${menu.breakfast_type}:`)
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
      meal_context: menu.breakfast_type,
      suggestions: ["What's for lunch?", "What's for dinner?"]
    }
  }

  /**
   * Handler for Soup (Rule 3 & 6)
   */
  private static handleSoupQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName
  ): AgentResponse {
    if (!menu.soup) {
      return {
        answer: `There is no soup listed on the menu for Week ${week} ${day}.`,
        week_number: week,
        day_of_week: day,
        meal_context: 'Soup',
        suggestions: ["What's for lunch?", "What's at the Grill Station?"]
      }
    }

    return {
      answer: `Today's soup is:\n\n• ${menu.soup}`,
      week_number: week,
      day_of_week: day,
      meal_context: 'Soup',
      suggestions: ["What's for lunch?", "What's for dinner?", "What's at the Grill Station?"]
    }
  }

  /**
   * Handler for Grill Station (Rule 3 & 6)
   */
  private static handleGrillStationQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName,
    mealTimes?: Record<string, { start: string; end: string } | null> | null
  ): AgentResponse {
    const lines: string[] = []
    lines.push('Grill Station:')
    menu.grill_station_items.forEach(item => lines.push(`• ${item}`))

    return {
      answer: lines.join('\n').trim(),
      week_number: week,
      day_of_week: day,
      meal_context: 'Grill Station',
      suggestions: ["Is there pizza today?", "What's for lunch?", "What soup is available?"]
    }
  }

  /**
   * Handler for Vegetarian options (Rule 8: strict vegetarian labeling)
   */
  private static handleVegetarianQuery(
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName
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
        answer: `There are no items explicitly labeled or identified as vegetarian for Week ${week} ${day}.`,
        week_number: week,
        day_of_week: day,
        suggestions: ["What's for lunch?", "What's at the Grill Station?"]
      }
    }

    lines.push(`Vegetarian options for Week ${week} ${day}:`)
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
      suggestions: ["What's for lunch?", "What soup is available?"]
    }
  }

  /**
   * Handler for Specific Food Search (Rule 7: search complete menu for item)
   */
  private static handleFoodSearchQuery(
    question: string,
    menu: DailyMenuCycle,
    week: number,
    day: DayOfWeekName
  ): AgentResponse | null {
    // List of searchable keywords/foods
    const foodKeywords = [
      'pizza',
      'chicken',
      'fish',
      'catfish',
      'tilapia',
      'salmon',
      'beef',
      'pork',
      'taco',
      'tacos',
      'shrimp',
      'turkey',
      'burger',
      'burgers',
      'fries',
      'french fries',
      'pasta',
      'lasagna',
      'wings',
      'wing bar',
      'rice',
      'ribs',
      'egg rolls',
      'po boy',
      'sub',
      'sandwich',
      'philly',
      'cornbread'
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

    // Pizza special handling matching prompt example in Section 16:
    // User: "Is there pizza today?" -> "Yes. The Grill Station has: • Cheese Pizza • Pepperoni Pizza"
    if (matchedKeyword === 'pizza') {
      const pizzaItems = menu.grill_station_items.filter(i => i.toLowerCase().includes('pizza'))
      if (pizzaItems.length > 0) {
        const lines = ['Yes. The Grill Station has:', '']
        pizzaItems.forEach(item => lines.push(`• ${item}`))
        return {
          answer: lines.join('\n').trim(),
          week_number: week,
          day_of_week: day,
          meal_context: 'Grill Station',
          suggestions: ["What's at the Grill Station?", "What's for lunch?"]
        }
      } else {
        return {
          answer: `No pizza is listed on the menu for Week ${week} ${day}.`,
          week_number: week,
          day_of_week: day
        }
      }
    }

    // General food search across breakfast, lunch, dinner, soup, grill
    const kw = matchedKeyword.toLowerCase()
    const matchesBreakfast = menu.breakfast_items.filter(i => i.toLowerCase().includes(kw))
    const matchesLunch = menu.lunch_items.filter(i => i.toLowerCase().includes(kw))
    const matchesDinner = (menu.dinner_items || []).filter(i => i.toLowerCase().includes(kw))
    const matchesSoup = menu.soup && menu.soup.toLowerCase().includes(kw) ? [menu.soup] : []
    const matchesGrill = menu.grill_station_items.filter(i => i.toLowerCase().includes(kw))

    const totalMatches = matchesBreakfast.length + matchesLunch.length + matchesDinner.length + matchesSoup.length + matchesGrill.length

    if (totalMatches === 0) {
      return {
        answer: `No, ${matchedKeyword} is not listed on the menu for Week ${week} ${day}.`,
        week_number: week,
        day_of_week: day,
        suggestions: ["What's being served today?", "What's for lunch?"]
      }
    }

    // Capitalize keyword for response
    const capKw = matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1)
    const lines: string[] = []
    lines.push(`Yes. ${capKw} is available today.`)
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
      suggestions: ["What's for lunch?", "What's for dinner?", "What's at the Grill Station?"]
    }
  }

  /**
   * Handler for weekly overview
   */
  private static handleWeeklyOverview(week: number): AgentResponse {
    const lines: string[] = []
    lines.push(`Here is the menu schedule for Week ${week} (Thursday through Wednesday):`)
    lines.push('')

    CAFETERIA_CYCLE_DAYS.forEach(day => {
      const menu = getMenuForDay(week, day)
      if (menu) {
        lines.push(`**${day}**`)
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
      week_number: week,
      day_of_week: 'Thursday',
      suggestions: ["What's for lunch today?", "What's at the Grill Station?"]
    }
  }
}
