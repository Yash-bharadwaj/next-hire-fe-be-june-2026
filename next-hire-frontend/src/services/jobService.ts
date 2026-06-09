import api, { apiClient } from "@/lib/api";

export type JobType = "full_time" | "part_time" | "contract" | "temporary";
export type JobStatus = "draft" | "active" | "paused" | "closed";
export type JobPriority = "low" | "medium" | "high";

export interface Job {
  id: string;
  job_id: string;
  title: string;
  description: string;
  external_description?: string;
  company_name: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
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
  submission_count?: number;
  vendor_eligible: boolean;
  remote_work_allowed: boolean;
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
      company_name: string;
    };
  };
}

export interface JobSearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  job_type?: JobType;
  status?: JobStatus;
  priority?: JobPriority;
  vendor_eligible?: boolean;
  salary_min?: number;
  salary_max?: number;
  experience_min?: number;
  experience_max?: number;
  remote_work_allowed?: boolean;
  skills?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  external_description?: string;
  company_name: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
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

export interface JobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
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

export interface SingleJobResponse {
  success: boolean;
  data: {
    job: Job;
  };
  message?: string;
}

class JobService {
  private baseUrl = "/jobs";

  // Public job search (no auth required)
  async searchJobs(filters: JobSearchFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    // Backend already returns pagination in the correct shape here
    return response.data;
  }

  // Get job by ID (public)
  async getJobById(id: string, isPublic: boolean = true): Promise<SingleJobResponse> {
    const endpoint = isPublic ? `${this.baseUrl}/${id}/public` : `${this.baseUrl}/${id}`;
    const response = await apiClient.get(endpoint);
    return response.data;
  }

  // Recruiter-specific methods
  async createJob(data: CreateJobRequest): Promise<SingleJobResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateJob(id: string, data: UpdateJobRequest): Promise<SingleJobResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getRecruiterJobs(filters: JobSearchFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/recruiter/jobs?${params.toString()}`);
    const apiData = response.data;

    const raw = apiData.data?.pagination || {};
    const currentPage = Number(
      raw.currentPage ?? raw.current_page ?? filters.page ?? 1
    );
    const totalPages = Number(raw.totalPages ?? raw.total_pages ?? 1);
    const totalItems = Number(raw.totalItems ?? raw.total_items ?? 0);
    const itemsPerPage = Number(
      raw.itemsPerPage ?? raw.items_per_page ?? filters.limit ?? 10
    );

    return {
      success: apiData.success,
      data: {
        jobs: apiData.data?.jobs || [],
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    };
  }

  // Export recruiter jobs as CSV
  async exportRecruiterJobs(filters: JobSearchFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    // Recruiter export endpoint lives under /recruiter/jobs/export
    const response = await api.get(`/recruiter/jobs/export`, {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  }

  // Vendor-specific methods
  async getVendorEligibleJobs(filters: JobSearchFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/vendor/jobs?${params.toString()}`);
    const apiData = response.data;

    const raw = apiData.data?.pagination || {};
    const currentPage = Number(
      raw.currentPage ?? raw.current_page ?? filters.page ?? 1
    );
    const totalPages = Number(raw.totalPages ?? raw.total_pages ?? 1);
    const totalItems = Number(raw.totalItems ?? raw.total_items ?? 0);
    const itemsPerPage = Number(
      raw.itemsPerPage ?? raw.items_per_page ?? filters.limit ?? 10
    );

    return {
      success: apiData.success,
      data: {
        jobs: apiData.data?.jobs || [],
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    };
  }

  // Helper methods
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
      return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)}`;
    } else if (job.salary_min) {
      return `From ${formatAmount(job.salary_min)}`;
    } else {
      return `Up to ${formatAmount(job.salary_max!)}`;
    }
  }

  formatExperienceRange(job: Job): string {
    if (!job.experience_min && !job.experience_max) return "Experience not specified";
    
    if (job.experience_min && job.experience_max) {
      return `${job.experience_min}-${job.experience_max} years`;
    } else if (job.experience_min) {
      return `${job.experience_min}+ years`;
    } else {
      return `Up to ${job.experience_max} years`;
    }
  }

  formatJobType(jobType: JobType): string {
    const typeMap: Record<JobType, string> = {
      full_time: "Full-time",
      part_time: "Part-time",
      contract: "Contract",
      temporary: "Temporary",
    };
    return typeMap[jobType] || jobType;
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

  // Backward-compatible alias used by some components
  getStatusColor(status: JobStatus): string {
    return this.getJobStatusColor(status);
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

export const jobService = new JobService();
