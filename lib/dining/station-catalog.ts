export interface EnrichedMenuItem {
  id: string
  name: string
  station: 'GRILL' | 'HOMESTYLE' | 'SALAD' | 'BAKERY' | 'SOUP & SIDES'
  portion: string
  calories: number
  description: string
  is_vegetarian: boolean
  is_vegan: boolean
  is_plant_protein: boolean
  is_halal: boolean
  is_gluten_free: boolean
  is_sustainable: boolean
  nutrition: {
    protein: string
    carbs: string
    fat: string
    sodium: string
    fiber: string
    allergens: string[]
  }
}

// Catalog of known dishes with realistic collegiate dining nutritional information
export const KNOWN_ITEM_CATALOG: Record<string, Partial<EnrichedMenuItem>> = {
  // --- GRILL STATION ---
  'Omelet Bar': {
    station: 'GRILL',
    portion: '1 plate',
    calories: 130,
    description: 'Two farm-fresh eggs or egg whites prepared to order with your choice of fillings',
    is_vegetarian: true,
    is_plant_protein: true,
    nutrition: { protein: '14g', carbs: '2g', fat: '8g', sodium: '240mg', fiber: '0g', allergens: ['Eggs', 'Milk'] }
  },
  'Omelet Station': {
    station: 'GRILL',
    portion: '1 plate',
    calories: 130,
    description: 'Two farm-fresh eggs or egg whites prepared to order with your choice of fillings',
    is_vegetarian: true,
    is_plant_protein: true,
    nutrition: { protein: '14g', carbs: '2g', fat: '8g', sodium: '240mg', fiber: '0g', allergens: ['Eggs', 'Milk'] }
  },
  'Eggs': {
    station: 'GRILL',
    portion: '3 fl oz',
    calories: 110,
    description: 'Fresh scrambled eggs cooked with creamery butter',
    is_vegetarian: true,
    is_plant_protein: true,
    nutrition: { protein: '12g', carbs: '1g', fat: '7g', sodium: '170mg', fiber: '0g', allergens: ['Eggs', 'Milk'] }
  },
  'Egg Whites': {
    station: 'GRILL',
    portion: '3 fl oz',
    calories: 45,
    description: 'Two egg whites made to order',
    is_vegetarian: true,
    is_plant_protein: true,
    nutrition: { protein: '10g', carbs: '0g', fat: '0g', sodium: '160mg', fiber: '0g', allergens: ['Eggs'] }
  },
  'Burgers': {
    station: 'GRILL',
    portion: '1 each',
    calories: 340,
    description: 'Grilled beef patty on a toasted brioche bun with lettuce and tomato',
    is_halal: true,
    nutrition: { protein: '22g', carbs: '28g', fat: '16g', sodium: '520mg', fiber: '2g', allergens: ['Wheat', 'Soy'] }
  },
  'French Fries': {
    station: 'GRILL',
    portion: '1 basket',
    calories: 220,
    description: 'Crispy golden shoestring potatoes tossed with sea salt',
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    nutrition: { protein: '3g', carbs: '32g', fat: '10g', sodium: '320mg', fiber: '3g', allergens: [] }
  },
  'Cheese Pizza': {
    station: 'GRILL',
    portion: '1 slice',
    calories: 280,
    description: 'Hand-stretched dough topped with marinara and melted mozzarella',
    is_vegetarian: true,
    nutrition: { protein: '12g', carbs: '34g', fat: '11g', sodium: '580mg', fiber: '2g', allergens: ['Wheat', 'Milk'] }
  },
  'Pepperoni Pizza': {
    station: 'GRILL',
    portion: '1 slice',
    calories: 310,
    description: 'House pizza topped with sliced pepperoni and herb mozzarella',
    nutrition: { protein: '14g', carbs: '34g', fat: '14g', sodium: '680mg', fiber: '2g', allergens: ['Wheat', 'Milk'] }
  },

  // --- HOMESTYLE ---
  'Scrambled Eggs': {
    station: 'HOMESTYLE',
    portion: '1/2 cup',
    calories: 210,
    description: 'Fluffy whole eggs seasoned with salt and fresh cracked pepper',
    is_vegetarian: true,
    is_plant_protein: true,
    nutrition: { protein: '14g', carbs: '2g', fat: '16g', sodium: '340mg', fiber: '0g', allergens: ['Eggs', 'Milk'] }
  },
  'Biscuits and Country Gravy': {
    station: 'HOMESTYLE',
    portion: '1 each',
    calories: 330,
    description: 'Fluffy, buttery buttermilk biscuits served with country pepper gravy',
    is_vegetarian: false,
    nutrition: { protein: '7g', carbs: '38g', fat: '17g', sodium: '840mg', fiber: '1g', allergens: ['Wheat', 'Milk', 'Pork'] }
  },
  'Hot Butter Biscuits': {
    station: 'BAKERY',
    portion: '1 each',
    calories: 180,
    description: 'Warm golden biscuits brushed with melted butter',
    is_vegetarian: true,
    nutrition: { protein: '3g', carbs: '24g', fat: '8g', sodium: '450mg', fiber: '1g', allergens: ['Wheat', 'Milk'] }
  },
  'Buttermilk Pancakes': {
    station: 'HOMESTYLE',
    portion: '2 cakes',
    calories: 240,
    description: 'Griddled buttermilk hotcakes served with warm maple syrup',
    is_vegetarian: true,
    nutrition: { protein: '5g', carbs: '44g', fat: '5g', sodium: '490mg', fiber: '1g', allergens: ['Wheat', 'Milk', 'Eggs'] }
  },
  'Bacon': {
    station: 'HOMESTYLE',
    portion: '2 strips',
    calories: 90,
    description: 'Crisp applewood smoked bacon strips',
    nutrition: { protein: '6g', carbs: '0g', fat: '7g', sodium: '320mg', fiber: '0g', allergens: ['Pork'] }
  },
  'Chicken Sausage Patty': {
    station: 'HOMESTYLE',
    portion: '1 patty',
    calories: 110,
    description: 'Savory country spiced chicken breakfast patty',
    is_halal: true,
    nutrition: { protein: '11g', carbs: '1g', fat: '7g', sodium: '290mg', fiber: '0g', allergens: [] }
  },
  'Vegetarian Sausage': {
    station: 'HOMESTYLE',
    portion: '1 each',
    calories: 70,
    description: 'Plant-based savory herb breakfast patty',
    is_vegetarian: true,
    is_vegan: true,
    is_plant_protein: true,
    nutrition: { protein: '9g', carbs: '3g', fat: '2.5g', sodium: '210mg', fiber: '2g', allergens: ['Soy'] }
  },
  'Potatoes': {
    station: 'HOMESTYLE',
    portion: '1/2 cup',
    calories: 140,
    description: 'Diced russet potatoes roasted with bell peppers and onions',
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    nutrition: { protein: '2g', carbs: '26g', fat: '4g', sodium: '280mg', fiber: '3g', allergens: [] }
  },
  'Grits': {
    station: 'HOMESTYLE',
    portion: '3/4 cup',
    calories: 120,
    description: 'Creamy southern stone-ground white corn grits',
    is_vegetarian: true,
    is_gluten_free: true,
    nutrition: { protein: '3g', carbs: '24g', fat: '1g', sodium: '150mg', fiber: '1g', allergens: ['Milk'] }
  },
  'Oatmeal': {
    station: 'HOMESTYLE',
    portion: '3/4 cup',
    calories: 140,
    description: 'Whole grain rolled oats simmered with brown sugar and cinnamon',
    is_vegetarian: true,
    is_vegan: true,
    is_sustainable: true,
    nutrition: { protein: '5g', carbs: '28g', fat: '2.5g', sodium: '80mg', fiber: '4g', allergens: [] }
  },
  'Fresh Grilled Glazed Ginger Chicken': {
    station: 'HOMESTYLE',
    portion: '5 oz',
    calories: 280,
    description: 'Tender chicken breast marinated in ginger tamari glaze and grilled to order',
    is_halal: true,
    is_sustainable: true,
    nutrition: { protein: '34g', carbs: '6g', fat: '8g', sodium: '440mg', fiber: '0g', allergens: ['Soy'] }
  },
  'Veggie Stir Fry': {
    station: 'HOMESTYLE',
    portion: '1 cup',
    calories: 110,
    description: 'Fresh broccoli florets, snap peas, bell peppers and carrots in sesame soy sauce',
    is_vegetarian: true,
    is_vegan: true,
    is_sustainable: true,
    nutrition: { protein: '4g', carbs: '18g', fat: '3g', sodium: '340mg', fiber: '5g', allergens: ['Soy', 'Sesame'] }
  },
  'Shrimp Fried Rice': {
    station: 'HOMESTYLE',
    portion: '3/4 cup',
    calories: 260,
    description: 'Jasmine rice wok-fried with baby shrimp, scrambled egg, scallions and peas',
    nutrition: { protein: '12g', carbs: '38g', fat: '6g', sodium: '520mg', fiber: '1g', allergens: ['Shellfish', 'Eggs', 'Soy'] }
  },
  'Steamed Rice': {
    station: 'HOMESTYLE',
    portion: '3/4 cup',
    calories: 170,
    description: 'Fragrant fluffy long-grain white rice',
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_halal: true,
    nutrition: { protein: '3g', carbs: '37g', fat: '0g', sodium: '5mg', fiber: '1g', allergens: [] }
  },
  'Garlic Parmesan Chicken': {
    station: 'HOMESTYLE',
    portion: '5 oz',
    calories: 320,
    description: 'Herb-crusted chicken cutlets tossed in garlic butter and aged parmesan',
    is_halal: true,
    nutrition: { protein: '36g', carbs: '4g', fat: '14g', sodium: '580mg', fiber: '0g', allergens: ['Milk'] }
  },
  'Fried Catfish / Grilled Tilapia': {
    station: 'HOMESTYLE',
    portion: '1 fillet',
    calories: 290,
    description: 'Cornmeal-crusted southern catfish or lightly seasoned grilled tilapia',
    is_sustainable: true,
    nutrition: { protein: '26g', carbs: '12g', fat: '13g', sodium: '420mg', fiber: '1g', allergens: ['Fish', 'Wheat'] }
  },
  'Yellow Macaroni & Cheese': {
    station: 'HOMESTYLE',
    portion: '1/2 cup',
    calories: 260,
    description: 'Tender elbow pasta baked in three-cheese sharp cheddar sauce',
    is_vegetarian: true,
    nutrition: { protein: '9g', carbs: '28g', fat: '13g', sodium: '510mg', fiber: '1g', allergens: ['Wheat', 'Milk'] }
  },

  // --- SALAD & DELI ---
  'Low Fat Vanilla Yogurt': {
    station: 'SALAD',
    portion: '1/2 cup',
    calories: 100,
    description: 'Smooth cultured yogurt flavored with pure Madagascar vanilla',
    is_vegetarian: true,
    is_gluten_free: true,
    nutrition: { protein: '6g', carbs: '18g', fat: '1.5g', sodium: '90mg', fiber: '0g', allergens: ['Milk'] }
  },
  'Low Fat Strawberry Yogurt': {
    station: 'SALAD',
    portion: '1/2 cup',
    calories: 105,
    description: 'Creamy yogurt swirled with real strawberry puree',
    is_vegetarian: true,
    is_gluten_free: true,
    nutrition: { protein: '5g', carbs: '19g', fat: '1.5g', sodium: '85mg', fiber: '0g', allergens: ['Milk'] }
  },
  'Granola': {
    station: 'SALAD',
    portion: '1/4 cup',
    calories: 130,
    description: 'Toasted whole oats with almonds, honey, and pumpkin seeds',
    is_vegetarian: true,
    is_sustainable: true,
    nutrition: { protein: '4g', carbs: '22g', fat: '4g', sodium: '45mg', fiber: '3g', allergens: ['Tree Nuts'] }
  },
  'Fruit': {
    station: 'SALAD',
    portion: '1/2 cup',
    calories: 60,
    description: 'Fresh seasonal sliced melon, pineapple, grapes and berries',
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_sustainable: true,
    nutrition: { protein: '1g', carbs: '15g', fat: '0g', sodium: '5mg', fiber: '2g', allergens: [] }
  },
  'Hard-Boiled Eggs': {
    station: 'SALAD',
    portion: '1 each',
    calories: 70,
    description: 'Chilled hard-boiled grade-A large egg',
    is_vegetarian: true,
    is_plant_protein: true,
    is_gluten_free: true,
    nutrition: { protein: '6g', carbs: '0g', fat: '5g', sodium: '70mg', fiber: '0g', allergens: ['Eggs'] }
  },
  'Steamed Broccoli': {
    station: 'SOUP & SIDES',
    portion: '3/4 cup',
    calories: 35,
    description: 'Tender steamed broccoli crowns seasoned with light olive oil and sea salt',
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    is_sustainable: true,
    nutrition: { protein: '2g', carbs: '6g', fat: '0.5g', sodium: '30mg', fiber: '3g', allergens: [] }
  },
  'California Blend': {
    station: 'SOUP & SIDES',
    portion: '3/4 cup',
    calories: 40,
    description: 'Steamed medley of broccoli, cauliflower and baby carrots',
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
    nutrition: { protein: '2g', carbs: '7g', fat: '0.5g', sodium: '45mg', fiber: '3g', allergens: [] }
  },
  'Collard Greens': {
    station: 'SOUP & SIDES',
    portion: '1/2 cup',
    calories: 65,
    description: 'Slow-simmered greens with garlic, cider vinegar and smoked seasoning',
    is_vegetarian: true,
    is_gluten_free: true,
    nutrition: { protein: '3g', carbs: '8g', fat: '2g', sodium: '360mg', fiber: '4g', allergens: [] }
  },
  'Candied Yams': {
    station: 'SOUP & SIDES',
    portion: '1/2 cup',
    calories: 160,
    description: 'Sliced sweet potatoes caramelized in brown sugar, cinnamon, and nutmeg',
    is_vegetarian: true,
    nutrition: { protein: '2g', carbs: '36g', fat: '2g', sodium: '110mg', fiber: '3g', allergens: ['Milk'] }
  },

  // --- BAKERY & DESSERT ---
  'Dinner Rolls': {
    station: 'BAKERY',
    portion: '1 each',
    calories: 120,
    description: 'Warm soft yeast rolls with honey butter glaze',
    is_vegetarian: true,
    nutrition: { protein: '3g', carbs: '20g', fat: '2.5g', sodium: '190mg', fiber: '1g', allergens: ['Wheat', 'Milk'] }
  },
  'Cornbread': {
    station: 'BAKERY',
    portion: '1 square',
    calories: 160,
    description: 'Sweet southern skillet cornbread with golden crust',
    is_vegetarian: true,
    nutrition: { protein: '3g', carbs: '26g', fat: '5g', sodium: '240mg', fiber: '1g', allergens: ['Wheat', 'Milk', 'Eggs'] }
  },
  'Chocolate Chip Monkey Bread': {
    station: 'BAKERY',
    portion: '1 each',
    calories: 220,
    description: 'Classic cinnamon-y, gooey, chocolatey sweet pull-apart anytime breakfast bread',
    is_vegetarian: true,
    nutrition: { protein: '3g', carbs: '38g', fat: '8g', sodium: '210mg', fiber: '1g', allergens: ['Wheat', 'Milk', 'Soy'] }
  },
  'Raspberry Muffin': {
    station: 'BAKERY',
    portion: '1 each',
    calories: 210,
    description: 'Fluffy home-baked muffin enhanced with raspberries and sugar crumble',
    is_vegetarian: true,
    nutrition: { protein: '4g', carbs: '36g', fat: '7g', sodium: '240mg', fiber: '2g', allergens: ['Wheat', 'Milk', 'Eggs'] }
  },
  'Cinnamon Roll': {
    station: 'BAKERY',
    portion: '1 each',
    calories: 250,
    description: 'Warm rolled dough swirled with brown sugar cinnamon and vanilla icing',
    is_vegetarian: true,
    nutrition: { protein: '4g', carbs: '42g', fat: '9g', sodium: '280mg', fiber: '1g', allergens: ['Wheat', 'Milk'] }
  },

  // --- SOUP ---
  'Creamy Potato Vegetarian Soup': {
    station: 'SOUP & SIDES',
    portion: '1 cup',
    calories: 160,
    description: 'Velvety soup crafted with russet potatoes, leeks, sweet cream and fresh chives',
    is_vegetarian: true,
    nutrition: { protein: '4g', carbs: '22g', fat: '7g', sodium: '480mg', fiber: '2g', allergens: ['Milk'] }
  }
}

// Helper to categorize and enrich any menu item dynamically
export function enrichMenuItem(rawName: string): EnrichedMenuItem {
  const trimmed = rawName.trim()
  const lower = trimmed.toLowerCase()

  // 1. Direct match in catalog
  if (KNOWN_ITEM_CATALOG[trimmed]) {
    const entry = KNOWN_ITEM_CATALOG[trimmed]
    return {
      id: `item-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: trimmed,
      station: entry.station || 'HOMESTYLE',
      portion: entry.portion || '1 serving',
      calories: entry.calories || 180,
      description: entry.description || 'Prepared fresh daily by HTU Campus Dining Services',
      is_vegetarian: !!entry.is_vegetarian,
      is_vegan: !!entry.is_vegan,
      is_plant_protein: !!entry.is_plant_protein,
      is_halal: !!entry.is_halal,
      is_gluten_free: !!entry.is_gluten_free,
      is_sustainable: !!entry.is_sustainable,
      nutrition: entry.nutrition || {
        protein: '12g',
        carbs: '22g',
        fat: '8g',
        sodium: '360mg',
        fiber: '2g',
        allergens: []
      }
    }
  }

  // 2. Fuzzy categorization
  let station: EnrichedMenuItem['station'] = 'HOMESTYLE'
  let portion = '1 serving'
  let calories = 180
  let is_vegetarian = false
  let is_vegan = false
  let is_plant_protein = false
  let is_halal = false
  let is_gluten_free = false
  let is_sustainable = false
  let allergens: string[] = []

  if (
    lower.includes('burger') ||
    lower.includes('pizza') ||
    lower.includes('fry') ||
    lower.includes('fries') ||
    lower.includes('grill') ||
    lower.includes('florentine') ||
    lower.includes('omelet')
  ) {
    station = 'GRILL'
    portion = lower.includes('pizza') ? '1 slice' : lower.includes('fries') ? '1 basket' : '1 each'
    calories = lower.includes('pizza') ? 280 : lower.includes('burger') ? 340 : 210
    allergens = ['Wheat']
  } else if (
    lower.includes('roll') ||
    lower.includes('bread') ||
    lower.includes('muffin') ||
    lower.includes('biscuit') ||
    lower.includes('cake') ||
    lower.includes('cookie') ||
    lower.includes('pancake')
  ) {
    station = 'BAKERY'
    portion = '1 each'
    calories = 160
    is_vegetarian = true
    allergens = ['Wheat', 'Milk']
  } else if (
    lower.includes('salad') ||
    lower.includes('fruit') ||
    lower.includes('yogurt') ||
    lower.includes('granola') ||
    lower.includes('grape') ||
    lower.includes('melon') ||
    lower.includes('orange') ||
    lower.includes('parfait')
  ) {
    station = 'SALAD'
    portion = lower.includes('yogurt') ? '1/2 cup' : '3/4 cup'
    calories = lower.includes('fruit') ? 60 : 110
    is_vegetarian = true
    is_vegan = lower.includes('fruit') || lower.includes('salad')
    is_sustainable = true
  } else if (
    lower.includes('soup') ||
    lower.includes('chili') ||
    lower.includes('stew') ||
    lower.includes('broccoli') ||
    lower.includes('vegetable') ||
    lower.includes('peas') ||
    lower.includes('beans') ||
    lower.includes('greens') ||
    lower.includes('yam')
  ) {
    station = 'SOUP & SIDES'
    portion = lower.includes('soup') ? '1 cup' : '1/2 cup'
    calories = lower.includes('soup') ? 140 : 80
    is_vegetarian = lower.includes('veggie') || lower.includes('vegetarian') || lower.includes('broccoli') || lower.includes('vegetable')
    is_vegan = is_vegetarian && !lower.includes('creamy') && !lower.includes('cheese')
    is_gluten_free = true
    is_sustainable = true
  } else {
    station = 'HOMESTYLE'
    portion = lower.includes('chicken') || lower.includes('fish') || lower.includes('pork') || lower.includes('ribs') ? '5 oz' : '3/4 cup'
    calories = lower.includes('chicken') ? 260 : lower.includes('pasta') ? 310 : 220
    is_halal = lower.includes('chicken')
    if (lower.includes('veggie') || lower.includes('vegan') || lower.includes('meatless') || lower.includes('tofu')) {
      is_vegetarian = true
      is_vegan = lower.includes('vegan')
      is_plant_protein = true
    }
  }

  // Dietary checks based on keywords
  if (lower.includes('veggie') || lower.includes('vegetarian') || lower.includes('cheese') || lower.includes('egg') || lower.includes('potato')) {
    is_vegetarian = true
  }
  if (lower.includes('vegan') || lower.includes('fruit') || lower.includes('steamed broccoli') || lower.includes('steamed rice')) {
    is_vegetarian = true
    is_vegan = true
  }
  if (lower.includes('egg') || lower.includes('sausage') || lower.includes('chicken') || lower.includes('beef') || lower.includes('protein')) {
    is_plant_protein = is_vegetarian
  }

  const generatedDesc = is_vegan
    ? 'Delicious plant-based recipe prepared with fresh ingredients'
    : is_vegetarian
    ? 'Wholesome vegetarian specialty seasoned with fragrant herbs'
    : lower.includes('chicken')
    ? 'Tender poultry seasoned with house blend herbs and spices'
    : 'Chef-crafted daily selection prepared hot and fresh for meal service'

  return {
    id: `item-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: trimmed,
    station,
    portion,
    calories,
    description: generatedDesc,
    is_vegetarian,
    is_vegan,
    is_plant_protein,
    is_halal,
    is_gluten_free,
    is_sustainable,
    nutrition: {
      protein: calories > 250 ? '24g' : calories > 150 ? '12g' : '4g',
      carbs: calories > 200 ? '28g' : '14g',
      fat: calories > 200 ? '12g' : '5g',
      sodium: `${calories * 2}mg`,
      fiber: is_vegetarian ? '4g' : '1g',
      allergens
    }
  }
}

