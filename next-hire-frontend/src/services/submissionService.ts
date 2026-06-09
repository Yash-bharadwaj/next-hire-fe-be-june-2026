import { apiClient } from "@/lib/api";
import { Job } from "./jobService";

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
  submitted_by: string;
  status: SubmissionStatus;
  ai_score?: number;
  notes?: string;
  cover_letter?: string;
  resume_url?: string;
  expected_salary?: number;
  availability_date?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  // Populated for candidates/vendors: latest interview summary (if any)
  latestInterview?: {
    id: string;
    scheduled_at: string;
    meeting_link?: string;
    interview_type?: string;
    duration_minutes?: number;
  };
  job?: Partial<Job>;
  candidate?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    location?: string;
    current_salary?: number;
    expected_salary?: number;
    experience_years?: number;
    skills?: string[];
    resume_url?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    bio?: string;
  };
  submitter?: {
    id: string;
    email: string;
    role: string;
    vendorProfile?: {
      company_name: string;
      contact_name: string;
    };
  };
  reviewer?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface CreateSubmissionRequest {
  job_id: string;
  candidate_id: string;
  cover_letter?: string;
  resume_url?: string;
  expected_salary?: number;
  availability_date?: string;
}

export interface UpdateSubmissionStatusRequest {
  status: SubmissionStatus;
  notes?: string;
}

export interface SubmissionFilters {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  job_id?: string;
  search?: string;
}

export interface SubmissionsResponse {
  success: boolean;
  data: {
    submissions: Submission[];
    job?: Partial<Job>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SingleSubmissionResponse {
  success: boolean;
  data: {
    submission: Submission;
  };
  message?: string;
}

class SubmissionService {
  private baseUrl = "/submissions";

  // Apply to job (for candidates)
  async applyToJob(jobId: string, data: {
    cover_letter?: string;
    expected_salary?: number;
    availability_date?: string;
  }): Promise<SingleSubmissionResponse> {
    try {
      console.log(`Applying to job ${jobId} with data:`, data);
      const response = await apiClient.post(`/candidate/jobs/${jobId}/apply`, data);
      console.log("Application API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Application API error:", error);
      throw error;
    }
  }

  // Create submission (general)
  async createSubmission(data: CreateSubmissionRequest): Promise<SingleSubmissionResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  // Get candidate's applications
  async getCandidateSubmissions(filters: SubmissionFilters = {}): Promise<SubmissionsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/candidate/submissions?${params.toString()}`);
    return response.data;
  }

  // Get vendor's submissions
  async getVendorSubmissions(filters: SubmissionFilters = {}): Promise<SubmissionsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/vendor/my-submissions?${params.toString()}`);
    return response.data;
  }

  // Get submissions for a job (recruiters)
  async getJobSubmissions(jobId: string, filters: SubmissionFilters = {}): Promise<SubmissionsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/job/${jobId}?${params.toString()}`);
    return response.data;
  }

  // Get single submission
  async getSubmissionById(id: string): Promise<SingleSubmissionResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update submission status (recruiters)
  async updateSubmissionStatus(id: string, data: UpdateSubmissionStatusRequest): Promise<SingleSubmissionResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/status`, data);
    return response.data;
  }

  // Withdraw application (candidates)
  async withdrawSubmission(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}/withdraw`);
    return response.data;
  }

  // Helper methods
  getStatusColor(status: SubmissionStatus): string {
    const colorMap: Record<SubmissionStatus, string> = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-indigo-100 text-indigo-800",
      offered: "bg-emerald-100 text-emerald-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getStatusLabel(status: SubmissionStatus): string {
    const labelMap: Record<SubmissionStatus, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offered: "Offered",
      hired: "Hired",
      rejected: "Rejected",
    };
    return labelMap[status] || status;
  }

  getNextPossibleStatuses(currentStatus: SubmissionStatus): SubmissionStatus[] {
    const transitions: Record<SubmissionStatus, SubmissionStatus[]> = {
      submitted: ["under_review", "rejected"],
      under_review: ["shortlisted", "rejected"],
      shortlisted: ["interview_scheduled", "rejected"],
      interview_scheduled: ["interviewed", "rejected"],
      interviewed: ["offered", "rejected"],
      offered: ["hired", "rejected"],
      hired: [],
      rejected: [],
    };
    return transitions[currentStatus] || [];
  }

  canWithdraw(status: SubmissionStatus): boolean {
    return !["hired", "rejected"].includes(status);
  }

  formatSubmissionDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getSubmissionProgress(status: SubmissionStatus): number {
    const progressMap: Record<SubmissionStatus, number> = {
      submitted: 10,
      under_review: 25,
      shortlisted: 40,
      interview_scheduled: 60,
      interviewed: 75,
      offered: 90,
      hired: 100,
      rejected: 0,
    };
    return progressMap[status] || 0;
  }
}

export const submissionService = new SubmissionService();
