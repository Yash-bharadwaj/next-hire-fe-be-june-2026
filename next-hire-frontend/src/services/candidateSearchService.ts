import { apiClient } from "@/lib/api";

export interface CandidateProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  current_salary?: number;
  expected_salary?: number;
  experience_years?: number;
  bio?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  availability_status: "available" | "not_available" | "interviewing" | "employed";
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    status: string;
    created_at: string;
    last_login_at?: string;
  };
  experiences?: Array<{
    id: string;
    job_title: string;
    company_name: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
  }>;
  education?: Array<{
    id: string;
    degree: string;
    institution: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
  }>;
  candidateSkills?: Array<{
    id: string;
    skill_name: string;
    category: "technical" | "soft" | "language" | "certification" | "other";
    proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
    years_of_experience?: number;
    is_primary: boolean;
  }>;
}

export interface CandidateSearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  skills?: string;
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  availability_status?: "available" | "not_available" | "interviewing" | "employed";
  education_level?: string;
  sort_by?: "name" | "experience" | "salary" | "created_at";
  sort_order?: "ASC" | "DESC";
}

export interface CandidateSearchResponse {
  success: boolean;
  data: {
    candidates: CandidateProfile[];
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

export interface CandidateDetailsResponse {
  success: boolean;
  data: {
    candidate: CandidateProfile;
    submissions: Array<{
      id: string;
      status: string;
      submitted_at: string;
      job?: {
        id: string;
        job_id: string;
        title: string;
        company_name: string;
        status: string;
      };
    }>;
  };
}

export interface CandidateStatsResponse {
  success: boolean;
  data: {
    totalCandidates: number;
    recentCandidates: number;
    availabilityStats: Array<{
      availability_status: string;
      count: number;
    }>;
    experienceStats: Array<{
      experience_level: string;
      count: number;
    }>;
    topSkills: Array<{
      skill_name: string;
      count: number;
    }>;
  };
}

class CandidateSearchService {
  private baseUrl = "/candidate-search";

  async searchCandidates(filters: CandidateSearchFilters = {}): Promise<CandidateSearchResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/search?${params.toString()}`);
    return response.data;
  }

  async getCandidateDetails(id: string): Promise<CandidateDetailsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getCandidateStats(): Promise<CandidateStatsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Helper methods
  formatCandidateName(candidate: CandidateProfile): string {
    return `${candidate.first_name} ${candidate.last_name}`;
  }

  formatExperience(years?: number): string {
    if (!years) return "No experience specified";
    if (years === 1) return "1 year";
    return `${years} years`;
  }

  formatSalary(amount?: number): string {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getAvailabilityColor(status: string): string {
    const colorMap: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      not_available: "bg-red-100 text-red-800",
      interviewing: "bg-yellow-100 text-yellow-800",
      employed: "bg-blue-100 text-blue-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  getAvailabilityLabel(status: string): string {
    const labelMap: Record<string, string> = {
      available: "Available",
      not_available: "Not Available",
      interviewing: "Interviewing",
      employed: "Employed",
    };
    return labelMap[status] || status;
  }

  getProficiencyColor(level: string): string {
    const colorMap: Record<string, string> = {
      beginner: "bg-gray-100 text-gray-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-green-100 text-green-800",
      expert: "bg-purple-100 text-purple-800",
    };
    return colorMap[level] || "bg-gray-100 text-gray-800";
  }

  getSkillCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      technical: "bg-blue-100 text-blue-800",
      soft: "bg-green-100 text-green-800",
      language: "bg-purple-100 text-purple-800",
      certification: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} days ago`;
      } else {
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} months ago`;
      }
    }
  }

  calculateMatchScore(candidate: CandidateProfile, jobRequirements: string[]): number {
    if (!candidate.candidateSkills || jobRequirements.length === 0) return 0;
    
    const candidateSkills = candidate.candidateSkills.map(skill => 
      skill.skill_name.toLowerCase()
    );
    
    const matchedSkills = jobRequirements.filter(req => 
      candidateSkills.some(skill => 
        skill.includes(req.toLowerCase()) || req.toLowerCase().includes(skill)
      )
    );
    
    return Math.round((matchedSkills.length / jobRequirements.length) * 100);
  }
}

export const candidateSearchService = new CandidateSearchService();
