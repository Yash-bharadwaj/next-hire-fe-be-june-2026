import { apiClient } from "@/lib/api";

export type SkillCategory =
  | "technical"
  | "soft"
  | "language"
  | "certification"
  | "other";
export type ProficiencyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  category: SkillCategory;
  proficiency_level: ProficiencyLevel;
  years_of_experience?: number;
  is_primary: boolean;
  endorsements?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSkillRequest {
  skill_name: string;
  category?: SkillCategory;
  proficiency_level?: ProficiencyLevel;
  years_of_experience?: number;
  is_primary?: boolean;
}

export interface UpdateSkillRequest extends Partial<CreateSkillRequest> {}

export interface BulkUpdateSkillsRequest {
  skills: Array<{
    skill_name: string;
    category?: SkillCategory;
    proficiency_level?: ProficiencyLevel;
    years_of_experience?: number;
    is_primary?: boolean;
  }>;
}

export interface SkillsResponse {
  success: boolean;
  data: {
    skills: CandidateSkill[];
    skillsByCategory: Record<SkillCategory, CandidateSkill[]>;
  };
}

export interface SingleSkillResponse {
  success: boolean;
  data: {
    skill: CandidateSkill;
  };
  message?: string;
}

export interface BulkSkillsResponse {
  success: boolean;
  data: {
    skills: CandidateSkill[];
  };
  message?: string;
}

class SkillsService {
  private baseUrl = "/skills";

  async getSkills(): Promise<SkillsResponse> {
    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async createSkill(data: CreateSkillRequest): Promise<SingleSkillResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateSkill(
    id: string,
    data: UpdateSkillRequest
  ): Promise<SingleSkillResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteSkill(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async bulkUpdateSkills(
    data: BulkUpdateSkillsRequest
  ): Promise<BulkSkillsResponse> {
    const response = await apiClient.post(`${this.baseUrl}/bulk`, data);
    return response.data;
  }

  // Helper method to migrate from old simple skills array
  async migrateFromSimpleSkills(skills: string[]): Promise<BulkSkillsResponse> {
    const skillsData = skills.map((skill, index) => ({
      skill_name: skill,
      category: "technical" as SkillCategory,
      proficiency_level: "intermediate" as ProficiencyLevel,
      is_primary: index < 5, // Mark first 5 as primary
    }));

    return this.bulkUpdateSkills({ skills: skillsData });
  }
}

export const skillsService = new SkillsService();
