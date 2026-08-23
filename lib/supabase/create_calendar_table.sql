-- 1. Create academic_calendar table
CREATE TABLE IF NOT EXISTS public.academic_calendar (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  category text NOT NULL DEFAULT 'academic' CHECK (category IN ('academic', 'holiday', 'deadline', 'housing', 'registration')),
  created_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Authenticated users can read calendar entries
DROP POLICY IF EXISTS "calendar: authenticated read" ON public.academic_calendar;
CREATE POLICY "calendar: authenticated read"
  ON public.academic_calendar FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Policy: Administrators can manage all calendar entries
DROP POLICY IF EXISTS "calendar: admin write" ON public.academic_calendar;
CREATE POLICY "calendar: admin write"
  ON public.academic_calendar FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Seed official Huston-Tillotson University Academic Calendar (Fall 2026 - Summer 2027)
TRUNCATE public.academic_calendar RESTART IDENTITY CASCADE;

INSERT INTO public.academic_calendar (title, description, start_date, end_date, category) VALUES
  -- FALL 2026
  ('Residence Halls Open – New International Students (Move-in)', 'New international students move-in starts.', '2026-08-13', NULL, 'housing'),
  ('Residence Halls Open – New & Transfer Students (Move-in)', 'New and transfer students housing check-in begins.', '2026-08-16', NULL, 'housing'),
  ('Advising & Registration – New & Transfer Students', 'Advising and registration support session.', '2026-08-16', NULL, 'registration'),
  ('Orientation for All New Students (New & Transfer Students)', 'Student orientation week.', '2026-08-16', '2026-08-23', 'academic'),
  ('Faculty Return', 'Faculty return to university.', '2026-08-17', NULL, 'academic'),
  ('University Institute & Faculty Meetings', 'University Institute (8:00 a.m. to 2:30 p.m.) & Faculty Meetings (3:00 p.m. to 5:30 p.m.)', '2026-08-18', NULL, 'academic'),
  ('Residence Halls Open – Registered Continuing Students', 'Continuing students check-in begins.', '2026-08-21', NULL, 'housing'),
  ('Matriculation (Freshmen Pinning) Ceremony', 'Official welcoming pinning ceremony.', '2026-08-23', NULL, 'academic'),
  ('Classes Begin – Schedule Changes Allowed', 'Fall classes officially begin.', '2026-08-24', NULL, 'academic'),
  ('Last Day for Adding or Dropping Classes', 'Last day to change class schedules. Also last day to financially clear or course schedule dropped.', '2026-08-28', NULL, 'deadline'),
  ('Labor Day Holiday – University Closed', 'No classes. University closed.', '2026-09-07', NULL, 'holiday'),
  ('Official Twelfth Class Day', 'Twelfth day of classes.', '2026-09-09', NULL, 'academic'),
  ('President’s Opening Convocation', 'Opening convocation ceremony.', '2026-09-10', NULL, 'academic'),
  ('Final Day to Withdraw from University with Tuition Adjustment', 'Last day for university withdrawal tuition adjust.', '2026-09-18', NULL, 'deadline'),
  ('Final Date for Filing for Spring 2027 Graduation', 'Deadline to apply for Spring graduation.', '2026-09-22', NULL, 'deadline'),
  ('Midterm Examinations Administered', 'Midterm examination week.', '2026-10-05', '2026-10-08', 'academic'),
  ('Fall Break', 'No classes. Break begins.', '2026-10-09', NULL, 'holiday'),
  ('Classes Resume', 'Classes resume after fall break.', '2026-10-12', NULL, 'academic'),
  ('Midterm Grades Entered', 'Midterm grades submitted.', '2026-10-13', NULL, 'academic'),
  ('Final Day to Withdraw from Class with "W"', 'Last day to withdraw from a class with a W grade.', '2026-10-16', NULL, 'deadline'),
  ('Academic Advising Begins', 'Course advising for upcoming term starts.', '2026-10-19', NULL, 'registration'),
  ('Charter Day Observance', 'University Charter Day celebrations.', '2026-10-23', NULL, 'academic'),
  ('Regular Registration for Spring 2027 Starts', 'Registration starts.', '2026-10-26', NULL, 'registration'),
  ('Final Day to Withdraw from University', 'Last day to withdraw from the university.', '2026-11-13', NULL, 'deadline'),
  ('Regular Registration for Spring 2027 Ends', 'End of regular registration period.', '2026-11-20', NULL, 'registration'),
  ('Late Registration Begins ($100 Late Fee)', 'Late registration period starts.', '2026-11-23', NULL, 'registration'),
  ('Thanksgiving Holiday Break', 'No classes. University closed.', '2026-11-25', '2026-11-27', 'holiday'),
  ('Classes Resume', 'Classes resume after Thanksgiving.', '2026-11-30', NULL, 'academic'),
  ('Last Class Day', 'Final day of Fall lectures.', '2026-12-07', NULL, 'academic'),
  ('Final Examinations', 'End of term exams.', '2026-12-08', '2026-12-11', 'academic'),
  ('Residence Halls Close', 'All halls close at 12:00 PM for winter break.', '2026-12-12', NULL, 'housing'),
  ('Final Grades Entered in Ram Connect', 'Grades submitted.', '2026-12-14', NULL, 'academic'),
  ('Assessment Week', 'Institutional assessment reviews.', '2026-12-15', '2026-12-18', 'academic'),

  -- SPRING 2027
  ('Staff Return', 'University staff return.', '2027-01-04', NULL, 'academic'),
  ('Faculty Return', 'University faculty return.', '2027-01-06', NULL, 'academic'),
  ('Faculty Institute', 'Faculty planning sessions (8:00 a.m. to 2:30 p.m.)', '2027-01-11', NULL, 'academic'),
  ('Residence Halls Open', 'Housing opens for Spring semester.', '2027-01-14', NULL, 'housing'),
  ('Orientation – All New and Transfer Students', 'Spring orientation sessions.', '2027-01-14', '2027-01-15', 'academic'),
  ('Martin Luther King Jr. Holiday – University Closed', 'No classes. University closed.', '2027-01-18', NULL, 'holiday'),
  ('Classes Begin – Schedule Changes Allowed', 'Spring classes officially begin.', '2027-01-19', NULL, 'academic'),
  ('Last Day for Adding or Dropping Classes', 'Last day to adjust schedules. Also last day to financially clear or course schedule dropped.', '2027-01-25', NULL, 'deadline'),
  ('Official Twelfth Class Day', 'Census date.', '2027-02-03', NULL, 'academic'),
  ('Final Day to Withdraw from University with Tuition Adjustment', 'Last day to withdraw with tuition credit.', '2027-02-12', NULL, 'deadline'),
  ('Filing Deadline for July & Dec 2027 Graduation', 'Graduation application deadline.', '2027-02-16', NULL, 'deadline'),
  ('Midterm Examinations', 'Spring midterms week.', '2027-03-02', '2027-03-05', 'academic'),
  ('Midterm Grades Entered in Ram Connect', 'Grades submitted.', '2027-03-08', NULL, 'academic'),
  ('AI Con', 'Special campus artificial intelligence conference.', '2027-03-10', '2027-03-11', 'academic'),
  ('Spring Break', 'No classes. Spring holiday.', '2027-03-15', '2027-03-20', 'holiday'),
  ('Good Friday – University Closed', 'No classes. University holiday.', '2027-03-26', NULL, 'holiday'),
  ('Classes Resume', 'Classes resume after Spring Break.', '2027-03-29', NULL, 'academic'),
  ('Academic Advising Begins', 'Advising opens for next term.', '2027-03-29', NULL, 'registration'),
  ('Regular Registration for Summer & Fall 2027 Begins', 'Registration opens.', '2027-04-05', NULL, 'registration'),
  ('Final Day to Withdraw from Class with "W" grade', 'Last day to withdraw with a W grade.', '2027-04-05', NULL, 'deadline'),
  ('Final Day to Withdraw from University', 'Last day to withdraw from Spring term.', '2027-04-16', NULL, 'deadline'),
  ('Regular Registration for Fall 2027 Ends', 'End of regular registration period.', '2027-04-30', NULL, 'registration'),
  ('Late Registration for Fall 2027 Begins ($100 Late Fee)', 'Late registration period starts.', '2027-05-03', NULL, 'registration'),
  ('Senior Final Exams', 'Final examinations for graduating seniors.', '2027-05-05', '2027-05-07', 'academic'),
  ('Last Class Day', 'Final day of Spring lectures.', '2027-05-07', NULL, 'academic'),
  ('Senior Grades Due', 'Grades submitted for seniors.', '2027-05-10', NULL, 'academic'),
  ('Final Examinations', 'Spring final exams week.', '2027-05-10', '2027-05-13', 'academic'),
  ('Honors Convocation', 'Awards and recognition ceremony.', '2027-05-14', NULL, 'academic'),
  ('Commencement', 'Official graduation ceremony.', '2027-05-15', NULL, 'academic'),
  ('Residence Halls Close', 'All halls close at 12:00 PM for Summer break.', '2027-05-16', NULL, 'housing'),
  ('Final Grades Entered', 'Term grades submitted.', '2027-05-17', NULL, 'academic'),
  ('Assessment Week', 'Institutional assessment reviews.', '2027-05-18', '2027-05-21', 'academic'),

  -- SUMMER 2027
  ('Summer Registration', 'Registration for summer courses.', '2027-06-07', NULL, 'registration'),
  ('Classes Begin – Schedule Changes Allowed (Summer)', 'Summer sessions begin.', '2027-06-07', NULL, 'academic'),
  ('Last Day to Add/Drop & Census Date', 'Deadline to register/drop and census registration.', '2027-06-11', NULL, 'deadline'),
  ('Final Day to Withdraw from Class (Summer)', 'Withdrawal deadline.', '2027-06-16', NULL, 'deadline'),
  ('New Student Registration I', 'Admissions check-in and advising.', '2027-06-17', '2027-06-18', 'registration'),
  ('Emancipation Day Holiday – University Closed', 'No classes. Juneteenth holiday.', '2027-06-18', NULL, 'holiday'),
  ('Summer Bridge Program – Ram Training Camp', 'Special summer camp program.', '2027-06-20', '2027-08-01', 'academic'),
  ('Final Day to Withdraw from University with Tuition Adjustment (Summer)', 'Withdrawal tuition adjustment deadline.', '2027-06-25', NULL, 'deadline'),
  ('Independence Day Holiday (Observed) – University Closed', 'No classes. Holiday closed.', '2027-07-05', NULL, 'holiday'),
  ('Classes Resume (Summer)', 'Summer lectures resume.', '2027-07-06', NULL, 'academic'),
  ('New Student Registration II', 'Admissions registration block 2.', '2027-07-08', '2027-07-09', 'registration'),
  ('Last Class Day (Summer)', 'Final day of summer courses.', '2027-07-12', NULL, 'academic'),
  ('Final Exams (Summer)', 'Summer final examinations.', '2027-07-13', '2027-07-14', 'academic'),
  ('Final Grades Entered in Ram Connect (Summer)', 'Grades submitted.', '2027-07-15', NULL, 'academic'),
  ('New Student Registration III & IV', 'Admissions registration blocks 3 and 4.', '2027-07-15', NULL, 'registration')
ON CONFLICT DO NOTHING;
