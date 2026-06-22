# hireNext Code Optimization & Reusability Audit

**Scope:** `next-hire-frontend/src` (73,089 lines) + `next-hire-backend/src` (20,085 lines) = **93,174 lines total**.
`frontend-previous/` was excluded — it is a read-only legacy mock-data prototype, not part of the shipped app.

**Method:** Three parallel research passes (frontend UI/components, frontend hooks/services/types, backend
controllers/models/routes), each required to cite exact `file:line` evidence for every claim — no generic
advice without a confirmed instance in this codebase.

**Status:** This is the audit + plan only. **No code has been changed.** Per your instructions, implementation
will only begin after you review this and tell me which phase(s) to proceed with.

---

## 1. Executive Summary

The codebase is functional and the patterns within each domain (jobs, candidates, submissions, interviews,
placements, business partners) are internally consistent — but the same ~6 domains were built by copy-pasting
the same handful of shapes (list/stats/detail/management hooks, note+attachment CRUD endpoints, export
dropdowns, stat-card grids) six times over rather than factoring them once. The single largest finding is **not
a duplication problem at all: ~8,960 lines (~9.6% of the frontend) are dead code** — 15 unrouted legacy page
variants (`*New.tsx`/`*Old.tsx`) and 6 unused "personalization settings" dialog components, confirmed via
whole-tree grep to have zero imports anywhere.

Beyond dead code, the highest-value real refactor is consolidating the **note/attachment CRUD** that exists
almost line-for-line identically across Interview, Submission, Placement, and BusinessPartner controllers
(backend) and the matching `use<Domain>s`/`use<Domain>Stats`/`use<Domain>Management`/`use<Domain>` hook
skeleton that exists identically across 7 frontend hook files. Both are narrow, well-understood, low-risk
extractions because the team has already proven the pattern works once (the existing `isJobStaff` permission
helper is exactly this kind of extraction, just not yet applied to the bigger note-CRUD duplication around it).

One correctness bug was found in passing (not a refactor item): `Job.salary_min/salary_max/bill_rate_min/
bill_rate_max`, `Candidate.current_salary/expected_salary`, `BusinessPartner.annual_revenue`, and
`Submission.expected_salary` are Postgres `DECIMAL` columns with no string→number coercion getter — the same
bug already found and fixed on `Placement` model fields earlier this project. It's flagged separately below
since fixing it is a correctness change, not a pure refactor.

**Total estimated reduction: ~12,000 lines (~13% of the codebase)** — ~8,960 lines from dead-code deletion
(zero risk) + ~3,100 lines from actual extraction/refactoring work (low-to-medium risk, detailed in the
roadmap).

---

## 2. Architecture Review

**Frontend** follows a consistent per-domain layered pattern: `pages/<Domain>.tsx` (list) + `pages/<Domain>Detail.tsx`
→ `hooks/use<Domain>s.ts` → `services/<domain>Service.ts` → `lib/api.ts` (axios wrapper). This is a sound,
conventional structure — the problem isn't the architecture, it's that the *implementation* of each layer was
duplicated per-domain instead of factored. Four shared UI panels already exist and are correctly reused across
4 detail pages (`NotesPanel`, `DocumentsPanel`, `JobProfitabilityPanel`, `CompanyFilter`) — proving the team
already does this when it's been noticed; the audit below mostly extends that same instinct to patterns not yet
noticed.

**Backend** is a standard Express + Sequelize MVC-ish layout (`controllers/`, `routes/`, `models/`,
`middleware/`, `utils/`, plus a thin `services/` directory reserved for genuinely cross-cutting concerns: AI
calls, embeddings, file storage). Two controller *styles* coexist — `asyncHandler()` + `throw createError()` vs.
manual `try/catch` + hand-rolled JSON envelopes — both work, and unifying them is out of scope for this audit
(flagged as a non-issue, see §4 backend item 2).

**Verdict:** the architecture itself doesn't need restructuring. The roadmap below is entirely about reducing
*duplication within* the existing structure, not changing the structure.

---

## 3. Reusability Opportunities (by category)

### Components (frontend)
| Pattern | Occurrences | Proposed component |
|---|---|---|
| Tab-strip active-state styling | 6 files (3 with a local const, 2 inlined 6-9×, 1 missing entirely — BusinessPartnerDetail has no active-tab affordance, a UX bug) | `<DetailTabsList variant="gradient-green"\|"white"\|"plain">` |
| KPI stat-card grid | 5 list pages | `<NavigationCardGrid cards={...} activeId={} loading={} />` |
| Export dropdown (CSV/PDF/Excel/Sheets) | 6 list pages, JSX + handlers both duplicated | `<ExportDropdown>` + `useEntityExport()` hook |
| "Actions" dropdown trigger button | 5 detail pages (1 uses a different pattern, inconsistent) | `<ActionsMenu items={[...]} />` |
| Detail-page header (back+title+badges+actions) | 6 detail pages | `<DetailPageHeader title subtitle badges actions onBack />` |
| Full-page loading spinner | 4 files identical, 2 files inconsistent (no spinner) | `<PageLoadingState label="..." />` |
| Empty-state block (icon+heading+CTA) | 6 list pages | `<EmptyState icon title description action />` |
| Hand-rolled `<label>+<Input>` form field | ~40 occurrences across 5 files | `<FormField label required>` (a `Form`/`FormField` component *already exists* at `components/ui/form.tsx` but is used in only 2 of 7+ forms) |

### The one structural finding that's more than "duplication"
`CandidateDetail.tsx` and `JobDetail.tsx` are the **only** two detail pages that didn't adopt the shared
`NotesPanel`/`DocumentsPanel` components — they hand-roll their own Notes and Documents/Attachments tabs
(~93 + ~73 lines of Notes tab, plus a similar amount for Documents). Both hand-rolled versions share an
identical **dormant bug**: filter/sort/search state (`notesFilter`, `notesSort`, `notesSearch`) is declared and
read, but the setters are never wired to any control — the filter UI is permanently inert on both pages.
Migrating both to the shared panels fixes the bug *and* removes ~300-350 lines, for free.

### Hooks
| Logic | Occurrences | Proposed hook |
|---|---|---|
| List-fetch skeleton (loading/error/pagination/filters/refresh/loadMore) | 7 hook files, ~10 hook functions | `useResourceList<T,F>(fetchFn, opts)` |
| Stats-fetch skeleton | 5 hook functions | `useResourceStats<S>(fetchFn)` |
| Single-record-fetch skeleton | 8 hook functions | `useResourceDetail<T>(id, fetchFn)` |
| Create/update/delete-with-role-guard skeleton | 5 hook files | `useResourceManagement(actions, opts)` |
| `window.confirm` + try/finally delete | 4-5 files | `useConfirmDelete(deleteFn, messages)` |
| localStorage read/write (3× "detail page personalization" feature, 11× auth tokens) | 25 call sites total | `useLocalStorage<T>(key, initial)` + a `tokenStorage` micro-module |
| Debounced search | only 1 instance today (`Submissions.tsx:236-257`) | `useDebounce<T>(value, delayMs)` — pre-emptive extraction so the next instance doesn't get copy-pasted |
| Task list filtering by status | 4 detail pages (`PlacementDetail`, `InterviewDetail`, `SubmissionDetail`, `JobDetail`) | `filterTasksByStatus(tasks, filter)` util |

### Shared utilities
| Function | Duplicated in | Target |
|---|---|---|
| `formatDate` | `businessPartnerService.ts`, `interviewService.ts`, `placementService.ts` (byte-identical) | `src/lib/format.ts` (already exists — extend it) |
| `formatDateTime` | `interviewService.ts`, `placementService.ts`, `dashboardService.ts` (byte-identical) | same |
| `getPriorityColor` | `jobService.ts`, `vendorService.ts`, `recruiterService.ts` (byte-identical) | same |
| Currency `Intl.NumberFormat` block | `placementService.ts`, `jobService.ts`, `vendorService.ts`, `businessPartnerService.ts` | same (a *different* shared helper, `formatCompactCurrency`, already exists in `lib/format.ts` but only 1 of 5 candidate call sites uses it) |
| Sequelize JSON-array TEXT column getter/setter | **18 fields across 8 backend models** (`notes_history`/`attachments`/`status_history` on Interview/Job/Placement/Submission/BusinessPartner, plus lenient string-array fields on Candidate/Job/Experience/Vendor) | `jsonArrayColumn()` field factory in `src/utils/sequelizeFields.ts` |
| Add/update/delete note CRUD | Interview/Placement/BusinessPartner/Submission controllers (~12 near-identical functions) | `createNoteHandlers(Model, canManage, opts)` factory |
| Note/attachment express-validator chains | `routes/interviews.ts`, `routes/placements.ts`, `routes/businessPartners.ts`, `routes/recruiter.ts` | `buildAddNoteValidation(label, idParam)` etc. in `src/validators/noteValidators.ts` |
| Dialect-aware month-grouping SQL expression | `placementController.ts`, `businessPartnerController.ts` | `monthGroupExpr(columnRef)` in `src/utils/dateGrouping.ts` |

### Types
- `src/lib/api.ts` already defines a generic `ApiResponse<T>` and `PaginatedResponse<T>` — but the latter is
  awkwardly designed (pre-declares every domain's list-key as an optional prop: `jobs?`, `candidates?`,
  `submissions?`...) which is likely *why* 6 of 8 services stopped using it and hand-rolled an identical
  `<X>sResponse` interface instead. Fix: make it properly generic over the key name
  (`PaginatedResponse<T, K extends string = "items">`), then `interface JobsResponse extends
  PaginatedResponse<Job, "jobs"> {}` everywhere.
- No `src/types/` duplication beyond the above — `src/types/auth.ts` is the only file there today and is
  scoped correctly.

### Constants
- No named `DEFAULT_PAGE_SIZE` exists; the pagination-state default is **inconsistently** `20` in 4 hooks and
  `10` in 9 hooks, with no explanation for the split.
- `limit: 100` (the assumed backend max page size) is hardcoded **13 times** verbatim across pages/services,
  only one of which (`useSubmissions.ts:361`) documents *why* with a comment.
- Role-literal strings (`"recruiter"`, `"candidate"`, etc.) appear 262 times as raw comparisons; low priority
  since `UserRole` already gives compile-time safety — flagged but not worth a refactor on its own.

---

## 4. Duplicate Code Analysis (highest-confidence findings only)

**Frontend — confirmed dead code (safe to delete outright, zero behavior change):**
- 15 unrouted page files, ~6,866 lines: `CandidatesNew.tsx`, `CandidatesOld.tsx`, `HomeNew.tsx`, `HomeOld.tsx`,
  `Index.tsx`, `JobMarketplaceNew.tsx`, `JobMarketplaceOld.tsx`, `JobSearchNew.tsx`, `JobSearchOld.tsx`,
  `JobsNew.tsx`, `JobsOld.tsx`, `MyJobsOld.tsx`, `SubmissionsNew.tsx`, `SubmissionsOld.tsx`, `TestJobs.tsx` —
  confirmed zero references anywhere including `App.tsx`'s route table.
- 6 unused component files, ~2,042 lines: `InterviewDetailPersonalizationSettings.tsx`,
  `JobDetailPersonalizationSettings.tsx`, `PlacementDetailPersonalizationSettings.tsx`,
  `SubmissionDetailPersonalizationSettings.tsx`, `SubmissionActionsDialog.tsx`, `TaskCalendar.tsx` — looks like
  a half-finished feature rollout: their siblings `BusinessPartnerDetailPersonalizationSettings.tsx` and
  `CandidateDetailPersonalizationSettings.tsx` *are* wired in and used.
- `src/utils/apiTest.ts` (37 lines, a dev-only manual test script never imported), plus 2 dead service methods:
  `businessPartnerService.getPriorityLabel` (8 lines) and `businessPartnerService.formatRevenue` (9 lines).
- Confirmed unused imports (not just suspected): `BusinessPartnerDetail.tsx:30,36,48`; `JobDetail.tsx` (6
  imports including an entire unused `Collapsible` import block); `CandidateDetail.tsx:20,22,24,28,40`;
  `AddNewJob.tsx:17,31,33,37,41,43`.
- Dead state: `JobDetail.tsx:709` (`personalizationSettings` loaded, never rendered); `JobDetail.tsx:588-590`
  and `CandidateDetail.tsx:175-177` (filter/sort/search setters declared, never invoked — see §3 above);
  `CandidateDetail.tsx:180` (`setTasks` never called — the Tasks tab is permanently static mock data).

**Frontend — largest files (none split into sub-components, unlike the detail pages that already adopted
shared panels):**

| Lines | File |
|---|---|
| 2,649 | `pages/JobDetail.tsx` |
| 2,370 | `pages/MyProfile.tsx` |
| 2,196 | `pages/AddNewJob.tsx` |
| 1,765 | `pages/CandidateDetail.tsx` |
| 1,635 | `pages/SubmissionDetail.tsx` |
| 1,544 | `pages/Interviews.tsx` |
| 1,533 | `pages/UserDetail.tsx` |
| 1,500 | `pages/Submissions.tsx` |
| 1,367 | `pages/Placements.tsx` |
| 1,342 | `pages/InterviewDetail.tsx` |

**Backend — confirmed duplication:**
- 18 Sequelize JSON-array column getter/setter pairs across 8 models (2 sub-patterns: try/catch'd
  `notes_history`/`attachments`/`status_history`, and lenient `skills`/`required_skills`-style fields) — all
  byte-identical apart from the field name.
- ~12 near-identical add/update/delete note-CRUD controller functions across Interview, Placement,
  BusinessPartner, and Submission (the strongest single backend finding — see roadmap item B1).
- 4 copies of the same note/attachment express-validator chain (3 near-identical + 1 minor variant).
- 2 copies of a 3-way dialect-detection SQL date-grouping expression (sqlite/postgres/mysql branch).
- Minor: 2 call sites use `require("sequelize").fn(...)` instead of the already-imported `Sequelize` — signals
  an incomplete prior refactor, worth a repo-wide grep.
- Minor: `middleware/validate.ts` is a redundant 2-line re-export of `middleware/validation.ts`; some routes
  import one path, some the other — harmless but should be collapsed to one canonical import.

**No dead backend exports were found** — three initial suspects (`buildCandidateProfileText`,
`buildJobEmbeddingText`, `jobDetailIncludes`) are all genuinely imported cross-controller; they're just housed
in the wrong layer (controller files acting as utility libraries) rather than being dead.

---

## 5. Performance Improvements

1. **`AuthContext.tsx:288-313` — unmemoized context value, highest-impact single fix in this audit.** The
   `value` object passed to `<AuthContext.Provider>` is rebuilt on every render with no `useMemo`, even though
   the individual functions inside it are already `useCallback`-wrapped. Since virtually every data hook in the
   app calls `useAuth()`, any `AuthProvider` re-render (e.g. `isLoading` toggling during *any* auth call)
   cascades a re-render through the entire app tree. Fix is a single `useMemo` wrap — see §8 backend... no,
   frontend roadmap item A2.
2. `Interviews.tsx:539-560` and `Submissions.tsx:173-182` — `.reduce()`/`.filter()` over the full fetched list
   runs on *every* render (including renders from unrelated state like dialog open/close), with no `useMemo`.
   `Submissions.tsx`'s sibling `availableCompanies` computation *is* correctly memoized right next to these —
   so the fix is applying the same pattern already used 20 lines away.
3. 4 duplicate `filteredTasks` computations (`PlacementDetail`/`InterviewDetail`/`SubmissionDetail`/
   `JobDetail`) are low perf-risk (small lists) but worth fixing as part of the dedup in §3, not as a separate
   performance pass.
4. No missing lazy-loading/code-splitting issues were specifically flagged by the research — not audited in
   depth this pass; recommend a follow-up bundle-size pass if this becomes a priority later (out of scope for
   this audit's evidence-based standard).

---

## 6. Type Safety Improvements

- Fix `PaginatedResponse<T>` in `lib/api.ts:141-158` to be generic over the list-key name (see §3 Types) and
  have the 6 services that currently hand-roll an identical interface extend it instead.
- Add the missing DECIMAL→number Sequelize getters (see correctness bug below) — this is as much a type-safety
  issue as a runtime one: the TypeScript types already claim these fields are `number`, but at runtime they're
  `string` until coerced, which is exactly the class of bug that already bit `Placement.salary` before it was
  fixed.

**Correctness bug (flagged separately from refactoring, since fixing it changes runtime values, not just
code structure — confirm with you before touching):**
`Job.salary_min`, `Job.salary_max`, `Job.bill_rate_min`, `Job.bill_rate_max`, `Candidate.current_salary`,
`Candidate.expected_salary`, `BusinessPartner.annual_revenue`, and `Submission.expected_salary` are Postgres
`DECIMAL` columns with no string-coercion getter — `Placement`'s equivalent fields already got this fix earlier
in this project (with an explanatory comment at `Placement.ts:187-191`) but it was never propagated to these 8
other fields. Confirmed live exposure: `recruiterController.ts:1420,1449` does arithmetic
(`submission.expected_salary || job.salary_min || 0`) on these raw values.

---

## 7. Folder Structure Recommendations

The existing structure is sound and does **not** need a structural overhaul:
```
next-hire-frontend/src/
 ├── components/   (shared UI + a few feature-specific dialogs)
 ├── components/ui/ (shadcn primitives)
 ├── pages/        (route-level components)
 ├── hooks/        (per-domain data hooks)
 ├── services/     (per-domain API classes)
 ├── contexts/      (1 file: AuthContext)
 ├── lib/          (api client, format helpers, utils)
 ├── types/        (currently only auth.ts)
```
Two small, low-risk additions (not a restructure — additive only):
- `src/validators/` style helpers don't apply to frontend; skip.
- Promote `src/lib/format.ts` as the single home for all formatter functions (it already exists and is
  *correctly* used by 1 of 5 candidate call sites — the fix is consolidating into it, not creating something new).
- Consider `src/hooks/factories/` for the new `useResourceList`/`useResourceStats`/etc. generic hooks, keeping
  per-domain `use<Domain>s.ts` files as thin wrappers calling them — this keeps the current per-domain file
  layout (so nothing that imports `usePlacements` etc. needs to change) while removing the duplicated internals.

```
next-hire-backend/src/
 ├── controllers/  (one file per domain, some doing too much — see recruiterController.ts at 1,871 lines)
 ├── routes/
 ├── models/
 ├── middleware/
 ├── utils/        (good home for the new jsonArrayColumn/dateGrouping/noteHandlers factories)
 ├── validators/   (doesn't fully exist yet as a directory — note validators are currently inline in route files; worth creating `src/validators/noteValidators.ts` as proposed)
 ├── services/     (already reserved for AI/embeddings/storage — correctly scoped, no change needed)
```
`recruiterController.ts` (1,871 lines) has outgrown "one controller" — it covers jobs, submissions, tasks,
profitability, and sourcing in one file, and partially duplicates `jobController.ts`'s job CRUD already.
Splitting it along those existing seams (e.g. `taskController.ts`, `jobProfitabilityController.ts`) would help
more than adding a service layer underneath it — flagged as a **medium-priority, file-organization-only**
change (move functions, change imports, zero logic change) for the roadmap below.

A full repository/service layer between controllers and Sequelize models would be **over-engineering** at this
team's current size and is explicitly **not recommended** — see §3 Reusability "Backend SOLID" notes above;
the existing controller-does-everything pattern is fine as long as the genuinely repeated slivers (note CRUD,
JSON-column getters, validators) are factored out, which the roadmap below covers.

---

## 8. Refactoring Roadmap

Each item lists: **Current issue → Recommended solution → Files affected → Risk → Effort → Benefit.**

### High Priority (biggest impact, lowest risk — recommend starting here)

**H1. Delete confirmed dead code**
- *Issue:* 15 unrouted legacy pages + 6 unused components + 1 dead test script + 2 dead service methods = ~8,960 lines with zero references anywhere in the app.
- *Solution:* Delete the files outright; remove the 2 dead method exports.
- *Files:* the 15+6+1 files listed in §4, plus `businessPartnerService.ts` (remove 2 methods).
- *Risk:* **Very low** — re-confirm each via grep immediately before deletion (already done once by the research agent; will re-verify at implementation time) since this is the one irreversible-feeling step, even though git history makes it fully recoverable.
- *Effort:* ~30 min.
- *Benefit:* ~9.6% codebase size reduction, zero behavior change, immediately reduces confusion for anyone grepping/reading the pages directory.

**H2. Memoize `AuthContext` value**
- *Issue:* `AuthContext.tsx:288-313` rebuilds its context value object every render, cascading re-renders through every consumer in the app.
- *Solution:* Wrap the `value` object in `useMemo` with the dependency list already implied by its contents.
- *Files:* `next-hire-frontend/src/contexts/AuthContext.tsx`.
- *Risk:* **Low** — purely additive memoization; must double check every dependency is listed (a missed dep would cause stale-closure bugs, the one real risk of this change).
- *Effort:* ~15 min + manual smoke-test of login/logout/role-switch flows.
- *Benefit:* App-wide render-performance fix; highest benefit-to-effort ratio in the whole audit.

**H3. Backend: `createNoteHandlers()` factory for note CRUD**
- *Issue:* ~12 near-identical add/update/delete-note functions across Interview/Placement/BusinessPartner/Submission controllers (~350-400 duplicated lines).
- *Solution:* Extract a factory taking the Model, a `canManage(record, userId)` permission function (already isolated per-entity), and options for the route's id-param name and whether to mirror the latest note into a flat field (interview/submission do this, placement/business-partner don't).
- *Files:* new `src/utils/noteHandlers.ts`; `controllers/interviewController.ts`, `controllers/placementController.ts`, `controllers/businessPartnerController.ts`, `controllers/recruiterController.ts` (submission notes).
- *Risk:* **Medium** — touches 4 live, frequently-used endpoints; needs a full regression pass (add/edit/delete a note on each of the 4 entity types) before merging, exactly like the verification done for each entity earlier in this project.
- *Effort:* ~3-4 hours including verification.
- *Benefit:* ~350-400 lines removed; one source of truth for note CRUD bugs/features going forward (a fix or new field — e.g. the `isPrivate` filter logic — currently needs 4 coordinated edits, will need 1).

**H4. Backend: `jsonArrayColumn()` Sequelize field factory**
- *Issue:* 18 byte-identical JSON-array TEXT-column getter/setter pairs across 8 models.
- *Solution:* A small factory function returning the Sequelize field config object, parameterized by column name and a `lenient` flag (try/catch vs. plain ternary).
- *Files:* new `src/utils/sequelizeFields.ts`; `models/Interview.ts`, `models/Job.ts`, `models/Placement.ts`, `models/Submission.ts`, `models/BusinessPartner.ts`, `models/Candidate.ts`, `models/Experience.ts`, `models/Vendor.ts`.
- *Risk:* **Low** — pure boilerplate substitution, no logic differs between copies; verify with a quick read-after-write smoke test per model (create/fetch one record with each affected field populated).
- *Effort:* ~2 hours including verification.
- *Benefit:* ~140 lines removed; removes 18 places that must independently stay correct.

**H5. Frontend: `useEntityExport()` hook + `<ExportDropdown>` component**
- *Issue:* Export-dropdown JSX and its 4 handler functions (CSV/PDF/Excel/Sheets) are duplicated across 6 list pages (~390 lines).
- *Solution:* A hook taking `{ rows, columns, entityLabel }` returning the 4 handlers + `exporting` state, paired with a presentational dropdown component.
- *Files:* new `src/hooks/useEntityExport.ts`, new `src/components/ExportDropdown.tsx`; `pages/Jobs.tsx`, `pages/BusinessPartners.tsx`, `pages/Placements.tsx`, `pages/Interviews.tsx`, `pages/Submissions.tsx`, `pages/Candidates.tsx`.
- *Risk:* **Low** — each page already has working `exportColumns`/`CsvColumn[]` definitions; this only moves the *trigger* plumbing, not the column definitions.
- *Effort:* ~3 hours across 6 pages including a manual export-and-open-the-file check per page.
- *Benefit:* ~390 lines removed; one place to add a future export format.

### Medium Priority (maintainability, moderate effort)

**M1. Frontend: `useResourceList`/`useResourceStats`/`useResourceDetail`/`useResourceManagement` factory hooks**
- *Issue:* The entire list/stats/detail/management hook skeleton (loading/error/pagination/toast handling) is duplicated near-identically across 7 hook files (~900-1,100 lines).
- *Solution:* 4 generic factory hooks in `src/hooks/factories/`; each domain's existing `use<Domain>s.ts` file becomes a thin ~10-15 line wrapper calling the factory with its own service method.
- *Files:* new `src/hooks/factories/*.ts`; `hooks/usePlacements.ts`, `useInterviews.ts`, `useBusinessPartners.ts`, `useJobs.ts`, `useSubmissions.ts`, `useVendor.ts`, `useRecruiter.ts`, `useCandidateSearch.ts`.
- *Risk:* **Medium-high** — this is the biggest single line-count win but touches the data layer feeding every list/detail page in the app. Must be done one domain at a time with a full manual pass of that domain's list+detail+create+edit+delete flow before moving to the next domain, not all at once.
- *Effort:* ~1-1.5 days, sequenced one domain per session with verification between each.
- *Benefit:* ~900-1,100 lines removed; the single biggest reduction in this audit, and removes the largest remaining copy-paste surface in the frontend.

**M2. Backend: note/attachment validator factory**
- *Issue:* 4 near-identical express-validator chains (~90 duplicated lines).
- *Solution:* `buildAddNoteValidation(entityLabel, idParam)` etc. in `src/validators/noteValidators.ts`.
- *Files:* new `src/validators/noteValidators.ts`; `routes/interviews.ts`, `routes/placements.ts`, `routes/businessPartners.ts`, `routes/recruiter.ts`.
- *Risk:* **Low** — mechanical, only the message string differs per call site.
- *Effort:* ~1 hour.
- *Benefit:* ~90 lines removed; pairs naturally with H3 (do them together).

**M3. Migrate `CandidateDetail.tsx`/`JobDetail.tsx` to shared `NotesPanel`/`DocumentsPanel`**
- *Issue:* Both pages hand-roll their own Notes and Documents tabs instead of using the components 4 other detail pages already share, and both have an identical dormant filter/sort/search bug as a result.
- *Solution:* Swap the hand-rolled tab content for `<NotesPanel>`/`<DocumentsPanel>` exactly as already done on `InterviewDetail.tsx`/`PlacementDetail.tsx`/`SubmissionDetail.tsx`/`BusinessPartnerDetail.tsx`.
- *Files:* `pages/CandidateDetail.tsx`, `pages/JobDetail.tsx` (both currently the #1 and #4 largest files in the frontend).
- *Risk:* **Medium** — these are the two largest, most-trafficked detail pages; needs careful live verification of add/edit/delete note and document-upload flows on both before considering done.
- *Effort:* ~4-5 hours including verification (this also happens to fix the dormant filter bug as a side effect — worth calling out to you separately as a bug fix, not just cleanup).
- *Benefit:* ~300-350 lines removed + 2 bug fixes.

**M4. Frontend: shared formatter functions, `useLocalStorage`, pagination constants, `PaginatedResponse<T,K>` generic**
- *Issue:* `formatDate`/`formatDateTime`/`getPriorityColor`/currency formatting duplicated 3-4× each; 3 independent "detail-page personalization" localStorage implementations; inconsistent page-size defaults; 6 hand-rolled paginated-response interfaces duplicating an existing-but-unused generic.
- *Solution:* Consolidate into `src/lib/format.ts` (extend, don't replace), a new `useLocalStorage` hook, a `DEFAULT_PAGE_SIZE` constant, and fixing `PaginatedResponse<T,K>`'s generic shape.
- *Files:* `services/businessPartnerService.ts`, `interviewService.ts`, `placementService.ts`, `jobService.ts`, `vendorService.ts`, `recruiterService.ts`, `dashboardService.ts`; `pages/CandidateDetail.tsx`, `JobDetail.tsx`, `BusinessPartnerDetail.tsx`; `lib/api.ts`.
- *Risk:* **Low** — these are small, independent, easily-verified swaps; can be done incrementally and individually.
- *Effort:* ~3-4 hours total across all four sub-items.
- *Benefit:* ~225 lines removed; fixes the `JobDetail.tsx` personalization-save inconsistency found during research as a side effect.

**M5. Frontend: `<NavigationCardGrid>`, `<DetailPageHeader>`, `<EmptyState>`, `<PageLoadingState>`, `<ActionsMenu>`, `useConfirmDelete`**
- *Issue:* 6 distinct UI shapes (stat-card grid, page header, empty state, loading spinner, actions dropdown trigger, confirm-delete flow) each duplicated 4-6× with minor variance.
- *Solution:* 5 presentational components + 1 hook, each a thin wrapper around the existing shadcn primitives already in use.
- *Files:* new components in `src/components/`; touches `pages/Jobs.tsx`, `Submissions.tsx`, `Interviews.tsx`, `BusinessPartners.tsx`, `Placements.tsx`, `Candidates.tsx`, and detail-page equivalents.
- *Risk:* **Low-medium** — purely presentational, but touches many files; do one component at a time, verify visually after each (per your "no UI/UX change" constraint — these are pixel-for-pixel extractions of existing JSX, not redesigns, so this should be the easiest of all the items to verify by screenshot diff).
- *Effort:* ~1 day total across all 6 sub-items, spread across sessions.
- *Benefit:* ~330 lines removed; biggest *consistency* win in the audit (e.g. fixes BusinessPartnerDetail's missing active-tab styling, the two detail pages with no loading spinner, etc.) — several of these "duplication" fixes are simultaneously fixing small inconsistency bugs.

**M6. Backend: `monthGroupExpr()` date-grouping helper**
- *Issue:* The 3-way sqlite/postgres/mysql dialect-detection SQL expression is copy-pasted in 2 stats functions.
- *Solution:* Extract to `src/utils/dateGrouping.ts`.
- *Files:* new util file; `controllers/placementController.ts`, `controllers/businessPartnerController.ts`.
- *Risk:* **Low.**
- *Effort:* ~30 min.
- *Benefit:* ~12 lines removed; removes drift risk in genuinely fragile multi-dialect SQL-generation code.

**M7. Backend: split `recruiterController.ts` (1,871 lines) by existing seams**
- *Issue:* One controller file covers jobs, submissions, tasks, profitability, and sourcing — and partially duplicates `jobController.ts`'s job CRUD.
- *Solution:* Move task-related functions to a new `taskController.ts`, profitability functions to `jobProfitabilityController.ts`, keeping imports/route wiring otherwise unchanged (pure file-organization move, zero logic change).
- *Files:* `controllers/recruiterController.ts` (split), new `controllers/taskController.ts`, `controllers/jobProfitabilityController.ts`, plus updated imports in `routes/recruiter.ts`.
- *Risk:* **Medium** — purely mechanical (move functions, update imports) but touches a high-traffic file; do as a dedicated, isolated commit with a full regression smoke-test of jobs/tasks/profitability endpoints, not bundled with any other change.
- *Effort:* ~2-3 hours.
- *Benefit:* No line reduction (it's a move, not a dedup) but meaningfully improves navigability of the largest backend file.

### Low Priority (nice-to-have, do opportunistically)

**L1.** Fix the correctness bug: add DECIMAL→number coercion getters to `Job.salary_min/salary_max/
bill_rate_min/bill_rate_max`, `Candidate.current_salary/expected_salary`, `BusinessPartner.annual_revenue`,
`Submission.expected_salary` (mirrors the existing fix on `Placement`). *Risk: low-medium (changes runtime
values from string to number — needs a check of every consumer that currently does string-coercion workarounds
manually, so they don't double-coerce). Effort: ~1 hour + grep for existing manual `parseFloat`/`Number()`
workarounds to remove. Benefit: closes a real latent bug class.* — Flagging as **low priority only because
no live bug report exists yet**, not because the risk is low; happy to bump this to high priority if you'd
rather fix it proactively.

**L2.** Collapse `middleware/validate.ts` into `middleware/validation.ts` (delete the redundant re-export,
standardize all route imports on one path). *Risk: very low. Effort: ~20 min.*

**L3.** Fix 2 call sites using `require("sequelize")` instead of the already-imported `Sequelize` in
`businessPartnerController.ts:466,475`. *Risk: very low. Effort: 5 min.*

**L4.** Pick one canonical name among `auth`/`protect`/`authenticate` in `middleware/auth.ts` and update imports
repo-wide. *Risk: low (purely a rename). Effort: ~30 min.*

**L5.** `useDebounce` hook, extracted pre-emptively from the one existing inline instance in `Submissions.tsx`,
so the next live-search feature doesn't copy-paste it again. *Risk: very low. Effort: ~20 min. Benefit: small now, prevents future duplication.*

**L6.** `MAX_PAGE_SIZE = 100` constant replacing 13 hardcoded call sites. *Risk: very low. Effort: ~20 min.*

---

## 9. Estimated Code Reduction

| Bucket | Lines | % of 93,174 total |
|---|---|---|
| Dead-code deletion (H1) | ~8,960 | ~9.6% |
| Frontend hook/component/util extraction (M1, M3, M4, M5, H5) | ~3,267 | ~3.5% |
| Backend extraction (H3, H4, M2, M6) | ~617 | ~0.7% |
| **Total** | **~12,840** | **~13.8%** |

(H2 and L1-L6 are correctness/performance/organization fixes, not line-reduction items, and are excluded from
this table on purpose.)

---

## 10. Estimated Maintainability Improvement

This isn't a number that can be rigorously computed the way line-reduction can — treat the following as a
qualitative, evidence-backed judgment rather than a precise metric:

- **High improvement, 3 specific mechanisms:**
  1. Note/attachment CRUD (H3) currently requires a *coordinated* edit across 4 (interview/placement/
     business-partner/submission) — soon to be more, as more entities likely get notes — controller files for
     any bug fix or new field. After H3, it's 1 file.
  2. The hook-factory work (M1) removes the largest remaining copy-paste surface in the frontend — currently,
     a new domain (the next one added after business-partners) would mean copy-pasting ~250-450 lines of
     hook boilerplate yet again; after M1, it's a ~15-line wrapper.
  3. H2 (AuthContext memoization) is a single-line-equivalent fix with app-wide performance implications —
     disproportionate benefit-to-effort.
- **Medium improvement:** the presentational-component extractions (M5) mostly fix *visual inconsistencies*
  that already exist between pages (missing loading spinners, missing active-tab styling) as a side effect of
  deduplication — this is a real maintainability win (one component to fix instead of 5) but a smaller one than
  the data-layer items above.
- **Caveat:** none of this changes what the app *does* — by design, per your constraints. The improvement is
  entirely in how much code a future change touches, not in new capability.

---

## Next Steps

This is the audit + roadmap only — **no code has been touched**. Per your process, I'll wait for you to tell me
which item(s) to implement and in what order. My recommendation, if useful: start with **H1 (delete dead
code)** since it's the highest-value, lowest-risk item and requires no design decisions, then **H2 (AuthContext
memo)** since it's a 15-minute fix with outsized benefit, then move into H3-H5 one at a time with verification
after each, before tackling the larger M1 hook-factory work last (since it benefits from the team/you being
comfortable with the verification rhythm on the smaller items first).
