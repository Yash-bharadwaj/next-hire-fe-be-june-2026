import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  submissionService,
  Submission,
  SubmissionFilters,
  UpdateSubmissionStatusRequest,
  SubmissionStatus,
} from "@/services/submissionService";
import { recruiterService } from "@/services/recruiterService";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for recruiters to view submissions for a specific job.
 * Requires job_id in filters; otherwise returns empty.
 */
export const useRecruiterSubmissions = (initialFilters: SubmissionFilters = {}) => {
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

  const { user } = useAuth();
  const isFetchingRef = useRef(false);

  const fetchAllSubmissions = useCallback(
    async (searchFilters: SubmissionFilters = {}) => {
      if (user?.role !== "recruiter") return;
      if (isFetchingRef.current) return;

      const jobId = searchFilters.job_id || filters.job_id || initialFilters.job_id;

      if (!jobId) {
        setSubmissions([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: pagination.itemsPerPage,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setFilters(searchFilters);
        return;
      }

      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const finalFilters = { ...filters, ...searchFilters, job_id: jobId };
        const response = await submissionService.getJobSubmissions(jobId, finalFilters);
        const subs = response.data.submissions || [];
        setSubmissions(subs);

        const pg = response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: subs.length,
          items_per_page: finalFilters.limit || 10,
        };

        setPagination({
          currentPage: pg.current_page || pg.currentPage || 1,
          totalPages: pg.total_pages || pg.totalPages || 1,
          totalItems: pg.total_items || pg.totalItems || subs.length,
          itemsPerPage: pg.items_per_page || pg.itemsPerPage || (finalFilters.limit || 10),
          hasNextPage: pg.hasNextPage ?? ((pg.current_page || 1) < (pg.total_pages || 1)),
          hasPrevPage: pg.hasPrevPage ?? ((pg.current_page || 1) > 1),
        });
        setFilters(finalFilters);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch submissions";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    },
    [user?.role, initialFilters.job_id, filters.job_id]
  );

  const searchSubmissions = useCallback((searchFilters: SubmissionFilters) => {
    fetchAllSubmissions(searchFilters);
  }, [fetchAllSubmissions]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchAllSubmissions({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchAllSubmissions, filters, pagination]);

  const refresh = useCallback(() => {
    fetchAllSubmissions(filters);
  }, [fetchAllSubmissions, filters]);

  const updateSubmissionStatus = useCallback(async (
    submissionId: string, 
    data: UpdateSubmissionStatusRequest
  ): Promise<Submission | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update submission status");
      return null;
    }

    try {
      const response = await recruiterService.updateSubmissionStatus(submissionId, data);
      toast.success(`Application status updated to ${recruiterService.formatSubmissionStatus(data.status)}`);
      
      // Refresh the submissions list
      refresh();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update submission status";
      toast.error(errorMessage);
      return null;
    }
  }, [user?.role, refresh]);

  // Load initial data
  return {
    submissions,
    loading,
    error,
    pagination,
    filters,
    searchSubmissions,
    loadMore,
    refresh,
    updateSubmissionStatus,
    setFilters,
  };
};
