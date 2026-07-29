-- Alter student role constraint to include cafeteria_admin
alter table public.students drop constraint if exists students_role_check;
alter table public.students add constraint students_role_check check (role in ('student', 'admin', 'cafeteria_admin'));

-- Cafeteria info (single row — general info about the dining hall)
create table if not exists public.cafeteria_info (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'HTU Cafeteria',
  location text,
  phone text,
  email text,
  announcement text,        -- e.g. "Closed for spring break May 1-5"
  image_url text,
  updated_at timestamptz default now()
);

-- Dining hours (one row per meal slot per day type)
create table if not exists public.dining_hours (
  id uuid primary key default uuid_generate_v4(),
  day_type text not null check (day_type in ('weekday', 'saturday', 'sunday')),
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'brunch')),
  open_time text not null,   -- e.g. "7:00 AM"
  close_time text not null,  -- e.g. "9:30 AM"
  is_active boolean default true,
  unique(day_type, meal_slot)
);

-- Default weekly menu template (repeats every week unless overridden)
-- day_of_week: 0=Monday 1=Tuesday 2=Wednesday 3=Thursday 4=Friday 5=Saturday 6=Sunday
create table if not exists public.menu_template (
  id uuid primary key default uuid_generate_v4(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'brunch')),
  items jsonb not null default '[]',
  -- items structure: [{ name: string, description: string, category: string,
  --                     is_vegetarian: boolean, is_vegan: boolean,
  --                     is_halal: boolean, allergens: string[] }]
  updated_at timestamptz default now(),
  unique(day_of_week, meal_slot)
);

-- Daily overrides (cafeteria admin posts these to replace template for a specific date)
create table if not exists public.daily_menu (
  id uuid primary key default uuid_generate_v4(),
  menu_date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'brunch')),
  items jsonb not null default '[]',
  -- same items structure as menu_template
  special_note text,         -- e.g. "Chef's special: Thanksgiving dinner"
  is_cancelled boolean default false,
  cancel_reason text,
  created_by uuid references public.students(id),
  updated_at timestamptz default now(),
  unique(menu_date, meal_slot)
);

-- Meal images (one image per named menu item — reusable across days)
create table if not exists public.meal_images (
  id uuid primary key default uuid_generate_v4(),
  item_name text not null unique,
  image_url text not null,
  uploaded_at timestamptz default now()
);

-- RLS policies for dining tables

alter table public.cafeteria_info enable row level security;
alter table public.dining_hours enable row level security;
alter table public.menu_template enable row level security;
alter table public.daily_menu enable row level security;
alter table public.meal_images enable row level security;

-- All authenticated students can read everything
drop policy if exists "dining: authenticated read cafeteria_info" on public.cafeteria_info;
create policy "dining: authenticated read cafeteria_info"
  on public.cafeteria_info for select
  using (auth.role() = 'authenticated');

drop policy if exists "dining: authenticated read dining_hours" on public.dining_hours;
create policy "dining: authenticated read dining_hours"
  on public.dining_hours for select
  using (auth.role() = 'authenticated');

drop policy if exists "dining: authenticated read menu_template" on public.menu_template;
create policy "dining: authenticated read menu_template"
  on public.menu_template for select
  using (auth.role() = 'authenticated');

drop policy if exists "dining: authenticated read daily_menu" on public.daily_menu;
create policy "dining: authenticated read daily_menu"
  on public.daily_menu for select
  using (auth.role() = 'authenticated');

drop policy if exists "dining: authenticated read meal_images" on public.meal_images;
create policy "dining: authenticated read meal_images"
  on public.meal_images for select
  using (auth.role() = 'authenticated');

-- Only cafeteria admin and global admin can write
drop policy if exists "dining: cafeteria admin write cafeteria_info" on public.cafeteria_info;
create policy "dining: cafeteria admin write cafeteria_info"
  on public.cafeteria_info for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('admin', 'cafeteria_admin')
    )
  );

drop policy if exists "dining: cafeteria admin write dining_hours" on public.dining_hours;
create policy "dining: cafeteria admin write dining_hours"
  on public.dining_hours for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('admin', 'cafeteria_admin')
    )
  );

drop policy if exists "dining: cafeteria admin write menu_template" on public.menu_template;
create policy "dining: cafeteria admin write menu_template"
  on public.menu_template for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('admin', 'cafeteria_admin')
    )
  );

drop policy if exists "dining: cafeteria admin write daily_menu" on public.daily_menu;
create policy "dining: cafeteria admin write daily_menu"
  on public.daily_menu for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('admin', 'cafeteria_admin')
    )
  );

drop policy if exists "dining: cafeteria admin write meal_images" on public.meal_images;
create policy "dining: cafeteria admin write meal_images"
  on public.meal_images for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('admin', 'cafeteria_admin')
    )
  );

-- Seed initial default cafeteria info if none exists
insert into public.cafeteria_info (id, name, location, phone, email, announcement)
values (
  'd1111111-1111-1111-1111-111111111111',
  'HTU Union Cafeteria',
  'Student Union Building, 1st Floor',
  '512-505-3000',
  'dining@htu.edu',
  'Welcome to the new semester! Check out our weekly menus.'
)
on conflict do nothing;

-- Seed default dining hours
insert into public.dining_hours (day_type, meal_slot, open_time, close_time) values
  ('weekday', 'breakfast', '7:00 AM', '9:30 AM'),
  ('weekday', 'lunch', '11:30 AM', '1:30 PM'),
  ('weekday', 'dinner', '5:00 PM', '7:30 PM'),
  ('saturday', 'brunch', '10:30 AM', '1:00 PM'),
  ('saturday', 'dinner', '5:00 PM', '7:00 PM'),
  ('sunday', 'brunch', '10:30 AM', '1:00 PM'),
  ('sunday', 'dinner', '5:00 PM', '7:00 PM')
on conflict (day_type, meal_slot) do nothing;

-- Seed default cafeteria admin user profile
insert into public.students (id, email, full_name, role, is_active)
values (
  'c8888888-8888-8888-8888-888888888888',
  'cafeteria@htu.edu',
  'HTU Dining Manager',
  'cafeteria_admin',
  true
)
on conflict (email) do update 
set role = 'cafeteria_admin', is_active = true;

-- Seed default weekly menu template items for Monday (day_of_week = 0)
insert into public.menu_template (day_of_week, meal_slot, items) values
  (0, 'breakfast', '[
    {"name": "Scrambled Eggs", "description": "Farm-fresh organic eggs scrambled to perfection", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["egg"]},
    {"name": "Golden Hashbrowns", "description": "Crispy shredded potato cakes", "category": "Side", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []},
    {"name": "Hot Coffee", "description": "Freshly brewed dark roast house blend", "category": "Beverage", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []}
  ]'::jsonb),
  (0, 'lunch', '[
    {"name": "Grilled Lemon Chicken", "description": "Tender chicken breast marinated in herbs and fresh lemon juice", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": true, "allergens": []},
    {"name": "Steamed Broccoli", "description": "Lightly seasoned fresh broccoli florets", "category": "Side", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []},
    {"name": "Fruit Infused Iced Tea", "description": "Unsweetened iced tea with fresh peach essence", "category": "Beverage", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []}
  ]'::jsonb),
  (0, 'dinner', '[
    {"name": "Classic Beef Lasagna", "description": "Layered pasta sheets with rich ground beef marinara and ricotta cheese", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": false, "allergens": ["gluten", "dairy"]},
    {"name": "Toasted Garlic Bread", "description": "Italian bread spread with herb garlic butter", "category": "Side", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "dairy"]},
    {"name": "Creamy Chocolate Pudding", "description": "Rich dark chocolate dessert whipped with cream", "category": "Dessert", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["dairy"]}
  ]'::jsonb)
on conflict (day_of_week, meal_slot) do update 
set items = excluded.items;

-- Seed default menu template items for rest of weekdays (Tues-Fri, days 1-4)
insert into public.menu_template (day_of_week, meal_slot, items) values
  (1, 'breakfast', '[{"name": "Oatmeal Bowl", "description": "Warm rolled oats topped with honey", "category": "Entrée", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []}]'::jsonb),
  (1, 'lunch', '[{"name": "Turkey Wrap", "description": "Sliced turkey breast in wheat tortilla", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": true, "allergens": ["gluten"]}]'::jsonb),
  (1, 'dinner', '[{"name": "Spaghetti Marinara", "description": "Pasta tossed with house red sauce", "category": "Entrée", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": ["gluten"]}]'::jsonb),
  (2, 'breakfast', '[{"name": "Breakfast Tacos", "description": "Warm flour tortilla with eggs and cheese", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "dairy", "egg"]}]'::jsonb),
  (2, 'lunch', '[{"name": "Beef Burger", "description": "Grilled beef patty with lettuce and tomato", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": false, "allergens": ["gluten"]}]'::jsonb),
  (2, 'dinner', '[{"name": "Baked Salmon", "description": "Lemon herb crusted wild salmon", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": true, "allergens": ["fish"]}]'::jsonb),
  (3, 'breakfast', '[{"name": "Pancakes", "description": "Fluffy buttermilk pancakes with maple syrup", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "dairy"]}]'::jsonb),
  (3, 'lunch', '[{"name": "Caesar Salad", "description": "Crisp romaine lettuce with croutons and parmesan", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["dairy", "gluten"]}]'::jsonb),
  (3, 'dinner', '[{"name": "Chicken Alfredo", "description": "Fettuccine pasta in rich cream sauce", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "dairy"]}]'::jsonb),
  (4, 'breakfast', '[{"name": "French Toast", "description": "Thick-cut bread dipped in cinnamon egg batter", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "egg", "dairy"]}]'::jsonb),
  (4, 'lunch', '[{"name": "Fish & Chips", "description": "Crispy battered cod served with fries", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": false, "allergens": ["gluten", "fish"]}]'::jsonb),
  (4, 'dinner', '[{"name": "Cheese Pizza Slice", "description": "Hand-tossed crust with mozzarella cheese", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "dairy"]}]'::jsonb)
on conflict (day_of_week, meal_slot) do update 
set items = excluded.items;

-- Seed default weekly menu template items for Saturday (day_of_week = 5)
insert into public.menu_template (day_of_week, meal_slot, items) values
  (5, 'brunch', '[
    {"name": "Belgian Waffles", "description": "Fluffy waffles topped with powdered sugar and syrup", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten", "dairy"]},
    {"name": "Fresh Berry Medley", "description": "Bowl of fresh blueberries, strawberries, and blackberries", "category": "Side", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []},
    {"name": "Fresh Orange Juice", "description": "Cold-pressed sweet orange juice", "category": "Beverage", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []}
  ]'::jsonb),
  (5, 'dinner', '[
    {"name": "Slow-Smoked Pulled Pork", "description": "Hickory-smoked pork shoulder shredded with sweet BBQ sauce", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": false, "allergens": []},
    {"name": "Southern Baked Beans", "description": "Slow-cooked sweet brown sugar baked beans", "category": "Side", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []},
    {"name": "Warm Apple Pie", "description": "Spiced apple filling inside a flaky butter crust", "category": "Dessert", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["gluten"]}
  ]'::jsonb)
on conflict (day_of_week, meal_slot) do update 
set items = excluded.items;

-- Seed default weekly menu template items for Sunday (day_of_week = 6)
insert into public.menu_template (day_of_week, meal_slot, items) values
  (6, 'brunch', '[
    {"name": "Breakfast Egg Omelet", "description": "Omelet cooked with bell peppers, onions, and cheddar cheese", "category": "Entrée", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["egg", "dairy"]},
    {"name": "Crispy Tater Tots", "description": "Seasoned grated potato tots fried golden brown", "category": "Side", "is_vegetarian": true, "is_vegan": true, "is_halal": true, "allergens": []},
    {"name": "Hot Chocolate", "description": "Warm hot cocoa whipped with milk and marshmallow", "category": "Beverage", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["dairy"]}
  ]'::jsonb),
  (6, 'dinner', '[
    {"name": "Herb Roasted Beef Tenderloin", "description": "Slow-roasted beef tenderloin sliced thick with natural au jus", "category": "Entrée", "is_vegetarian": false, "is_vegan": false, "is_halal": true, "allergens": []},
    {"name": "Butter Mashed Potatoes", "description": "Creamy russet potatoes whipped with butter and milk", "category": "Side", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["dairy"]},
    {"name": "Strawberry Cheesecake Slice", "description": "New York style cheesecake topped with strawberry compote", "category": "Dessert", "is_vegetarian": true, "is_vegan": false, "is_halal": true, "allergens": ["dairy", "gluten"]}
  ]'::jsonb)
on conflict (day_of_week, meal_slot) do update 
set items = excluded.items;

