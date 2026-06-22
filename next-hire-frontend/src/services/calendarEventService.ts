import { apiClient } from "@/lib/api";

export type CalendarEventType = "interview" | "meeting" | "screening" | "call" | "deadline" | "other";
export type CalendarEventStatus = "confirmed" | "pending" | "completed";
export type CalendarEventTaskType = "my-task" | "follow-up";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  event_type: CalendarEventType;
  status: CalendarEventStatus;
  task_type: CalendarEventTaskType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  event_type?: CalendarEventType;
  task_type?: CalendarEventTaskType;
  status?: CalendarEventStatus;
}

class CalendarEventService {
  private baseUrl = "/calendar-events";

  async getEvents(params: { from?: string; to?: string } = {}): Promise<{ success: boolean; data: { events: CalendarEvent[] } }> {
    const search = new URLSearchParams();
    if (params.from) search.append("from", params.from);
    if (params.to) search.append("to", params.to);
    const response = await apiClient.get(`${this.baseUrl}?${search.toString()}`);
    return response.data;
  }

  async createEvent(data: CreateCalendarEventRequest): Promise<{ success: boolean; data: { event: CalendarEvent } }> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<CreateCalendarEventRequest>): Promise<{ success: boolean; data: { event: CalendarEvent } }> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const calendarEventService = new CalendarEventService();
