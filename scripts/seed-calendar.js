const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const calendarEntries = [
  // FALL 2026
  { title: 'Residence Halls Open – New International Students (Move-in)', description: 'New international students move-in starts.', start_date: '2026-08-13', end_date: null, category: 'housing' },
  { title: 'Residence Halls Open – New & Transfer Students (Move-in)', description: 'New and transfer students housing check-in begins.', start_date: '2026-08-16', end_date: null, category: 'housing' },
  { title: 'Advising & Registration – New & Transfer Students', description: 'Advising and registration support session.', start_date: '2026-08-16', end_date: null, category: 'registration' },
  { title: 'Orientation for All New Students (New & Transfer Students)', description: 'Student orientation week.', start_date: '2026-08-16', end_date: '2026-08-23', category: 'academic' },
  { title: 'Faculty Return', description: 'Faculty return to university.', start_date: '2026-08-17', end_date: null, category: 'academic' },
  { title: 'University Institute & Faculty Meetings', description: 'University Institute (8:00 a.m. to 2:30 p.m.) & Faculty Meetings (3:00 p.m. to 5:30 p.m.)', start_date: '2026-08-18', end_date: null, category: 'academic' },
  { title: 'Residence Halls Open – Registered Continuing Students', description: 'Continuing students check-in begins.', start_date: '2026-08-21', end_date: null, category: 'housing' },
  { title: 'Matriculation (Freshmen Pinning) Ceremony', description: 'Official welcoming pinning ceremony.', start_date: '2026-08-23', end_date: null, category: 'academic' },
  { title: 'Classes Begin – Schedule Changes Allowed', description: 'Fall classes officially begin.', start_date: '2026-08-24', end_date: null, category: 'academic' },
  { title: 'Last Day for Adding or Dropping Classes', description: 'Last day to change class schedules. Also last day to financially clear or course schedule dropped.', start_date: '2026-08-28', end_date: null, category: 'deadline' },
  { title: 'Labor Day Holiday – University Closed', description: 'No classes. University closed.', start_date: '2026-09-07', end_date: null, category: 'holiday' },
  { title: 'Official Twelfth Class Day', description: 'Twelfth day of classes.', start_date: '2026-09-09', end_date: null, category: 'academic' },
  { title: 'President’s Opening Convocation', description: 'Opening convocation ceremony.', start_date: '2026-09-10', end_date: null, category: 'academic' },
  { title: 'Final Day to Withdraw from University with Tuition Adjustment', description: 'Last day for university withdrawal tuition adjust.', start_date: '2026-09-18', end_date: null, category: 'deadline' },
  { title: 'Final Date for Filing for Spring 2027 Graduation', description: 'Deadline to apply for Spring graduation.', start_date: '2026-09-22', end_date: null, category: 'deadline' },
  { title: 'Midterm Examinations Administered', description: 'Midterm examination week.', start_date: '2026-10-05', end_date: '2026-10-08', category: 'academic' },
  { title: 'Fall Break', description: 'No classes. Break begins.', start_date: '2026-10-09', end_date: null, category: 'holiday' },
  { title: 'Classes Resume', description: 'Classes resume after fall break.', start_date: '2026-10-12', end_date: null, category: 'academic' },
  { title: 'Midterm Grades Entered', description: 'Midterm grades submitted.', start_date: '2026-10-13', end_date: null, category: 'academic' },
  { title: 'Final Day to Withdraw from Class with "W"', description: 'Last day to withdraw from a class with a W grade.', start_date: '2026-10-16', end_date: null, category: 'deadline' },
  { title: 'Academic Advising Begins', description: 'Course advising for upcoming term starts.', start_date: '2026-10-19', end_date: null, category: 'registration' },
  { title: 'Charter Day Observance', description: 'University Charter Day celebrations.', start_date: '2026-10-23', end_date: null, category: 'academic' },
  { title: 'Regular Registration for Spring 2027 Starts', description: 'Registration starts.', start_date: '2026-10-26', end_date: null, category: 'registration' },
  { title: 'Final Day to Withdraw from University', description: 'Last day to withdraw from the university.', start_date: '2026-11-13', end_date: null, category: 'deadline' },
  { title: 'Regular Registration for Spring 2027 Ends', description: 'End of regular registration period.', start_date: '2026-11-20', end_date: null, category: 'registration' },
  { title: 'Late Registration Begins ($100 Late Fee)', description: 'Late registration period starts.', start_date: '2026-11-23', end_date: null, category: 'registration' },
  { title: 'Thanksgiving Holiday Break', description: 'No classes. University closed.', start_date: '2026-11-25', end_date: '2026-11-27', category: 'holiday' },
  { title: 'Classes Resume', description: 'Classes resume after Thanksgiving.', start_date: '2026-11-30', end_date: null, category: 'academic' },
  { title: 'Last Class Day', description: 'Final day of Fall lectures.', start_date: '2026-12-07', end_date: null, category: 'academic' },
  { title: 'Final Examinations', description: 'End of term exams.', start_date: '2026-12-08', end_date: '2026-12-11', category: 'academic' },
  { title: 'Residence Halls Close', description: 'All halls close at 12:00 PM for winter break.', start_date: '2026-12-12', end_date: null, category: 'housing' },
  { title: 'Final Grades Entered in Ram Connect', description: 'Grades submitted.', start_date: '2026-12-14', end_date: null, category: 'academic' },
  { title: 'Assessment Week', description: 'Institutional assessment reviews.', start_date: '2026-12-15', end_date: '2026-12-18', category: 'academic' },

  // SPRING 2027
  { title: 'Staff Return', description: 'University staff return.', start_date: '2027-01-04', end_date: null, category: 'academic' },
  { title: 'Faculty Return', description: 'University faculty return.', start_date: '2027-01-06', end_date: null, category: 'academic' },
  { title: 'Faculty Institute', description: 'Faculty planning sessions (8:00 a.m. to 2:30 p.m.)', start_date: '2027-01-11', end_date: null, category: 'academic' },
  { title: 'Residence Halls Open', description: 'Housing opens for Spring semester.', start_date: '2027-01-14', end_date: null, category: 'housing' },
  { title: 'Orientation – All New and Transfer Students', description: 'Spring orientation sessions.', start_date: '2027-01-14', end_date: '2027-01-15', category: 'academic' },
  { title: 'Martin Luther King Jr. Holiday – University Closed', description: 'No classes. University closed.', start_date: '2027-01-18', end_date: null, category: 'holiday' },
  { title: 'Classes Begin – Schedule Changes Allowed', description: 'Spring classes officially begin.', start_date: '2027-01-19', end_date: null, category: 'academic' },
  { title: 'Last Day for Adding or Dropping Classes', description: 'Last day to adjust schedules. Also last day to financially clear or course schedule dropped.', start_date: '2027-01-25', end_date: null, category: 'deadline' },
  { title: 'Official Twelfth Class Day', description: 'Census date.', start_date: '2027-02-03', end_date: null, category: 'academic' },
  { title: 'Final Day to Withdraw from University with Tuition Adjustment', description: 'Last day to withdraw with tuition credit.', start_date: '2027-02-12', end_date: null, category: 'deadline' },
  { title: 'Filing Deadline for July & Dec 2027 Graduation', description: 'Graduation application deadline.', start_date: '2027-02-16', end_date: null, category: 'deadline' },
  { title: 'Midterm Examinations', description: 'Spring midterms week.', start_date: '2027-03-02', end_date: '2027-03-05', category: 'academic' },
  { title: 'Midterm Grades Entered in Ram Connect', description: 'Grades submitted.', start_date: '2027-03-08', end_date: null, category: 'academic' },
  { title: 'AI Con', description: 'Special campus artificial intelligence conference.', start_date: '2027-03-10', end_date: '2027-03-11', category: 'academic' },
  { title: 'Spring Break', description: 'No classes. Spring holiday.', start_date: '2027-03-15', end_date: '2027-03-20', category: 'holiday' },
  { title: 'Good Friday – University Closed', description: 'No classes. University holiday.', start_date: '2027-03-26', end_date: null, category: 'holiday' },
  { title: 'Classes Resume', description: 'Classes resume after Spring Break.', start_date: '2027-03-29', end_date: null, category: 'academic' },
  { title: 'Academic Advising Begins', description: 'Advising opens for next term.', start_date: '2027-03-29', end_date: null, category: 'registration' },
  { title: 'Regular Registration for Summer & Fall 2027 Begins', description: 'Registration opens.', start_date: '2027-04-05', end_date: null, category: 'registration' },
  { title: 'Final Day to Withdraw from Class with "W" grade', description: 'Last day to withdraw with a W grade.', start_date: '2027-04-05', end_date: null, category: 'deadline' },
  { title: 'Final Day to Withdraw from University', description: 'Last day to withdraw from Spring term.', start_date: '2027-04-16', end_date: null, category: 'deadline' },
  { title: 'Regular Registration for Fall 2027 Ends', description: 'End of regular registration period.', start_date: '2027-04-30', end_date: null, category: 'registration' },
  { title: 'Late Registration for Fall 2027 Begins ($100 Late Fee)', description: 'Late registration period starts.', start_date: '2027-05-03', end_date: null, category: 'registration' },
  { title: 'Senior Final Exams', description: 'Final examinations for graduating seniors.', start_date: '2027-05-05', end_date: '2027-05-07', category: 'academic' },
  { title: 'Last Class Day', description: 'Final day of Spring lectures.', start_date: '2027-05-07', end_date: null, category: 'academic' },
  { title: 'Senior Grades Due', description: 'Grades submitted for seniors.', start_date: '2027-05-10', end_date: null, category: 'academic' },
  { title: 'Final Examinations', description: 'Spring final exams week.', start_date: '2027-05-10', end_date: '2027-05-13', category: 'academic' },
  { title: 'Honors Convocation', description: 'Awards and recognition ceremony.', start_date: '2027-05-14', end_date: null, category: 'academic' },
  { title: 'Commencement', description: 'Official graduation ceremony.', start_date: '2027-05-15', end_date: null, category: 'academic' },
  { title: 'Residence Halls Close', description: 'All halls close at 12:00 PM for Summer break.', start_date: '2027-05-16', end_date: null, category: 'housing' },
  { title: 'Final Grades Entered', description: 'Term grades submitted.', start_date: '2027-05-17', end_date: null, category: 'academic' },
  { title: 'Assessment Week', description: 'Institutional assessment reviews.', start_date: '2027-05-18', end_date: '2027-05-21', category: 'academic' },

  // SUMMER 2027
  { title: 'Summer Registration', description: 'Registration for summer courses.', start_date: '2027-06-07', end_date: null, category: 'registration' },
  { title: 'Classes Begin – Schedule Changes Allowed (Summer)', description: 'Summer sessions begin.', start_date: '2027-06-07', end_date: null, category: 'academic' },
  { title: 'Last Day to Add/Drop & Census Date', description: 'Deadline to register/drop and census registration.', start_date: '2027-06-11', end_date: null, category: 'deadline' },
  { title: 'Final Day to Withdraw from Class (Summer)', description: 'Withdrawal deadline.', start_date: '2027-06-16', end_date: null, category: 'deadline' },
  { title: 'New Student Registration I', description: 'Admissions check-in and advising.', start_date: '2027-06-17', end_date: '2027-06-18', category: 'registration' },
  { title: 'Emancipation Day Holiday – University Closed', description: 'No classes. Juneteenth holiday.', start_date: '2027-06-18', end_date: null, category: 'holiday' },
  { title: 'Summer Bridge Program – Ram Training Camp', description: 'Special summer camp program.', start_date: '2027-06-20', end_date: '2027-08-01', category: 'academic' },
  { title: 'Final Day to Withdraw from University with Tuition Adjustment (Summer)', description: 'Withdrawal tuition adjustment deadline.', start_date: '2027-06-25', end_date: null, category: 'deadline' },
  { title: 'Independence Day Holiday (Observed) – University Closed', description: 'No classes. Holiday closed.', start_date: '2027-07-05', end_date: null, category: 'holiday' },
  { title: 'Classes Resume (Summer)', description: 'Summer lectures resume.', start_date: '2027-07-06', end_date: null, category: 'academic' },
  { title: 'New Student Registration II', description: 'Admissions registration block 2.', start_date: '2027-07-08', end_date: '2027-07-09', category: 'registration' },
  { title: 'Last Class Day (Summer)', description: 'Final day of summer courses.', start_date: '2027-07-12', end_date: null, category: 'academic' },
  { title: 'Final Exams (Summer)', description: 'Summer final examinations.', start_date: '2027-07-13', end_date: '2027-07-14', category: 'academic' },
  { title: 'Final Grades Entered in Ram Connect (Summer)', description: 'Grades submitted.', start_date: '2027-07-15', end_date: null, category: 'academic' },
  { title: 'New Student Registration III & IV', description: 'Admissions registration blocks 3 and 4.', start_date: '2027-07-15', end_date: null, category: 'registration' }
];

async function seedCalendar() {
  console.log('Clearing existing academic calendar entries...');
  
  // Try to delete all entries
  const { error: deleteError } = await supabase
    .from('academic_calendar')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all

  if (deleteError) {
    console.error('Error clearing academic calendar table:', deleteError.message);
    console.log('Make sure the table academic_calendar exists and you have run the schema migration.');
    process.exit(1);
  }

  console.log(`Inserting ${calendarEntries.length} calendar entries...`);
  
  const { error: insertError } = await supabase
    .from('academic_calendar')
    .insert(calendarEntries);

  if (insertError) {
    console.error('Error seeding calendar entries:', insertError.message);
  } else {
    console.log('Successfully seeded HTU Academic Calendar (Fall 2026 - Summer 2027)!');
  }
}

seedCalendar();
