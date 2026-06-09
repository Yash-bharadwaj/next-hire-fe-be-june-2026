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
  addSubmissionNote,
  addSubmissionAttachment,
  scheduleInterview,
  createTask,
  listTasks,
  updateTaskStatus,
} from "../controllers/recruiterController";
import { authenticate, recruiterOnly } from "../middleware/auth";
import { validate } from "../middleware/validation";

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
  body("company_name").notEmpty().withMessage("Company name is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("job_type")
    .isIn(["full_time", "part_time", "contract", "temporary"])
    .withMessage("Valid job type is required"),
  body("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  body("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  body("experience_min")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum experience must be non-negative"),
  body("experience_max")
    .optional()
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
  body("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  body("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
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
    .isIn([
      "submitted",
      "under_review",
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
      "hired",
      "rejected",
    ])
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
      "submitted",
      "under_review",
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
      "hired",
      "rejected",
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
];

const updateTaskStatusValidation = [
  param("taskId").isUUID().withMessage("Valid task ID is required"),
  body("status")
    .isIn(["pending", "in_progress", "completed", "cancelled"])
    .withMessage("Valid status is required"),
];

// Routes

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, validate, updateProfile);

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
  jobDetailsValidation,
  attachmentValidation,
  validate,
  addJobAttachment
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

export default router;
