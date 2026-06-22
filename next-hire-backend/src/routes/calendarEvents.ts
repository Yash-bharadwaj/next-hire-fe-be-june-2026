import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../controllers/calendarEventController";

const router = Router();

router.use(auth);

const createEventValidation = [
  body("title").notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("start_time").matches(/^\d{2}:\d{2}$/).withMessage("Start time must be in HH:MM format"),
  body("end_time").matches(/^\d{2}:\d{2}$/).withMessage("End time must be in HH:MM format"),
  body("event_type").optional().isIn(["interview", "meeting", "screening", "call", "deadline", "other"]),
  body("task_type").optional().isIn(["my-task", "follow-up"]),
  body("status").optional().isIn(["confirmed", "pending", "completed"]),
];

const updateEventValidation = [
  param("eventId").isUUID(),
  body("title").optional().notEmpty().isLength({ max: 200 }),
  body("date").optional().isISO8601(),
  body("start_time").optional().matches(/^\d{2}:\d{2}$/),
  body("end_time").optional().matches(/^\d{2}:\d{2}$/),
  body("event_type").optional().isIn(["interview", "meeting", "screening", "call", "deadline", "other"]),
  body("task_type").optional().isIn(["my-task", "follow-up"]),
  body("status").optional().isIn(["confirmed", "pending", "completed"]),
];

router.get(
  "/",
  [query("from").optional().isISO8601(), query("to").optional().isISO8601()],
  validate,
  listCalendarEvents
);
router.post("/", createEventValidation, validate, createCalendarEvent);
router.put("/:eventId", updateEventValidation, validate, updateCalendarEvent);
router.delete("/:eventId", [param("eventId").isUUID()], validate, deleteCalendarEvent);

export default router;
