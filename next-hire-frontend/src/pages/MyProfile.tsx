import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelect, StateSelect, CitySelect } from "@/components/location-fields";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Edit,
  Save,
  X,
  Plus,
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  Building2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import {
  candidateService,
  CandidateProfile,
  CandidateResume,
  UpdateProfileRequest,
} from "@/services/candidateService";
import {
  experienceService,
  Experience,
  CreateExperienceRequest,
  UpdateExperienceRequest,
} from "@/services/experienceService";
import {
  skillsService,
  CandidateSkill,
  SkillCategory,
  ProficiencyLevel,
  CreateSkillRequest,
} from "@/services/skillsService";
import {
  vendorService,
  VendorProfile,
  UpdateVendorProfileRequest,
} from "@/services/vendorService";
import {
  recruiterService,
  RecruiterProfile,
  UpdateRecruiterProfileRequest,
} from "@/services/recruiterService";

export default function MyProfile() {
  const { user, setUser } = useAuth();
  const isVendor = user?.role === "vendor";
  const isRecruiter = user?.role === "recruiter";
  const isCandidate = !isVendor && !isRecruiter;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [originalProfile, setOriginalProfile] =
    useState<CandidateProfile | null>(null);

  // Experience and Skills state
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<
    Record<SkillCategory, CandidateSkill[]>
  >({} as Record<SkillCategory, CandidateSkill[]>);

  // Experience form state
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState<string | null>(
    null
  );
  const [experienceForm, setExperienceForm] = useState<CreateExperienceRequest>(
    {
      job_title: "",
      company_name: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      achievements: [],
      technologies: [],
    }
  );

  // Skills form state
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<CreateSkillRequest>({
    skill_name: "",
    category: "technical",
    proficiency_level: "intermediate",
    years_of_experience: undefined,
    is_primary: false,
  });

  // Avatar / resume upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Resume list state (multiple resumes with primary/delete)
  const [resumes, setResumes] = useState<CandidateResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumeActionId, setResumeActionId] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    bio: "",
    current_salary: "",
    expected_salary: "",
    experience_years: "",
    linkedin_url: "",
    portfolio_url: "",
    skills: [] as string[],
    availability_status: "available" as
      | "available"
      | "not_available"
      | "interviewing",
    preferred_job_types: [] as string[],
    preferred_locations: [] as string[],
  });

  // Vendor profile state
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(
    null
  );
  const [vendorFormData, setVendorFormData] = useState({
    company_name: "",
    company_website: "",
    contact_person_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    years_in_business: "",
    bio: "",
    specializations: [] as string[],
  });

  // Recruiter profile state
  const [recruiterProfile, setRecruiterProfile] =
    useState<RecruiterProfile | null>(null);
  const [recruiterFormData, setRecruiterFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    company_name: "",
    company_website: "",
    job_title: "",
    department: "",
    bio: "",
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
    if (isCandidate) {
      loadExperiences();
      loadSkills();
      loadResumes();
    }
  }, []);

  const mapVendorProfileToForm = (profileData: VendorProfile) => ({
    company_name: profileData.company_name || "",
    company_website: profileData.company_website || "",
    contact_person_name: profileData.contact_person_name || "",
    phone: profileData.phone || "",
    address: profileData.address || "",
    city: profileData.city || "",
    state: profileData.state || "",
    country: profileData.country || "",
    years_in_business: profileData.years_in_business?.toString() || "",
    bio: profileData.bio || "",
    specializations: profileData.specializations || [],
  });

  const mapRecruiterProfileToForm = (profileData: RecruiterProfile) => ({
    first_name: profileData.first_name || "",
    last_name: profileData.last_name || "",
    phone: profileData.phone || "",
    company_name: profileData.company_name || "",
    company_website: profileData.company_website || "",
    job_title: profileData.job_title || "",
    department: profileData.department || "",
    bio: profileData.bio || "",
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      if (isVendor) {
        const response = await vendorService.getProfile();
        const profileData = response.data.profile;
        setVendorProfile(profileData);
        setVendorFormData(mapVendorProfileToForm(profileData));
        return;
      }

      if (isRecruiter) {
        const response = await recruiterService.getProfile();
        const profileData = response.data.profile;
        setRecruiterProfile(profileData);
        setRecruiterFormData(mapRecruiterProfileToForm(profileData));
        return;
      }

      const response = await candidateService.getProfile();
      const profileData = response.data.profile;

      setProfile(profileData);
      setOriginalProfile(profileData);

      // Update form data with profile data
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        bio: profileData.bio || "",
        current_salary: profileData.current_salary?.toString() || "",
        expected_salary: profileData.expected_salary?.toString() || "",
        experience_years: profileData.experience_years?.toString() || "",
        linkedin_url: profileData.linkedin_url || "",
        portfolio_url: profileData.portfolio_url || "",
        skills: profileData.skills || [],
        availability_status: profileData.availability_status || "available",
        preferred_job_types: profileData.preferred_job_types || [],
        preferred_locations: profileData.preferred_locations || [],
      });
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast.error(error.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Load experiences
  const loadExperiences = async () => {
    try {
      const response = await experienceService.getExperiences();
      setExperiences(response.data.experiences);
    } catch (error: any) {
      console.error("Failed to load experiences:", error);
      toast.error("Failed to load experiences");
    }
  };

  // Load skills
  const loadSkills = async () => {
    try {
      const response = await skillsService.getSkills();
      setCandidateSkills(response.data.skills);
      setSkillsByCategory(response.data.skillsByCategory);
    } catch (error: any) {
      console.error("Failed to load skills:", error);
      toast.error("Failed to load skills");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (isVendor) {
        const updateData: UpdateVendorProfileRequest = {
          company_name: vendorFormData.company_name || undefined,
          company_website: vendorFormData.company_website || undefined,
          contact_person_name: vendorFormData.contact_person_name || undefined,
          phone: vendorFormData.phone || undefined,
          address: vendorFormData.address || undefined,
          city: vendorFormData.city || undefined,
          state: vendorFormData.state || undefined,
          country: vendorFormData.country || undefined,
          years_in_business: vendorFormData.years_in_business
            ? parseInt(vendorFormData.years_in_business)
            : undefined,
          bio: vendorFormData.bio || undefined,
          specializations:
            vendorFormData.specializations.length > 0
              ? vendorFormData.specializations
              : undefined,
        };

        const response = await vendorService.updateProfile(updateData);
        const updated = response.data!;
        setVendorProfile(updated);
        setVendorFormData(mapVendorProfileToForm(updated));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        return;
      }

      if (isRecruiter) {
        const updateData: UpdateRecruiterProfileRequest = {
          first_name: recruiterFormData.first_name || undefined,
          last_name: recruiterFormData.last_name || undefined,
          phone: recruiterFormData.phone || undefined,
          company_name: recruiterFormData.company_name || undefined,
          company_website: recruiterFormData.company_website || undefined,
          job_title: recruiterFormData.job_title || undefined,
          department: recruiterFormData.department || undefined,
          bio: recruiterFormData.bio || undefined,
        };

        const response = await recruiterService.updateProfile(updateData);
        const updated = response.data!;
        setRecruiterProfile(updated);
        setRecruiterFormData(mapRecruiterProfileToForm(updated));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        return;
      }

      // Prepare update data
      const updateData: UpdateProfileRequest = {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        bio: formData.bio || undefined,
        current_salary: formData.current_salary
          ? parseFloat(formData.current_salary)
          : undefined,
        expected_salary: formData.expected_salary
          ? parseFloat(formData.expected_salary)
          : undefined,
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : undefined,
        linkedin_url: formData.linkedin_url || undefined,
        portfolio_url: formData.portfolio_url || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        availability_status: formData.availability_status,
        preferred_job_types:
          formData.preferred_job_types.length > 0
            ? formData.preferred_job_types
            : undefined,
        preferred_locations:
          formData.preferred_locations.length > 0
            ? formData.preferred_locations
            : undefined,
      };

      const response = await candidateService.updateProfile(updateData);
      setProfile(response.data);
      setOriginalProfile(response.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isVendor) {
      if (vendorProfile) {
        setVendorFormData(mapVendorProfileToForm(vendorProfile));
      }
      setIsEditing(false);
      return;
    }

    if (isRecruiter) {
      if (recruiterProfile) {
        setRecruiterFormData(mapRecruiterProfileToForm(recruiterProfile));
      }
      setIsEditing(false);
      return;
    }

    if (originalProfile) {
      // Reset form data to original values
      setFormData({
        first_name: originalProfile.first_name || "",
        last_name: originalProfile.last_name || "",
        phone: originalProfile.phone || "",
        location: originalProfile.location || "",
        bio: originalProfile.bio || "",
        current_salary: originalProfile.current_salary?.toString() || "",
        expected_salary: originalProfile.expected_salary?.toString() || "",
        experience_years: originalProfile.experience_years?.toString() || "",
        linkedin_url: originalProfile.linkedin_url || "",
        portfolio_url: originalProfile.portfolio_url || "",
        skills: originalProfile.skills || [],
        availability_status: originalProfile.availability_status || "available",
        preferred_job_types: originalProfile.preferred_job_types || [],
        preferred_locations: originalProfile.preferred_locations || [],
      });
    }
    setIsEditing(false);
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const addPreferredJobType = (jobType: string) => {
    if (jobType && !formData.preferred_job_types.includes(jobType)) {
      setFormData({
        ...formData,
        preferred_job_types: [...formData.preferred_job_types, jobType],
      });
    }
  };

  const removePreferredJobType = (index: number) => {
    const newJobTypes = formData.preferred_job_types.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, preferred_job_types: newJobTypes });
  };

  const addPreferredLocation = (location: string) => {
    if (location && !formData.preferred_locations.includes(location)) {
      setFormData({
        ...formData,
        preferred_locations: [...formData.preferred_locations, location],
      });
    }
  };

  const removePreferredLocation = (index: number) => {
    const newLocations = formData.preferred_locations.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, preferred_locations: newLocations });
  };

  const addSpecialization = (specialization: string) => {
    if (
      specialization &&
      !vendorFormData.specializations.includes(specialization)
    ) {
      setVendorFormData({
        ...vendorFormData,
        specializations: [...vendorFormData.specializations, specialization],
      });
    }
  };

  const removeSpecialization = (index: number) => {
    setVendorFormData({
      ...vendorFormData,
      specializations: vendorFormData.specializations.filter(
        (_, i) => i !== index
      ),
    });
  };

  // Experience management functions
  const handleCreateExperience = async () => {
    try {
      await experienceService.createExperience(experienceForm);
      toast.success("Experience added successfully!");
      setIsAddingExperience(false);
      resetExperienceForm();
      loadExperiences();
    } catch (error: any) {
      toast.error(error.message || "Failed to add experience");
    }
  };

  const handleUpdateExperience = async (id: string) => {
    try {
      await experienceService.updateExperience(id, experienceForm);
      toast.success("Experience updated successfully!");
      setEditingExperience(null);
      resetExperienceForm();
      loadExperiences();
    } catch (error: any) {
      toast.error(error.message || "Failed to update experience");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await experienceService.deleteExperience(id);
      toast.success("Experience deleted successfully!");
      loadExperiences();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete experience");
    }
  };

  const resetExperienceForm = () => {
    setExperienceForm({
      job_title: "",
      company_name: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      achievements: [],
      technologies: [],
    });
  };

  const startEditingExperience = (experience: Experience) => {
    setExperienceForm({
      job_title: experience.job_title,
      company_name: experience.company_name,
      location: experience.location || "",
      start_date: experience.start_date.split("T")[0], // Convert to YYYY-MM-DD
      end_date: experience.end_date ? experience.end_date.split("T")[0] : "",
      is_current: experience.is_current,
      description: experience.description || "",
      achievements: experience.achievements || [],
      technologies: experience.technologies || [],
    });
    setEditingExperience(experience.id);
  };

  // Skills management functions
  const handleCreateSkill = async () => {
    try {
      await skillsService.createSkill(skillForm);
      toast.success("Skill added successfully!");
      setIsAddingSkill(false);
      resetSkillForm();
      loadSkills();
    } catch (error: any) {
      toast.error(error.message || "Failed to add skill");
    }
  };

  const handleUpdateSkill = async (id: string) => {
    try {
      await skillsService.updateSkill(id, skillForm);
      toast.success("Skill updated successfully!");
      setEditingSkill(null);
      resetSkillForm();
      loadSkills();
    } catch (error: any) {
      toast.error(error.message || "Failed to update skill");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await skillsService.deleteSkill(id);
      toast.success("Skill deleted successfully!");
      loadSkills();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete skill");
    }
  };

  const resetSkillForm = () => {
    setSkillForm({
      skill_name: "",
      category: "technical",
      proficiency_level: "intermediate",
      years_of_experience: undefined,
      is_primary: false,
    });
  };

  const startEditingSkill = (skill: CandidateSkill) => {
    setSkillForm({
      skill_name: skill.skill_name,
      category: skill.category,
      proficiency_level: skill.proficiency_level,
      years_of_experience: skill.years_of_experience,
      is_primary: skill.is_primary,
    });
    setEditingSkill(skill.id);
  };

  // Profile photo upload (all roles)
  const handleAvatarFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarUploading(true);
    try {
      const { profile_image_url } = await authService.uploadAvatar(file);
      if (user) {
        setUser({ ...user, profile_image_url });
      }
      toast.success("Profile photo updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload profile photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Load all resumes for the candidate
  const loadResumes = async () => {
    setResumesLoading(true);
    try {
      const { data } = await candidateService.getResumes();
      setResumes(data.resumes || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load resumes");
    } finally {
      setResumesLoading(false);
    }
  };

  // Resume upload (candidates only)
  const handleResumeFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setResumeUploading(true);
    try {
      const { data } = await candidateService.uploadResumeFile(file);
      setProfile((prev) => (prev ? { ...prev, resume_url: data.resume_url } : prev));
      setOriginalProfile((prev) =>
        prev ? { ...prev, resume_url: data.resume_url } : prev
      );
      if (data.resumes) {
        setResumes(data.resumes);
      } else {
        await loadResumes();
      }
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  // Set a resume as the primary resume
  const handleSetPrimaryResume = async (resumeId: string) => {
    setResumeActionId(resumeId);
    try {
      const { data } = await candidateService.setPrimaryResume(resumeId);
      setResumes(data.resumes || []);
      const primary = data.resumes?.find((r) => r.is_primary);
      setProfile((prev) =>
        prev ? { ...prev, resume_url: primary?.file_url } : prev
      );
      setOriginalProfile((prev) =>
        prev ? { ...prev, resume_url: primary?.file_url } : prev
      );
      toast.success("Primary resume updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to set primary resume");
    } finally {
      setResumeActionId(null);
    }
  };

  // Delete a resume
  const handleDeleteResume = async (resume: CandidateResume) => {
    if (!window.confirm(`Delete "${resume.file_name}"? This cannot be undone.`)) {
      return;
    }

    setResumeActionId(resume.id);
    try {
      const { data } = await candidateService.deleteResume(resume.id);
      setResumes(data.resumes || []);
      const primary = data.resumes?.find((r) => r.is_primary);
      setProfile((prev) =>
        prev ? { ...prev, resume_url: primary?.file_url } : prev
      );
      setOriginalProfile((prev) =>
        prev ? { ...prev, resume_url: primary?.file_url } : prev
      );
      toast.success("Resume deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resume");
    } finally {
      setResumeActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="bg-green-600 hover:bg-green-700"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isEditing ? (
            <Save className="w-4 h-4 mr-2" />
          ) : (
            <Edit className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className={`grid w-full ${isCandidate ? "grid-cols-6" : "grid-cols-3"}`}>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">
            {isCandidate ? "Professional" : "Company Info"}
          </TabsTrigger>
          {isCandidate && (
            <>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </>
          )}
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  {user?.profile_image_url && (
                    <AvatarImage
                      src={`${API_BASE_URL}${user.profile_image_url}`}
                    />
                  )}
                  <AvatarFallback className="text-xl bg-green-100 text-green-700">
                    {isVendor
                      ? (vendorFormData.contact_person_name ||
                          vendorFormData.company_name ||
                          user?.email ||
                          "U")[0]?.toUpperCase()
                      : isRecruiter
                      ? ((recruiterFormData.first_name || "") +
                          " " +
                          (recruiterFormData.last_name || ""))
                          .trim()
                          .split(" ")
                          .map((n) => n[0])
                          .join("") ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"
                      : (
                          (formData.first_name || "") +
                          " " +
                          (formData.last_name || "")
                        )
                          .trim()
                          .split(" ")
                          .map((n) => n[0])
                          .join("") ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFileSelected}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {avatarUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                    {isCandidate && (
                      <>
                        <input
                          type="file"
                          ref={resumeInputRef}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleResumeFileSelected}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={resumeUploading}
                        >
                          {resumeUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4 mr-2" />
                          )}
                          {resumeUploading ? "Uploading..." : "Upload Resume"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {isVendor ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person_name">
                      Contact Person Name
                    </Label>
                    <Input
                      id="contact_person_name"
                      value={vendorFormData.contact_person_name}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          contact_person_name: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={vendorFormData.phone}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          phone: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={vendorFormData.address}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <CountrySelect
                      value={vendorFormData.country}
                      onChange={(value) =>
                        setVendorFormData({
                          ...vendorFormData,
                          country: value,
                          state: "",
                          city: "",
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <StateSelect
                      country={vendorFormData.country}
                      value={vendorFormData.state}
                      onChange={(value) =>
                        setVendorFormData({
                          ...vendorFormData,
                          state: value,
                          city: "",
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <CitySelect
                      country={vendorFormData.country}
                      state={vendorFormData.state}
                      value={vendorFormData.city}
                      onChange={(value) =>
                        setVendorFormData({
                          ...vendorFormData,
                          city: value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              ) : isRecruiter ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={recruiterFormData.first_name}
                        onChange={(e) =>
                          setRecruiterFormData({
                            ...recruiterFormData,
                            first_name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={recruiterFormData.last_name}
                        onChange={(e) =>
                          setRecruiterFormData({
                            ...recruiterFormData,
                            last_name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={recruiterFormData.phone}
                        onChange={(e) =>
                          setRecruiterFormData({
                            ...recruiterFormData,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={recruiterFormData.bio}
                      onChange={(e) =>
                        setRecruiterFormData({
                          ...recruiterFormData,
                          bio: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({ ...formData, first_name: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({ ...formData, last_name: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Enter your location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability_status">
                        Availability Status
                      </Label>
                      <Select
                        value={formData.availability_status}
                        onValueChange={(
                          value: "available" | "not_available" | "interviewing"
                        ) =>
                          setFormData({ ...formData, availability_status: value })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="not_available">
                            Not Available
                          </SelectItem>
                          <SelectItem value="interviewing">
                            Currently Interviewing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          {isVendor ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Update your company details and areas of specialization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={vendorFormData.company_name}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          company_name: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_website">Company Website</Label>
                    <Input
                      id="company_website"
                      type="url"
                      value={vendorFormData.company_website}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          company_website: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_in_business">
                      Years in Business
                    </Label>
                    <Input
                      id="years_in_business"
                      type="number"
                      min="0"
                      max="100"
                      value={vendorFormData.years_in_business}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          years_in_business: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter years in business"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Specializations
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {vendorFormData.specializations.map((spec, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-blue-200 text-blue-800"
                      >
                        {spec}
                        {isEditing && (
                          <X
                            className="w-3 h-3 ml-1 cursor-pointer"
                            onClick={() => removeSpecialization(index)}
                          />
                        )}
                      </Badge>
                    ))}
                    {vendorFormData.specializations.length === 0 && (
                      <p className="text-gray-500 text-sm">
                        No specializations specified
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add specialization (e.g., IT Staffing, Healthcare)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const spec = e.currentTarget.value.trim();
                            if (spec) {
                              addSpecialization(spec);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input =
                            e.currentTarget.parentElement?.querySelector(
                              "input"
                            );
                          const spec = input?.value.trim();
                          if (spec) {
                            addSpecialization(spec);
                            input.value = "";
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor_bio">About the Company</Label>
                  <Textarea
                    id="vendor_bio"
                    value={vendorFormData.bio}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        bio: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about your company..."
                  />
                </div>
              </CardContent>
            </Card>
          ) : isRecruiter ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Update your company and role details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={recruiterFormData.company_name}
                      onChange={(e) =>
                        setRecruiterFormData({
                          ...recruiterFormData,
                          company_name: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_website">Company Website</Label>
                    <Input
                      id="company_website"
                      type="url"
                      value={recruiterFormData.company_website}
                      onChange={(e) =>
                        setRecruiterFormData({
                          ...recruiterFormData,
                          company_website: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={recruiterFormData.job_title}
                      onChange={(e) =>
                        setRecruiterFormData({
                          ...recruiterFormData,
                          job_title: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., Senior Technical Recruiter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={recruiterFormData.department}
                      onChange={(e) =>
                        setRecruiterFormData({
                          ...recruiterFormData,
                          department: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., Talent Acquisition"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Update your professional details and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_years: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_salary">Current Salary (USD)</Label>
                    <Input
                      id="current_salary"
                      type="number"
                      min="0"
                      value={formData.current_salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_salary: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter current salary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_salary">Expected Salary (USD)</Label>
                    <Input
                      id="expected_salary"
                      type="number"
                      min="0"
                      value={formData.expected_salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expected_salary: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter expected salary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin_url: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio_url">Portfolio URL</Label>
                    <Input
                      id="portfolio_url"
                      type="url"
                      value={formData.portfolio_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_url: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isCandidate && (
        <>
        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Experience
              </CardTitle>
              <CardDescription>
                Add and manage your work experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Experience Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Work Experience</h3>
                <Button
                  onClick={() => setIsAddingExperience(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {/* Experience List */}
              <div className="space-y-4">
                {experiences.map((experience) => (
                  <div
                    key={experience.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {experience.job_title}
                        </h4>
                        <p className="text-gray-600 font-medium">
                          {experience.company_name}
                        </p>
                        {experience.location && (
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {experience.location}
                          </p>
                        )}
                        <p className="text-gray-500 text-sm">
                          {new Date(experience.start_date).toLocaleDateString()}{" "}
                          -{" "}
                          {experience.is_current
                            ? "Present"
                            : new Date(
                                experience.end_date!
                              ).toLocaleDateString()}
                        </p>
                        {experience.description && (
                          <p className="text-gray-700 mt-2">
                            {experience.description}
                          </p>
                        )}
                        {experience.achievements &&
                          experience.achievements.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">
                                Key Achievements:
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                {experience.achievements.map(
                                  (achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {experience.technologies &&
                          experience.technologies.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Technologies:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {experience.technologies.map((tech, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingExperience(experience)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteExperience(experience.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {experiences.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No work experience added yet</p>
                    <p className="text-sm">
                      Add your professional experience to showcase your
                      background
                    </p>
                  </div>
                )}
              </div>

              {/* Add/Edit Experience Form */}
              {(isAddingExperience || editingExperience) && (
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingExperience
                        ? "Edit Experience"
                        : "Add New Experience"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="job_title">Job Title *</Label>
                        <Input
                          id="job_title"
                          value={experienceForm.job_title}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              job_title: e.target.value,
                            })
                          }
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company_name">Company Name *</Label>
                        <Input
                          id="company_name"
                          value={experienceForm.company_name}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              company_name: e.target.value,
                            })
                          }
                          placeholder="e.g., Google"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={experienceForm.location}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            location: e.target.value,
                          })
                        }
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={experienceForm.start_date}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={experienceForm.end_date}
                          onChange={(e) =>
                            setExperienceForm({
                              ...experienceForm,
                              end_date: e.target.value,
                            })
                          }
                          disabled={experienceForm.is_current}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_current"
                        checked={experienceForm.is_current}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            is_current: e.target.checked,
                            end_date: e.target.checked
                              ? ""
                              : experienceForm.end_date,
                          })
                        }
                      />
                      <Label htmlFor="is_current">I currently work here</Label>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={experienceForm.description}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your role and responsibilities..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingExperience(false);
                          setEditingExperience(null);
                          resetExperienceForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          editingExperience
                            ? handleUpdateExperience(editingExperience)
                            : handleCreateExperience()
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {editingExperience
                          ? "Update Experience"
                          : "Add Experience"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>
                Manage your skills and areas of expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Skill Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Professional Skills</h3>
                <Button
                  onClick={() => setIsAddingSkill(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              {/* Skills by Category */}
              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="text-md font-medium text-gray-700 mb-3 capitalize">
                      {category === "technical"
                        ? "Technical Skills"
                        : category === "soft"
                        ? "Soft Skills"
                        : category === "language"
                        ? "Languages"
                        : category === "certification"
                        ? "Certifications"
                        : "Other Skills"}
                    </h4>
                    <div className="grid gap-3">
                      {skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {skill.skill_name}
                                </span>
                                {skill.is_primary && (
                                  <Badge
                                    variant="default"
                                    className="bg-green-100 text-green-800 text-xs"
                                  >
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="capitalize">
                                  {skill.proficiency_level}
                                </span>
                                {skill.years_of_experience && (
                                  <span>{skill.years_of_experience} years</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingSkill(skill)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteSkill(skill.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {candidateSkills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No skills added yet</p>
                    <p className="text-sm">
                      Add your professional skills to showcase your expertise
                    </p>
                  </div>
                )}
              </div>

              {/* Add/Edit Skill Form */}
              {(isAddingSkill || editingSkill) && (
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingSkill ? "Edit Skill" : "Add New Skill"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="skill_name">Skill Name *</Label>
                        <Input
                          id="skill_name"
                          value={skillForm.skill_name}
                          onChange={(e) =>
                            setSkillForm({
                              ...skillForm,
                              skill_name: e.target.value,
                            })
                          }
                          placeholder="e.g., JavaScript, Leadership, Spanish"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={skillForm.category}
                          onValueChange={(value: SkillCategory) =>
                            setSkillForm({ ...skillForm, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="soft">Soft Skills</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
                            <SelectItem value="certification">
                              Certification
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proficiency_level">
                          Proficiency Level
                        </Label>
                        <Select
                          value={skillForm.proficiency_level}
                          onValueChange={(value: ProficiencyLevel) =>
                            setSkillForm({
                              ...skillForm,
                              proficiency_level: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="years_of_experience">
                          Years of Experience
                        </Label>
                        <Input
                          id="years_of_experience"
                          type="number"
                          min="0"
                          max="50"
                          value={skillForm.years_of_experience || ""}
                          onChange={(e) =>
                            setSkillForm({
                              ...skillForm,
                              years_of_experience: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_primary"
                        checked={skillForm.is_primary}
                        onChange={(e) =>
                          setSkillForm({
                            ...skillForm,
                            is_primary: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="is_primary">Mark as primary skill</Label>
                    </div>

                    <div className="flex gap-4 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingSkill(false);
                          setEditingSkill(null);
                          resetSkillForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          editingSkill
                            ? handleUpdateSkill(editingSkill)
                            : handleCreateSkill()
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {editingSkill ? "Update Skill" : "Add Skill"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </>
        )}

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
              <CardDescription>
                Manage your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Upload Resume
                  </h3>
                  <p className="text-gray-600 mb-4">
                    PDF, DOC, or DOCX up to 5MB
                  </p>
                  <input
                    type="file"
                    ref={resumeInputRef}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeFileSelected}
                  />
                  <Button
                    variant="outline"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={resumeUploading}
                  >
                    {resumeUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {resumeUploading ? "Uploading..." : "Choose File"}
                  </Button>
                </div>

                {/* Resumes */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Your Resumes</h4>
                  {resumesLoading ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading resumes...
                    </div>
                  ) : resumes.length > 0 ? (
                    <div className="space-y-2">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-gray-900 truncate">
                                  {resume.file_name}
                                </h5>
                                {resume.is_primary && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              {resume.created_at && (
                                <p className="text-sm text-gray-500">
                                  Uploaded{" "}
                                  {new Date(resume.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {!resume.is_primary && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Set as Primary"
                                disabled={resumeActionId === resume.id}
                                onClick={() => handleSetPrimaryResume(resume.id)}
                              >
                                {resumeActionId === resume.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Star className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Download"
                              onClick={() =>
                                window.open(
                                  `${API_BASE_URL}${resume.file_url}`,
                                  "_blank"
                                )
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Delete"
                              disabled={resumeActionId === resume.id}
                              onClick={() => handleDeleteResume(resume)}
                            >
                              {resumeActionId === resume.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No resume uploaded yet</p>
                      <p className="text-sm">
                        Upload your resume to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {isCandidate && (
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>
                Set your job search preferences and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Preferred Job Types
                </Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.preferred_job_types.map((jobType, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-blue-200 text-blue-800"
                    >
                      {jobType}
                      {isEditing && (
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removePreferredJobType(index)}
                        />
                      )}
                    </Badge>
                  ))}
                  {formData.preferred_job_types.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No job types specified
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add job type (e.g., Full-time, Remote, Contract)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const jobType = e.currentTarget.value.trim();
                          if (jobType) {
                            addPreferredJobType(jobType);
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input =
                          e.currentTarget.parentElement?.querySelector("input");
                        const jobType = input?.value.trim();
                        if (jobType) {
                          addPreferredJobType(jobType);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Preferred Locations
                </Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.preferred_locations.map((location, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-purple-200 text-purple-800"
                    >
                      {location}
                      {isEditing && (
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removePreferredLocation(index)}
                        />
                      )}
                    </Badge>
                  ))}
                  {formData.preferred_locations.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No location preferences specified
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add location (e.g., San Francisco, Remote, New York)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const location = e.currentTarget.value.trim();
                          if (location) {
                            addPreferredLocation(location);
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input =
                          e.currentTarget.parentElement?.querySelector("input");
                        const location = input?.value.trim();
                        if (location) {
                          addPreferredLocation(location);
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Email notifications for new job matches</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>SMS notifications for interview updates</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Weekly digest emails</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Privacy</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Make my profile visible to recruiters</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Allow direct contact from employers</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
