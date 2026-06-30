import { Router } from "express";
import { body, param } from "express-validator";
import { auth, recruiterOrAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  listAssignableUsers,
} from "../controllers/ticketController";

const router = Router();

router.use(auth);

const CATEGORIES = ["Technical", "Bug", "Feature Request", "Performance", "Integration", "Other"];

const createTicketValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("assignee_id").optional().isUUID(),
];

const updateTicketValidation = [
  param("ticketId").isUUID(),
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("description").optional().trim().notEmpty(),
  body("category").optional().isIn(CATEGORIES),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("status").optional().isIn(["open", "in-progress", "resolved", "closed"]),
  body("assignee_id").optional({ nullable: true }).isUUID(),
];

router.get("/", listTickets);
router.get("/assignees", recruiterOrAdmin, listAssignableUsers);
router.post("/", createTicketValidation, validate, createTicket);
router.put("/:ticketId", recruiterOrAdmin, updateTicketValidation, validate, updateTicket);
router.delete("/:ticketId", recruiterOrAdmin, [param("ticketId").isUUID()], validate, deleteTicket);

export default router;
