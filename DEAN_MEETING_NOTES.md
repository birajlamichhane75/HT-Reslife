# Meeting Notes & Talking Points
## Meeting with Dean of Residence Life (Huston-Tillotson University)

Use these outline notes, demo checklists, and integration questions to guide your presentation and align on administrative details with the Dean today.

---

## 1. App Introduction & Core Value (Non-Technical Summary)
* **Goal**: Provide on-campus residents with a unified portal to streamline move-in, resolve maintenance issues, view announcements/events, and contact their resident assistants.
* **Benefits for Students**:
  - One-stop dashboard to track required checklist tasks before moving in.
  - Quick, transparent maintenance ticketing (no more paper forms or unreturned calls).
  - Clean layout optimized for mobile screens (perfect for when they are moving in or on the go), and full-screen view on laptops/tablets.
* **Benefits for ResLife Admin Staff**:
  - Dashboard for managing tickets, logging notes, resolving issues, and posting events or announcements.
  - Ability to quickly see checklist completion percentages across halls.
  - Fast, digital notifications instead of flyers or standard emails.

---

## 2. Live Demo Checklist (Quick Walkthrough)
* **Login Process**: Show how simple it is to enter the app. Explain that it currently has a "developer mode" for testing, but will integrate with their official HT account in production.
* **Student Dashboard**: Show the welcome card, the announcements section, and the checklist.
* **Filing a Maintenance Request**: File a quick plumbing or lock request. Show the list of submitted tickets.
* **Map & Directory**: Click on the Halls and Staff options. Show how the map renders Allen-Frazier, Beard-Burrowes, and Teresa Halls, and show the updated directory page.
* **Admin Portal**: Log in as an admin and show the ticket manager, staff editor, and event creation features.

---

## 3. Key Technical & Administrative Requests (What we need from them)

To transition from our local development setup to a secure university-branded production portal, we need resources from the Housing Office and the university IT department:

### A. University SSO & Domain Integration (Single Sign-On)
* **Question to Ask**: *“Can we coordinate with the IT Department to enable Microsoft 365 / Azure login for the app?”*
* **Why we need it**: This allows students to securely log in using their official `@htu.edu` student accounts. We need the IT team to register our application in their Azure portal and share the Client ID & Client Secret.

### B. Official ResLife Communication Email Domain
* **Question to Ask**: *“What is the official email address we should send notifications from (e.g., reslife@htu.edu or housing@htu.edu)?”*
* **Why we need it**: Currently, the system uses personal developer accounts for testing. To send student registrations, magic links, and ticket updates, we need to register the official university sending domain in our mail API (Resend) and have IT add DNS authentication records.

### C. Student Roster Seed Data
* **Question to Ask**: *“When can we retrieve the official student roster (emails, full names, room numbers, assigned halls) for the upcoming semester?”*
* **Why we need it**: RLS database policies restrict login access solely to active registered students. We need to import this list to whitelist users.

### D. Move-in Checklist Templates
* **Question to Ask**: *“Are there specific tasks we should add or change on the student move-in checklist?”*
* **Why we need it**: We currently display placeholders (financial clearance, key pickup, etc.). We need the official items required by the Housing Office.

### E. Portal Web Domain
* **Question to Ask**: *“What domain web address would you like to host this portal on (e.g., housing.htu.edu or reslife.htu.edu)?”*
* **Why we need it**: To point the domain to our hosting server.

---

## 4. Proposed Deployment Roadmap
1. **SSO & Email Setup**: 1-2 weeks (requires IT department action).
2. **Beta Testing (RAs & Staff)**: 1 week (gather feedback from housing staff).
3. **Launch**: Ready for the upcoming student check-in cycle.
