import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { 
  submissionService, 
  Submission, 
  SubmissionFilters, 
  CreateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  SubmissionStatus
} from "@/services/submissionService";
import { useAuth } from "@/contexts/AuthContext";

export const useSubmissions = (initialFilters: SubmissionFilters = {}) => {
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
  const [filters, setFilters] = useState<SubmissionFilters>(initialFilters);
  const filtersRef = useRef<SubmissionFilters>(initialFilters);
  const isFetchingRef = useRef(false);

  const { user } = useAuth();

  const fetchSubmissions = useCallback(
    async (searchFilters: SubmissionFilters = {}) => {
      if (isFetchingRef.current) return;
      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const finalFilters = { ...filtersRef.current, ...searchFilters };
        let response;

        // Choose the appropriate service method based on user role
        if (user?.role === "candidate") {
          response = await submissionService.getCandidateSubmissions(finalFilters);
        } else if (user?.role === "vendor") {
          response = await submissionService.getVendorSubmissions(finalFilters);
        } else if (user?.role === "recruiter") {
          // Recruiters should use useRecruiterSubmissions; return empty to avoid loops.
          response = {
            success: true,
            data: {
              submissions: [],
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPrevPage: false,
              },
            },
          };
        } else {
          throw new Error("Invalid user role for fetching submissions");
        }

        setSubmissions(response.data.submissions);
        setPagination(response.data.pagination);
        filtersRef.current = finalFilters;
        setFilters(finalFilters);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch submissions";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    },
    [user?.role]
  );

  const searchSubmissions = useCallback((searchFilters: SubmissionFilters) => {
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
    if (user?.role && ["candidate", "vendor"].includes(user.role)) {
      fetchSubmissions();
    }
  }, [user?.role, fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    pagination,
    filters,
    fetchSubmissions,
    searchSubmissions,
    loadMore,
    refresh,
    setFilters: (next: SubmissionFilters) => {
      filtersRef.current = next;
      setFilters(next);
    },
  };
};

export const useJobSubmissions = (jobId: string | null) => {
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
  const [filters, setFilters] = useState<SubmissionFilters>({});

  const { user } = useAuth();

  const fetchJobSubmissions = useCallback(async (searchFilters: SubmissionFilters = {}) => {
    if (!jobId || user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await submissionService.getJobSubmissions(jobId, finalFilters);

      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch job submissions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId, filters, user?.role]);

  const searchSubmissions = useCallback((searchFilters: SubmissionFilters) => {
    fetchJobSubmissions(searchFilters);
  }, [fetchJobSubmissions]);

  const refresh = useCallback(() => {
    fetchJobSubmissions(filters);
  }, [fetchJobSubmissions, filters]);

  // Load initial data
  useEffect(() => {
    if (jobId && user?.role === "recruiter") {
      fetchJobSubmissions();
    }
  }, [jobId, user?.role]);

  return {
    submissions,
    loading,
    error,
    pagination,
    filters,
    searchSubmissions,
    refresh,
    setFilters,
  };
};

export const useSubmission = (submissionId: string | null) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = useCallback(async () => {
    if (!submissionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await submissionService.getSubmissionById(submissionId);
      setSubmission(response.data.submission);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch submission";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const refresh = useCallback(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  return {
    submission,
    loading,
    error,
    refresh,
  };
};

export const useSubmissionManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const applyToJob = useCallback(async (data: CreateSubmissionRequest): Promise<Submission | null> => {
    if (!["candidate", "vendor"].includes(user?.role || "")) {
      toast.error("Only candidates and vendors can apply to jobs");
      return null;
    }

    try {
      setLoading(true);
      const response = await submissionService.createSubmission(data);
      toast.success("Application submitted successfully!");
      return response.data.submission;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit application";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const updateSubmissionStatus = useCallback(async (
    submissionId: string, 
    data: UpdateSubmissionStatusRequest
  ): Promise<Submission | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update submission status");
      return null;
    }

    try {
      setLoading(true);
      const response = await submissionService.updateSubmissionStatus(submissionId, data);
      toast.success(`Application status updated to ${submissionService.getStatusLabel(data.status)}`);
      return response.data.submission;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update submission status";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const withdrawApplication = useCallback(async (submissionId: string): Promise<boolean> => {
    if (user?.role !== "candidate") {
      toast.error("Only candidates can withdraw their applications");
      return false;
    }

    try {
      setLoading(true);
      await submissionService.withdrawSubmission(submissionId);
      toast.success("Application withdrawn successfully");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to withdraw application";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const bulkUpdateStatus = useCallback(async (
    submissionIds: string[], 
    status: SubmissionStatus,
    notes?: string
  ): Promise<boolean> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can bulk update submissions");
      return false;
    }

    try {
      setLoading(true);
      
      // Update submissions one by one (could be optimized with a bulk endpoint)
      const promises = submissionIds.map(id => 
        submissionService.updateSubmissionStatus(id, { status, notes })
      );
      
      await Promise.all(promises);
      toast.success(`${submissionIds.length} applications updated to ${submissionService.getStatusLabel(status)}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to bulk update submissions";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  return {
    loading,
    applyToJob,
    updateSubmissionStatus,
    withdrawApplication,
    bulkUpdateStatus,
  };
};

export const useSubmissionStats = (jobId?: string) => {
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    interviewed: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (user?.role !== "recruiter" || !jobId) return;

    try {
      setLoading(true);
      
      // Fetch all submissions for the job using pagination (backend max limit is 100)
      let allSubmissions: any[] = [];
      let currentPage = 1;
      let hasMore = true;
      const limit = 100; // Backend max limit
      
      while (hasMore) {
        try {
          const response = await submissionService.getJobSubmissions(jobId, { 
            page: currentPage, 
            limit: limit 
          });
          
          const pageSubmissions = response.data.submissions || [];
          allSubmissions = [...allSubmissions, ...pageSubmissions];
          
          const pagination = response.data.pagination || {};
          const totalPages = pagination.total_pages || pagination.totalPages || 1;
          
          if (currentPage >= totalPages || pageSubmissions.length < limit) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } catch (error) {
          console.error(`Error fetching submissions page ${currentPage}:`, error);
          hasMore = false;
        }
      }
      
      const submissions = allSubmissions;

      // Calculate stats
      const newStats = {
        total: submissions.length,
        submitted: 0,
        under_review: 0,
        shortlisted: 0,
        interview_scheduled: 0,
        interviewed: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
      };

      submissions.forEach(submission => {
        newStats[submission.status]++;
      });

      setStats(newStats);
    } catch (err: any) {
      console.error("Failed to fetch submission stats:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId, user?.role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refresh,
  };
};
