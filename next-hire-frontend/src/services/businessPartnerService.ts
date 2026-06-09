import { apiClient } from "@/lib/api";

export type BusinessPartnerStatus = "active" | "prospect" | "inactive" | "on_hold";
export type BusinessPartnerSource = "referral" | "website" | "cold_call" | "trade_show" | "linkedin" | "email_campaign" | "other";
export type BusinessPartnerPriority = "low" | "medium" | "high";
export type CompanySize = "startup" | "small" | "medium" | "large" | "enterprise";

export interface BusinessPartner {
  id: string;
  business_partner_number: string;
  business_partner_guid: string;
  
  // Partner types
  is_lead: boolean;
  is_client: boolean;
  is_vendor: boolean;
  
  // Company information
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  geocode?: string;
  tax_id?: string;
  
  // Contact information
  primary_email?: string;
  primary_phone?: string;
  website?: string;
  domain?: string;
  
  // Business details
  industry?: string;
  company_size?: CompanySize;
  annual_revenue?: number;
  
  // Relationship details
  source: BusinessPartnerSource;
  status: BusinessPartnerStatus;
  priority: BusinessPartnerPriority;
  
  // Metadata
  logo_url?: string;
  notes?: string;
  tags?: string[];
  
  // Tracking
  created_by: string;
  assigned_to?: string;
  last_activity_at?: string;
  
  created_at: string;
  updated_at: string;
  
  // Associations
  creator?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
    };
  };
  assignee?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface BusinessPartnerFilters {
  page?: number;
  limit?: number;
  status?: BusinessPartnerStatus;
  partner_type?: "lead" | "client" | "vendor";
  source?: BusinessPartnerSource;
  priority?: BusinessPartnerPriority;
  assigned_to?: string;
  search?: string;
  sort_by?: "name" | "created_at" | "last_activity_at" | "status" | "priority";
  sort_order?: "ASC" | "DESC";
}

export interface CreateBusinessPartnerRequest {
  name: string;
  is_lead?: boolean;
  is_client?: boolean;
  is_vendor?: boolean;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  geocode?: string;
  tax_id?: string;
  primary_email?: string;
  primary_phone?: string;
  website?: string;
  domain?: string;
  industry?: string;
  company_size?: CompanySize;
  annual_revenue?: number;
  source?: BusinessPartnerSource;
  status?: BusinessPartnerStatus;
  priority?: BusinessPartnerPriority;
  logo_url?: string;
  notes?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface UpdateBusinessPartnerRequest {
  name?: string;
  is_lead?: boolean;
  is_client?: boolean;
  is_vendor?: boolean;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  geocode?: string;
  tax_id?: string;
  primary_email?: string;
  primary_phone?: string;
  website?: string;
  domain?: string;
  industry?: string;
  company_size?: CompanySize;
  annual_revenue?: number;
  source?: BusinessPartnerSource;
  status?: BusinessPartnerStatus;
  priority?: BusinessPartnerPriority;
  logo_url?: string;
  notes?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface BusinessPartnersResponse {
  success: boolean;
  data: {
    businessPartners: BusinessPartner[];
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

export interface SingleBusinessPartnerResponse {
  success: boolean;
  data: {
    businessPartner: BusinessPartner;
  };
  message?: string;
}

export interface BusinessPartnerStatsResponse {
  success: boolean;
  data: {
    totalPartners: number;
    leads: number;
    clients: number;
    vendors: number;
    activePartners: number;
    prospectPartners: number;
    inactivePartners: number;
    sourceStats: Array<{ source: string; count: number }>;
    priorityStats: Array<{ priority: string; count: number }>;
  };
}

class BusinessPartnerService {
  private baseUrl = "/business-partners";

  async getBusinessPartners(filters: BusinessPartnerFilters = {}): Promise<BusinessPartnersResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getBusinessPartnerById(id: string): Promise<SingleBusinessPartnerResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createBusinessPartner(data: CreateBusinessPartnerRequest): Promise<SingleBusinessPartnerResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateBusinessPartner(id: string, data: UpdateBusinessPartnerRequest): Promise<SingleBusinessPartnerResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteBusinessPartner(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getBusinessPartnerStats(): Promise<BusinessPartnerStatsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Helper methods
  getStatusColor(status: BusinessPartnerStatus): string {
    const colorMap: Record<BusinessPartnerStatus, string> = {
      active: "bg-green-100 text-green-800 border-green-200",
      prospect: "bg-blue-100 text-blue-800 border-blue-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  getStatusLabel(status: BusinessPartnerStatus): string {
    const labelMap: Record<BusinessPartnerStatus, string> = {
      active: "Active",
      prospect: "Prospect",
      inactive: "Inactive",
      on_hold: "On Hold",
    };
    return labelMap[status] || status;
  }

  getPriorityColor(priority: BusinessPartnerPriority): string {
    const colorMap: Record<BusinessPartnerPriority, string> = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  getPriorityLabel(priority: BusinessPartnerPriority): string {
    const labelMap: Record<BusinessPartnerPriority, string> = {
      high: "High",
      medium: "Medium",
      low: "Low",
    };
    return labelMap[priority] || priority;
  }

  getSourceLabel(source: BusinessPartnerSource): string {
    const labelMap: Record<BusinessPartnerSource, string> = {
      referral: "Referral",
      website: "Website",
      cold_call: "Cold Call",
      trade_show: "Trade Show",
      linkedin: "LinkedIn",
      email_campaign: "Email Campaign",
      other: "Other",
    };
    return labelMap[source] || source;
  }

  getPartnerType(partner: BusinessPartner): string {
    const types = [];
    if (partner.is_lead) types.push("Lead");
    if (partner.is_client) types.push("Client");
    if (partner.is_vendor) types.push("Vendor");
    return types.join(", ") || "Partner";
  }

  getPartnerTypeColor(partner: BusinessPartner): string {
    if (partner.is_lead && partner.is_client) return "bg-purple-100 text-purple-800 border-purple-200";
    if (partner.is_lead) return "bg-green-100 text-green-800 border-green-200";
    if (partner.is_client) return "bg-blue-100 text-blue-800 border-blue-200";
    if (partner.is_vendor) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatRevenue(amount?: number): string {
    if (!amount) return "Not disclosed";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export const businessPartnerService = new BusinessPartnerService();
