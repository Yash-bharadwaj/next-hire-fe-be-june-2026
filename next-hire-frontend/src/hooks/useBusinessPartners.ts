import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  businessPartnerService,
  BusinessPartner,
  BusinessPartnerFilters,
  CreateBusinessPartnerRequest,
  UpdateBusinessPartnerRequest,
} from "@/services/businessPartnerService";
import { useAuth } from "@/contexts/AuthContext";

export const useBusinessPartners = (initialFilters: BusinessPartnerFilters = {}) => {
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([]);
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
  const [filters, setFilters] = useState<BusinessPartnerFilters>(initialFilters);

  const { user } = useAuth();

  const fetchBusinessPartners = useCallback(
    async (searchFilters: BusinessPartnerFilters = {}) => {
      if (!user || user.role !== "recruiter") return;

      try {
        setLoading(true);
        setError(null);

        const finalFilters = { ...filters, ...searchFilters };
        const response = await businessPartnerService.getBusinessPartners(finalFilters);

        setBusinessPartners(response.data.businessPartners);
        setPagination(response.data.pagination);
        setFilters(finalFilters);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch business partners";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters, user]
  );

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchBusinessPartners({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchBusinessPartners, filters, pagination]);

  const refresh = useCallback(() => {
    fetchBusinessPartners(filters);
  }, [fetchBusinessPartners, filters]);

  useEffect(() => {
    if (user && user.role === "recruiter") {
      fetchBusinessPartners();
    }
  }, [user]);

  return {
    businessPartners,
    loading,
    error,
    pagination,
    filters,
    fetchBusinessPartners,
    loadMore,
    refresh,
    setFilters,
  };
};

export const useBusinessPartnerManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createBusinessPartner = useCallback(
    async (data: CreateBusinessPartnerRequest): Promise<BusinessPartner | null> => {
      if (user?.role !== "recruiter") {
        toast.error("Only recruiters can create business partners");
        return null;
      }

      try {
        setLoading(true);
        const response = await businessPartnerService.createBusinessPartner(data);
        toast.success("Business partner created successfully!");
        return response.data.businessPartner;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to create business partner";
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  const updateBusinessPartner = useCallback(
    async (
      partnerId: string,
      data: UpdateBusinessPartnerRequest
    ): Promise<BusinessPartner | null> => {
      if (user?.role !== "recruiter") {
        toast.error("Only recruiters can update business partners");
        return null;
      }
      try {
        setLoading(true);
        const response = await businessPartnerService.updateBusinessPartner(partnerId, data);
        toast.success("Business partner updated successfully!");
        return response.data.businessPartner;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to update business partner";
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  const deleteBusinessPartner = useCallback(
    async (partnerId: string): Promise<boolean> => {
      if (user?.role !== "recruiter") {
        toast.error("Only recruiters can delete business partners");
        return false;
      }
      try {
        setLoading(true);
        await businessPartnerService.deleteBusinessPartner(partnerId);
        toast.success("Business partner deleted successfully!");
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to delete business partner";
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  return {
    loading,
    createBusinessPartner,
    updateBusinessPartner,
    deleteBusinessPartner,
  };
};

export const useBusinessPartnerStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user || user.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const response = await businessPartnerService.getBusinessPartnerStats();
      setStats(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch business partner statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

export const useBusinessPartner = (id: string) => {
  const [businessPartner, setBusinessPartner] = useState<BusinessPartner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchBusinessPartner = useCallback(async () => {
    if (!user || user.role !== "recruiter" || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await businessPartnerService.getBusinessPartnerById(id);
      setBusinessPartner(response.data.businessPartner);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch business partner";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    fetchBusinessPartner();
  }, [fetchBusinessPartner]);

  const refresh = useCallback(() => {
    fetchBusinessPartner();
  }, [fetchBusinessPartner]);

  return {
    businessPartner,
    loading,
    error,
    refresh,
  };
};
