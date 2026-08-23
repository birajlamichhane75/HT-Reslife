-- 1. Add is_ra column to public.students table if it doesn't exist
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_ra boolean DEFAULT false;

-- 2. Enable select policy for authenticated users to view Resident Assistants (RAs)
DROP POLICY IF EXISTS "students: read RAs" ON public.students;
CREATE POLICY "students: read RAs"
  ON public.students FOR SELECT
  USING (
    auth.role() = 'authenticated' AND is_ra = true
  );
