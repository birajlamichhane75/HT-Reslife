# Huston-Tillotson Housing Portal (HT Housing)
## Technical & Project Documentation

Welcome to the comprehensive documentation of the **HT Housing** portal. This guide details the application's history, architecture, database design, features, and the checklist needed for a production launch.

---

## 1. Project Evolution & History

The project evolved from an empty repository into a secure, responsive, and university-branded web application:

1. **Database Schema & Abstraction Layer**:
   - Designed a database schema in Supabase utilizing Row Level Security (RLS) policies.
   - Created tables for `students`, `announcements`, `maintenance_tickets`, `events`, `staff_directory`, `faqs`, and `checklist_progress`.
   
2. **Authentication Core**:
   - Implemented standard passwordless magic link auth via Supabase Auth.
   - Created a developer-mode bypass login allowing quick login for registered `@htu.edu` emails.
   
3. **Student Portal Features**:
   - **Dashboard**: High-level view showing student details, checklists, alerts, and recent announcements.
   - **Maintenance Requests**: Simple form allowing students to request repairs and track ticket progress. Added staff comment notifications.
   - **Checklist**: Structured list for students to complete tasks (e.g. forms, finance, key pickup) before moving in.
   - **Campus Map**: Interactive maps highlighting the residence halls.
   - **Staff Directory**: Fast search-by-name/hall interface for RA and coordinator contacts.

4. **University Branding & Customization**:
   - Applied Huston-Tillotson University's official brand guidelines.
   - Configured official palette: Maroon (`#660100`), Gold (`#FFCC00`), Sand background (`#FFFAEB`), and Terra text (`#291C14`).
   - Integrated logo assets: Interlocking HT logo (`logo-ht.png`) and RAM mascot (`logo-mascot.png`).

5. **Responsive Redesign**:
   - Tailored the layout to fit different viewports.
   - Retained the narrow mobile frame for screens under `768px` (mobile).
   - Expanded into a desktop sidebar layout (`StudentSidebar`) with grid containers for tablets and laptops.

6. **Key Bug Fixes**:
   - **Authentication Reset**: Fixed the `Invalid login credentials` error in dev login by querying pre-existing Auth users and updating their password to the temporary dev token via the admin API on the fly.
   - **Middleware Asset Serving**: Prevented Next.js middleware from redirecting public files with extensions (like `.png` logos) to the login screen, resolving broken images.

---

## 2. Technology Stack

- **Framework**: Next.js 14 (App Router, React Server & Client Components)
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS configurations
- **Backend & Auth**: Supabase (Database, Auth, Row Level Security)
- **Email Service**: Resend API
- **Push Notifications**: Web-Push VAPID API
- **Hosting**: Vercel

---

## 3. Database Architecture & Schema

### `public.students`
Stores user profile information (both students and admins):
- `id` (uuid, primary key, maps to `auth.users.id`)
- `email` (text, unique)
- `full_name` (text)
- `room_number` (text, nullable)
- `hall_name` (text, nullable)
- `role` (text: 'student' or 'admin')
- `is_active` (boolean)

### `public.maintenance_tickets`
Represents student maintenance issues:
- `id` (uuid, primary key)
- `student_id` (uuid, references `students.id`)
- `room_number` (text)
- `issue_type` (text)
- `priority` (text check: 'routine', 'urgent', 'emergency')
- `description` (text)
- `allow_entry` (boolean)
- `status` (text check: 'open', 'in_progress', 'resolved')
- `staff_notes` (text, nullable)

### `public.staff_directory`
Housing office staff list:
- `id` (uuid, primary key)
- `full_name` (text)
- `role` (text)
- `hall` (text, nullable)
- `phone` (text, nullable)
- `email` (text, nullable)
- `avatar_initials` (text)
- `sort_order` (integer)

### Row Level Security (RLS) Policies
- **Students**: Can only select and update their own profile row. They can insert and read only their own maintenance tickets and checklist progress.
- **Admins**: Granted full read/write access to all tables (announcements, events, maintenance tickets, staff listings, student records) to manage the university operations.

---

## 4. Production Launch Checklist

Before deploying the portal to the live server, complete the following items:

1. **IT Domain & SSO Integration**:
   - Coordinate with the HTU IT department to set up Single Sign-On (SSO) using Microsoft 365 Azure AD.
   - Configure redirect URIs in Azure App Registration pointing to `https://<your-supabase-url>.supabase.co/auth/v1/callback`.
   - Toggle Microsoft/Azure Provider in Supabase Auth settings.

2. **Official Email Delivery**:
   - Change the sender profile from personal test accounts to an official domain (e.g. `housing@htu.edu` or `reslife@htu.edu`).
   - Add TXT records (SPF, DKIM, and DMARC) provided by Resend to HTU DNS settings to authorize email deliveries.

3. **Production Database & Migration**:
   - Initialize the production database instance in Supabase.
   - Run `lib/supabase/schema.sql` to compile tables and configure row security.
   - Import the final registered student list into the database to restrict bypass login to registered residents only.

4. **Web Push Setup**:
   - Generate production VAPID key pairs.
   - Set environment variables on the production environment (Vercel).

5. **Custom Domain Mapping**:
   - Map a custom subdomain (such as `housing.htu.edu`) to the Vercel hosting deployment.
