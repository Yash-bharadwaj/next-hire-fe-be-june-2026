# NeXt Hire – Full Testing Sheet Analysis & Fix Plan

## Critical Instructions

You must analyze the attached testing sheet and resolve ALL issues.

### Reference Source of Truth

* `@frontend-previous` is the UI/UX reference implementation.
* `next-hire-frontend` is the current frontend.
* `next-hire-backend` is the current backend.

### Mandatory Process

1. Run both applications:

   * `frontend-previous`
   * `next-hire-frontend`

2. Compare every page side-by-side.

3. Treat `frontend-previous` as the expected behavior and UI reference.

4. Replicate the same UI/UX, workflows, navigation, layouts, columns, actions, filters, statuses, cards, and user experience.

5. Do NOT blindly copy frontend code.

   * Build everything dynamically using the backend.
   * Design scalable database-driven implementations.
   * Avoid hardcoded values.
   * Ensure proper API integration.

6. Before fixing anything:

   * Audit current frontend
   * Audit backend APIs
   * Audit database models
   * Audit permissions
   * Audit routing
   * Audit reusable components

7. Ensure:

   * No dummy data
   * No mock data
   * No placeholder implementations
   * No temporary fixes

8. Every feature must:

   * Save correctly
   * Edit correctly
   * Delete correctly
   * Refresh correctly
   * Persist after page refresh
   * Work through APIs
   * Follow optimal coding standards

---

# IMPORTANT DEVELOPMENT RULES

For every issue:

### Check

* Existing API
* Existing DB schema
* Existing reusable components
* Existing hooks
* Existing services
* Existing utility functions

### Reuse First

Do not create new implementations if similar logic already exists.

Look for:

* Reusable tables
* Reusable forms
* Reusable ToDo components
* Reusable document upload modules
* Reusable activity feeds
* Reusable KPI cards
* Reusable filters
* Reusable search implementations

### Code Quality

* Remove duplication
* Improve maintainability
* Follow SOLID principles
* Follow feature-based architecture
* Optimize queries
* Optimize state management
* Optimize API calls
* Avoid unnecessary re-renders
* Use shared types/interfaces
* Use shared constants

---

# FIX ISSUES FROM BOTTOM TO TOP

Process issues in reverse order exactly as listed below.

---

## 1. Support Tickets

### Add Ticket

Issue:

* Ticket data does not save.

Expected:

* Save successfully.
* Persist after refresh.
* Validate required fields.
* Display success/error states.
* Use backend APIs properly.

---

## 2. Task Planner

Issue:

* Should show all ToDos and tasks from:

  * Jobs
  * Submissions
  * Business Partners
  * Future modules

Expected:

* Centralized task dashboard.
* Reusable task model.
* Assignment support.
* Status support.
* Date tracking.
* Filtering.
* Search.
* Sorting.

This should become the master implementation for all ToDo tabs.

---

## 3. Search Jobs

### AI Search

Issue:

* Does not behave like Manual Search.

Expected:

* Same user experience as Manual Search.
* AI extracts keywords.
* Search jobs dynamically.
* Same filtering and ranking experience.

---

## 4. Candidates

### Candidate Table

Issues:

1. Candidate IDs should display:

   * #10
   * #11

Instead of:

* CAND-2026-010

2. Ratings are blank.

Expected:

* Show valid rating.
* Default fallback value if rating missing.

---

## 5. Search Candidates

### AI Search

Expected:

* Match Manual Search behavior.
* Add score filtering.
* Same ranking experience.
* Backend-driven filtering.

---

## 6. Business Partners

### Documents Tab

Expected:

* Same implementation as:

  * Jobs
  * Candidates
  * Submissions

Additional field:

* Document Expiry Date

Use shared document module.

---

### ToDos

Expected:

Replicate Jobs ToDos system.

Must include:

* Assignment
* Status
* Due Date
* Planned Completion Date
* Comments
* Tracking

Use shared task system.

---

### Activity Feed

Issue:

* Dummy data exists.

Expected:

* Real data only.
* Backend connected.

---

### Contacts

Issue:

* Edit Contact incomplete.

Expected fields:

* Name
* Designation
* Email
* Comments

---

### Overview

Issue:

* Dummy data shown.

Expected:

* Real metrics.
* Real recent activity.

---

## 7. Time Sheets

Expected:

* Hide entire Time Sheets app.
* Remove navigation entry.

---

## 8. Dashboard

### Dashboard Actions

Issues:

* Open Dashboard not working.
* Quick Actions not working.

Expected:

Working actions:

* Generate Report
* View Trends
* Set Goals
* Export Data

---

### KPI Cards

Expected:

Replace:

* Total Jobs

With:

* Total Revenue

Replace:

* Total Submissions

With:

* Response Time

Display:

* 2.4h
* -15% from last month

Match previous UI.

---

## 9. Home

### Calendar

Issue:

* * New button not working.

Expected:

* Open event creation flow.
* Save event.
* Refresh correctly.

---

### KPI Cards

Replace:

* Total Jobs → Active Jobs
* Applications → Active Candidates
* Placements → Pending Submissions
* Interviews → Interviews Today

Each card:

* Shows real count
* Navigates correctly

---

### Activity Feed

Issues:

* Missing filters
* View All not working

Add filters:

* Market Insights
* My Top Customers
* Company News
* Entertainment

View All must navigate correctly.

---

### Welcome Banner

Missing:

* Welcome back, John!
* Let's catch up on the To-Dos

Match previous UI.

---

## 10. Business Partners

### Summary Filter Cards

Issue:

* Counts not refreshing.

Expected:

After creating partner:

* Total Partners updates
* Leads updates
* Clients updates
* Vendors updates

Real-time refresh.

---

## 11. Submissions

### Documents

Issues:

* Resume not opening
* Resume not downloading
* Local upload missing

Expected:

* View document
* Download document
* Upload local files

---

## 12. Candidates

### Documents

Issue:

* View document not working.

Expected:

* Open document correctly.

---

## 13. Jobs

### Company Jobs Table

Match frontend-previous exactly.

Issues:

1. Replace:

   * JOB-2026-006

With:

* #6

2. Add:

   * Assigned To column

3. Replace:

   * Applications

With:

* Submissions

---

### ToDos

Apply globally across all modules.

Statuses:

* Not Started (Default)
* In Progress
* Completed
* Not Applicable

Additional fields:

* Assigned To
* Planned Completion Date

Create reusable task architecture.

---

### Create Job

Missing options:

* Manual Job
* Import From File
* AI Assistant
* From Email

Match previous UI.

---

# FINAL DELIVERABLE REQUIRED

For every issue provide:

## Root Cause

* Frontend issue?
* Backend issue?
* Database issue?
* API issue?

## Fix Plan

* Files affected
* APIs affected
* DB changes
* Components reused

## Implementation

Complete implementation.

## Validation

Verify:

* UI matches frontend-previous
* Backend works
* No regressions
* No console errors
* No TypeScript errors
* No lint errors

---

Before marking complete:

1. Run frontend-previous.
2. Run next-hire-frontend.
3. Compare screen-by-screen.
4. Compare workflows.
5. Compare tables.
6. Compare forms.
7. Compare navigation.
8. Compare filters.
9. Compare actions.
10. Ensure current application matches previous UI while remaining fully dynamic and backend-driven.
