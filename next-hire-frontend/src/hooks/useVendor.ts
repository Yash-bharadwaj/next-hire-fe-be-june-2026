import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  vendorService, 
  Job, 
  Candidate,
  CreateCandidateRequest,
  Submission,
  SubmitCandidateRequest,
  SubmissionStatus
} from "@/services/vendorService";
import { useAuth } from "@/contexts/AuthContext";

// Hook for managing vendor jobs
export const useVendorJobs = (initialFilters: {
  page?: number;
  limit?: number;
  salary_min?: number;
  salary_max?: number;
  experience_min?: number;
  experience_max?: number;
  location?: string;
  skills?: string;
  search?: string;
  job_type?: string;
  remote_work_allowed?: boolean;
} = {}) => {
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
  const [filters, setFilters] = useState(initialFilters);

  const { user } = useAuth();

  const fetchJobs = useCallback(async (searchFilters = {}) => {
    if (user?.role !== "vendor") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await vendorService.getJobs(finalFilters);

      setJobs(response.data.jobs || []);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  const searchJobs = useCallback((searchFilters: any) => {
    fetchJobs(searchFilters);
  }, [fetchJobs]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchJobs({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchJobs, filters, pagination]);

  const refresh = useCallback(() => {
    fetchJobs(filters);
  }, [fetchJobs, filters]);

  // Load initial data
  useEffect(() => {
    if (user?.role === "vendor") {
      fetchJobs();
    }
  }, [user?.role]);

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

// Hook for managing vendor candidates
export const useVendorCandidates = (initialFilters: {
  page?: number;
  limit?: number;
  experience_min?: number;
  experience_max?: number;
  availability_status?: "available" | "not_available" | "interviewing";
  skills?: string;
  search?: string;
} = {}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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
  const [filters, setFilters] = useState(initialFilters);

  const { user } = useAuth();

  const fetchCandidates = useCallback(async (searchFilters = {}) => {
    if (user?.role !== "vendor") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await vendorService.getCandidates(finalFilters);

      setCandidates(response.data.candidates || []);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch candidates";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  const createCandidate = useCallback(async (data: CreateCandidateRequest): Promise<Candidate | null> => {
    if (user?.role !== "vendor") {
      toast.error("Only vendors can create candidates");
      return null;
    }

    try {
      setLoading(true);
      const response = await vendorService.createCandidate(data);
      toast.success("Candidate created successfully!");
      
      // Refresh the candidates list
      fetchCandidates();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create candidate";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role, fetchCandidates]);

  const searchCandidates = useCallback((searchFilters: any) => {
    fetchCandidates(searchFilters);
  }, [fetchCandidates]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchCandidates({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchCandidates, filters, pagination]);

  const refresh = useCallback(() => {
    fetchCandidates(filters);
  }, [fetchCandidates, filters]);

  // Load initial data
  useEffect(() => {
    if (user?.role === "vendor") {
      fetchCandidates();
    }
  }, [user?.role]);

  return {
    candidates,
    loading,
    error,
    pagination,
    filters,
    createCandidate,
    searchCandidates,
    loadMore,
    refresh,
    setFilters,
  };
};

// Hook for managing vendor submissions
export const useVendorSubmissions = (initialFilters: {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  job_id?: string;
} = {}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
  const [filters, setFilters] = useState(initialFilters);

  const { user } = useAuth();

  const fetchSubmissions = useCallback(async (searchFilters = {}) => {
    if (user?.role !== "vendor") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await vendorService.getSubmissions(finalFilters);

      setSubmissions(response.data.submissions || []);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch submissions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  const submitCandidate = useCallback(async (
    jobId: string,
    data: SubmitCandidateRequest
  ): Promise<Submission | null> => {
    if (user?.role !== "vendor") {
      toast.error("Only vendors can submit candidates");
      return null;
    }

    try {
      setLoading(true);
      const response = await vendorService.submitCandidate(jobId, data);
      toast.success("Candidate submitted successfully!");
      
      // Refresh the submissions list
      fetchSubmissions();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to submit candidate";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role, fetchSubmissions]);

  const searchSubmissions = useCallback((searchFilters: any) => {
    fetchSubmissions(searchFilters);
  }, [fetchSubmissions]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchSubmissions({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchSubmissions, filters, pagination]);

  const refresh = useCallback(() => {
    fetchSubmissions(filters);
  }, [fetchSubmissions, filters]);

  // Load initial data
  useEffect(() => {
    if (user?.role === "vendor") {
      fetchSubmissions();
    }
  }, [user?.role]);

  return {
    submissions,
    loading,
    error,
    pagination,
    filters,
    submitCandidate,
    searchSubmissions,
    loadMore,
    refresh,
    setFilters,
  };
};

// Hook for single job details (vendor view)
export const useVendorJob = (jobId: string | null) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchJob = useCallback(async () => {
    if (!jobId || user?.role !== "vendor") return;

    try {
      setLoading(true);
      setError(null);

      const response = await vendorService.getJobDetails(jobId);
      setJob(response.data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch job details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId, user?.role]);

  const refresh = useCallback(() => {
    fetchJob();
  }, [fetchJob]);

  // Load initial data
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    refresh,
  };
};

// Hook for single submission status (vendor view)
export const useVendorSubmission = (submissionId: string | null) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchSubmission = useCallback(async () => {
    if (!submissionId || user?.role !== "vendor") return;

    try {
      setLoading(true);
      setError(null);

      const response = await vendorService.getSubmissionStatus(submissionId);
      setSubmission(response.data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch submission details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [submissionId, user?.role]);

  const refresh = useCallback(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  // Load initial data
  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  return {
    submission,
    loading,
    error,
    refresh,
  };
};
