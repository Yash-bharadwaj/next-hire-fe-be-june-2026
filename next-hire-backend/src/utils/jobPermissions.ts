interface JobStaffFields {
  created_by?: string;
  assigned_to?: string | null;
  primary_recruiter_id?: string | null;
  account_manager_id?: string | null;
}

// A job's "staff" - anyone who should be able to manage it and its
// submissions: whoever created it, is generally assigned to it, sources for
// it, or owns the client relationship. Centralized so every permission check
// across the recruiter and submission controllers stays in sync as staffing
// fields are added - assigned_to alone used to be the only check;
// primary_recruiter_id/account_manager_id were added later, and duplicating
// this check inline at each call site is exactly how a couple of them got
// missed.
export const isJobStaff = (
  job: JobStaffFields | null | undefined,
  userId?: string
): boolean => {
  if (!job || !userId) return false;
  return [job.created_by, job.assigned_to, job.primary_recruiter_id, job.account_manager_id].includes(
    userId
  );
};
