import dotenv from "dotenv";
dotenv.config();

import { Op } from "sequelize";
import bcrypt from "bcrypt";
import {
  sequelize,
  applyAssociations,
  User,
  Candidate,
  Recruiter,
  Vendor,
  Job,
  Submission,
  Interview,
  Placement,
} from "../models";
import {
  ensureCandidateCreatedByColumn,
  ensureJobAndSubmissionJsonColumns,
  ensureCandidateSkillsSchema,
} from "../utils/schemaPatcher";
import { logger } from "../utils/logger";

const DEFAULT_PASSWORD = "Password@123";

async function upsertUser(email: string, role: "candidate" | "recruiter" | "vendor") {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    user = await User.create({
      email,
      password: hashedPassword,
      role,
      status: "active",
      email_verified: true,
      email_verified_at: new Date(),
    });
    logger.info(`Created user ${email} (${role})`);
  } else {
    logger.info(`User ${email} (${role}) already exists`);
  }
  return user;
}

async function main() {
  await ensureCandidateCreatedByColumn();
  await ensureJobAndSubmissionJsonColumns();
  await ensureCandidateSkillsSchema();

  applyAssociations();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const recruiterUser = await upsertUser("recruiter_demo@next-hire.com", "recruiter");
  const candidateUser = await upsertUser("candidate_demo@next-hire.com", "candidate");
  const vendorUser = await upsertUser("vendor_demo@next-hire.com", "vendor");

  const [recruiter] = await Recruiter.findOrCreate({
    where: { user_id: recruiterUser.id },
    defaults: {
      user_id: recruiterUser.id,
      first_name: "Rita",
      last_name: "Recruiter",
      phone: "+1-555-1000",
    },
  });

  const [candidate] = await Candidate.findOrCreate({
    where: { user_id: candidateUser.id },
    defaults: {
      user_id: candidateUser.id,
      first_name: "Carl",
      last_name: "Candidate",
      phone: "+1-555-2000",
      experience_years: 5,
      location: "Remote",
      availability_status: "available",
      created_by: recruiterUser.id,
    },
  });

  const [vendor] = await Vendor.findOrCreate({
    where: { user_id: vendorUser.id },
    defaults: {
      user_id: vendorUser.id,
      company_name: "Vendor Co",
      contact_person_name: "Vicky Vendor",
      phone: "+1-555-3000",
      status: "approved",
    },
  });

  const jobYear = new Date().getFullYear();
  const jobCount = await Job.count({
    where: {
      job_id: {
        [Op.like]: `JOB-${jobYear}-%`,
      },
    },
  });
  const jobId = `JOB-${jobYear}-${String(jobCount + 1).padStart(3, "0")}`;

  const [job] = await Job.findOrCreate({
    where: { title: "Full Stack Engineer (Demo)", created_by: recruiterUser.id },
    defaults: {
      job_id: jobId,
      created_by: recruiterUser.id,
      assigned_to: recruiterUser.id,
      title: "Full Stack Engineer (Demo)",
      description: "Demo job for seeding flows.",
      company_name: "Next Hire Demo",
      location: "Remote",
      job_type: "full_time",
      salary_min: 90000,
      salary_max: 130000,
      salary_currency: "USD",
      status: "active",
      remote_work_allowed: true,
      vendor_eligible: true,
      required_skills: ["typescript", "react", "node"],
      preferred_skills: ["aws", "docker"],
      positions_available: 1,
      priority: "medium",
    },
  });

  const [submission] = await Submission.findOrCreate({
    where: { job_id: job.id, candidate_id: candidate.id },
    defaults: {
      job_id: job.id,
      candidate_id: candidate.id,
      submitted_by: candidateUser.id,
      status: "submitted",
      expected_salary: 110000,
      cover_letter: "Excited to join!",
      submitted_at: new Date(),
    },
  });

  const [interview] = await Interview.findOrCreate({
    where: { submission_id: submission.id },
    defaults: {
      submission_id: submission.id,
      interview_type: "video",
      scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration_minutes: 60,
      meeting_link: `https://meet.jit.si/next-hire-${submission.id}`,
      interviewer_id: recruiterUser.id,
      notes: "Initial demo interview",
      status: "scheduled",
      created_by: recruiterUser.id,
    },
  });

  // Placement demo (offered -> hired)
  const year = new Date().getFullYear();
  const count = await Placement.count({
    where: {
      placement_id: {
        [Op.like]: `PL-${year}-%`,
      },
    },
  });
  const placementId = `PL-${year}-${String(count + 1).padStart(3, "0")}`;

  const [placement] = await Placement.findOrCreate({
    where: { submission_id: submission.id },
    defaults: {
      placement_id: placementId,
      job_id: job.id,
      candidate_id: candidate.id,
      submission_id: submission.id,
      recruiter_id: recruiterUser.id,
      vendor_id: vendorUser.id, // tie vendor to show vendor flow; remove if not needed
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      placement_type: "permanent",
      salary: 120000,
      salary_currency: "USD",
      status: "active",
      location: job.location,
      work_arrangement: "remote",
      onboarding_status: "in_progress",
      created_by: recruiterUser.id,
    },
  });

  logger.info("Seed complete:");
  logger.info(`Recruiter: ${recruiterUser.email}`);
  logger.info(`Candidate: ${candidateUser.email}`);
  logger.info(`Vendor: ${vendorUser.email}`);
  logger.info(`Job: ${job.title} (${job.id})`);
  logger.info(`Submission: ${submission.id}`);
  logger.info(`Interview: ${interview.id}`);
  logger.info(`Placement: ${placement.placement_id}`);
}

main()
  .then(() => {
    logger.info("Demo data ready. Default password: Password@123");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

