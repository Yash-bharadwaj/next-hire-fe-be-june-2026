import { apiClient } from "@/lib/api";

export type InterviewStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
export type InterviewType = "phone" | "video" | "in_person" | "technical" | "behavioral";

export interface Interview {
  id: string;
  submission_id: string;
  interview_type: InterviewType;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  interviewer_id?: string;
  notes?: string;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  submission?: {
    id: string;
    status: string;
    job?: {
      id: string;
      job_id: string;
      title: string;
      company_name: string;
    };
    candidate?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
  };
  interviewer?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
    };
  };
  creator?: {
    id: string;
    email: string;
    recruiterProfile?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface InterviewFilters {
  page?: number;
  limit?: number;
  status?: InterviewStatus;
  interview_type?: InterviewType;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CreateInterviewRequest {
  submission_id: string;
  interview_type?: InterviewType;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  meeting_link?: string;
  interviewer_id?: string;
  notes?: string;
}

export interface UpdateInterviewRequest {
  interview_type?: InterviewType;
  scheduled_at?: string;
  duration_minutes?: number;
  location?: string;
  meeting_link?: string;
  interviewer_id?: string;
  notes?: string;
  status?: InterviewStatus;
  feedback?: string;
  rating?: number;
}

export interface InterviewsResponse {
  success: boolean;
  data: {
    interviews: Interview[];
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

export interface SingleInterviewResponse {
  success: boolean;
  data: {
    interview: Interview;
  };
  message?: string;
}

export interface InterviewStatsResponse {
  success: boolean;
  data: {
    totalInterviews: number;
    upcomingInterviews: number;
    statusStats: Array<{
      status: string;
      count: number;
    }>;
    typeStats: Array<{
      interview_type: string;
      count: number;
    }>;
  };
}

class InterviewService {
  private baseUrl = "/interviews";

  async getInterviews(filters: InterviewFilters = {}): Promise<InterviewsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async createInterview(data: CreateInterviewRequest): Promise<SingleInterviewResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getInterview(id: string): Promise<SingleInterviewResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateInterview(id: string, data: UpdateInterviewRequest): Promise<SingleInterviewResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteInterview(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getInterviewStats(): Promise<InterviewStatsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Helper methods
  getStatusColor(status: InterviewStatus): string {
    const colorMap: Record<InterviewStatus, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getStatusLabel(status: InterviewStatus): string {
    const labelMap: Record<InterviewStatus, string> = {
      scheduled: "Scheduled",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return labelMap[status] || status;
  }

  getTypeColor(type: InterviewType): string {
    const colorMap: Record<InterviewType, string> = {
      phone: "bg-blue-100 text-blue-800",
      video: "bg-purple-100 text-purple-800",
      in_person: "bg-green-100 text-green-800",
      technical: "bg-orange-100 text-orange-800",
      behavioral: "bg-pink-100 text-pink-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  }

  getTypeLabel(type: InterviewType): string {
    const labelMap: Record<InterviewType, string> = {
      phone: "Phone",
      video: "Video",
      in_person: "In Person",
      technical: "Technical",
      behavioral: "Behavioral",
    };
    return labelMap[type] || type;
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  isUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  isPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getTimeUntil(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) {
      return "Past";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days}d`;
    }
  }

  getRatingStars(rating?: number): string {
    if (!rating) return "No rating";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  canEdit(interview: Interview, userRole: string): boolean {
    if (userRole === "recruiter") return true;
    if (userRole === "candidate" && interview.status === "scheduled") return true;
    return false;
  }

  canCancel(interview: Interview, userRole: string): boolean {
    if (userRole !== "recruiter") return false;
    return ["scheduled", "in_progress"].includes(interview.status);
  }

  getNextPossibleStatuses(currentStatus: InterviewStatus): InterviewStatus[] {
    const transitions: Record<InterviewStatus, InterviewStatus[]> = {
      scheduled: ["in_progress", "completed", "cancelled", "no_show"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: ["scheduled"],
      no_show: ["scheduled"],
    };
    return transitions[currentStatus] || [];
  }
}

export const interviewService = new InterviewService();
