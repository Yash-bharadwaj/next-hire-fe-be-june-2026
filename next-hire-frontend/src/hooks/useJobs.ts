import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  jobService, 
  Job, 
  JobSearchFilters, 
  CreateJobRequest, 
  UpdateJobRequest 
} from "@/services/jobService";
import { useAuth } from "@/contexts/AuthContext";

export const useJobs = (initialFilters: JobSearchFilters = {}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<JobSearchFilters>(initialFilters);

  const { user } = useAuth();

  const fetchJobsWithFilters = async (searchFilters: JobSearchFilters) => {
    try {
      console.log("useJobs fetchJobs called with filters:", searchFilters);
      console.log("User role:", user?.role);
      
      setLoading(true);
      setError(null);

      let response;

      // Choose the appropriate service method based on user role
      if (user?.role === "recruiter") {
        console.log("Calling getRecruiterJobs with filters:", searchFilters);
        response = await jobService.getRecruiterJobs(searchFilters);
      } else if (user?.role === "vendor") {
        response = await jobService.getVendorEligibleJobs(searchFilters);
      } else {
        // Public search for candidates or unauthenticated users
        response = await jobService.searchJobs(searchFilters);
      }

      console.log("Jobs API response:", response);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
      setFilters(searchFilters);
    } catch (err: any) {
      console.error("Jobs API error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = useCallback((searchFilters: JobSearchFilters) => {
    fetchJobsWithFilters(searchFilters);
  }, [user?.role]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchJobsWithFilters({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [filters, pagination.hasNextPage, pagination.currentPage]);

  const refresh = useCallback(() => {
    fetchJobsWithFilters(filters);
  }, [filters]);

  // Don't auto-load data - let the component decide when to load

  return {
    jobs,
    loading,
    error,
    pagination,
    filters,
    searchJobs,
    loadMore,
    refresh,
    setFilters,
  };
};

export const useJob = (jobId: string | null, isPublic: boolean = true) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await jobService.getJobById(jobId, isPublic);
      setJob(response.data.job);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch job";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId, isPublic]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const refresh = useCallback(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    refresh,
  };
};

export const useJobManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createJob = useCallback(async (data: CreateJobRequest): Promise<Job | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can create jobs");
      return null;
    }

    try {
      setLoading(true);
      const response = await jobService.createJob(data);
      toast.success("Job created successfully!");
      return response.data.job;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create job";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const updateJob = useCallback(async (jobId: string, data: UpdateJobRequest): Promise<Job | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update jobs");
      return null;
    }

    try {
      setLoading(true);
      const response = await jobService.updateJob(jobId, data);
      toast.success("Job updated successfully!");
      return response.data.job;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update job";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can delete jobs");
      return false;
    }

    try {
      setLoading(true);
      await jobService.deleteJob(jobId);
      toast.success("Job deleted successfully!");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete job";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const duplicateJob = useCallback(async (originalJob: Job): Promise<Job | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can duplicate jobs");
      return null;
    }

    const duplicateData: CreateJobRequest = {
      title: `${originalJob.title} (Copy)`,
      description: originalJob.description,
      external_description: originalJob.external_description,
      company_name: originalJob.company_name,
      location: originalJob.location,
      city: originalJob.city,
      state: originalJob.state,
      country: originalJob.country,
      job_type: originalJob.job_type,
      salary_min: originalJob.salary_min,
      salary_max: originalJob.salary_max,
      salary_currency: originalJob.salary_currency,
      experience_min: originalJob.experience_min,
      experience_max: originalJob.experience_max,
      required_skills: originalJob.required_skills,
      preferred_skills: originalJob.preferred_skills,
      education_requirements: originalJob.education_requirements,
      status: "draft", // Always create as draft
      priority: originalJob.priority,
      positions_available: originalJob.positions_available,
      max_submissions_allowed: originalJob.max_submissions_allowed,
      vendor_eligible: originalJob.vendor_eligible,
      remote_work_allowed: originalJob.remote_work_allowed,
    };

    return createJob(duplicateData);
  }, [createJob, user?.role]);

  return {
    loading,
    createJob,
    updateJob,
    deleteJob,
    duplicateJob,
  };
};
