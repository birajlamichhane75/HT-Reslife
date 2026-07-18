-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Students (all app users — both students and admins)
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  room_number text,
  hall_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  is_active boolean not null default true,
  push_subscription jsonb,
  created_at timestamptz default now()
);

-- Announcements
create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  priority text not null default 'info' check (priority in ('info', 'urgent', 'event')),
  created_by uuid references public.students(id),
  created_at timestamptz default now()
);

-- Maintenance tickets
create table public.maintenance_tickets (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) not null,
  room_number text not null,
  issue_type text not null,
  priority text not null check (priority in ('routine', 'urgent', 'emergency')),
  description text not null,
  allow_entry boolean default false,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  staff_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  location text,
  event_date timestamptz not null,
  tag text not null default 'social' check (tag in ('social', 'mandatory', 'academic', 'deadline', 'housing')),
  description text,
  created_by uuid references public.students(id),
  created_at timestamptz default now()
);

-- Staff directory
create table public.staff_directory (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  role text not null,
  hall text,
  phone text,
  email text,
  avatar_initials text,
  sort_order integer default 0
);

-- FAQs
create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  sort_order integer default 0
);

-- Move-in checklist items (global template — admin defines these)
create table public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  sort_order integer default 0
);

-- Per-student checklist progress
create table public.checklist_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) not null,
  item_id uuid references public.checklist_items(id) not null,
  completed boolean default false,
  unique(student_id, item_id)
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────

alter table public.students enable row level security;
alter table public.announcements enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.events enable row level security;
alter table public.staff_directory enable row level security;
alter table public.faqs enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checklist_progress enable row level security;

-- Students: can only read their own row
create policy "students: read own row"
  on public.students for select
  using (auth.uid() = id);

-- Students: cannot update their own role (service_role only)
create policy "students: update own non-role fields"
  on public.students for update
  using (auth.uid() = id)
  with check (role = (select role from public.students where id = auth.uid()));

-- Announcements: all authenticated users can read
create policy "announcements: authenticated read"
  on public.announcements for select
  using (auth.role() = 'authenticated');

-- Announcements: only admins can insert/update/delete
create policy "announcements: admin write"
  on public.announcements for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role = 'admin'
    )
  );

-- Maintenance: students can insert their own tickets
create policy "maintenance: student insert own"
  on public.maintenance_tickets for insert
  with check (student_id = auth.uid());

-- Maintenance: students can read only their own tickets
create policy "maintenance: student read own"
  on public.maintenance_tickets for select
  using (student_id = auth.uid());

-- Maintenance: admins can read and update all tickets
create policy "maintenance: admin all"
  on public.maintenance_tickets for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role = 'admin'
    )
  );

-- Events: all authenticated users can read
create policy "events: authenticated read"
  on public.events for select
  using (auth.role() = 'authenticated');

-- Events: only admins can write
create policy "events: admin write"
  on public.events for all
  using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role = 'admin'
    )
  );

-- Staff + FAQ + Checklist items: public read, admin write
create policy "staff: authenticated read" on public.staff_directory for select using (auth.role() = 'authenticated');
create policy "staff: admin write" on public.staff_directory for all using (exists (select 1 from public.students where id = auth.uid() and role = 'admin'));
create policy "faq: authenticated read" on public.faqs for select using (auth.role() = 'authenticated');
create policy "faq: admin write" on public.faqs for all using (exists (select 1 from public.students where id = auth.uid() and role = 'admin'));
create policy "checklist_items: authenticated read" on public.checklist_items for select using (auth.role() = 'authenticated');
create policy "checklist_items: admin write" on public.checklist_items for all using (exists (select 1 from public.students where id = auth.uid() and role = 'admin'));

-- Checklist progress: students manage their own
create policy "checklist_progress: own"
  on public.checklist_progress for all
  using (student_id = auth.uid());
