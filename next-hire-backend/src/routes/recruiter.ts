import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getProfile,
  updateProfile,
  createJob,
  updateJob,
  listJobs,
  exportJobsCsv,
  getJobDetails,
  getJobSubmissions,
  getSubmissionDetails,
  updateSubmissionStatus,
  addJobNote,
  addJobAttachment,
  getJobProfitability,
  updateJobProfitability,
  addSubmissionNote,
  addSubmissionAttachment,
  scheduleInterview,
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
  sourceCandidates,
  listTeamMembers,
  getPayRatePrompt,
  updatePayRatePrompt,
  reestimateJobPayRate,
} from "../controllers/recruiterController";
import { authenticate, recruiterOnly } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { documentUpload } from "../middleware/upload";

const router = Router();

// Apply authentication and recruiter role check to all routes
router.use(authenticate);
router.use(recruiterOnly);

// Validation rules
const updateProfileValidation = [
  body("first_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("First name must be less than 100 characters"),
  body("last_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Last name must be less than 100 characters"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("company_website")
    .optional()
    .isURL()
    .withMessage("Company website must be valid URL"),
];

const createJobValidation = [
  body("title")
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage("Job title is required and must be less than 200 characters"),
  body("description").notEmpty().withMessage("Job description is required"),
  body("company_name").optional({ nullable: true }).isString(),
  body("business_partner_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid client (business partner) ID is required"),
  body().custom((value) => {
    if (!value.company_name?.trim() && !value.business_partner_id) {
      throw new Error("A client is required");
    }
    return true;
  }),
  body("client_contact_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid client contact ID is required"),
  body("primary_recruiter_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid primary recruiter ID is required"),
  body("account_manager_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid account manager ID is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("job_type")
    .isIn(["full_time", "part_time", "contract", "temporary"])
    .withMessage("Valid job type is required"),
  body("salary_min")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  body("salary_max")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  body("bill_rate_min")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum bill rate must be positive"),
  body("bill_rate_max")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum bill rate must be positive"),
  body("experience_min")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Minimum experience must be non-negative"),
  body("experience_max")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Maximum experience must be non-negative"),
  body("required_skills")
    .optional()
    .isArray()
    .withMessage("Required skills must be an array"),
  body("preferred_skills")
    .optional()
    .isArray()
    .withMessage("Preferred skills must be an array"),
  body("work_schedule")
    .optional({ nullable: true })
    .isIn(["day_shift", "night_shift", "rotating_shift", "flexible"])
    .withMessage("Invalid work schedule"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("positions_available")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Positions available must be at least 1"),
  body("vendor_eligible")
    .optional()
    .isBoolean()
    .withMessage("Vendor eligible must be boolean"),
  body("remote_work_allowed")
    .optional()
    .isBoolean()
    .withMessage("Remote work allowed must be boolean"),
];

const updateJobValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
  body("title")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Job title must be less than 200 characters"),
  body("business_partner_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid client (business partner) ID is required"),
  body("client_contact_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid client contact ID is required"),
  body("primary_recruiter_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid primary recruiter ID is required"),
  body("account_manager_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Valid account manager ID is required"),
  body("salary_min")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  body("salary_max")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  body("bill_rate_min")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum bill rate must be positive"),
  body("bill_rate_max")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum bill rate must be positive"),
  body("status")
    .optional()
    .isIn(["draft", "active", "paused", "closed"])
    .withMessage("Invalid status"),
];

const listJobsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["draft", "active", "paused", "closed"])
    .withMessage("Invalid status"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  query("job_type")
    .optional()
    .isIn(["full_time", "part_time", "contract", "temporary"])
    .withMessage("Invalid job type"),
];

const jobDetailsValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
];

const submissionStatusOptions = [
  "new_candidate",
  "initial_scanning",
  "first_round",
  "technical_round",
  "final_round",
  "hired",
  "rejected",
  "sourcing",
  "submitted",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "interviewed",
  "offered",
];

const getJobSubmissionsValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(submissionStatusOptions)
    .withMessage("Invalid status"),
  query("sort_by")
    .optional()
    .isIn(["submitted_at", "ai_score", "status"])
    .withMessage("Invalid sort field"),
  query("sort_order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Sort order must be ASC or DESC"),
];

const submissionDetailsValidation = [
  param("submissionId").isUUID().withMessage("Valid submission ID is required"),
];

const noteValidation = [
  body("note")
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage("Note is required and must be less than 2000 characters"),
];

const attachmentValidation = [
  body("url").isURL().withMessage("Attachment url must be valid"),
  body("name")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),
];

const updateSubmissionStatusValidation = [
  param("submissionId").isUUID().withMessage("Valid submission ID is required"),
  body("status")
    .isIn([
      "new_candidate",
      "initial_scanning",
      "first_round",
      "technical_round",
      "final_round",
      "hired",
      "rejected",
      "sourcing",
      "submitted",
      "under_review",
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
    ])
    .withMessage("Valid status is required"),
  body("notes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Notes must be less than 2000 characters"),
];

const scheduleInterviewValidation = [
  param("submissionId").isUUID().withMessage("Valid submission ID is required"),
  body("interviewer_id")
    .optional()
    .isUUID()
    .withMessage("Valid interviewer ID is required"),
  body("interview_type")
    .isIn(["phone", "video", "in_person", "technical"])
    .withMessage("Valid interview type is required"),
  body("scheduled_at")
    .isISO8601()
    .withMessage("Valid scheduled date is required"),
  body("duration_minutes")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
];

const createTaskValidation = [
  body("title")
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage("Task title is required and must be less than 200 characters"),
  body("assigned_to")
    .optional()
    .isUUID()
    .withMessage("Valid assigned user ID is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Valid due date is required"),
  body("job_id").optional().isUUID().withMessage("Valid job ID is required"),
  body("submission_id")
    .optional()
    .isUUID()
    .withMessage("Valid submission ID is required"),
];

const listTasksValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["pending", "in_progress", "completed", "cancelled"])
    .withMessage("Invalid status"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  query("job_id").optional().isUUID().withMessage("Valid job ID is required"),
  query("submission_id").optional().isUUID().withMessage("Valid submission ID is required"),
];

const updateTaskStatusValidation = [
  param("taskId").isUUID().withMessage("Valid task ID is required"),
  body("status")
    .isIn(["pending", "in_progress", "completed", "cancelled"])
    .withMessage("Valid status is required"),
];

const updateTaskValidation = [
  param("taskId").isUUID().withMessage("Valid task ID is required"),
  body("title")
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage("Task title must be less than 200 characters"),
  body("assigned_to")
    .optional()
    .isUUID()
    .withMessage("Valid assigned user ID is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("status")
    .optional()
    .isIn(["pending", "in_progress", "completed", "cancelled"])
    .withMessage("Invalid status"),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Valid due date is required"),
];

const deleteTaskValidation = [
  param("taskId").isUUID().withMessage("Valid task ID is required"),
];

// Routes

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, validate, updateProfile);

// Team members (for Primary Recruiter / Account Manager / Assigned To dropdowns)
router.get("/team", listTeamMembers);

// AI pay rate estimation prompt (admin/recruiter-editable)
router.get("/settings/pay-rate-prompt", getPayRatePrompt);
router.put(
  "/settings/pay-rate-prompt",
  [body("prompt").trim().notEmpty().withMessage("Prompt text is required")],
  validate,
  updatePayRatePrompt
);

// Job management
router.post("/jobs", createJobValidation, validate, createJob);
router.get("/jobs", listJobsValidation, validate, listJobs);
router.get("/jobs/export", listJobsValidation, validate, exportJobsCsv);
router.get("/jobs/:jobId", jobDetailsValidation, validate, getJobDetails);
router.put("/jobs/:jobId", updateJobValidation, validate, updateJob);
router.post(
  "/jobs/:jobId/notes",
  jobDetailsValidation,
  noteValidation,
  validate,
  addJobNote
);
router.post(
  "/jobs/:jobId/attachments",
  documentUpload.single("file"),
  jobDetailsValidation,
  validate,
  addJobAttachment
);
router.get(
  "/jobs/:jobId/profitability",
  jobDetailsValidation,
  validate,
  getJobProfitability
);
router.put(
  "/jobs/:jobId/profitability",
  jobDetailsValidation,
  validate,
  updateJobProfitability
);
router.post(
  "/jobs/:jobId/estimate-pay-rate",
  jobDetailsValidation,
  validate,
  reestimateJobPayRate
);

// Source candidates into a job's sourcing funnel
router.post(
  "/jobs/:jobId/source-candidates",
  jobDetailsValidation,
  [
    body("candidate_ids").isArray({ min: 1 }).withMessage("candidate_ids must be a non-empty array"),
    body("ai_scores").optional().isObject().withMessage("ai_scores must be an object"),
  ],
  validate,
  sourceCandidates
);

// Submission management
router.get(
  "/jobs/:jobId/submissions",
  getJobSubmissionsValidation,
  validate,
  getJobSubmissions
);
router.get(
  "/submissions/:submissionId",
  submissionDetailsValidation,
  validate,
  getSubmissionDetails
);
router.put(
  "/submissions/:submissionId/status",
  updateSubmissionStatusValidation,
  validate,
  updateSubmissionStatus
);
router.post(
  "/submissions/:submissionId/notes",
  submissionDetailsValidation,
  noteValidation,
  validate,
  addSubmissionNote
);
router.post(
  "/submissions/:submissionId/attachments",
  submissionDetailsValidation,
  attachmentValidation,
  validate,
  addSubmissionAttachment
);

// Interview management
router.post(
  "/submissions/:submissionId/interviews",
  scheduleInterviewValidation,
  validate,
  scheduleInterview
);

// Task management
router.post("/tasks", createTaskValidation, validate, createTask);
router.get("/tasks", listTasksValidation, validate, listTasks);
router.put(
  "/tasks/:taskId/status",
  updateTaskStatusValidation,
  validate,
  updateTaskStatus
);
router.put("/tasks/:taskId", updateTaskValidation, validate, updateTask);
router.delete("/tasks/:taskId", deleteTaskValidation, validate, deleteTask);

export default router;
