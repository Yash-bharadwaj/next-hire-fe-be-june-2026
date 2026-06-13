# Next Hire — Manual Test Plan (Jobs → Business Partners, All Roles)

**App URL:** http://localhost:8080 (replace with the deployed URL if testing staging/prod)

## How to use this

- Go through each section top to bottom. Sections are grouped by module, and
  each module has sub-sections per role (Recruiter / Candidate / Vendor).
- For every numbered step, do the action and compare against "Expected".
  Tick the box if it matches. If it doesn't, write down what actually
  happened in the Notes column (screenshot if possible).
- Use a unique suffix (e.g. today's date/time) in any name/title you create,
  so your test data is easy to find and clean up afterwards.
- At the end, delete/clean up any test records you created (jobs, partners,
  candidates, etc.) unless told otherwise.

## Test Accounts

| Role      | Email                     | Password    |
|-----------|---------------------------|-------------|
| Recruiter | recruiter@hirenext.com    | Password@123 |
| Vendor    | vendor@hirenext.com       | Password@123 |
| Candidate | candidate@hirenext.com    | Password@123 |

---

## 0. Login / Logout (do this for each account)

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 0.1 | Go to `/auth/login`. Enter a valid email + wrong password. Click "Sign In". | Error message shown, stays on login page. | ☐ | |
| 0.2 | Enter correct credentials for **Recruiter**. Click "Sign In". | Redirected to `/dashboard`. Sidebar shows: Home, Jobs, Candidates, Submissions, Interviews, Placements, Business Partners, Time Sheets, Reports, etc. | ☐ | |
| 0.3 | Click user menu (top right) → Logout. | Returned to login page. | ☐ | |
| 0.4 | Repeat 0.2/0.3 for **Vendor** login. | Sidebar shows only: Home, Jobs, Submissions, Reports. | ☐ | |
| 0.5 | Repeat 0.2/0.3 for **Candidate** login. | Sidebar shows only: Home, Jobs, Submissions, Interviews, Reports. | ☐ | |

---

## 1. JOBS

### 1.1 Recruiter — Job CRUD (`/dashboard/jobs`)

**CREATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.1.1 | Login as Recruiter → Jobs → click "Add New Job" (or the + quick link). | Opens the 4-step "Add New Job" wizard at `/dashboard/jobs/new`, Step 1 active. | ☐ | |
| 1.1.2 | **Step 1 – Basic Info**: fill Job Title (e.g. "QA Test Job <timestamp>"), Company, select Job Type (Full-time), Priority (Medium), Job Status (Active), Location ("Remote"), Min/Max salary. Click "Next". | Advances to Step 2. Required-field validation works if you leave Job Title/Company blank and click Next (should block / show error). | ☐ | |
| 1.1.3 | **Step 2 – Description**: fill internal description, external description, Start Date, End Date, Application Deadline. Click "Next". | Advances to Step 3. | ☐ | |
| 1.1.4 | **Step 3 – Requirements**: fill min/max experience, education. Add 2 Primary Skills (type a skill, press Enter) and 1 Secondary Skill (type, press Enter). Fill Spoken Languages and Additional Requirements fields and press Enter / tab out. | Each skill appears as a removable badge/tag. **Pressing Enter in the Spoken Languages field must NOT remove or clear the Primary/Secondary Skill badges already added** (this was a known bug — verify it's fixed). | ☐ | |
| 1.1.5 | Click "Next" → **Step 4 – Settings**: set Number of Positions (e.g. 2) and Max Submissions (e.g. 5). Click "Create Job". | Job is created; redirected to Jobs list or job detail. Success toast/message shown. | ☐ | |

**READ / LIST**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.1.6 | Go to `/dashboard/jobs`. Search for your test job title. | The new job appears in the table with correct title, company, type, status. | ☐ | |
| 1.1.7 | Click the "View" (eye) icon on the test job row. | Navigates to job detail page showing all the data you entered (title, description, skills, salary, dates, positions). | ☐ | |

**UPDATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.1.8 | From Jobs list, click "Edit" (pencil) icon on the test job. | Opens the same 4-step wizard pre-filled with existing data, at `/dashboard/jobs/:id/edit`. | ☐ | |
| 1.1.9 | Change Job Title (append " - Edited") and Priority (e.g. to High). Click "Next" through remaining steps without changing anything, then click "Update Job". | Returns to Jobs list / detail. Updated title and priority are reflected. | ☐ | |
| 1.1.10 | Re-open the edited job (View or Edit). | Confirms the Step 1–4 data you entered earlier (skills, dates, positions) was preserved after the edit — nothing got wiped. | ☐ | |

**DELETE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.1.11 | From Jobs list, click "Delete" (trash) icon on the test job. | A confirmation popup appears ("Are you sure you want to delete this job? This action cannot be undone."). | ☐ | |
| 1.1.12 | Click Cancel on the confirmation. | Job is NOT deleted, still visible in list. | ☐ | |
| 1.1.13 | Click Delete again, then confirm. | Job is removed from the list immediately (no page reload needed). | ☐ | |
| 1.1.14 | Refresh the page and search for the deleted job title. | Job does not reappear — confirms it was actually deleted on the backend, not just hidden client-side. | ☐ | |

**MAX SUBMISSIONS LIMIT (bonus check)**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.1.15 | Create (or edit) a job and set "Max Submissions" to a small number (e.g. 1). As Vendor, submit candidates to this job until the limit is reached (see 1.3), then try one more. | A "maximum submissions reached" message/popup appears and blocks further submissions once the limit is hit. | ☐ | |

---

### 1.2 Candidate — Job Search & Apply (`/dashboard/job-search` or `/jobs`)

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.2.1 | Login as Candidate → Jobs (sidebar) or go to `/dashboard/job-search`. | "Find Your Dream Job" page loads with Featured Jobs and a job list/tabs (All Jobs / Featured / Recent / Remote). | ☐ | |
| 1.2.2 | Use the search filters: enter keywords, location, select Job Type, toggle "Remote Only", adjust salary slider, click "Search". | Job list updates to match filters (or shows "no results" if nothing matches). | ☐ | |
| 1.2.3 | Click "Apply Now" on the test job created in 1.1 (search for its title if needed). | Navigates to `/job/:id/apply` showing job summary + application form. | ☐ | |
| 1.2.4 | Fill Cover Letter (check the 0/2000 character counter updates), Expected Salary, Availability Date. Click "Submit Application". | Shows "Application Submitted!" success screen with "View My Applications" and "Browse More Jobs" buttons. | ☐ | |
| 1.2.5 | Click "View My Applications". | Navigates to `/dashboard/my-submissions` ("My Applications") and the new application appears with status "Submitted". | ☐ | |
| 1.2.6 | On that application row, open the actions menu → "Withdraw Application" (only available while status = Submitted). | Confirmation appears; after confirming, status changes (or the entry is removed/marked withdrawn). | ☐ | |
| 1.2.7 | Open the actions menu → "View Timeline" on any application. | A dialog shows the application's milestone timeline (submitted, reviewed, etc.). | ☐ | |

---

### 1.3 Vendor — Job Marketplace & Submit Candidate (`/dashboard/vendor/jobs`)

**Pre-requisite**: add at least one candidate to the vendor's pool first — do section 2.2 (Vendor Candidate Pool CRUD) before this if the pool is empty.

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 1.3.1 | Login as Vendor → Jobs (sidebar) → lands on "Vendor Job Board" (`/dashboard/vendor/jobs`). | Page shows "Browse vendor-eligible jobs and submit your best candidates" with a search/filter card and job cards. | ☐ | |
| 1.3.2 | Use filters: Keywords, Location, Skills, Job Type, "Remote Only" checkbox. Click "Search", then "Reset". | Results filter as expected; Reset clears filters and restores the full list. | ☐ | |
| 1.3.3 | Find the test job from 1.1. Click "Submit Candidate" on its card. | "Submit Candidate" dialog opens with a Candidate dropdown (from your vendor pool), Expected Salary, Availability Date, Cover Letter, Notes. | ☐ | |
| 1.3.4 | Select a candidate from the pool, optionally fill the other fields, click "Submit Candidate". | Dialog closes; success message shown. | ☐ | |
| 1.3.5 | Go to Submissions (sidebar) → `/dashboard/vendor/submissions`. | The new submission appears with the candidate name, job title, and status "Submitted". | ☐ | |
| 1.3.6 | Repeat the submit flow until the job's "Max Submissions" limit (set in 1.1.15) is reached, then try once more. | A message/dialog says the maximum submissions for this job has been reached, and the submit action is blocked. | ☐ | |

---

## 2. CANDIDATES

### 2.1 Recruiter — Candidate CRUD (`/dashboard/candidates`)

**CREATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.1.1 | Login as Recruiter → Candidates → click "Add Candidate". | Dialog opens with fields: First Name*, Last Name*, Email*, Phone, Location, Experience (years). | ☐ | |
| 2.1.2 | Try clicking "Add Candidate" (save) with First/Last/Email empty. | Validation error(s) shown for required fields; dialog stays open. | ☐ | |
| 2.1.3 | Fill First Name, Last Name, a unique Email (e.g. `qa.candidate+<timestamp>@test.com`), Phone, Location, Experience. Click "Add Candidate". | Dialog closes; new candidate appears in the candidates list/table. | ☐ | |

**READ / LIST**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.1.4 | Search/filter for the new candidate by name or email. | Candidate row appears with correct details. | ☐ | |
| 2.1.5 | Click into the candidate (View / row click) → candidate detail page. | Detail page shows profile info, and (if applicable) skills, experience, submissions/applications tabs. | ☐ | |

**UPDATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.1.6 | From the candidate detail or list, edit the candidate (e.g. change Phone or Location). Save. | Change is persisted — reload the page/list and confirm the new value sticks. | ☐ | |

**DELETE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.1.7 | Delete the test candidate (if a delete action exists in the list/detail page). Confirm any prompt. | Candidate is removed from the list; reload confirms it's gone. | ☐ | |

---

### 2.2 Vendor — Candidate Pool CRUD (`/dashboard/vendor/candidates`)

**CREATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.2.1 | Login as Vendor → Jobs → "Manage Candidates" (or navigate directly to `/dashboard/vendor/candidates`). | "Candidate Pool" page loads: "Maintain profiles for the talent you represent" with Filters card and candidate cards. | ☐ | |
| 2.2.2 | Click "+ Add Candidate". | Dialog "Add Candidate" opens with: First Name*, Last Name*, Email*, Phone, Location, Experience Years, Current Salary, Expected Salary, Skills (comma-separated), Bio. | ☐ | |
| 2.2.3 | Try saving with First/Last/Email blank. | Validation blocks submission. | ☐ | |
| 2.2.4 | Fill required fields + Skills (e.g. "React, Node.js, SQL") + other optional fields. Click "Add Candidate". | New candidate card appears in the pool with name, email, location, experience, expected salary, and skill tags. | ☐ | |

**READ / SEARCH**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.2.5 | Use Filters: Keywords (name/location), Skills, Availability dropdown (All/Available/Interviewing/Not Available). Click "Search", then "Clear". | List filters correctly; "Clear" resets filters and shows full pool again. | ☐ | |

**UPDATE / DELETE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 2.2.6 | If the candidate card has Edit/Delete options, edit one field (e.g. Bio or Skills) and save. | Change is reflected on the card after save/reload. | ☐ | |
| 2.2.7 | Delete the test candidate from the pool (if delete is available). Confirm prompt if shown. | Candidate card disappears from the pool; reload confirms removal. | ☐ | |

---

## 3. SUBMISSIONS

### 3.1 Recruiter — Manage Submissions (`/dashboard/submissions`)

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 3.1.1 | Login as Recruiter → Submissions. Page title "Job Applications". | List shows all submissions across candidates/vendors, with stats cards: Total Submissions, Active Jobs, In Progress, Interviews. | ☐ | |
| 3.1.2 | Use the search box ("Search by candidate name, job title, or company...") and the Status filter dropdown (Submitted/Under Review/Shortlisted/.../Hired/Rejected). Click "Search", then "Refresh". | Results filter correctly; Refresh reloads the list. | ☐ | |
| 3.1.3 | Find the submission created in 1.2 (candidate apply) or 1.3 (vendor submit). Open its row actions (⋯) → "View Candidate Profile". | Navigates to `/dashboard/candidates/:id` for that candidate. | ☐ | |
| 3.1.4 | Row actions → "Update Status". Select a new status (e.g. "Under Review" or "Shortlisted"), optionally add a note, click "Update Status". | Dialog closes; the submission's status badge updates in the list immediately. | ☐ | |
| 3.1.5 | Row actions → "Add Note". Type a note, click "Add Note". | Note is saved (verify via "View Timeline" or a notes section shows the new note). | ☐ | |
| 3.1.6 | Row actions → "Add Attachment". Enter an Attachment URL + display name, click "Add Attachment". | Attachment is saved and listed somewhere on the submission (timeline/detail). | ☐ | |
| 3.1.7 | Row actions → "Schedule Interview" — covered in detail in Section 4. | Opens "Schedule Interview" dialog. | ☐ | |
| 3.1.8 | Row actions → "View Timeline". | Dialog shows milestones (Application submitted, Reviewed, Interview scheduled if any, Current status). | ☐ | |

### 3.2 Candidate — My Applications (`/dashboard/my-submissions`)

Covered in 1.2.5–1.2.7 (view list, withdraw, view timeline). Additionally:

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 3.2.1 | After the recruiter changes status (3.1.4) or schedules an interview (Section 4), refresh "My Applications" as Candidate. | Updated status is visible; if an interview was scheduled, interview details (date/time/meeting link) show on the application. | ☐ | |

### 3.3 Vendor — My Submissions (`/dashboard/vendor/submissions`)

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 3.3.1 | Login as Vendor → Submissions. | Shows only submissions made by this vendor, with job title, candidate, status. | ☐ | |
| 3.3.2 | Row actions → "View Job Details" and "View Timeline". | "View Job Details" opens the public job page `/job/:id`; "View Timeline" shows the milestone dialog. | ☐ | |

---

## 4. INTERVIEWS (`/dashboard/interviews`)

### 4.1 Recruiter — Schedule & Manage

**CREATE (via Submissions)**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 4.1.1 | From Submissions (3.1.7), row actions → "Schedule Interview". | "Schedule Interview" dialog opens. | ☐ | |
| 4.1.2 | Select Interview Type "Video Call". Confirm a "Meeting Link" field appears (optional, with helper text about auto-generating). | Field visibility changes correctly based on type. | ☐ | |
| 4.1.3 | Switch type to "In Person". Confirm "Location" field appears and is required. Switch back to "Video Call". | Conditional fields toggle correctly. | ☐ | |
| 4.1.4 | Fill Date (today or later), Time, Duration (e.g. "1 hour"), optional Interviewer Email and Notes. Click "Schedule Interview" (should be enabled once date/time are set). | Dialog closes; success message shown. | ☐ | |

**READ / LIST**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 4.1.5 | Go to Interviews (sidebar). | New interview appears in the list with stats cards: Total Interviews, Active Jobs, Scheduled, Completed. | ☐ | |
| 4.1.6 | Use filters: Status, Interview Type, search, date range (from/to). | List filters correctly. | ☐ | |
| 4.1.7 | Row actions (⋯) → "View Details". | Navigates to `/dashboard/interviews/:id` showing tabs (Job/Candidate/Meta), scheduled date/time, duration, type, meeting link, interviewer, notes. | ☐ | |

**UPDATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 4.1.8 | Row actions → "Edit". Change the time or notes. Save. | Updated values reflected in list/detail. | ☐ | |
| 4.1.9 | Row actions → "Reschedule". Pick a new date/time. | Interview's scheduled time updates. | ☐ | |
| 4.1.10 | Row actions → "Complete Interview". | Status changes to "Completed". | ☐ | |
| 4.1.11 | On a different (or new) interview, row actions → "Cancel Interview". | Status changes to "Cancelled". | ☐ | |

**DELETE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 4.1.12 | Row actions → "Delete" on a test interview. Confirm prompt. | Interview removed from list; reload confirms it's gone. | ☐ | |

### 4.2 Candidate — View Interviews

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 4.2.1 | Login as Candidate → Interviews (sidebar, if the interview is for this candidate). | Candidate can see their scheduled interview (date, time, type, meeting link) but cannot edit/delete it. | ☐ | |

---

## 5. PLACEMENTS (`/dashboard/placements`)

### 5.1 Recruiter — Placement CRUD

**CREATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 5.1.1 | Login as Recruiter → Placements → click "+ New Placement". | "Record Placement" dialog opens. | ☐ | |
| 5.1.2 | Select Job (the test job, or any job with a hired/offered candidate), select Candidate (populated based on the job's submissions), fill Start Date, Salary, Salary Currency (USD), Location, Placement Type (permanent/contract/temporary), Work Arrangement (onsite/remote/hybrid), optional End Date / Commission % / Notes. Click "Create Placement". | Dialog closes; new placement appears in the list. | ☐ | |

**READ / LIST**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 5.1.3 | Check stats cards: Active Placements, Completed, Total Commission, Average Salary. Click on "Active Placements" card. | Cards show counts; clicking filters the list to active placements only. | ☐ | |
| 5.1.4 | Use filters: Status, Placement Type, search. | List filters correctly. | ☐ | |
| 5.1.5 | Row actions (⋯) → "View Details". | Navigates to `/dashboard/placements/:id` with tabs (Job/Candidate/Meta) showing job title, company, candidate, submission ID, start date, salary, location, type. | ☐ | |

**UPDATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 5.1.6 | Row actions → "Edit". Change Status (active/completed/inactive), Onboarding Status (pending/in_progress/completed), Salary, End Date, Performance Rating (0-5), Notes. Click "Update Placement". | Changes persist — reload list/detail to confirm. | ☐ | |

**DELETE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 5.1.7 | Row actions → "Delete". Confirm prompt. | Placement removed from list; reload confirms it's gone. | ☐ | |

---

## 6. BUSINESS PARTNERS (`/dashboard/business-partners`)

### 6.1 Recruiter — Business Partner CRUD

**CREATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 6.1.1 | Login as Recruiter → Business Partners → click "New Partner" → "Manual Entry". | "New Business Partner" dialog opens: "Add a new lead, client, or vendor to your business partners." | ☐ | |
| 6.1.2 | Try clicking "Create" with Company Name empty. | Validation blocks submission (Company Name is required, marked with *). | ☐ | |
| 6.1.3 | Fill Company Name (e.g. "QA Test Partner <timestamp>"), Primary Email, Primary Phone, Website, Domain. | Fields accept input normally. | ☐ | |
| 6.1.4 | Under "Partner Type", check one or more of Lead / Client / Vendor checkboxes. | Checkboxes toggle independently. | ☐ | |
| 6.1.5 | Fill Address Line 1/2. Select Country (e.g. "Germany"). Confirm State dropdown becomes enabled/populated after Country is chosen, then select a State, then a City. | Country → State → City cascading selects work correctly (State/City reset when Country changes). | ☐ | |
| 6.1.6 | Fill Postal Code, Industry, Company Size (Startup/Small/Medium/Large/Enterprise), Annual Revenue, Tax ID. | Fields accept input; Company Size dropdown shows all 5 options. | ☐ | |
| 6.1.7 | Set Source (e.g. "Referral"), Status (e.g. "Prospect"), Priority (e.g. "Medium"). Click the create/save button. | Dialog closes; new partner appears in the Business Partners list. | ☐ | |

**READ / LIST**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 6.1.8 | Use the navigation/stat cards (All / by type / by status, etc.) and search to find the test partner. | Filters and search correctly narrow the list to the test partner. | ☐ | |
| 6.1.9 | Click into the test partner (View / row click). | Navigates to `/dashboard/business-partners/:id` and shows all the data entered (contact info, address, industry, size, source, status, priority, partner type flags). | ☐ | |

**UPDATE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 6.1.10 | From the detail page or list, edit the partner ("Edit Business Partner" dialog/mode). Change Status (e.g. Prospect → Active) and Priority (e.g. Medium → High). Save. | Changes persist — reload the detail page/list to confirm the new Status/Priority. | ☐ | |
| 6.1.11 | Edit again and change Country/State/City to a different country, confirming State/City reset and repopulate correctly. Save. | New location values persist correctly. | ☐ | |

**BULK ACTIONS (if accessible)**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 6.1.12 | Select one or more partners (checkbox) and try the bulk actions menu: "Send bulk email", "Update status", "Mass changes" (note: "Bulk delete" is destructive — only test if you intend to delete test data). | Menu items are reachable; "Update status" applies to selected rows. | ☐ | |

**DELETE**

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 6.1.13 | Delete the test partner via row action or "Bulk delete" with only the test partner selected. Confirm any prompt. | Partner is removed from the list; reload confirms it's gone. | ☐ | |

---

## 7. PROFILE (all roles, `/dashboard/profile`)

| # | Steps | Expected | Pass/Fail | Notes |
|---|-------|----------|-----------|-------|
| 7.1 | Login as Candidate → Profile → click "Edit Profile". | Profile becomes editable; tabs visible: Basic Information, Salary & Career, Links, Preferences, Skills, Experience, Documents. | ☐ | |
| 7.2 | Basic Information: edit First/Last Name, Phone, Location (Country/State/City), Bio. | Fields update. | ☐ | |
| 7.3 | Salary & Career: set Current/Expected Salary, Years of Experience, Availability Status (available/interviewing/not_available). | Fields update. | ☐ | |
| 7.4 | Skills tab → "+ Add Skill": fill Skill Name, Category (technical/soft/language/domain/tools), Proficiency (beginner/intermediate/advanced/expert), Years of Experience, "Is Primary Skill" checkbox. Save. | New skill appears as a tag. | ☐ | |
| 7.5 | Experience tab → "+ Add Experience": fill Job Title, Company, Location, Start Date, "Currently Working Here" checkbox (hides End Date when checked), Description, Achievements, Technologies. Save. | New experience entry appears in the list. | ☐ | |
| 7.6 | Documents tab → upload a resume file. Mark it "Set as Primary". Download it. Delete it. | Upload succeeds, "Primary" flag toggles, download works, delete removes it from the list. | ☐ | |
| 7.7 | Click "Save Changes" at the top, then refresh the page. | All edits from 7.2–7.5 persist after reload. | ☐ | |
| 7.8 | Login as Vendor → Profile. Edit Company Name, Company Website, Contact Person, Phone, Address/City/State/Country, Years in Business, Bio, Specializations. Save and reload. | Vendor profile fields persist correctly. | ☐ | |
| 7.9 | Login as Recruiter → Profile. Confirm profile loads and basic edits (if editable for this role) save correctly. | No errors; edits persist. | ☐ | |

---

## Bug Report Template

For anything that fails, capture:

```
Title: <short description>
Role/Account: recruiter@hirenext.com / vendor@hirenext.com / candidate@hirenext.com
Page/URL: <e.g. /dashboard/jobs/new>
Steps to Reproduce:
 1.
 2.
 3.
Expected:
Actual:
Screenshot: <attach>
```
