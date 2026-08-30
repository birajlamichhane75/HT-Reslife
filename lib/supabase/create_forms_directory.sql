-- Create forms_directory table
CREATE TABLE IF NOT EXISTS public.forms_directory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  url text,
  is_erezlife boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.forms_directory ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read forms/links
DROP POLICY IF EXISTS "forms_directory: authenticated read" ON public.forms_directory;
CREATE POLICY "forms_directory: authenticated read"
  ON public.forms_directory FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Administrators can manage all forms/links
DROP POLICY IF EXISTS "forms_directory: admin write" ON public.forms_directory;
CREATE POLICY "forms_directory: admin write"
  ON public.forms_directory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed Initial Default Data
TRUNCATE public.forms_directory RESTART IDENTITY CASCADE;

INSERT INTO public.forms_directory (title, description, url, is_erezlife, sort_order) VALUES
  -- eRezLife Links (is_erezlife = true)
  ('Room Assessments (RCR)', 'Complete your room condition report at move-in and check room inspection updates.', 'https://htu.erezlife.com/', true, 0),
  ('Guest Check-In Form', 'Register overnight visitors and check status of approved guest passes.', 'https://htu.erezlife.com/', true, 1),
  ('Forms & Requests', 'Fill out housing applications, roommate agreements, and move-in preference sheets.', 'https://htu.erezlife.com/', true, 2),
  ('Duty Processes & Logs', 'Submit duty logs, incident reports, and round logs (Authorized Staff only).', 'https://htu.erezlife.com/', true, 3),

  -- Housing Forms (is_erezlife = false)
  ('Room Change Request Form', 'Request a room change or swap for the current academic semester.', 'https://htu.edu', false, 0),
  ('Key Replacement Agreement', 'Acknowledge terms and fees for replacement of residence hall keys.', 'https://htu.edu', false, 1),
  ('Liability & Property Damage Waiver', 'Standard release of liability and student property responsibility disclaimer.', 'https://htu.edu', false, 2),
  ('Meal Plan Adjustment Request', 'Submit changes to your default student union meal plan tier.', 'https://htu.edu', false, 3);
