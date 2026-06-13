import { apiClient } from "@/lib/api";

// Types for candidate profile
export interface CandidateProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  current_salary?: number;
  expected_salary?: number;
  experience_years?: number;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[];
  availability_status: "available" | "not_available" | "interviewing";
  preferred_job_types?: string[];
  preferred_locations?: string[];
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  current_salary?: number;
  expected_salary?: number;
  experience_years?: number;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[];
  availability_status?: "available" | "not_available" | "interviewing";
  preferred_job_types?: string[];
  preferred_locations?: string[];
  bio?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      status: string;
      email_verified: boolean;
    };
    profile: CandidateProfile;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: CandidateProfile;
}

export interface UploadResumeRequest {
  resume_url: string;
}

export interface CandidateResume {
  id: string;
  candidate_id: string;
  file_url: string;
  file_name: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  data: {
    resume_url: string;
    resumes?: CandidateResume[];
  };
}

export interface ResumesResponse {
  success: boolean;
  data: {
    resumes: CandidateResume[];
  };
}

export interface OnboardingResponse {
  success: boolean;
  data: {
    placements: any[];
    tasks: any[];
  };
}

class CandidateService {
  /**
   * Get candidate profile
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<ProfileResponse>("/candidate/profile");
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update candidate profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.put<UpdateProfileResponse>("/candidate/profile", data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload resume
   */
  async uploadResume(data: UploadResumeRequest): Promise<UploadResumeResponse> {
    try {
      const response = await apiClient.post<UploadResumeResponse>("/candidate/resume", data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload resume file (PDF/DOC/DOCX)
   */
  async uploadResumeFile(file: File): Promise<UploadResumeResponse> {
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await apiClient.upload<UploadResumeResponse["data"]>(
        "/candidate/resume/upload",
        formData
      );
      return response.data as UploadResumeResponse;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all resumes for the logged-in candidate
   */
  async getResumes(): Promise<ResumesResponse> {
    try {
      const response = await apiClient.get<ResumesResponse["data"]>(
        "/candidate/resumes"
      );
      return response.data as ResumesResponse;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark a resume as the candidate's primary resume
   */
  async setPrimaryResume(resumeId: string): Promise<ResumesResponse> {
    try {
      const response = await apiClient.patch<ResumesResponse["data"]>(
        `/candidate/resumes/${resumeId}/primary`
      );
      return response.data as ResumesResponse;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: string): Promise<ResumesResponse> {
    try {
      const response = await apiClient.delete<ResumesResponse["data"]>(
        `/candidate/resumes/${resumeId}`
      );
      return response.data as ResumesResponse;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch onboarding tasks and placements after hire
   */
  async getOnboarding(): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.get<OnboardingResponse>("/candidate/onboarding");
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.errors?.length > 0) {
      const firstError = error.response.data.errors[0];
      return new Error(firstError.message);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unexpected error occurred");
  }
}

// Export singleton instance
export const candidateService = new CandidateService();
export default candidateService;
