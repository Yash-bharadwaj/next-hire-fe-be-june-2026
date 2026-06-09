import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";

// Types for recruiter profile
export interface RecruiterProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  location?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateRecruiterProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_website?: string;
}

export interface RecruiterProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      status: string;
      email_verified: boolean;
    };
    profile: RecruiterProfile;
  };
}

// Job types
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
}

export interface CreateJobRequest {
  title: string;
  description: string;
  external_description?: string;
  company_name: string;
  location: string;
  job_type: JobType;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  experience_min?: number;
  experience_max?: number;
  required_skills?: string[];
  preferred_skills?: string[];
  education_requirements?: string;
  status?: JobStatus;
  priority?: JobPriority;
  positions_available?: number;
  max_submissions_allowed?: number;
  vendor_eligible?: boolean;
  remote_work_allowed?: boolean;
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  assigned_to?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {}

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
  vendor_id?: string;
  cover_letter?: string;
  expected_salary?: number;
  availability_date?: string;
  status: SubmissionStatus;
  ai_score?: number;
  notes?: string;
  submitted_at: string;
  updated_at: string;
  job?: Job;
  candidate?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    resume_url?: string;
    experience_years?: number;
    skills?: string[];
  };
}

export interface UpdateSubmissionStatusRequest {
  status: SubmissionStatus;
  notes?: string;
}

// Interview types
export type InterviewType = "phone" | "video" | "in_person" | "technical";

export interface Interview {
  id: string;
  submission_id: string;
  interviewer_id?: string;
  interview_type: InterviewType;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  meeting_url?: string;
  notes?: string;
  feedback?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  created_at: string;
  updated_at: string;
  submission?: Submission;
}

export interface ScheduleInterviewRequest {
  interviewer_id?: string;
  interview_type: InterviewType;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  meeting_url?: string;
  notes?: string;
}

// Task types
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  job_id?: string;
  submission_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: TaskPriority;
  due_date?: string;
  job_id?: string;
  submission_id?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

// API Response types
export interface JobsResponse extends PaginatedResponse<Job> {}
export interface SubmissionsResponse extends PaginatedResponse<Submission> {}
export interface TasksResponse extends PaginatedResponse<Task> {}

export interface SingleJobResponse {
  success: boolean;
  data: {
    job: Job;
    submission_count?: number;
  };
  message?: string;
}

export interface SingleSubmissionResponse {
  success: boolean;
  data: Submission;
  message?: string;
}

export interface SingleInterviewResponse {
  success: boolean;
  data: Interview;
  message?: string;
}

export interface SingleTaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}

class RecruiterService {
  /**
   * Get recruiter profile
   */
  async getProfile(): Promise<RecruiterProfileResponse> {
    try {
      const response = await apiClient.get<RecruiterProfileResponse>("/recruiter/profile");
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update recruiter profile
   */
  async updateProfile(data: UpdateRecruiterProfileRequest): Promise<ApiResponse<RecruiterProfile>> {
    try {
      const response = await apiClient.put<ApiResponse<RecruiterProfile>>("/recruiter/profile", data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new job
   */
  async createJob(data: CreateJobRequest): Promise<SingleJobResponse> {
    try {
      const response = await apiClient.post<SingleJobResponse>("/recruiter/jobs", data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recruiter's jobs
   */
  async getJobs(filters: {
    page?: number;
    limit?: number;
    status?: JobStatus;
    priority?: JobPriority;
    job_type?: JobType;
  } = {}): Promise<JobsResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<JobsResponse>(`/recruiter/jobs?${params.toString()}`);
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
      const response = await apiClient.get<SingleJobResponse>(`/recruiter/jobs/${jobId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update job
   */
  async updateJob(jobId: string, data: UpdateJobRequest): Promise<SingleJobResponse> {
    try {
      const response = await apiClient.put<SingleJobResponse>(`/recruiter/jobs/${jobId}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get submissions for a job
   */
  async getJobSubmissions(jobId: string, filters: {
    page?: number;
    limit?: number;
    status?: SubmissionStatus;
    sort_by?: "submitted_at" | "ai_score" | "status";
    sort_order?: "ASC" | "DESC";
  } = {}): Promise<SubmissionsResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<SubmissionsResponse>(`/recruiter/jobs/${jobId}/submissions?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get submission details
   */
  async getSubmissionDetails(submissionId: string): Promise<SingleSubmissionResponse> {
    try {
      const response = await apiClient.get<SingleSubmissionResponse>(`/recruiter/submissions/${submissionId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(submissionId: string, data: UpdateSubmissionStatusRequest): Promise<SingleSubmissionResponse> {
    try {
      const response = await apiClient.put<SingleSubmissionResponse>(`/recruiter/submissions/${submissionId}/status`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add note to submission
   */
  async addSubmissionNote(submissionId: string, note: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/recruiter/submissions/${submissionId}/notes`, { note });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add attachment to submission
   */
  async addSubmissionAttachment(
    submissionId: string,
    data: { url: string; name?: string }
  ): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/recruiter/submissions/${submissionId}/attachments`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(submissionId: string, data: ScheduleInterviewRequest): Promise<SingleInterviewResponse> {
    try {
      const response = await apiClient.post<SingleInterviewResponse>(`/recruiter/submissions/${submissionId}/interviews`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add note to job
   */
  async addJobNote(jobId: string, note: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/recruiter/jobs/${jobId}/notes`, { note });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add attachment to job
   */
  async addJobAttachment(jobId: string, data: { url: string; name?: string }): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/recruiter/jobs/${jobId}/attachments`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create task
   */
  async createTask(data: CreateTaskRequest): Promise<SingleTaskResponse> {
    try {
      const response = await apiClient.post<SingleTaskResponse>("/recruiter/tasks", data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get tasks
   */
  async getTasks(filters: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
  } = {}): Promise<TasksResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<TasksResponse>(`/recruiter/tasks?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, data: UpdateTaskStatusRequest): Promise<SingleTaskResponse> {
    try {
      const response = await apiClient.put<SingleTaskResponse>(`/recruiter/tasks/${taskId}/status`, data);
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

  getPriorityColor(priority: JobPriority | TaskPriority): string {
    const colorMap: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  }
}

// Export singleton instance
export const recruiterService = new RecruiterService();
export default recruiterService;
