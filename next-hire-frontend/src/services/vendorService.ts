import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";

// Types for vendor profile
export interface VendorProfile {
  id: string;
  user_id: string;
  company_name?: string;
  company_website?: string;
  contact_person_name?: string;
  phone?: string;
  location?: string;
  specializations?: string[];
  years_in_business?: number;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateVendorProfileRequest {
  company_website?: string;
  contact_person_name?: string;
  phone?: string;
  specializations?: string[];
  years_in_business?: number;
}

export interface VendorProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      status: string;
      email_verified: boolean;
    };
    profile: VendorProfile;
  };
}

// Job types (reused from recruiter service)
export type JobType = "full_time" | "part_time" | "contract" | "temporary";
export type JobStatus = "draft" | "active" | "paused" | "closed";
export type JobPriority = "low" | "medium" | "high";

export interface Job {
  id: string;
  title: string;
  description: string;
  external_description?: string;
  company_name: string;
  location: string;
  job_type: JobType;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  experience_min?: number;
  experience_max?: number;
  required_skills: string[];
  preferred_skills?: string[];
  education_requirements?: string;
  status: JobStatus;
  priority: JobPriority;
  positions_available: number;
  max_submissions_allowed?: number;
  vendor_eligible: boolean;
  remote_work_allowed: boolean;
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  total_submissions?: number;
  vendor_submissions?: number;
}

// Candidate types
export interface Candidate {
  id: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  current_salary?: number;
  expected_salary?: number;
  experience_years?: number;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[];
  availability_status: "available" | "not_available" | "interviewing";
  created_by: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    status?: string;
  };
}

export interface CreateCandidateRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  current_salary?: number;
  expected_salary?: number;
  experience_years?: number;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[];
  bio?: string;
}

// Submission types
export type SubmissionStatus =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview_scheduled"
  | "interviewed"
  | "offered"
  | "hired"
  | "rejected";

export interface Submission {
  id: string;
  job_id: string;
  candidate_id: string;
  vendor_id: string;
  cover_letter?: string;
  expected_salary?: number;
  availability_date?: string;
  notes?: string;
  status: SubmissionStatus;
  ai_score?: number;
  submitted_at: string;
  updated_at: string;
  job?: Job;
  candidate?: Candidate;
}

export interface SubmitCandidateRequest {
  candidate_id: string;
  cover_letter?: string;
  expected_salary?: number;
  availability_date?: string;
  notes?: string;
}

// API Response types
export interface JobsResponse extends PaginatedResponse<Job> {}
export interface CandidatesResponse extends PaginatedResponse<Candidate> {}
export interface SubmissionsResponse extends PaginatedResponse<Submission> {}

export interface SingleJobResponse {
  success: boolean;
  data: Job;
  message?: string;
}

export interface SingleCandidateResponse {
  success: boolean;
  data: Candidate;
  message?: string;
}

export interface SingleSubmissionResponse {
  success: boolean;
  data: Submission;
  message?: string;
}

class VendorService {
  /**
   * Get vendor profile
   */
  async getProfile(): Promise<VendorProfileResponse> {
    try {
      const response = await apiClient.get<VendorProfileResponse>(
        "/vendor/profile"
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update vendor profile
   */
  async updateProfile(
    data: UpdateVendorProfileRequest
  ): Promise<ApiResponse<VendorProfile>> {
    try {
      const response = await apiClient.put<ApiResponse<VendorProfile>>(
        "/vendor/profile",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vendor-eligible jobs
   */
  async getJobs(
    filters: {
      page?: number;
      limit?: number;
      salary_min?: number;
      salary_max?: number;
      experience_min?: number;
      experience_max?: number;
      location?: string;
      skills?: string;
      search?: string;
      job_type?: JobType;
      remote_work_allowed?: boolean;
    } = {}
  ): Promise<JobsResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<JobsResponse>(
        `/vendor/jobs?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get job details
   */
  async getJobDetails(jobId: string): Promise<SingleJobResponse> {
    try {
      const response = await apiClient.get<SingleJobResponse>(
        `/vendor/jobs/${jobId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit candidate to job
   */
  async submitCandidate(
    jobId: string,
    data: SubmitCandidateRequest
  ): Promise<SingleSubmissionResponse> {
    try {
      const response = await apiClient.post<SingleSubmissionResponse>(
        `/vendor/jobs/${jobId}/submit`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vendor's submissions
   */
  async getSubmissions(
    filters: {
      page?: number;
      limit?: number;
      status?: SubmissionStatus;
      job_id?: string;
    } = {}
  ): Promise<SubmissionsResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<SubmissionsResponse>(
        `/vendor/submissions?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get submission status
   */
  async getSubmissionStatus(
    submissionId: string
  ): Promise<SingleSubmissionResponse> {
    try {
      const response = await apiClient.get<SingleSubmissionResponse>(
        `/vendor/submissions/${submissionId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create candidate
   */
  async createCandidate(
    data: CreateCandidateRequest
  ): Promise<SingleCandidateResponse> {
    try {
      const response = await apiClient.post<SingleCandidateResponse>(
        "/vendor/candidates",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vendor's candidates
   */
  async getCandidates(
    filters: {
      page?: number;
      limit?: number;
      experience_min?: number;
      experience_max?: number;
      availability_status?: "available" | "not_available" | "interviewing";
      skills?: string;
      search?: string;
    } = {}
  ): Promise<CandidatesResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<CandidatesResponse>(
        `/vendor/candidates?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.errors?.length > 0) {
      const firstError = error.response.data.errors[0];
      return new Error(firstError.message);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unexpected error occurred");
  }

  // Helper methods
  formatJobType(jobType: JobType): string {
    const typeMap: Record<JobType, string> = {
      full_time: "Full-time",
      part_time: "Part-time",
      contract: "Contract",
      temporary: "Temporary",
    };
    return typeMap[jobType] || jobType;
  }

  formatJobStatus(status: JobStatus): string {
    const statusMap: Record<JobStatus, string> = {
      draft: "Draft",
      active: "Active",
      paused: "Paused",
      closed: "Closed",
    };
    return statusMap[status] || status;
  }

  formatSubmissionStatus(status: SubmissionStatus): string {
    const statusMap: Record<SubmissionStatus, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offered: "Offered",
      hired: "Hired",
      rejected: "Rejected",
    };
    return statusMap[status] || status;
  }

  formatSalaryRange(job: Job): string {
    if (!job.salary_min && !job.salary_max) return "Salary not specified";

    const currency = job.salary_currency || "USD";
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.salary_min && job.salary_max) {
      return `${formatAmount(job.salary_min)} - ${formatAmount(
        job.salary_max
      )}`;
    } else if (job.salary_min) {
      return `From ${formatAmount(job.salary_min)}`;
    } else {
      return `Up to ${formatAmount(job.salary_max!)}`;
    }
  }

  getJobStatusColor(status: JobStatus): string {
    const colorMap: Record<JobStatus, string> = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      closed: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getSubmissionStatusColor(status: SubmissionStatus): string {
    const colorMap: Record<SubmissionStatus, string> = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-purple-100 text-purple-800",
      interview_scheduled: "bg-indigo-100 text-indigo-800",
      interviewed: "bg-cyan-100 text-cyan-800",
      offered: "bg-green-100 text-green-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getPriorityColor(priority: JobPriority): string {
    const colorMap: Record<JobPriority, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  }
}

// Export singleton instance
export const vendorService = new VendorService();
export default vendorService;
