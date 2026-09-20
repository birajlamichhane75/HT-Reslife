const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const STANDARD_BREAKFAST = [
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
];

const MENU_DATA = [
  // WEEK 1
  {
    week_number: 1,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Fresh Grilled Glazed Ginger Chicken', 'Veggie Stir Fry', 'Shrimp Fried Rice', 'Steamed Rice', 'California Blend', 'Steamed Broccoli', 'Veggie Egg Rolls', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Garlic Parmesan Chicken', 'Pasta Shells'],
    soup: 'Creamy Potato Vegetarian Soup',
    grill_station_items: ['Florentine', 'Smoke Sausage w/ Onions & Peppers', 'Dirty Rice', 'Sauteed Kale', 'Capri Vegetable Medley', 'Dinner Rolls', 'Cornbread', 'Burgers', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 1,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Fried Catfish / Grilled Tilapia', 'Pasta Primavera', 'Cajun Rotisserie Chicken', 'Yellow Macaroni & Cheese', 'Black-Eye Peas', 'Collard Greens', 'Candied Yams', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Honey BBQ Ribs', 'Veggie Stir Fry', 'BBQ Cornbread'],
    soup: 'Gumbo',
    grill_station_items: ['Rotisserie Chicken', 'Yellow Rice', 'Cabbage', 'Fresh Vegetable Medley', 'Buttered Rolls', 'Chicken Philly', 'Turkey Sliders w/ Caramelized Onions', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 1,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Chicken Tenders', 'Vegan Meatless Paella', 'Rolls', 'Cornbread'],
    dinner_items: ['Wing Bar', 'Stuffed Squash', 'Baked Lemon Pepper Fish', 'Oven Roasted Red Skin Potatoes', 'Corn on the Cob', 'Baked Beans', 'Buttered Rolls'],
    soup: null,
    grill_station_items: ['Chili Dog', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 1,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Rosemary Garlic Rotisserie Chicken', 'Grilled Potato & Spinach Burritos', 'Steamed Rice', 'Broccoli Spears w/ Cheese', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Carving Tom Turkey w/ Cornbread Dressing', 'Portobello Stuffed w/ Corn & Roasted Tomatoes', 'Rosemary Garlic Rotisserie Chicken', 'Yellow Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Buttered Rolls', 'Cornbread'],
    soup: null,
    grill_station_items: ['Chicken Po Boy', 'French Fries', 'Cheese Pizza', 'Ham & Pineapple Pizza']
  },
  {
    week_number: 1,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Fried Chicken', 'Tempura Fried Zucchini', 'Cajun Baked Fish w/ Spinach', 'Rice Pilaf', 'Pinto Beans', 'California Blend', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Chicken Parmesan', 'Rasta Pasta', 'Herb Crusted Fish', 'Steamed Rice', 'Cabbage', 'Capri Vegetable Medley', 'Buttered Rolls', 'Cornbread'],
    soup: 'Chicken Tortilla Soup',
    grill_station_items: ['Classic Corn Dogs', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 1,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Chicken / Beef / Shrimp Tacos', 'Mexican Vegan Enchiladas', 'Lemon Pepper Rotisserie Chicken', 'Spanish Rice', 'Black Beans & Corn', 'Mexican Baked Beans', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Lemon Pepper Salmon', 'Ziti w/ Roasted Veggies', 'Lemon Pepper Rotisserie Chicken', 'Garlic Smashed Potatoes', 'Normandy Cut Vegetable Blend', 'Green Peas', 'Buttered Rolls', 'Cornbread'],
    soup: 'Broccoli & Cheese Soup',
    grill_station_items: ['Spicy Chicken Sandwich', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 1,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Fried Chicken', 'Vegan Lasagna', 'Cajun Baked Fish', 'Rotisserie Chicken Honey BBQ', 'Yellow Macaroni & Cheese', 'Candied Yams', 'Mixed Greens', 'Buttered Rolls', 'Cornbread'],
    dinner_items: ['Chicken Alfredo', 'Penne Pasta w/ Vegetables', 'Blackened Fish', 'Roasted Red Potatoes', 'Mixed Vegetables', 'Sauteed Cabbage', 'Dinner Rolls', 'Cornbread'],
    soup: 'Cuban Black Bean Soup',
    grill_station_items: ['Chicken Sausage Philly', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },

  // WEEK 2
  {
    week_number: 2,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Sweet & Sour Pork', 'Veggie Stir Fry', 'Rotisserie Chicken', 'Steamed Rice', 'Steamed Broccoli', 'Veggie Egg Roll', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['BBQ Slice Beef Brisket', 'Pasta Shells Florentine', 'Rotisserie Chicken', 'Mashed Potatoes / Gravy', 'Creamed Spinach', 'Capri Vegetable Medley', 'Dinner Rolls', 'Cornbread'],
    soup: 'Santa Fe - Turkey Chili',
    grill_station_items: ['Hot Dog', 'Shrimp Po Boy', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 2,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Fried Catfish / Grilled Tilapia', 'Sweet & Sour Vegan Tenders', 'Cajun Rotisserie Chicken', 'Yellow Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Cheese Manicotti', 'Wing Bar', 'Cajun Shrimp', 'Cornbread'],
    soup: 'Corn Chowder',
    grill_station_items: ['Pasta', 'Oven Roasted Potatoes', 'Whole Kernel Corn', 'Fresh Vegetable Medley', 'Buttered Rolls', 'Chicken Tender Basket', 'Bacon Cheese Burger', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 2,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Country Fried Steak w/ Gravy', 'Rotisserie Chicken', 'Garlic Mashed Potato', 'Green Bean Almandine', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Grilled Cajun Tilapia', 'Stuffed Portabello', 'Rotisserie Chicken', 'Steamed Rice', 'Pinto Beans', 'Turnip Greens', 'Buttered Rolls', 'Cornbread'],
    soup: null,
    grill_station_items: ['Buffalo Chicken Sandwich', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 2,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Oven Roasted Potato & Spinach Taco', 'Rosemary Garlic Chicken Wings', 'Broccoli Spears w/ Cheese', 'Corn on the Cob', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Fried Chicken', 'Breaded Ravioli', 'Rosemary Garlic Rotisserie Chicken', 'Yellow Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Buttered Rolls', 'Cornbread'],
    soup: null,
    grill_station_items: ['Beef Philly Cheesesteak', 'French Fries', 'Cheese Pizza', 'Ham & Pineapple Pizza']
  },
  {
    week_number: 2,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Beef & Broccoli', 'Tempura Fried Zucchini', 'Chipotle Rotisserie Chicken', 'Mashed Potatoes', 'Green Beans', 'California Blend', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Jerk Beef Tips', 'Rasta Pasta', 'Jerk Spiced Cornbread'],
    soup: 'Chicken Noodle Soup',
    grill_station_items: ['Rotisserie Chicken', 'Fried Rice', 'Sauteed Cabbage', 'Plantains', 'Buttered Rolls', 'Fish Sandwich', 'Chicken Quesadilla', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 2,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Chicken / Beef / Shrimp Tacos', 'Mexican Vegan Enchiladas', 'Lemon Pepper Rotisserie Chicken', 'Spanish Rice', 'Black Beans & Corn', 'Mexican Baked Beans & Corn', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Grilled Pork Chops', 'Whole Wheat Ziti w/ Roasted Veggies', 'Lemon Pepper Rotisserie Chicken'],
    soup: 'Chicken Tortilla Soup',
    grill_station_items: ['Chicken', 'Garlic Smashed Potatoes', 'Normandy Cut Vegetable Blend', 'Green Beans Almandine', 'Buttered Rolls', 'Philly Cheese Steak', 'Meatball Sub', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 2,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Shrimp Lo Mein', 'Penne Pasta w/ Vegetables', 'Rotisserie Chicken Honey BBQ', 'Roasted Red Potatoes', 'Mixed Vegetables', 'Sauteed Spinach', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Fried Chicken', 'Vegan Lasagna', 'Cajun Baked Fish', 'Rotisserie Chicken Honey BBQ', 'Yellow Macaroni & Cheese', 'Candied Yams', 'Mixed Greens', 'Buttered Rolls', 'Cornbread'],
    soup: 'Beef & Noodle Soup',
    grill_station_items: ['Cheese Burger', 'Chicken Po Boy', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },

  // WEEK 3
  {
    week_number: 3,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Cajun Baked Fish', 'Stuffed Shells', 'Beef & Noodle Casserole', 'Rotisserie Chicken', 'Yellow Rice', 'Green Beans', 'California Blend', 'Rolls', 'Cornbread'],
    dinner_items: ['Shrimp Lo Mein', 'Veggie Egg Rolls', 'Sausage w/ Onions & Peppers', 'BBQ Rotisserie Chicken', 'Rice Pilaf', 'Mixed Vegetables', 'Steamed Broccoli', 'Dinner Rolls', 'Cornbread'],
    soup: 'Santa Fe - Turkey Chili',
    grill_station_items: ['Burger', 'Buffalo Cauliflower Bites', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 3,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Southern Fried Fish', 'Baked Fish', 'BBQ Rotisserie Chicken Honey Garlic', 'Yellow Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Yellow Squash & Onions', 'Rolls', 'Cornbread'],
    dinner_items: ['Wing Bar (Lemon Pepper / Buffalo)', 'Veggie Tenders', 'Grilled Tilapia w/ Cajun Sauce', 'Baked Potatoes', 'Corn on the Cob', 'Sauteed Asparagus', 'Dinner Rolls', 'Corn Bread'],
    soup: 'Corn Chowder',
    grill_station_items: ['Boneless Wings', 'Turkey Burger w/ Cheese', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 3,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Carving Roast Turkey w/ Cornbread Dressing', 'Vegetarian Lasagna', 'Rotisserie Chicken', 'Rice Pilaf', 'Spinach Casserole', 'Brussel Sprouts w/ Caramelized Onions', 'Rolls', 'Cornbread'],
    dinner_items: ['Wing Bar (Lemon Pepper / Buffalo)', 'Veggie Tenders', 'Grilled Tilapia w/ Cajun Sauce', 'Baked Potatoes', 'Corn on the Cob', 'Sauteed Asparagus', 'Dinner Rolls', 'Corn Bread'],
    soup: null,
    grill_station_items: ['Burger', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 3,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Carving Station (Ham)', 'Fried Chicken', 'Vegetable Lasagna', 'Rosemary Garlic Rotisserie Chicken', 'Macaroni & Cheese', 'Fried Cabbage with Julienne Carrots & Onions', 'Candied Yams', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Carving Station (Pork Loin)', 'Penne Pasta w/ Vegetables', 'Rosemary Garlic Rotisserie Chicken', 'Twice Baked Potato', 'Sauteed Green Beans', 'Succotash', 'Rolls', 'Cornbread'],
    soup: null,
    grill_station_items: ['Chili Dog', 'French Fries', 'Cheese Pizza', 'Ham & Pineapple Pizza']
  },
  {
    week_number: 3,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['BBQ Ribs', 'Grilled Vegetables w/ Meatless Beef Stir Fry', 'Shrimp Jambalaya', 'Chipotle Rotisserie Chicken', 'Scalloped Potato', 'California Blend', 'Navy Beans', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Blackened Fish w/ Roasted Peppers', 'Eggplant Parmesan', 'Fried Pork Chop', 'Shrimp Fried Rice', 'Parslied Red Potatoes', 'Seasoned Green Beans', 'Peas & Carrots', 'Dinner Rolls', 'Cornbread'],
    soup: 'Chicken Tortilla Soup',
    grill_station_items: ['BBQ Chicken Sandwich', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 3,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Shrimp Fajitas Tacos', 'Meatless Chicken Fajitas', 'Chicken Fajitas', 'Lemon Pepper Rotisserie Chicken', 'Spanish Rice', 'Fire Roasted Corn & Black Beans', 'Pinto Beans', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Fried Okra', 'Shrimp Alfredo', 'Country Fried Steak', 'Black Bean & Rice', 'Lemon Pepper Rotisserie Chicken'],
    soup: 'Broccoli & Cheese Soup',
    grill_station_items: ['Loaded Garlic Smashed Potatoes', 'Mixed Veggies', 'Boneless Chicken Wings', 'Shrimp Po Boy', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 3,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Teriyaki Chicken w/ Grilled Pineapple', 'Chinese Pepper Steak & Broccoli', 'Angel Hair Pasta w/ Fresh Veggies', 'Rotisserie Chicken', 'Yellow Rice', 'Smothered Cabbage', 'Broccoli & Cheese', 'Dinner Rolls', 'Cornbread'],
    dinner_items: ['Spaghetti Bolognese', 'Fried Chicken', 'Vegan Jambalaya', 'Rotisserie Chicken', 'Cheddar Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Dinner Rolls', 'Cornbread'],
    soup: 'Chicken & Noodle Soup',
    grill_station_items: ['Chicken Po Boy', 'Chili Dog', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },

  // WEEK 4
  {
    week_number: 4,
    day_of_week: 'Thursday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Smoked Sausage w/ Peppers & Onions', 'Greek Stuffed Zucchini Squash', 'Rotisserie Chicken Cajun Spice', 'Mashed Potatoes', 'Corn on the Cob', 'California Blend', 'Rolls', 'Cornbread'],
    dinner_items: ['Chicken Fried Tofu', 'Grilled Tilapia w/ Mango Salsa', 'Rotisserie Chicken Cajun Spice', 'Yellow Rice', 'Seasoned Lima Beans', 'Fresh Vegetable Medley', 'Dinner Rolls', 'Cornbread'],
    soup: 'Potato and Corn Chowder',
    grill_station_items: ['Grilled Hot Dog', 'Bacon Cheese Burger', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 4,
    day_of_week: 'Friday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Southern Fried Fish', 'Stuffed Squash', 'Baked Fish', 'BBQ Rotisserie Chicken Honey Garlic', 'Yellow Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Yellow Squash', 'Rolls', 'Cornbread'],
    dinner_items: ['Chicken Wing Bar', 'Garlic & Red Pepper Penne', 'Cornbread'],
    soup: 'Chicken and Rice Soup',
    grill_station_items: ['Cajun Shrimp Pasta', 'Oven Roasted Baby Reds', 'Baked Beans', 'Whole Green Beans', 'Rolls', 'Chicken Philly', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 4,
    day_of_week: 'Saturday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Grilled Chicken Breast', 'Vegan Beef Stir Fry', 'Beef Tips over Rice', 'Steamed Rice', 'Fresh Fried Pork Chops', 'Portobella Stuffed w/ Corn & Roasted Tomatoes', 'Rotisserie Chicken Italian Herb', 'Sauteed Spinach', 'Squash Casserole', 'Candied Yams', 'Rolls', 'Cornbread'],
    dinner_items: null, // NOT PROVIDED IN SOURCE DATA
    soup: 'Vegetarian Cream of Broccoli',
    grill_station_items: ['BBQ Beef Sliders', 'Grilled Chicken Sandwich', 'Veggie Blend', 'Broccoli Spears w/ Cheese', 'Dinner Rolls', 'Cornbread', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 4,
    day_of_week: 'Sunday',
    breakfast_type: 'Brunch',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Carving Station (Maple Glazed Ham)', 'Vegetarian Lasagna', 'Rotisserie Chicken', 'Braised Cabbage', 'Cajun Rice', 'Pinto Beans', 'Rolls', 'Cornbread'],
    dinner_items: ['Fried Chicken', 'Veggie Tenders', 'Rosemary Garlic Rotisserie Chicken', 'Yellow Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Buttered Rolls'],
    soup: 'Vegan Garden Vegetable Soup',
    grill_station_items: ['Burger', 'Beef Philly Cheesesteak', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 4,
    day_of_week: 'Monday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Country Fried Steak', 'Stuffed Pepper', 'Rotisserie Chicken Portuguese', 'Au Gratin Potatoes', 'Broccoli & Cheese', 'Sauteed Spinach', 'Rolls', 'Cornbread'],
    dinner_items: ['Blackened Fish w/ Roasted Peppers', 'Cheese Manicotti', 'BBQ Ribs', 'Mashed Potatoes', 'Sauteed Spinach', 'Veggie Blend', 'Dinner Rolls', 'Cornbread'],
    soup: 'Prize Winning Chili',
    grill_station_items: ['Fried Fish Sandwich', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  },
  {
    week_number: 4,
    day_of_week: 'Tuesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Turkey Tacos', 'Chicken / Shrimp Tacos', 'Spinach & Cheese Quesadilla', 'Rotisserie Chicken Garlic Citrus', 'Spanish Rice', 'Mexican Corn', 'Black Beans', 'Rolls', 'Cornbread'],
    dinner_items: ['Lemon Pepper Wings', 'Baked Meatless Ziti', 'Cornbread'],
    soup: 'Tomato Bacon Soup',
    grill_station_items: ['Shrimp Alfredo', 'Rice & Gravy', 'Twice Bake Potatoes', 'Baked Beans', 'Dinner Rolls', 'Loaded Baked Potato Wedges', 'Sweet Chili Chicken Sandwich', 'French Fries', 'Cheese Pizza', 'Beef Topping Pizza']
  },
  {
    week_number: 4,
    day_of_week: 'Wednesday',
    breakfast_type: 'Breakfast',
    breakfast_items: STANDARD_BREAKFAST,
    lunch_items: ['Chinese Pepper Steaks', 'Veggie Egg Rolls', 'Chinese Chicken', 'Rice Pilaf', 'Glazed Baby Whole Carrots', 'Steamed Cabbage', 'Rolls', 'Cornbread'],
    dinner_items: ['Spaghetti Bolognese', 'Fried Chicken', 'Vegan Jambalaya', 'Rotisserie Chicken', 'Cheddar Macaroni & Cheese', 'Collard Greens', 'Candied Yams', 'Dinner Rolls', 'Cornbread'],
    soup: 'Chicken Gumbo',
    grill_station_items: ['Grilled Chicken Tenders', 'French Fries', 'Cheese Pizza', 'Pepperoni Pizza']
  }
];

// 1. Generate the standalone SQL file
let sql = `-- =========================================================
-- CAFETERIA MENUS 4-WEEK CYCLE SCHEMA & SEED
-- =========================================================

create table if not exists public.cafeteria_menus (
  id text primary key,
  week_number integer not null check (week_number between 1 and 4),
  day_of_week text not null check (day_of_week in ('Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday')),
  date date,
  meal_type text not null check (meal_type in ('Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Soup', 'Grill Station')),
  station text not null check (station in ('Main Dining', 'Grill Station', 'Soup Station', 'Breakfast Bar')),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.cafeteria_menus enable row level security;

drop policy if exists "cafeteria_menus: public read" on public.cafeteria_menus;
create policy "cafeteria_menus: public read"
  on public.cafeteria_menus for select
  using (true);

drop policy if exists "cafeteria_menus: admin write" on public.cafeteria_menus;
create policy "cafeteria_menus: admin write"
  on public.cafeteria_menus for all
  using (
    exists (
      select 1 from public.students
      where students.id = auth.uid()
      and students.role in ('admin', 'cafeteria_admin')
    )
  );

create index if not exists idx_cafeteria_menus_week_day on public.cafeteria_menus(week_number, day_of_week);
create index if not exists idx_cafeteria_menus_meal_type on public.cafeteria_menus(meal_type);

insert into public.cafeteria_menus (id, week_number, day_of_week, date, meal_type, station, items, updated_at) values
`;

const records = [];
const sqlRows = [];

MENU_DATA.forEach(day => {
  const w = day.week_number;
  const dCode = day.day_of_week.toLowerCase().slice(0, 3);

  // Breakfast / Brunch
  const bId = `w${w}-${dCode}-${day.breakfast_type.toLowerCase()}`;
  records.push({
    id: bId,
    week_number: w,
    day_of_week: day.day_of_week,
    date: null,
    meal_type: day.breakfast_type,
    station: 'Breakfast Bar',
    items: day.breakfast_items
  });
  sqlRows.push(`('${bId}', ${w}, '${day.day_of_week}', null, '${day.breakfast_type}', 'Breakfast Bar', '${JSON.stringify(day.breakfast_items).replace(/'/g, "''")}'::jsonb, now())`);

  // Lunch
  if (day.lunch_items && day.lunch_items.length > 0) {
    const lId = `w${w}-${dCode}-lunch`;
    records.push({
      id: lId,
      week_number: w,
      day_of_week: day.day_of_week,
      date: null,
      meal_type: 'Lunch',
      station: 'Main Dining',
      items: day.lunch_items
    });
    sqlRows.push(`('${lId}', ${w}, '${day.day_of_week}', null, 'Lunch', 'Main Dining', '${JSON.stringify(day.lunch_items).replace(/'/g, "''")}'::jsonb, now())`);
  }

  // Dinner
  if (day.dinner_items && day.dinner_items.length > 0) {
    const dnId = `w${w}-${dCode}-dinner`;
    records.push({
      id: dnId,
      week_number: w,
      day_of_week: day.day_of_week,
      date: null,
      meal_type: 'Dinner',
      station: 'Main Dining',
      items: day.dinner_items
    });
    sqlRows.push(`('${dnId}', ${w}, '${day.day_of_week}', null, 'Dinner', 'Main Dining', '${JSON.stringify(day.dinner_items).replace(/'/g, "''")}'::jsonb, now())`);
  }

  // Soup
  if (day.soup) {
    const spId = `w${w}-${dCode}-soup`;
    records.push({
      id: spId,
      week_number: w,
      day_of_week: day.day_of_week,
      date: null,
      meal_type: 'Soup',
      station: 'Soup Station',
      items: [day.soup]
    });
    sqlRows.push(`('${spId}', ${w}, '${day.day_of_week}', null, 'Soup', 'Soup Station', '${JSON.stringify([day.soup]).replace(/'/g, "''")}'::jsonb, now())`);
  }

  // Grill Station
  if (day.grill_station_items && day.grill_station_items.length > 0) {
    const grId = `w${w}-${dCode}-grill`;
    records.push({
      id: grId,
      week_number: w,
      day_of_week: day.day_of_week,
      date: null,
      meal_type: 'Grill Station',
      station: 'Grill Station',
      items: day.grill_station_items
    });
    sqlRows.push(`('${grId}', ${w}, '${day.day_of_week}', null, 'Grill Station', 'Grill Station', '${JSON.stringify(day.grill_station_items).replace(/'/g, "''")}'::jsonb, now())`);
  }
});

sql += sqlRows.join(',\n');
sql += `\non conflict (id) do update set
  week_number = excluded.week_number,
  day_of_week = excluded.day_of_week,
  meal_type = excluded.meal_type,
  station = excluded.station,
  items = excluded.items,
  updated_at = now();\n`;

fs.writeFileSync(path.join(__dirname, '../lib/supabase/cafeteria-menus-schema.sql'), sql);
console.log('✅ Generated lib/supabase/cafeteria-menus-schema.sql with', records.length, 'records.');

// 2. Attempt direct Supabase upsert if credentials are available
async function seedSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('ℹ️ Supabase credentials not found; skipping direct database push.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { error } = await supabase
      .from('cafeteria_menus')
      .upsert(records, { onConflict: 'id' });

    if (error) {
      console.log('ℹ️ Table cafeteria_menus may not be created in Supabase yet (' + error.message + ').');
      console.log('ℹ️ Execute lib/supabase/cafeteria-menus-schema.sql in Supabase SQL editor to create the table.');
    } else {
      console.log('🚀 Successfully seeded', records.length, 'menu records directly into Supabase!');
    }
  } catch (err) {
    console.log('ℹ️ Database seed skipped:', err.message);
  }
}

seedSupabase();
