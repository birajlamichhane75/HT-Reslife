// Cafeteria 28-Day Menu Source of Truth
// Follows 4-week cycle starting with Week 1 Thursday through Week 4 Wednesday

export type DayOfWeekName = 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'

export interface DailyMenuCycle {
  week_number: 1 | 2 | 3 | 4
  day_of_week: DayOfWeekName
  breakfast_type: 'Breakfast' | 'Brunch'
  breakfast_items: string[]
  lunch_items: string[]
  dinner_items: string[] | null // null indicates NOT PROVIDED IN SOURCE DATA
  soup: string | null
  grill_station_items: string[]
}

export const STANDARD_BREAKFAST_ITEMS = [
  'Grits',
  'Omelet Station',
  'Scrambled Eggs',
  'Potatoes',
  'Bacon',
  'Chicken Sausage Patty',
  'Vegetarian Sausage',
  'Hot Butter Biscuits',
  'Buttermilk Pancakes',
  'Oatmeal',
  'Hard-Boiled Eggs',
  'Granola',
  'Fruit'
]

export const CAFETERIA_CYCLE_DAYS: DayOfWeekName[] = [
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday'
]

export const CAFETERIA_28_DAY_MENU: DailyMenuCycle[] = [
  // ==================== WEEK 1 ====================
  {
    week_number: 1,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Fresh Grilled Glazed Ginger Chicken',
      'Veggie Stir Fry',
      'Shrimp Fried Rice',
      'Steamed Rice',
      'California Blend',
      'Steamed Broccoli',
      'Veggie Egg Rolls',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Garlic Parmesan Chicken',
      'Pasta Shells'
    ],
    soup: 'Creamy Potato Vegetarian Soup',
    grill_station_items: [
      'Florentine',
      'Smoke Sausage w/ Onions & Peppers',
      'Dirty Rice',
      'Sauteed Kale',
      'Capri Vegetable Medley',
      'Dinner Rolls',
      'Cornbread',
      'Burgers',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 1,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Fried Catfish / Grilled Tilapia',
      'Pasta Primavera',
      'Cajun Rotisserie Chicken',
      'Yellow Macaroni & Cheese',
      'Black-Eye Peas',
      'Collard Greens',
      'Candied Yams',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Honey BBQ Ribs',
      'Veggie Stir Fry',
      'BBQ Cornbread'
    ],
    soup: 'Gumbo',
    grill_station_items: [
      'Rotisserie Chicken',
      'Yellow Rice',
      'Cabbage',
      'Fresh Vegetable Medley',
      'Buttered Rolls',
      'Chicken Philly',
      'Turkey Sliders w/ Caramelized Onions',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 1,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Chicken Tenders',
      'Vegan Meatless Paella',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Wing Bar',
      'Stuffed Squash',
      'Baked Lemon Pepper Fish',
      'Oven Roasted Red Skin Potatoes',
      'Corn on the Cob',
      'Baked Beans',
      'Buttered Rolls'
    ],
    soup: null,
    grill_station_items: [
      'Chili Dog',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 1,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Rosemary Garlic Rotisserie Chicken',
      'Grilled Potato & Spinach Burritos',
      'Steamed Rice',
      'Broccoli Spears w/ Cheese',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Carving Tom Turkey w/ Cornbread Dressing',
      'Portobello Stuffed w/ Corn & Roasted Tomatoes',
      'Rosemary Garlic Rotisserie Chicken',
      'Yellow Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Buttered Rolls',
      'Cornbread'
    ],
    soup: null,
    grill_station_items: [
      'Chicken Po Boy',
      'French Fries',
      'Cheese Pizza',
      'Ham & Pineapple Pizza'
    ]
  },
  {
    week_number: 1,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Fried Chicken',
      'Tempura Fried Zucchini',
      'Cajun Baked Fish w/ Spinach',
      'Rice Pilaf',
      'Pinto Beans',
      'California Blend',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Chicken Parmesan',
      'Rasta Pasta',
      'Herb Crusted Fish',
      'Steamed Rice',
      'Cabbage',
      'Capri Vegetable Medley',
      'Buttered Rolls',
      'Cornbread'
    ],
    soup: 'Chicken Tortilla Soup',
    grill_station_items: [
      'Classic Corn Dogs',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 1,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Chicken / Beef / Shrimp Tacos',
      'Mexican Vegan Enchiladas',
      'Lemon Pepper Rotisserie Chicken',
      'Spanish Rice',
      'Black Beans & Corn',
      'Mexican Baked Beans',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Lemon Pepper Salmon',
      'Ziti w/ Roasted Veggies',
      'Lemon Pepper Rotisserie Chicken',
      'Garlic Smashed Potatoes',
      'Normandy Cut Vegetable Blend',
      'Green Peas',
      'Buttered Rolls',
      'Cornbread'
    ],
    soup: 'Broccoli & Cheese Soup',
    grill_station_items: [
      'Spicy Chicken Sandwich',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 1,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Fried Chicken',
      'Vegan Lasagna',
      'Cajun Baked Fish',
      'Rotisserie Chicken Honey BBQ',
      'Yellow Macaroni & Cheese',
      'Candied Yams',
      'Mixed Greens',
      'Buttered Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Chicken Alfredo',
      'Penne Pasta w/ Vegetables',
      'Blackened Fish',
      'Roasted Red Potatoes',
      'Mixed Vegetables',
      'Sauteed Cabbage',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Cuban Black Bean Soup',
    grill_station_items: [
      'Chicken Sausage Philly',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },

  // ==================== WEEK 2 ====================
  {
    week_number: 2,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Sweet & Sour Pork',
      'Veggie Stir Fry',
      'Rotisserie Chicken',
      'Steamed Rice',
      'Steamed Broccoli',
      'Veggie Egg Roll',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'BBQ Slice Beef Brisket',
      'Pasta Shells Florentine',
      'Rotisserie Chicken',
      'Mashed Potatoes / Gravy',
      'Creamed Spinach',
      'Capri Vegetable Medley',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Santa Fe - Turkey Chili',
    grill_station_items: [
      'Hot Dog',
      'Shrimp Po Boy',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 2,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Fried Catfish / Grilled Tilapia',
      'Sweet & Sour Vegan Tenders',
      'Cajun Rotisserie Chicken',
      'Yellow Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Cheese Manicotti',
      'Wing Bar',
      'Cajun Shrimp',
      'Cornbread'
    ],
    soup: 'Corn Chowder',
    grill_station_items: [
      'Pasta',
      'Oven Roasted Potatoes',
      'Whole Kernel Corn',
      'Fresh Vegetable Medley',
      'Buttered Rolls',
      'Chicken Tender Basket',
      'Bacon Cheese Burger',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 2,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Country Fried Steak w/ Gravy',
      'Rotisserie Chicken',
      'Garlic Mashed Potato',
      'Green Bean Almandine',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Grilled Cajun Tilapia',
      'Stuffed Portabello',
      'Rotisserie Chicken',
      'Steamed Rice',
      'Pinto Beans',
      'Turnip Greens',
      'Buttered Rolls',
      'Cornbread'
    ],
    soup: null,
    grill_station_items: [
      'Buffalo Chicken Sandwich',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 2,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Oven Roasted Potato & Spinach Taco',
      'Rosemary Garlic Chicken Wings',
      'Broccoli Spears w/ Cheese',
      'Corn on the Cob',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Fried Chicken',
      'Breaded Ravioli',
      'Rosemary Garlic Rotisserie Chicken',
      'Yellow Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Buttered Rolls',
      'Cornbread'
    ],
    soup: null,
    grill_station_items: [
      'Beef Philly Cheesesteak',
      'French Fries',
      'Cheese Pizza',
      'Ham & Pineapple Pizza'
    ]
  },
  {
    week_number: 2,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Beef & Broccoli',
      'Tempura Fried Zucchini',
      'Chipotle Rotisserie Chicken',
      'Mashed Potatoes',
      'Green Beans',
      'California Blend',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Jerk Beef Tips',
      'Rasta Pasta',
      'Jerk Spiced Cornbread'
    ],
    soup: 'Chicken Noodle Soup',
    grill_station_items: [
      'Rotisserie Chicken',
      'Fried Rice',
      'Sauteed Cabbage',
      'Plantains',
      'Buttered Rolls',
      'Fish Sandwich',
      'Chicken Quesadilla',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 2,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Chicken / Beef / Shrimp Tacos',
      'Mexican Vegan Enchiladas',
      'Lemon Pepper Rotisserie Chicken',
      'Spanish Rice',
      'Black Beans & Corn',
      'Mexican Baked Beans & Corn',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Grilled Pork Chops',
      'Whole Wheat Ziti w/ Roasted Veggies',
      'Lemon Pepper Rotisserie Chicken'
    ],
    soup: 'Chicken Tortilla Soup',
    grill_station_items: [
      'Chicken',
      'Garlic Smashed Potatoes',
      'Normandy Cut Vegetable Blend',
      'Green Beans Almandine',
      'Buttered Rolls',
      'Philly Cheese Steak',
      'Meatball Sub',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 2,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Shrimp Lo Mein',
      'Penne Pasta w/ Vegetables',
      'Rotisserie Chicken Honey BBQ',
      'Roasted Red Potatoes',
      'Mixed Vegetables',
      'Sauteed Spinach',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Fried Chicken',
      'Vegan Lasagna',
      'Cajun Baked Fish',
      'Rotisserie Chicken Honey BBQ',
      'Yellow Macaroni & Cheese',
      'Candied Yams',
      'Mixed Greens',
      'Buttered Rolls',
      'Cornbread'
    ],
    soup: 'Beef & Noodle Soup',
    grill_station_items: [
      'Cheese Burger',
      'Chicken Po Boy',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },

  // ==================== WEEK 3 ====================
  {
    week_number: 3,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Cajun Baked Fish',
      'Stuffed Shells',
      'Beef & Noodle Casserole',
      'Rotisserie Chicken',
      'Yellow Rice',
      'Green Beans',
      'California Blend',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Shrimp Lo Mein',
      'Veggie Egg Rolls',
      'Sausage w/ Onions & Peppers',
      'BBQ Rotisserie Chicken',
      'Rice Pilaf',
      'Mixed Vegetables',
      'Steamed Broccoli',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Santa Fe - Turkey Chili',
    grill_station_items: [
      'Burger',
      'Buffalo Cauliflower Bites',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 3,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Southern Fried Fish',
      'Baked Fish',
      'BBQ Rotisserie Chicken Honey Garlic',
      'Yellow Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Yellow Squash & Onions',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Wing Bar (Lemon Pepper / Buffalo)',
      'Veggie Tenders',
      'Grilled Tilapia w/ Cajun Sauce',
      'Baked Potatoes',
      'Corn on the Cob',
      'Sauteed Asparagus',
      'Dinner Rolls',
      'Corn Bread'
    ],
    soup: 'Corn Chowder',
    grill_station_items: [
      'Boneless Wings',
      'Turkey Burger w/ Cheese',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 3,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Carving Roast Turkey w/ Cornbread Dressing',
      'Vegetarian Lasagna',
      'Rotisserie Chicken',
      'Rice Pilaf',
      'Spinach Casserole',
      'Brussel Sprouts w/ Caramelized Onions',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Wing Bar (Lemon Pepper / Buffalo)',
      'Veggie Tenders',
      'Grilled Tilapia w/ Cajun Sauce',
      'Baked Potatoes',
      'Corn on the Cob',
      'Sauteed Asparagus',
      'Dinner Rolls',
      'Corn Bread'
    ],
    soup: null,
    grill_station_items: [
      'Burger',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 3,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Carving Station (Ham)',
      'Fried Chicken',
      'Vegetable Lasagna',
      'Rosemary Garlic Rotisserie Chicken',
      'Macaroni & Cheese',
      'Fried Cabbage with Julienne Carrots & Onions',
      'Candied Yams',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Carving Station (Pork Loin)',
      'Penne Pasta w/ Vegetables',
      'Rosemary Garlic Rotisserie Chicken',
      'Twice Baked Potato',
      'Sauteed Green Beans',
      'Succotash',
      'Rolls',
      'Cornbread'
    ],
    soup: null,
    grill_station_items: [
      'Chili Dog',
      'French Fries',
      'Cheese Pizza',
      'Ham & Pineapple Pizza'
    ]
  },
  {
    week_number: 3,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'BBQ Ribs',
      'Grilled Vegetables w/ Meatless Beef Stir Fry',
      'Shrimp Jambalaya',
      'Chipotle Rotisserie Chicken',
      'Scalloped Potato',
      'California Blend',
      'Navy Beans',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Blackened Fish w/ Roasted Peppers',
      'Eggplant Parmesan',
      'Fried Pork Chop',
      'Shrimp Fried Rice',
      'Parslied Red Potatoes',
      'Seasoned Green Beans',
      'Peas & Carrots',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Chicken Tortilla Soup',
    grill_station_items: [
      'BBQ Chicken Sandwich',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 3,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Shrimp Fajitas Tacos',
      'Meatless Chicken Fajitas',
      'Chicken Fajitas',
      'Lemon Pepper Rotisserie Chicken',
      'Spanish Rice',
      'Fire Roasted Corn & Black Beans',
      'Pinto Beans',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Fried Okra',
      'Shrimp Alfredo',
      'Country Fried Steak',
      'Black Bean & Rice',
      'Lemon Pepper Rotisserie Chicken'
    ],
    soup: 'Broccoli & Cheese Soup',
    grill_station_items: [
      'Loaded Garlic Smashed Potatoes',
      'Mixed Veggies',
      'Boneless Chicken Wings',
      'Shrimp Po Boy',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 3,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Teriyaki Chicken w/ Grilled Pineapple',
      'Chinese Pepper Steak & Broccoli',
      'Angel Hair Pasta w/ Fresh Veggies',
      'Rotisserie Chicken',
      'Yellow Rice',
      'Smothered Cabbage',
      'Broccoli & Cheese',
      'Dinner Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Spaghetti Bolognese',
      'Fried Chicken',
      'Vegan Jambalaya',
      'Rotisserie Chicken',
      'Cheddar Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Chicken & Noodle Soup',
    grill_station_items: [
      'Chicken Po Boy',
      'Chili Dog',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },

  // ==================== WEEK 4 ====================
  {
    week_number: 4,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Smoked Sausage w/ Peppers & Onions',
      'Greek Stuffed Zucchini Squash',
      'Rotisserie Chicken Cajun Spice',
      'Mashed Potatoes',
      'Corn on the Cob',
      'California Blend',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Chicken Fried Tofu',
      'Grilled Tilapia w/ Mango Salsa',
      'Rotisserie Chicken Cajun Spice',
      'Yellow Rice',
      'Seasoned Lima Beans',
      'Fresh Vegetable Medley',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Potato and Corn Chowder',
    grill_station_items: [
      'Grilled Hot Dog',
      'Bacon Cheese Burger',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 4,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Southern Fried Fish',
      'Stuffed Squash',
      'Baked Fish',
      'BBQ Rotisserie Chicken Honey Garlic',
      'Yellow Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Yellow Squash',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Chicken Wing Bar',
      'Garlic & Red Pepper Penne',
      'Cornbread'
    ],
    soup: 'Chicken and Rice Soup',
    grill_station_items: [
      'Cajun Shrimp Pasta',
      'Oven Roasted Baby Reds',
      'Baked Beans',
      'Whole Green Beans',
      'Rolls',
      'Chicken Philly',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 4,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Grilled Chicken Breast',
      'Vegan Beef Stir Fry',
      'Beef Tips over Rice',
      'Steamed Rice',
      'Fresh Fried Pork Chops',
      'Portobella Stuffed w/ Corn & Roasted Tomatoes',
      'Rotisserie Chicken Italian Herb',
      'Sauteed Spinach',
      'Squash Casserole',
      'Candied Yams',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: null, // NOT PROVIDED IN SOURCE DATA
    soup: 'Vegetarian Cream of Broccoli',
    grill_station_items: [
      'BBQ Beef Sliders',
      'Grilled Chicken Sandwich',
      'Veggie Blend',
      'Broccoli Spears w/ Cheese',
      'Dinner Rolls',
      'Cornbread',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 4,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Carving Station (Maple Glazed Ham)',
      'Vegetarian Lasagna',
      'Rotisserie Chicken',
      'Braised Cabbage',
      'Cajun Rice',
      'Pinto Beans',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Fried Chicken',
      'Veggie Tenders',
      'Rosemary Garlic Rotisserie Chicken',
      'Yellow Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Buttered Rolls'
    ],
    soup: 'Vegan Garden Vegetable Soup',
    grill_station_items: [
      'Burger',
      'Beef Philly Cheesesteak',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 4,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Country Fried Steak',
      'Stuffed Pepper',
      'Rotisserie Chicken Portuguese',
      'Au Gratin Potatoes',
      'Broccoli & Cheese',
      'Sauteed Spinach',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Blackened Fish w/ Roasted Peppers',
      'Cheese Manicotti',
      'BBQ Ribs',
      'Mashed Potatoes',
      'Sauteed Spinach',
      'Veggie Blend',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Prize Winning Chili',
    grill_station_items: [
      'Fried Fish Sandwich',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  },
  {
    week_number: 4,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Turkey Tacos',
      'Chicken / Shrimp Tacos',
      'Spinach & Cheese Quesadilla',
      'Rotisserie Chicken Garlic Citrus',
      'Spanish Rice',
      'Mexican Corn',
      'Black Beans',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Lemon Pepper Wings',
      'Baked Meatless Ziti',
      'Cornbread'
    ],
    soup: 'Tomato Bacon Soup',
    grill_station_items: [
      'Shrimp Alfredo',
      'Rice & Gravy',
      'Twice Bake Potatoes',
      'Baked Beans',
      'Dinner Rolls',
      'Loaded Baked Potato Wedges',
      'Sweet Chili Chicken Sandwich',
      'French Fries',
      'Cheese Pizza',
      'Beef Topping Pizza'
    ]
  },
  {
    week_number: 4,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST_ITEMS,
    lunch_items: [
      'Chinese Pepper Steaks',
      'Veggie Egg Rolls',
      'Chinese Chicken',
      'Rice Pilaf',
      'Glazed Baby Whole Carrots',
      'Steamed Cabbage',
      'Rolls',
      'Cornbread'
    ],
    dinner_items: [
      'Spaghetti Bolognese',
      'Fried Chicken',
      'Vegan Jambalaya',
      'Rotisserie Chicken',
      'Cheddar Macaroni & Cheese',
      'Collard Greens',
      'Candied Yams',
      'Dinner Rolls',
      'Cornbread'
    ],
    soup: 'Chicken Gumbo',
    grill_station_items: [
      'Grilled Chicken Tenders',
      'French Fries',
      'Cheese Pizza',
      'Pepperoni Pizza'
    ]
  }
]

// Day of week mapping from standard Date getDay()
// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const JS_DAY_TO_NAME: Record<number, DayOfWeekName> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}

// Reference anchor: Fall 2026 Week 1 Thursday (2026-08-27)
export const CYCLE_ANCHOR_DATE = '2026-08-27'

/**
 * Calculates current cycle week (1 to 4) given a reference date.
 * Cycle advances every Thursday.
 */
export function calculateCycleWeek(date: Date = new Date(), anchorDateStr: string = CYCLE_ANCHOR_DATE): 1 | 2 | 3 | 4 {
  const anchor = new Date(anchorDateStr)
  // Time difference in milliseconds
  const diffTime = date.getTime() - anchor.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  // Each cycle week starts on Thursday (7 days per cycle week)
  const weeksPassed = Math.floor(diffDays / 7)
  const weekNum = ((weeksPassed % 4) + 4) % 4
  return (weekNum === 0 ? 4 : weekNum) as 1 | 2 | 3 | 4
}

/**
 * Finds menu entry for a specific week and day of week
 */
export function getMenuForDay(weekNumber: number, dayOfWeek: DayOfWeekName): DailyMenuCycle | undefined {
  return CAFETERIA_28_DAY_MENU.find(
    (m) => m.week_number === weekNumber && m.day_of_week.toLowerCase() === dayOfWeek.toLowerCase()
  )
}

/**
 * Returns the Thursday starting the current 7-day cycle period for a given date
 */
export function getPrecedingThursday(refDate: Date = new Date()): Date {
  const d = new Date(refDate)
  d.setHours(0, 0, 0, 0)
  const jsDay = d.getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const daysSinceThursday = (jsDay - 4 + 7) % 7
  d.setDate(d.getDate() - daysSinceThursday)
  return d
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

/**
 * Formats date as e.g. "Sunday, September 20"
 */
export function formatDateMonthDay(date: Date): string {
  const dayName = JS_DAY_TO_NAME[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  return `${dayName}, ${monthName} ${date.getDate()}`
}

/**
 * Formats date as e.g. "Sun, Sep 20"
 */
export function formatDateShort(date: Date): string {
  const dayShort = (JS_DAY_TO_NAME[date.getDay()] || '').slice(0, 3)
  const monthShort = MONTH_SHORT[date.getMonth()]
  return `${dayShort}, ${monthShort} ${date.getDate()}`
}

/**
 * Formats date as e.g. "Sunday, September 20, 2026"
 */
export function formatDateLong(date: Date): string {
  const dayName = JS_DAY_TO_NAME[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
}

/**
 * Formats date range as e.g. "Sep 17 – 23" or "Sep 24 – Oct 1"
 */
export function formatMonthDayRange(start: Date, end: Date): string {
  const startMonth = MONTH_SHORT[start.getMonth()]
  const endMonth = MONTH_SHORT[end.getMonth()]
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}`
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`
}

export interface CycleDayInfo {
  name: DayOfWeekName
  date: Date
  dateStr: string // "2026-09-20"
  shortLabel: string // "Sun, Sep 20"
  fullLabel: string // "Sunday, September 20"
  isToday: boolean
}

export interface CycleWeekPeriod {
  index: number // 0, 1, 2, 3
  cycleWeekNumber: 1 | 2 | 3 | 4
  startDate: Date
  endDate: Date
  label: string // e.g. "This Week (Sep 17 – 23)" or "Next Week (Sep 24 – 30)"
  isCurrentPeriod: boolean
  days: CycleDayInfo[]
}

/**
 * Returns 4 consecutive 7-day cycle periods starting from the current Thursday,
 * mapped to exact calendar dates.
 */
export function getCyclePeriods(baseDate: Date = new Date()): CycleWeekPeriod[] {
  const baseThursday = getPrecedingThursday(baseDate)
  const todayStr = new Date(baseDate).toISOString().split('T')[0]
  const periods: CycleWeekPeriod[] = []

  for (let i = 0; i < 4; i++) {
    const periodThursday = new Date(baseThursday)
    periodThursday.setDate(baseThursday.getDate() + i * 7)

    const periodWednesday = new Date(periodThursday)
    periodWednesday.setDate(periodThursday.getDate() + 6)

    const cycleWeekNum = calculateCycleWeek(periodThursday)
    const rangeLabel = formatMonthDayRange(periodThursday, periodWednesday)
    let periodTitle = rangeLabel
    if (i === 0) {
      periodTitle = `This Week (${rangeLabel})`
    } else if (i === 1) {
      periodTitle = `Next Week (${rangeLabel})`
    }

    const days: CycleDayInfo[] = []
    CAFETERIA_CYCLE_DAYS.forEach((dayName, dayOffset) => {
      const dayDate = new Date(periodThursday)
      dayDate.setDate(periodThursday.getDate() + dayOffset)
      const dStr = dayDate.toISOString().split('T')[0]

      days.push({
        name: dayName,
        date: dayDate,
        dateStr: dStr,
        shortLabel: formatDateShort(dayDate),
        fullLabel: formatDateMonthDay(dayDate),
        isToday: dStr === todayStr
      })
    })

    periods.push({
      index: i,
      cycleWeekNumber: cycleWeekNum,
      startDate: periodThursday,
      endDate: periodWednesday,
      label: periodTitle,
      isCurrentPeriod: i === 0,
      days
    })
  }

  return periods
}

/**
 * Looks up the menu for any given calendar date
 */
export function getMenuForCalendarDate(date: Date = new Date()): {
  menu: DailyMenuCycle | undefined
  date: Date
  dayName: DayOfWeekName
  formattedDate: string
} {
  const dayName = (JS_DAY_TO_NAME[date.getDay()] || 'Thursday') as DayOfWeekName
  const cycleWeekNum = calculateCycleWeek(date)
  const menu = getMenuForDay(cycleWeekNum, dayName)
  return {
    menu,
    date,
    dayName,
    formattedDate: formatDateMonthDay(date)
  }
}

