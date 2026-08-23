const fs = require('fs');
const path = require('path');

const tsvPath = path.join(__dirname, '../lib/supabase/students_data.tsv');
const sqlOutputPath = path.join(__dirname, '../lib/supabase/add_students.sql');

if (!fs.existsSync(tsvPath)) {
  console.error(`TSV file not found at ${tsvPath}`);
  process.exit(1);
}

const tsvContent = fs.readFileSync(tsvPath, 'utf8');
const lines = tsvContent.split('\n').map(l => l.trim()).filter(Boolean);

const seenEmails = new Set();
const students = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.split('\t');
  
  let studentId = '';
  let firstName = '';
  let lastName = '';
  let email = '';
  let session = '';
  let cohort = '';
  let appStatus = '';
  let building = '';
  let suite = '';
  let roomNumber = '';
  let bed = '';

  if (parts.length === 10) {
    // 10 columns format (First name & Last name combined with a comma)
    studentId = parts[0].trim();
    
    const namePart = parts[1].trim();
    if (namePart.includes(',')) {
      const nameParts = namePart.split(',');
      firstName = nameParts[0].trim();
      lastName = nameParts[1].trim();
    } else {
      firstName = namePart;
      lastName = '';
    }
    
    email = parts[2].trim().toLowerCase();
    session = parts[3].trim();
    cohort = parts[4].trim();
    appStatus = parts[5] ? parts[5].trim() : 'Accepted Offer';
    building = parts[6].trim();
    suite = parts[7] ? parts[7].trim() : '';
    roomNumber = parts[8] ? parts[8].trim() : '';
    bed = parts[9] ? parts[9].trim() : '';
  } else if (parts.length === 11) {
    // 11 columns format
    studentId = parts[0].trim();
    firstName = parts[1].trim();
    lastName = parts[2].trim();
    email = parts[3].trim().toLowerCase();
    session = parts[4].trim();
    cohort = parts[5].trim();
    appStatus = parts[6] ? parts[6].trim() : 'Accepted Offer';
    building = parts[7].trim();
    suite = parts[8] ? parts[8].trim() : '';
    roomNumber = parts[9] ? parts[9].trim() : '';
    bed = parts[10] ? parts[10].trim() : '';
  } else {
    console.warn(`Warning: Line ${i} has unexpected column count (${parts.length}): "${line}"`);
    continue;
  }

  // Deduplicate by email
  if (seenEmails.has(email)) {
    console.log(`Note: Duplicate student email ignored: ${email}`);
    continue;
  }
  seenEmails.add(email);

  // Normalize mapping rules
  const isSuite = building.toLowerCase().includes('suite');
  
  let finalSuite = null;
  let finalRoom = null;

  if (isSuite) {
    finalSuite = suite || null;
    finalRoom = roomNumber || null;
  } else {
    finalSuite = null;
    finalRoom = roomNumber || null;
  }

  students.push({
    studentId,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    session,
    cohort,
    appStatus,
    building,
    suite: finalSuite,
    room: finalRoom,
    roomNumber: finalRoom,
    bed: bed || null
  });
}

// Generate SQL
let sql = `-- Migration: Add student details columns and populate student records
-- Run this in the Supabase SQL Editor

-- 1. Add columns to public.students table if they don't exist
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS session text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS cohort text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS application_status text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS building text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS suite text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS room text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS bed text;

-- 2. Insert or update the student records from the CSV/TSV file
`;

const valueRows = students.map(s => {
  const escapeStr = (val) => {
    if (val === null || val === undefined || val === '') return 'NULL';
    // Escape single quotes
    return `'${val.replace(/'/g, "''")}'`;
  };

  return `(${escapeStr(s.email)}, ${escapeStr(s.fullName)}, 'student', true, ${escapeStr(s.studentId)}, ${escapeStr(s.firstName)}, ${escapeStr(s.lastName)}, ${escapeStr(s.session)}, ${escapeStr(s.cohort)}, ${escapeStr(s.appStatus)}, ${escapeStr(s.building)}, ${escapeStr(s.suite)}, ${escapeStr(s.room)}, ${escapeStr(s.bed)}, ${escapeStr(s.building)}, ${escapeStr(s.roomNumber)})`;
});

sql += `INSERT INTO public.students (
  email, 
  full_name, 
  role, 
  is_active, 
  student_id, 
  first_name, 
  last_name, 
  session, 
  cohort, 
  application_status, 
  building, 
  suite, 
  room, 
  bed,
  hall_name,
  room_number
)
VALUES
  ${valueRows.join(',\n  ')}
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  student_id = EXCLUDED.student_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  session = EXCLUDED.session,
  cohort = EXCLUDED.cohort,
  application_status = EXCLUDED.application_status,
  building = EXCLUDED.building,
  suite = EXCLUDED.suite,
  room = EXCLUDED.room,
  bed = EXCLUDED.bed,
  hall_name = EXCLUDED.hall_name,
  room_number = EXCLUDED.room_number;
`;

fs.writeFileSync(sqlOutputPath, sql, 'utf8');
console.log(`Successfully generated ${students.length} unique student inserts in ${sqlOutputPath}`);
