import { apiClient } from "@/lib/api";

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export const TICKET_CATEGORIES = ["Technical", "Bug", "Feature Request", "Performance", "Integration", "Other"] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  reporter_id: string;
  reporter_name: string;
  assignee_id?: string | null;
  assignee_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketAssignee {
  id: string;
  name: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory | string;
  priority?: TicketPriority;
  assignee_id?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  category?: TicketCategory | string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignee_id?: string | null;
}

class TicketService {
  private baseUrl = "/tickets";

  async getTickets(): Promise<{ success: boolean; data: { tickets: Ticket[] } }> {
    const response = await apiClient.get<{ tickets: Ticket[] }>(this.baseUrl);
    return response.data as { success: boolean; data: { tickets: Ticket[] } };
  }

  async getAssignees(): Promise<{ success: boolean; data: { assignees: TicketAssignee[] } }> {
    const response = await apiClient.get<{ assignees: TicketAssignee[] }>(`${this.baseUrl}/assignees`);
    return response.data as { success: boolean; data: { assignees: TicketAssignee[] } };
  }

  async createTicket(data: CreateTicketRequest): Promise<{ success: boolean; message: string; data: { ticket: Ticket } }> {
    const response = await apiClient.post<{ ticket: Ticket }>(this.baseUrl, data);
    return response.data as { success: boolean; message: string; data: { ticket: Ticket } };
  }

  async updateTicket(id: string, data: UpdateTicketRequest): Promise<{ success: boolean; message: string; data: { ticket: Ticket } }> {
    const response = await apiClient.put<{ ticket: Ticket }>(`${this.baseUrl}/${id}`, data);
    return response.data as { success: boolean; message: string; data: { ticket: Ticket } };
  }

  async deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<unknown>(`${this.baseUrl}/${id}`);
    return response.data as { success: boolean; message: string };
  }
}

export const ticketService = new TicketService();
