import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  interviewService, 
  Interview, 
  InterviewFilters, 
  CreateInterviewRequest,
  UpdateInterviewRequest 
} from "@/services/interviewService";
import { useAuth } from "@/contexts/AuthContext";

export const useInterviews = (initialFilters: InterviewFilters = {}) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<InterviewFilters>(initialFilters);

  const { user } = useAuth();

  const fetchInterviews = useCallback(async (searchFilters: InterviewFilters = {}) => {
    if (!user || !["recruiter", "candidate"].includes(user.role)) {
      setInterviews([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await interviewService.getInterviews(finalFilters);

      setInterviews(response.data?.interviews || []);
      setPagination(response.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false,
      });
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch interviews";
      setError(errorMessage);
      setInterviews([]); // Set empty array on error
      console.error('Error fetching interviews:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchInterviews({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchInterviews, filters, pagination]);

  const refresh = useCallback(() => {
    fetchInterviews(filters);
  }, [fetchInterviews, filters]);

  // Load initial data
  useEffect(() => {
    if (user && ["recruiter", "candidate"].includes(user.role)) {
      fetchInterviews({});
    } else {
      setInterviews([]);
      setLoading(false);
    }
  }, [user?.role]); // Only depend on role, not entire user object

  return {
    interviews,
    loading,
    error,
    pagination,
    filters,
    fetchInterviews,
    loadMore,
    refresh,
    setFilters,
  };
};

export const useInterviewDetail = (interviewId: string | undefined) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInterview = useCallback(async () => {
    if (!interviewId || !user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await interviewService.getInterview(interviewId);
      setInterview(response.data.interview);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load interview";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [interviewId, user]);

  useEffect(() => {
    fetchInterview();
  }, [fetchInterview]);

  return { interview, loading, error, refresh: fetchInterview };
};

export const useInterviewManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createInterview = useCallback(async (data: CreateInterviewRequest): Promise<Interview | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can create interviews");
      return null;
    }

    try {
      setLoading(true);
      const response = await interviewService.createInterview(data);
      toast.success("Interview scheduled successfully!");
      return response.data.interview;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create interview";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const updateInterview = useCallback(async (
    interviewId: string, 
    data: UpdateInterviewRequest
  ): Promise<Interview | null> => {
    try {
      setLoading(true);
      const response = await interviewService.updateInterview(interviewId, data);
      toast.success("Interview updated successfully!");
      return response.data.interview;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update interview";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInterview = useCallback(async (interviewId: string): Promise<boolean> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can delete interviews");
      return false;
    }

    try {
      setLoading(true);
      await interviewService.deleteInterview(interviewId);
      toast.success("Interview deleted successfully!");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete interview";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const completeInterview = useCallback(async (
    interviewId: string, 
    feedback?: string, 
    rating?: number
  ): Promise<Interview | null> => {
    return updateInterview(interviewId, {
      status: "completed",
      feedback,
      rating,
    });
  }, [updateInterview]);

  const cancelInterview = useCallback(async (
    interviewId: string, 
    reason?: string
  ): Promise<Interview | null> => {
    return updateInterview(interviewId, {
      status: "cancelled",
      notes: reason ? `Cancelled: ${reason}` : undefined,
    });
  }, [updateInterview]);

  const rescheduleInterview = useCallback(async (
    interviewId: string, 
    newDateTime: string
  ): Promise<Interview | null> => {
    return updateInterview(interviewId, {
      scheduled_at: newDateTime,
      status: "scheduled",
    });
  }, [updateInterview]);

  return {
    loading,
    createInterview,
    updateInterview,
    deleteInterview,
    completeInterview,
    cancelInterview,
    rescheduleInterview,
  };
};

export const useInterviewStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const response = await interviewService.getInterviewStats();
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch interview statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};
