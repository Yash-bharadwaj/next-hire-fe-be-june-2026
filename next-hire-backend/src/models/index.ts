// models/index.ts
import { sequelize } from "../config/database";

import { User } from "./User";
import { Candidate } from "./Candidate";
import { Recruiter } from "./Recruiter";
import { Vendor } from "./Vendor";
import { Job } from "./Job";
import { Submission } from "./Submission";
import { Interview } from "./Interview";
import { Placement } from "./Placement";
import { Task } from "./Task";
import { Experience } from "./Experience";
import { Education } from "./Education";
import { CandidateSkill } from "./CandidateSkill";
import { BusinessPartner } from "./BusinessPartner";

let associationsApplied = false;

export function applyAssociations() {
  if (associationsApplied) return;
  associationsApplied = true;

  // User ↔ Profiles
  User.hasOne(Candidate, { foreignKey: "user_id", as: "candidateProfile" });
  User.hasOne(Recruiter, { foreignKey: "user_id", as: "recruiterProfile" });
  User.hasOne(Vendor, { foreignKey: "user_id", as: "vendorProfile" });

  Candidate.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Candidate.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  User.hasMany(Candidate, {
    foreignKey: "created_by",
    as: "createdCandidates",
  });
  Recruiter.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Vendor.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // Jobs
  Job.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  Job.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });

  // Submissions
  Submission.belongsTo(Job, { foreignKey: "job_id", as: "job" });
  Submission.belongsTo(Candidate, {
    foreignKey: "candidate_id",
    as: "candidate",
  });
  Submission.belongsTo(User, { foreignKey: "submitted_by", as: "submitter" });
  Submission.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

  // Interviews
  Interview.belongsTo(Submission, {
    foreignKey: "submission_id",
    as: "submission",
  });
  Interview.belongsTo(User, {
    foreignKey: "interviewer_id",
    as: "interviewer",
  });
  Interview.belongsTo(User, { foreignKey: "created_by", as: "creator" });

  // Placements
  Placement.belongsTo(Job, { foreignKey: "job_id", as: "job" });
  Placement.belongsTo(Candidate, {
    foreignKey: "candidate_id",
    as: "candidate",
  });
  Placement.belongsTo(Submission, {
    foreignKey: "submission_id",
    as: "submission",
  });
  Placement.belongsTo(User, { foreignKey: "recruiter_id", as: "recruiter" });
  Placement.belongsTo(User, { foreignKey: "vendor_id", as: "vendor" });
  Placement.belongsTo(User, { foreignKey: "created_by", as: "creator" });

  // Tasks
  Task.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });
  Task.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  Task.belongsTo(Job, { foreignKey: "job_id", as: "job" });
  Task.belongsTo(Submission, { foreignKey: "submission_id", as: "submission" });

  // Candidate Experience & Education
  Candidate.hasMany(Experience, {
    foreignKey: "candidate_id",
    as: "experiences",
  });
  Experience.belongsTo(Candidate, {
    foreignKey: "candidate_id",
    as: "candidate",
  });

  Candidate.hasMany(Education, { foreignKey: "candidate_id", as: "education" });
  Education.belongsTo(Candidate, {
    foreignKey: "candidate_id",
    as: "candidate",
  });

  // Candidate Skills
  Candidate.hasMany(CandidateSkill, {
    foreignKey: "candidate_id",
    as: "candidateSkills",
  });
  CandidateSkill.belongsTo(Candidate, {
    foreignKey: "candidate_id",
    as: "candidate",
  });

  // Business Partners
  BusinessPartner.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  BusinessPartner.belongsTo(User, {
    foreignKey: "assigned_to",
    as: "assignee",
  });
}

// Export models & sequelize
export {
  User,
  Candidate,
  Recruiter,
  Vendor,
  Job,
  Submission,
  Interview,
  Placement,
  Task,
  Experience,
  Education,
  CandidateSkill,
  BusinessPartner,
  sequelize,
};
