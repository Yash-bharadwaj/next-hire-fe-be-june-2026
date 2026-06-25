import { apiClient, PaginatedResponse } from "@/lib/api";
import { formatDate as formatDateUtil } from "@/lib/format";
import { MAX_PAGE_SIZE } from "@/lib/constants";

export type BusinessPartnerStatus = "active" | "prospect" | "inactive" | "on_hold";
export type BusinessPartnerSource = "referral" | "website" | "cold_call" | "trade_show" | "linkedin" | "email_campaign" | "other";
export type BusinessPartnerPriority = "low" | "medium" | "high";
export type CompanySize = "startup" | "small" | "medium" | "large" | "enterprise";
export type BusinessPartnerNoteCategory = "technical" | "behavioral" | "feedback" | "general";
export type BusinessPartnerDocumentType = "PDF" | "DOC" | "DOCX" | "IMG" | "OTHER";

export interface BusinessPartnerNote {
  id: string;
  title: string;
  content: string;
  category: BusinessPartnerNoteCategory;
  isPrivate: boolean;
  tags: string[];
  author: string;
  by?: string;
  at: string;
  edited_at?: string;
}

export interface BusinessPartnerDocument {
  id: string;
  url: string;
  name: string;
  document_type: BusinessPartnerDocumentType;
  size?: number;
  valid_from: string;
  valid_to?: string;
  by?: string;
  at: string;
}

export interface BusinessPartnerDetailStats {
  activeJobs: number;
  totalJobs: number;
  totalPlacements: number;
  totalContacts: number;
  revenueGenerated: number;
  // null when the underlying placements span more than one currency, since a
  // single sum can't be labeled with one currency symbol in that case.
  revenueCurrency: string | null;
}

export interface BusinessPartnerActivityItem {
  id: string;
  type: "job" | "placement" | "contact";
  description: string;
  at: string;
}

export interface BusinessPartnerRevenueTrendPoint {
  month: string;
  placements: number;
  revenue: number;
}

export interface BusinessPartnerJob {
  id: string;
  job_id: string;
  title: string;
  status: string;
  job_type?: string;
  location?: string;
  created_at: string;
}

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
  notes_history?: BusinessPartnerNote[];
  attachments?: BusinessPartnerDocument[];

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
  scope?: "all" | "mine";
  search?: string;
  sort_by?: "name" | "created_at" | "last_activity_at" | "status" | "priority" | "annual_revenue";
  sort_order?: "ASC" | "DESC";
}

export interface BusinessPartnerContact {
  id: string;
  business_partner_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  comments?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessPartnerContactRequest {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  comments?: string;
  is_primary?: boolean;
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

export interface BusinessPartnersResponse extends PaginatedResponse<BusinessPartner, "businessPartners"> {}

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

  /** All clients org-wide (not scoped to the current recruiter) - for the Job form's Client dropdown. */
  async getClientOptions(): Promise<BusinessPartner[]> {
    const response = await this.getBusinessPartners({
      partner_type: "client",
      scope: "all",
      limit: MAX_PAGE_SIZE,
      sort_by: "name",
      sort_order: "ASC",
    });
    return response.data.businessPartners;
  }

  async getContacts(businessPartnerId: string): Promise<BusinessPartnerContact[]> {
    const response = await apiClient.get(`${this.baseUrl}/${businessPartnerId}/contacts`);
    return response.data.data.contacts;
  }

  async createContact(
    businessPartnerId: string,
    data: CreateBusinessPartnerContactRequest
  ): Promise<BusinessPartnerContact> {
    const response = await apiClient.post(`${this.baseUrl}/${businessPartnerId}/contacts`, data);
    return response.data.data.contact;
  }

  async updateContact(
    businessPartnerId: string,
    contactId: string,
    data: Partial<CreateBusinessPartnerContactRequest>
  ): Promise<BusinessPartnerContact> {
    const response = await apiClient.put(`${this.baseUrl}/${businessPartnerId}/contacts/${contactId}`, data);
    return response.data.data.contact;
  }

  async deleteContact(businessPartnerId: string, contactId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${businessPartnerId}/contacts/${contactId}`);
    return response.data;
  }

  async getDetailStats(id: string): Promise<{ success: boolean; data: BusinessPartnerDetailStats }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/detail-stats`);
    return response.data;
  }

  async getActivity(id: string): Promise<{ success: boolean; data: { activity: BusinessPartnerActivityItem[] } }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/activity`);
    return response.data;
  }

  async getRevenueTrend(id: string): Promise<{ success: boolean; data: { trend: BusinessPartnerRevenueTrendPoint[] } }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/revenue-trend`);
    return response.data;
  }

  async getJobs(id: string): Promise<{ success: boolean; data: { jobs: BusinessPartnerJob[] } }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/jobs`);
    return response.data;
  }

  async addNote(
    id: string,
    data: { title?: string; content: string; category?: BusinessPartnerNoteCategory; isPrivate?: boolean; tags?: string[] }
  ): Promise<{ success: boolean; data: { notes_history: BusinessPartnerNote[] } }> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/notes`, data);
    return response.data;
  }

  async updateNote(
    id: string,
    noteId: string,
    data: { title?: string; content?: string; category?: BusinessPartnerNoteCategory; isPrivate?: boolean; tags?: string[] }
  ): Promise<{ success: boolean; data: { notes_history: BusinessPartnerNote[] } }> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/notes/${noteId}`, data);
    return response.data;
  }

  async deleteNote(id: string, noteId: string): Promise<{ success: boolean; data: { notes_history: BusinessPartnerNote[] } }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}/notes/${noteId}`);
    return response.data;
  }

  async addAttachment(
    id: string,
    data: { file?: File; url?: string; name?: string; document_type?: BusinessPartnerDocumentType; valid_from?: string; valid_to?: string }
  ): Promise<{ success: boolean; data: { attachments: BusinessPartnerDocument[] } }> {
    const formData = new FormData();
    if (data.file) formData.append("file", data.file);
    if (data.url) formData.append("url", data.url);
    if (data.name) formData.append("name", data.name);
    if (data.document_type) formData.append("document_type", data.document_type);
    if (data.valid_from) formData.append("valid_from", data.valid_from);
    if (data.valid_to) formData.append("valid_to", data.valid_to);
    const response = await apiClient.upload<{ attachments: BusinessPartnerDocument[] }>(
      `${this.baseUrl}/${id}/attachments`,
      formData
    );
    return response.data as { success: boolean; data: { attachments: BusinessPartnerDocument[] } };
  }

  async deleteAttachment(id: string, attachmentId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}/attachments/${attachmentId}`);
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
    return formatDateUtil(dateString);
  }

}

export const businessPartnerService = new BusinessPartnerService();
