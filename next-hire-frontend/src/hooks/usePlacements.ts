import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  placementService, 
  Placement, 
  PlacementFilters, 
  CreatePlacementRequest,
  UpdatePlacementRequest,
  OnboardingStatus 
} from "@/services/placementService";
import { useAuth } from "@/contexts/AuthContext";

export const usePlacements = (initialFilters: PlacementFilters = {}) => {
  const [placements, setPlacements] = useState<Placement[]>([]);
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
  const [filters, setFilters] = useState<PlacementFilters>(initialFilters);

  const { user } = useAuth();

  const fetchPlacements = useCallback(async (searchFilters: PlacementFilters = {}) => {
    if (!user || !["recruiter", "candidate", "vendor"].includes(user.role)) return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await placementService.getPlacements(finalFilters);

      setPlacements(response.data.placements);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch placements";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchPlacements({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchPlacements, filters, pagination]);

  const refresh = useCallback(() => {
    fetchPlacements(filters);
  }, [fetchPlacements, filters]);

  // Load initial data
  useEffect(() => {
    if (user && ["recruiter", "candidate", "vendor"].includes(user.role)) {
      fetchPlacements();
    }
  }, [user]);

  return {
    placements,
    loading,
    error,
    pagination,
    filters,
    fetchPlacements,
    loadMore,
    refresh,
    setFilters,
  };
};

export const usePlacementDetail = (placementId: string | undefined) => {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlacement = useCallback(async () => {
    if (!placementId || !user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await placementService.getPlacementById(placementId);
      setPlacement(response.data.placement);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load placement";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [placementId, user]);

  useEffect(() => {
    fetchPlacement();
  }, [fetchPlacement]);

  return { placement, loading, error, refresh: fetchPlacement };
};

export const usePlacementManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createPlacement = useCallback(async (data: CreatePlacementRequest): Promise<Placement | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can create placements");
      return null;
    }

    try {
      setLoading(true);
      const response = await placementService.createPlacement(data);
      toast.success("Placement created successfully!");
      return response.data.placement;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create placement";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const updatePlacement = useCallback(async (
    placementId: string, 
    data: UpdatePlacementRequest
  ): Promise<Placement | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update placements");
      return null;
    }

    try {
      setLoading(true);
      const response = await placementService.updatePlacement(placementId, data);
      toast.success("Placement updated successfully!");
      return response.data.placement;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update placement";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const deletePlacement = useCallback(async (placementId: string): Promise<boolean> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can delete placements");
      return false;
    }

    try {
      setLoading(true);
      await placementService.deletePlacement(placementId);
      toast.success("Placement deleted successfully!");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete placement";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const terminatePlacement = useCallback(async (
    placementId: string, 
    reason: string, 
    terminationDate?: string
  ): Promise<Placement | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can terminate placements");
      return null;
    }

    try {
      setLoading(true);
      const response = await placementService.terminatePlacement(placementId, reason, terminationDate);
      toast.success("Placement terminated successfully!");
      return response.data.placement;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to terminate placement";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const updateOnboardingStatus = useCallback(async (
    placementId: string, 
    status: OnboardingStatus
  ): Promise<Placement | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update onboarding status");
      return null;
    }

    try {
      setLoading(true);
      const response = await placementService.updateOnboardingStatus(placementId, status);
      toast.success("Onboarding status updated successfully!");
      return response.data.placement;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update onboarding status";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  return {
    loading,
    createPlacement,
    updatePlacement,
    deletePlacement,
    terminatePlacement,
    updateOnboardingStatus,
  };
};

export const usePlacementStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const response = await placementService.getPlacementStats();
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch placement statistics";
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

export const usePlacement = (placementId: string) => {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchPlacement = useCallback(async () => {
    if (!placementId || !user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await placementService.getPlacementById(placementId);
      setPlacement(response.data.placement);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch placement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [placementId, user]);

  useEffect(() => {
    fetchPlacement();
  }, [fetchPlacement]);

  const refresh = useCallback(() => {
    fetchPlacement();
  }, [fetchPlacement]);

  return {
    placement,
    loading,
    error,
    refresh,
  };
};
