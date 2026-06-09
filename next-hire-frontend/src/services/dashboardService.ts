import { apiClient } from "@/lib/api";

export interface DashboardStats {
  overview: {
    totalJobs?: number;
    activeJobs?: number;
    totalSubmissions?: number;
    newSubmissions?: number;
    totalInterviews?: number;
    upcomingInterviews?: number;
    totalPlacements?: number;
    totalApplications?: number;
    activeApplications?: number;
    interviews?: number;
    offers?: number;
    placements?: number;
    availableJobs?: number;
  };
  submissionsByStatus?: Array<{
    status: string;
    count: number;
  }>;
  applicationsByStatus?: Array<{
    status: string;
    count: number;
  }>;
  recentSubmissions?: Array<{
    id: string;
    status: string;
    submitted_at: string;
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
    };
  }>;
  recentApplications?: Array<{
    id: string;
    status: string;
    submitted_at: string;
    job?: {
      id: string;
      job_id: string;
      title: string;
      company_name: string;
      location: string;
    };
  }>;
  upcomingInterviews?: Array<{
    id: string;
    scheduled_at: string;
    interview_type: string;
    submission?: {
      job?: {
        id: string;
        job_id: string;
        title: string;
        company_name: string;
      };
    };
  }>;
  topJobs?: Array<{
    id: string;
    job_id: string;
    title: string;
    status: string;
    submission_count: number;
  }>;
}

export interface Activity {
  type: string;
  action: string;
  candidate?: string;
  job?: string;
  company?: string;
  status: string;
  timestamp: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export interface ActivityResponse {
  success: boolean;
  data: {
    activities: Activity[];
  };
}

class DashboardService {
  private baseUrl = "/dashboard";

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getRecentActivity(limit: number = 20): Promise<ActivityResponse> {
    const response = await apiClient.get(`${this.baseUrl}/activity?limit=${limit}`);
    return response.data;
  }

  // Helper methods for formatting
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-indigo-100 text-indigo-800",
      offered: "bg-emerald-100 text-emerald-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      paused: "bg-yellow-100 text-yellow-800",
      closed: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offered: "Offered",
      hired: "Hired",
      rejected: "Rejected",
      active: "Active",
      draft: "Draft",
      paused: "Paused",
      closed: "Closed",
    };
    return labelMap[status] || status;
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
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
}

export const dashboardService = new DashboardService();
