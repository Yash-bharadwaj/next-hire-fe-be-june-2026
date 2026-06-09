import { apiClient } from "@/lib/api";

export type PlacementStatus = "active" | "completed" | "terminated" | "on_hold";
export type PlacementType = "permanent" | "contract" | "temporary" | "temp_to_perm";
export type WorkArrangement = "onsite" | "remote" | "hybrid";
export type OnboardingStatus = "pending" | "in_progress" | "completed";
export type RenewalStatus = "pending" | "renewed" | "not_renewed";

export interface Placement {
  id: string;
  placement_id: string;
  job_id: string;
  candidate_id: string;
  submission_id: string;
  recruiter_id: string;
  vendor_id?: string;
  
  start_date: string;
  end_date?: string;
  placement_type: PlacementType;
  
  salary: number;
  salary_currency: string;
  billing_rate?: number;
  commission_amount?: number;
  commission_percentage?: number;
  
  status: PlacementStatus;
  termination_reason?: string;
  termination_date?: string;
  
  location: string;
  work_arrangement: WorkArrangement;
  reporting_manager?: string;
  department?: string;
  notes?: string;
  
  onboarding_status: OnboardingStatus;
  onboarding_completed_at?: string;
  
  performance_rating?: number;
  performance_notes?: string;
  
  renewal_date?: string;
  renewal_status?: RenewalStatus;
  
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Associations
  job?: {
    id: string;
    job_id: string;
    title: string;
    company_name: string;
    location?: string;
    job_type?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
  };
  candidate?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    location?: string;
    experience_years?: number;
  };
  submission?: {
    id: string;
    status: string;
    submitted_at: string;
    ai_score?: number;
  };
  recruiter?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
      phone?: string;
    };
  };
  vendor?: {
    id: string;
    email: string;
  };
}

export interface PlacementFilters {
  page?: number;
  limit?: number;
  status?: PlacementStatus;
  placement_type?: PlacementType;
  recruiter_id?: string;
  search?: string;
  start_date_from?: string;
  start_date_to?: string;
  sort_by?: "created_at" | "start_date" | "salary" | "status" | "placement_type";
  sort_order?: "ASC" | "DESC";
}

export interface CreatePlacementRequest {
  job_id: string;
  candidate_id: string;
  submission_id: string;
  start_date: string;
  end_date?: string;
  placement_type?: PlacementType;
  salary: number;
  salary_currency?: string;
  billing_rate?: number;
  commission_amount?: number;
  commission_percentage?: number;
  location: string;
  work_arrangement?: WorkArrangement;
  reporting_manager?: string;
  department?: string;
  notes?: string;
}

export interface UpdatePlacementRequest {
  start_date?: string;
  end_date?: string;
  placement_type?: PlacementType;
  salary?: number;
  salary_currency?: string;
  billing_rate?: number;
  commission_amount?: number;
  commission_percentage?: number;
  status?: PlacementStatus;
  location?: string;
  work_arrangement?: WorkArrangement;
  reporting_manager?: string;
  department?: string;
  notes?: string;
  onboarding_status?: OnboardingStatus;
  performance_rating?: number;
  performance_notes?: string;
  renewal_date?: string;
  renewal_status?: RenewalStatus;
}

export interface PlacementsResponse {
  success: boolean;
  data: {
    placements: Placement[];
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

export interface SinglePlacementResponse {
  success: boolean;
  data: {
    placement: Placement;
  };
  message?: string;
}

export interface PlacementStatsResponse {
  success: boolean;
  data: {
    totalPlacements: number;
    activePlacements: number;
    completedPlacements: number;
    terminatedPlacements: number;
    statusStats: Array<{
      status: string;
      count: number;
    }>;
    typeStats: Array<{
      placement_type: string;
      count: number;
    }>;
    monthlyStats: Array<{
      month: string;
      count: number;
    }>;
  };
}

class PlacementService {
  private baseUrl = "/placements";

  async getPlacements(filters: PlacementFilters = {}): Promise<PlacementsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getPlacementById(id: string): Promise<SinglePlacementResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createPlacement(data: CreatePlacementRequest): Promise<SinglePlacementResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updatePlacement(id: string, data: UpdatePlacementRequest): Promise<SinglePlacementResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deletePlacement(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async terminatePlacement(
    id: string, 
    termination_reason: string, 
    termination_date?: string
  ): Promise<SinglePlacementResponse> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/terminate`, {
      termination_reason,
      termination_date,
    });
    return response.data;
  }

  async updateOnboardingStatus(
    id: string, 
    onboarding_status: OnboardingStatus
  ): Promise<SinglePlacementResponse> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/onboarding`, {
      onboarding_status,
    });
    return response.data;
  }

  async getPlacementStats(): Promise<PlacementStatsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Helper methods
  getStatusColor(status: PlacementStatus): string {
    const colorMap: Record<PlacementStatus, string> = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      terminated: "bg-red-100 text-red-800",
      on_hold: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getStatusLabel(status: PlacementStatus): string {
    const labelMap: Record<PlacementStatus, string> = {
      active: "Active",
      completed: "Completed",
      terminated: "Terminated",
      on_hold: "On Hold",
    };
    return labelMap[status] || status;
  }

  getTypeColor(type: PlacementType): string {
    const colorMap: Record<PlacementType, string> = {
      permanent: "bg-green-100 text-green-800",
      contract: "bg-blue-100 text-blue-800",
      temporary: "bg-orange-100 text-orange-800",
      temp_to_perm: "bg-purple-100 text-purple-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  }

  getTypeLabel(type: PlacementType): string {
    const labelMap: Record<PlacementType, string> = {
      permanent: "Permanent",
      contract: "Contract",
      temporary: "Temporary",
      temp_to_perm: "Temp to Perm",
    };
    return labelMap[type] || type;
  }

  getWorkArrangementColor(arrangement: WorkArrangement): string {
    const colorMap: Record<WorkArrangement, string> = {
      onsite: "bg-blue-100 text-blue-800",
      remote: "bg-green-100 text-green-800",
      hybrid: "bg-purple-100 text-purple-800",
    };
    return colorMap[arrangement] || "bg-gray-100 text-gray-800";
  }

  getWorkArrangementLabel(arrangement: WorkArrangement): string {
    const labelMap: Record<WorkArrangement, string> = {
      onsite: "On-site",
      remote: "Remote",
      hybrid: "Hybrid",
    };
    return labelMap[arrangement] || arrangement;
  }

  getOnboardingStatusColor(status: OnboardingStatus): string {
    const colorMap: Record<OnboardingStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getOnboardingStatusLabel(status: OnboardingStatus): string {
    const labelMap: Record<OnboardingStatus, string> = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
    };
    return labelMap[status] || status;
  }

  formatSalary(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  calculateDuration(startDate: string, endDate?: string): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  }

  isActive(placement: Placement): boolean {
    return placement.status === "active";
  }

  isExpiringSoon(placement: Placement, daysThreshold: number = 30): boolean {
    if (!placement.end_date || placement.status !== "active") return false;
    
    const endDate = new Date(placement.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= daysThreshold && diffDays > 0;
  }

  canEdit(placement: Placement, userRole: string, userId: string): boolean {
    if (userRole !== "recruiter") return false;
    return placement.recruiter_id === userId;
  }

  canTerminate(placement: Placement, userRole: string, userId: string): boolean {
    if (userRole !== "recruiter") return false;
    return placement.recruiter_id === userId && placement.status === "active";
  }

  getPerformanceRatingStars(rating?: number): string {
    if (!rating) return "No rating";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  getCommissionInfo(placement: Placement): string {
    if (placement.commission_amount) {
      return this.formatSalary(placement.commission_amount, placement.salary_currency);
    }
    if (placement.commission_percentage) {
      const amount = (placement.salary * placement.commission_percentage) / 100;
      return `${placement.commission_percentage}% (${this.formatSalary(amount, placement.salary_currency)})`;
    }
    return "Not specified";
  }
}

export const placementService = new PlacementService();
