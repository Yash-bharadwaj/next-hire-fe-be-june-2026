import { Router } from "express";
import { query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { resolveFile } from "../controllers/fileController";

const router = Router();

router.use(auth);

router.get(
  "/resolve",
  [query("key").notEmpty().withMessage("A file key is required")],
  validate,
  resolveFile
);

export default router;
