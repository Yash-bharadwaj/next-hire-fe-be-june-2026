import { apiClient } from "@/lib/api";

export interface Experience {
  id: string;
  candidate_id: string;
  job_title: string;
  company_name: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateExperienceRequest {
  job_title: string;
  company_name: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface UpdateExperienceRequest
  extends Partial<CreateExperienceRequest> {}

export interface ExperienceResponse {
  success: boolean;
  data: {
    experiences: Experience[];
  };
}

export interface SingleExperienceResponse {
  success: boolean;
  data: {
    experience: Experience;
  };
  message?: string;
}

class ExperienceService {
  private baseUrl = "/experience";

  async getExperiences(): Promise<ExperienceResponse> {
    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async createExperience(
    data: CreateExperienceRequest
  ): Promise<SingleExperienceResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateExperience(
    id: string,
    data: UpdateExperienceRequest
  ): Promise<SingleExperienceResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteExperience(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const experienceService = new ExperienceService();
