SETUP CHECKLIST — complete before deploying:

1. Create a Supabase project at supabase.com
   - Copy project URL and anon key into .env.local
   - Copy service role key into .env.local
   - Run lib/supabase/schema.sql in the Supabase SQL editor

2. Enable Microsoft (Azure AD) OAuth in Supabase:
   - Go to Supabase dashboard → Authentication → Providers → Azure
   - Register an app at portal.azure.com
   - Set redirect URL to: https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   - Copy client ID and secret into Supabase Azure provider settings
   - In Azure app registration: set supported account types to "Accounts in any organizational directory"
   - Add api permission: User.Read (Microsoft Graph)

3. Set up Resend at resend.com
   - Verify your sending domain
   - Create an API key
   - Add to .env.local

4. Generate VAPID keys for push notifications:
   - Run: npx web-push generate-vapid-keys
   - Add both keys to .env.local

5. Register your first admin:
   - Have the admin log in once (they get a student row created)
   - Go to Supabase dashboard → Table editor → students
   - Find their row, change role from "student" to "admin"

6. Seed initial data in Supabase:
   - Add staff members to staff_directory table
   - Add FAQs to faqs table
   - Add checklist items to checklist_items table

7. Deploy to Vercel:
   - Push to GitHub
   - Import repo in Vercel
   - Add all .env.local values as Vercel environment variables
   - Set NEXT_PUBLIC_APP_URL to your Vercel deployment URL

---

# HT Housing App

HT Housing is a university housing web application for Huston-Tillotson University in Austin, Texas. Built with Next.js 14, Supabase Auth, Suppabase Database (RLS enabled), and Web Push Notifications.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database + Auth**: Supabase
- **Email**: Resend API
- **Push**: Web Push
- **Host**: Vercel

## Local Development
1. Clone this repository.
2. Complete steps 1-4 of the SETUP CHECKLIST.
3. Install dependencies: `npm install`.
4. Run locally: `npm run dev`.
