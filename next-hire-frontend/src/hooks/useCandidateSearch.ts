import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  candidateSearchService, 
  CandidateProfile, 
  CandidateSearchFilters 
} from "@/services/candidateSearchService";
import { useAuth } from "@/contexts/AuthContext";

export const useCandidateSearch = (initialFilters: CandidateSearchFilters = {}) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
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
  const [filters, setFilters] = useState<CandidateSearchFilters>(initialFilters);

  const { user } = useAuth();

  const searchCandidates = useCallback(async (searchFilters: CandidateSearchFilters = {}) => {
    if (user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await candidateSearchService.searchCandidates(finalFilters);

      setCandidates(response.data.candidates);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to search candidates";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      searchCandidates({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [searchCandidates, filters, pagination]);

  const refresh = useCallback(() => {
    searchCandidates(filters);
  }, [searchCandidates, filters]);

  // Load initial data
  useEffect(() => {
    if (user?.role === "recruiter") {
      searchCandidates();
    }
  }, [user?.role]);

  return {
    candidates,
    loading,
    error,
    pagination,
    filters,
    searchCandidates,
    loadMore,
    refresh,
    setFilters,
  };
};

export const useCandidateDetails = (candidateId: string | null) => {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchCandidateDetails = useCallback(async () => {
    if (!candidateId || user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const response = await candidateSearchService.getCandidateDetails(candidateId);
      setCandidate(response.data.candidate);
      setSubmissions(response.data.submissions);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch candidate details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [candidateId, user?.role]);

  useEffect(() => {
    fetchCandidateDetails();
  }, [fetchCandidateDetails]);

  const refresh = useCallback(() => {
    fetchCandidateDetails();
  }, [fetchCandidateDetails]);

  return {
    candidate,
    submissions,
    loading,
    error,
    refresh,
  };
};

export const useCandidateStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const response = await candidateSearchService.getCandidateStats();
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch candidate statistics";
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
