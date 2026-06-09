import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Mail,
  Phone,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  Video,
  Building,
  Target,
  CheckSquare,
  UserPlus,
  Briefcase,
  Plus,
  Download,
  Upload,
  CalendarDays,
  User,
  Star,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Search,
  Brain,
  Bot,
  UserCog,
  MoreHorizontal,
  Settings,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useJob } from "@/hooks/useJobs";
import { jobService } from "@/services/jobService";
import { recruiterService } from "@/services/recruiterService";

// Local type definitions
interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
  validFrom: string;
  validTo?: string;
  status?: string;
  description?: string;
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { job, loading, error, refresh } = useJob(id || null, false); // Use private endpoint for recruiters
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Local state for edit operations
  const [isUpdating, setIsUpdating] = useState(false);
  const [localJob, setLocalJob] = useState(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(
    searchParams.get("edit") === "true"
  );
  const [editedJob, setEditedJob] = useState<any>(null);

  // Map API job data to component expected format
  const mapJobData = (apiJob: any) => {
    if (!apiJob) return null;

    return {
      ...apiJob,
      jobTitle: apiJob.title,
      customer: apiJob.company_name,
      jobDescription: apiJob.description,
      externalJobDescription: apiJob.external_description || "",
      jobType: apiJob.job_type,
      createdOn: apiJob.created_at,
      minExperience: apiJob.experience_min || 0,
      maxExperience: apiJob.experience_max || 0,
      salary:
        apiJob.salary_min && apiJob.salary_max
          ? `$${apiJob.salary_min / 1000}k - $${apiJob.salary_max / 1000}k`
          : apiJob.salary_min
          ? `$${apiJob.salary_min / 1000}k+`
          : "Competitive",
      primarySkills: apiJob.required_skills || [],
      secondarySkills: apiJob.preferred_skills || [],
      state: apiJob.location || apiJob.city || apiJob.state || "Remote",
      clientContact: apiJob.assigned_to || "Unassigned",
      endClient: apiJob.company_name,
      educationRequirements: apiJob.education_requirements || "Not specified",
      positionsAvailable: apiJob.positions_available || 1,
      applicationDeadline: apiJob.application_deadline,
      startDate: apiJob.start_date,
      endDate: apiJob.end_date,
    };
  };

  // Update editedJob when job data is loaded
  useEffect(() => {
    if (job && !editedJob) {
      const mappedJob = mapJobData(job);
      setEditedJob(mappedJob);
    }
  }, [job, editedJob]);

  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchJobId, setSearchJobId] = useState("");

  // Profitability analysis removed - not needed for this version

  // Handle edit mode changes
  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditMode(true);
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!editedJob || !id) return;

    try {
      setIsUpdating(true);

      // Map the edited job data to API format
      const updateData = {
        title: editedJob.jobTitle,
        description: editedJob.jobDescription,
        external_description: editedJob.externalJobDescription,
        company_name: editedJob.customer,
        location: editedJob.state || editedJob.location,
        city: editedJob.city,
        state: editedJob.state,
        country: editedJob.country,
        job_type: editedJob.jobType,
        salary_min: editedJob.salary_min,
        salary_max: editedJob.salary_max,
        salary_currency: editedJob.salary_currency,
        experience_min: editedJob.minExperience,
        experience_max: editedJob.maxExperience,
        required_skills: editedJob.primarySkills || [],
        preferred_skills: editedJob.secondarySkills || [],
        education_requirements: editedJob.educationRequirements,
        status: editedJob.status,
        priority: editedJob.priority,
        positions_available: editedJob.positionsAvailable,
        max_submissions_allowed: editedJob.max_submissions_allowed,
        vendor_eligible: editedJob.vendor_eligible,
        remote_work_allowed: editedJob.remote_work_allowed,
        start_date: editedJob.startDate,
        end_date: editedJob.endDate,
        application_deadline: editedJob.applicationDeadline,
      };

      const response = await jobService.updateJob(id, updateData);

      if (response.success) {
        // Update the job data with the response
        setLocalJob(response.data.job);
        setEditedJob(null);
        setIsEditMode(false);

        // Show success message
        toast({
          title: "Job Updated Successfully",
          description: "The job has been updated with your changes.",
        });

        // Remove edit parameter from URL
        navigate(`/dashboard/jobs/${id}`, { replace: true });
      } else {
        throw new Error(response.message || "Failed to update job");
      }
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Error Updating Job",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset to original job data
    setEditedJob(job ? { ...job } : null);
    setIsEditMode(false);
    // Remove edit parameter from URL
    navigate(`/dashboard/jobs/${id}`, { replace: true });
  };

  const handleFieldChange = (field: string, value: any) => {
    if (editedJob) {
      setEditedJob({ ...editedJob, [field]: value });
    }
  };

  const currentJob = isEditMode ? editedJob : mapJobData(job);

  // Search functionality
  const handleSearchJob = () => {
    if (searchJobId.trim()) {
      // Simply navigate to the job - let the job detail page handle if it exists or not
      navigate(`/dashboard/jobs/${searchJobId.trim()}`);
      setSearchJobId("");
      setIsSearchExpanded(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchJob();
    }
  };

  // Candidates will be loaded from submissions API in the future
  const [candidates, setCandidates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Job notes will be loaded from backend in the future
  const [jobNotes, setJobNotes] = useState([]);

  // Notes filter and sort state
  const [notesFilter, setNotesFilter] = useState("all");
  const [notesSort, setNotesSort] = useState("newest");
  const [notesSearch, setNotesSearch] = useState("");

  // Filter and sort function for job notes
  const getFilteredAndSortedJobNotes = () => {
    let filtered = jobNotes.filter((note) => {
      const matchesFilter =
        notesFilter === "all" || note.category === notesFilter;
      const matchesSearch =
        notesSearch === "" ||
        note.content.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.author.toLowerCase().includes(notesSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (notesSort) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "author":
          return a.author.localeCompare(b.author);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });
  };

  const kanbanColumns = [
    { id: "sourced", title: "New Candidates", color: "bg-gray-50" },
    { id: "screening", title: "Initial Scanning", color: "bg-blue-50" },
    { id: "submitted", title: "First Round", color: "bg-purple-50" },
    {
      id: "interview",
      title: "Technical Manager Round",
      color: "bg-yellow-50",
    },
    { id: "offer", title: "Final Round", color: "bg-green-50" },
  ];

  const handleAddCandidate = (stageId: string) => {
    console.log(`Adding candidate to ${stageId}`);
  };

  const handleMoveCandidate = (candidateId: number, newStage: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, stage: newStage }
          : candidate
      )
    );
  };

  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter((candidate) => candidate.stage === stageId);
  };

  const getStageCount = (stageId: string) => {
    return getCandidatesByStage(stageId).length;
  };

  // Team management removed - not needed for this version

  // Mock job documents with expiration tracking
  // Job documents will be loaded from backend in the future
  const [jobDocuments, setJobDocuments] = useState<Document[]>([]);

  const handleJobDocumentUpload = (newDocument: Omit<Document, "id">) => {
    const documentWithId = {
      ...newDocument,
      id: jobDocuments.length + 1,
    };
    setJobDocuments((prev) => [...prev, documentWithId]);
  };

  // Todos functionality removed - not needed for this version

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Mock data for users and roles
  const usersData = {
    users: [
      {
        id: 1,
        name: "John Smith",
        role: "Technical Interviewer",
        email: "john.smith@company.com",
        status: "Active",
        avatar: "JS",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        role: "Lead Recruiter",
        email: "sarah.johnson@company.com",
        status: "Active",
        avatar: "SJ",
      },
      {
        id: 3,
        name: "Emily Davis",
        role: "Account Manager",
        email: "emily.davis@company.com",
        status: "Active",
        avatar: "ED",
      },
      {
        id: 4,
        name: "Mike Rodriguez",
        role: "Senior Recruiter",
        email: "mike.rodriguez@company.com",
        status: "Active",
        avatar: "MR",
      },
      {
        id: 5,
        name: "Lisa Wang",
        role: "HR Manager",
        email: "lisa.wang@company.com",
        status: "Active",
        avatar: "LW",
      },
    ],
  };

  const rolesData = {
    roles: [
      { id: 1, name: "Lead Recruiter" },
      { id: 2, name: "Senior Recruiter" },
      { id: 3, name: "Account Manager" },
      { id: 4, name: "Technical Interviewer" },
      { id: 5, name: "HR Manager" },
      { id: 6, name: "Reviewer" },
      { id: 7, name: "Collaborator" },
    ],
  };

  // Load personalization settings from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("jobDetailPersonalization");
    if (saved) {
      try {
        setPersonalizationSettings(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse personalization settings:", error);
      }
    }
  }, []);

  // Listen for personalization settings event from TopNavbar
  useEffect(() => {
    const handleOpenPersonalization = () => {
      setIsPersonalizationOpen(true);
    };

    window.addEventListener(
      "openPersonalizationSettings",
      handleOpenPersonalization
    );
    return () =>
      window.removeEventListener(
        "openPersonalizationSettings",
        handleOpenPersonalization
      );
  }, []);

  // Todo functions
  // Todo functions removed - not needed for this version

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Fetch submission statistics from backend
  const [submissionStats, setSubmissionStats] = useState({
    total: 0,
    hired: 0,
    rejected: 0,
    active: 0,
  });

  // Map submission status to kanban stage
  const mapSubmissionStatusToStage = (status: string): string => {
    const statusMap: Record<string, string> = {
      "submitted": "submitted",
      "under_review": "screening",
      "shortlisted": "screening",
      "interview_scheduled": "submitted",
      "interviewed": "submitted",
      "offered": "offer",
      "hired": "offer",
      "rejected": "sourced", // Rejected candidates stay in sourced for visibility
    };
    return statusMap[status] || "sourced";
  };

  useEffect(() => {
    const fetchSubmissionStats = async () => {
      if (!id) return;
      
      try {
        // Fetch all submissions for this job using pagination
        let allSubmissions: any[] = [];
        let currentPage = 1;
        let hasMore = true;
        const limit = 100; // Backend max limit
        
        while (hasMore) {
          const response = await recruiterService.getJobSubmissions(id, {
            page: currentPage,
            limit: limit,
          });
          
          const submissions = response.data.submissions || [];
          allSubmissions = [...allSubmissions, ...submissions];
          
          const pagination = response.data.pagination || {};
          const totalPages = pagination.total_pages || pagination.totalPages || 1;
          
          if (currentPage >= totalPages || submissions.length < limit) {
            hasMore = false;
          } else {
            currentPage++;
          }
        }
        
        // Store submissions for kanban display
        setSubmissions(allSubmissions);
        
        // Map submissions to candidates format for kanban
        const mappedCandidates = allSubmissions.map((sub: any, index: number) => ({
          id: sub.id || `sub-${index}`,
          name: `${sub.candidate?.first_name || ""} ${sub.candidate?.last_name || ""}`.trim() || "Unknown Candidate",
          experience: `${sub.candidate?.years_of_experience || 0} years`,
          location: sub.candidate?.location || sub.job?.location || "Unknown",
          score: sub.ai_score || Math.floor(Math.random() * 100),
          stage: mapSubmissionStatusToStage(sub.status),
          notes: sub.notes || sub.cover_letter?.substring(0, 100),
          submission: sub, // Keep reference to original submission
        }));
        setCandidates(mappedCandidates);
        
        const stats = {
          total: allSubmissions.length,
          hired: allSubmissions.filter((s: any) => s.status === "hired").length,
          rejected: allSubmissions.filter((s: any) => s.status === "rejected").length,
          active: allSubmissions.filter((s: any) => 
            ["submitted", "under_review", "shortlisted", "interview_scheduled", "interviewed", "offered"].includes(s.status)
          ).length,
        };
        
        setSubmissionStats(stats);
      } catch (error) {
        console.error("Error fetching submission stats:", error);
        // Keep defaults (0) on error
      }
    };

    if (id && user?.role === "recruiter") {
      fetchSubmissionStats();
    }
  }, [id, user?.role]);

  // Calculate statistics from backend data
  const totalCandidates = submissionStats.total || job?.submission_count || 0;
  const sourcingFunnelCandidates = submissionStats.active || 0;
  const hiredCandidates = submissionStats.hired || 0;
  const rejectedCandidates = submissionStats.rejected || 0;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading job details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "The job you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Job Header Card */}
      <Card className="card-gradient border-green-200/50 shadow-xl shadow-green-500/10">
        <CardHeader className="pb-4">
          {/* Job ID and Search Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-medium">
                Job ID: #{currentJob.id}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center transition-all duration-300 ease-in-out ${
                  isSearchExpanded ? "w-64" : "w-10"
                }`}
              >
                {isSearchExpanded && (
                  <Input
                    value={searchJobId}
                    onChange={(e) => setSearchJobId(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Enter Job ID..."
                    className="mr-2 border-blue-300 focus:border-blue-500"
                    autoFocus
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isSearchExpanded) {
                      handleSearchJob();
                    } else {
                      setIsSearchExpanded(true);
                    }
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 min-w-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {isEditMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPersonalizationOpen(true)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"
                      >
                        <MoreHorizontal className="w-4 h-4 mr-1" />
                        Actions
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-white border border-gray-200 shadow-lg z-50"
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`/dashboard/jobs/${job.id}/edit`)}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200" />
                      <DropdownMenuItem className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <Search className="w-4 h-4 mr-2" />
                        Manual Search
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <UserCog className="w-4 h-4 mr-2" />
                        Change Assignment
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <Bot className="w-4 h-4 mr-2" />
                        Assign to AI Agent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Job Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/30 flex-shrink-0">
                <Briefcase className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <div className="space-y-3">
                    <Input
                      value={currentJob.jobTitle}
                      onChange={(e) =>
                        handleFieldChange("jobTitle", e.target.value)
                      }
                      className="text-2xl font-bold border-2 border-blue-300 focus:border-blue-500"
                      placeholder="Job Title"
                    />
                    <Input
                      value={currentJob.customer}
                      onChange={(e) =>
                        handleFieldChange("customer", e.target.value)
                      }
                      className="text-lg border-2 border-blue-300 focus:border-blue-500"
                      placeholder="Company Name"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-3xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      {currentJob.jobTitle}
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-shadow flex-shrink-0">
                      Public
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                  <span className="font-medium whitespace-nowrap">
                    {currentJob.minExperience}-{currentJob.maxExperience} Years
                    Experience
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  {isEditMode ? (
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <Input
                          value={currentJob.salary}
                          onChange={(e) =>
                            handleFieldChange("salary", e.target.value)
                          }
                          className="w-24 text-center border-blue-300"
                          placeholder="Salary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <Input
                          value={currentJob.state || "Remote"}
                          onChange={(e) =>
                            handleFieldChange("state", e.target.value)
                          }
                          className="w-32 text-center border-blue-300"
                          placeholder="Location"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700 whitespace-nowrap">
                          {currentJob.salary}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full flex-shrink-0">
                        <span className="font-medium text-orange-700 whitespace-nowrap">
                          $
                          {Math.round(
                            (parseFloat(
                              currentJob.salary.replace(/[$,k]/g, "")
                            ) *
                              1000 *
                              1.55) /
                              1000
                          )}
                          k (Estimated)
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Brain className="w-3 h-3 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Estimated billing rate (calculated)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-700 whitespace-nowrap">
                          {currentJob.state ||
                            job.location ||
                            job.city ||
                            "Remote"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full flex-shrink-0">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-700 whitespace-nowrap">
                          Posted{" "}
                          {new Date(currentJob.createdOn).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics positioned to the right */}
            <div className="flex flex-col gap-4 flex-shrink-0">
              {/* First Row - Current Statistics */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {totalCandidates}
                  </div>
                  <div className="text-sm text-gray-600">Total Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sourcingFunnelCandidates}
                  </div>
                  <div className="text-sm text-gray-600">Sourcing Funnel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {hiredCandidates}
                  </div>
                  <div className="text-sm text-gray-600">Hired</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {rejectedCandidates}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>

              {/* Second Row - New Financial Statistics */}
              {user?.role === "recruiter" && (
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {job.salary_min && job.salary_max
                        ? `$${Math.round(
                            (job.salary_min + job.salary_max) / 2 / 2080
                          )}`
                        : job.salary_min
                        ? `$${Math.round(job.salary_min / 2080)}`
                        : "N/A"}
                      /hr
                    </div>
                    <div className="text-sm text-gray-600">
                      Estimated Pay Rate
                    </div>
                  </div>
                  {/* Removed static margin percentages - these should come from backend if needed */}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Tabs */}
      <Card className="card-gradient border-green-200/50 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-6 pb-2">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 lg:w-auto bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50">
              <TabsTrigger
                value="overview"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="sourcing-funnel"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Sourcing Funnel
              </TabsTrigger>
              {user?.role === "recruiter" && (
                <TabsTrigger
                  value="notes"
                  className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  Notes
                </TabsTrigger>
              )}
              <TabsTrigger
                value="attachments"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Attachments
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="space-y-6">
                {/* Job Description */}
                <Card className="card-gradient border-green-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditMode ? (
                      <Textarea
                        value={currentJob.jobDescription}
                        onChange={(e) =>
                          handleFieldChange("jobDescription", e.target.value)
                        }
                        className="min-h-32 border-2 border-blue-300 focus:border-blue-500"
                        placeholder="Enter job description..."
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">
                        {currentJob.jobDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Skills Required */}
                <Card className="card-gradient border-blue-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                      Skills Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Primary Skills
                          </label>
                          <Input
                            value={currentJob.primarySkills.join(", ")}
                            onChange={(e) =>
                              handleFieldChange(
                                "primarySkills",
                                e.target.value.split(", ")
                              )
                            }
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="React, TypeScript, Node.js"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Secondary Skills
                          </label>
                          <Input
                            value={currentJob.secondarySkills.join(", ")}
                            onChange={(e) =>
                              handleFieldChange(
                                "secondarySkills",
                                e.target.value.split(", ")
                              )
                            }
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="AWS, Docker, GraphQL"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3 text-gray-700">
                            Primary Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {currentJob.primarySkills.map(
                              (skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                        {currentJob.secondarySkills.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-700">
                              Secondary Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentJob.secondarySkills.map(
                                (skill: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                  >
                                    {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bottom Cards Row - 4 Equal Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* Client Contact Card */}
                  <Card className="card-gradient border-purple-200/50 shadow-lg card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                        Client Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isEditMode ? (
                        <div className="space-y-2">
                          <Input
                            value={currentJob.clientContact}
                            onChange={(e) =>
                              handleFieldChange("clientContact", e.target.value)
                            }
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="Client Contact Name"
                          />
                          <Input
                            value={currentJob.endClient}
                            onChange={(e) =>
                              handleFieldChange("endClient", e.target.value)
                            }
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="End Client"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {currentJob.clientContact}
                            </p>
                            <p className="text-sm text-gray-600">
                              Hiring Manager
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="button-gradient shadow-md hover:shadow-lg transition-shadow w-full justify-center"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-700 hover:bg-green-50 w-full justify-center"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Account Manager Card */}
                  <Card className="card-gradient border-orange-200/50 shadow-lg card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                        Account Manager
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-gray-800">
                        {job.assigned_to || "Unassigned"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Responsible for this placement
                      </p>
                    </CardContent>
                  </Card>

                  {/* Job Priority Card */}
                  <Card className="card-gradient border-red-200/50 shadow-lg card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                        Priority Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={
                          job.priority === "high" ? "destructive" : "secondary"
                        }
                        className="mb-2"
                      >
                        {job.priority} Priority
                      </Badge>
                      <p className="text-sm text-gray-600">
                        Job Type: {job.job_type}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Job Details Card */}
                  <Card className="card-gradient border-indigo-200/50 shadow-lg card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent">
                        Job Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Industry</p>
                        <p className="font-semibold text-gray-800">
                          {(job as any).industry || "Technology"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-semibold text-gray-800">
                          {job.experience_min || 0}-{job.experience_max || 0}{" "}
                          years
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sourcing-funnel" className="space-y-4 mt-0">
              {/* Premium Kanban Sourcing Funnel */}
              <div className="flex gap-4 overflow-x-auto pb-4">
                {kanbanColumns.map((column) => (
                  <Card
                    key={column.id}
                    className={`min-w-[300px] ${column.color} border-2`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                          {column.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {getStageCount(column.id)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getCandidatesByStage(column.id).map((candidate) => (
                        <div
                          key={candidate.id}
                          className="p-3 bg-white rounded-lg border shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {candidate.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              Score: {candidate.score}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {candidate.experience}
                          </p>
                          <p className="text-xs text-gray-500">
                            {candidate.location}
                          </p>
                          {candidate.notes && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              {candidate.notes}
                            </p>
                          )}
                        </div>
                      ))}
                      {getCandidatesByStage(column.id).length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No candidates in this stage
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-0">
              <Card className="card-gradient border-orange-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                      Job Notes & Comments
                    </CardTitle>
                    <Button size="sm" className="button-gradient">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Note
                    </Button>
                  </div>

                  {/* Notes Filters and Search */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search notes..."
                        value={notesSearch}
                        onChange={(e) => setNotesSearch(e.target.value)}
                        className="pl-10 border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <Select value={notesFilter} onValueChange={setNotesFilter}>
                      <SelectTrigger className="w-40 border-orange-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={notesSort} onValueChange={setNotesSort}>
                      <SelectTrigger className="w-32 border-orange-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="author">By Author</SelectItem>
                        <SelectItem value="priority">By Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFilteredAndSortedJobNotes().map((note) => (
                      <div
                        key={note.id}
                        className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {note.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {note.author}
                              </p>
                              <p className="text-xs text-gray-500">
                                {note.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-xs ${
                                note.priority === "high"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : note.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                              }`}
                            >
                              {note.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {note.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-6 mt-0">
              <Card className="card-gradient border-blue-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                      Job Attachments
                    </CardTitle>
                    <Button size="sm" className="button-gradient">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Document
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {doc.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {doc.size} • Uploaded by {doc.uploadedBy} •{" "}
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {jobDocuments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No documents uploaded yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Job Timeline
                </h3>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-blue-500"></div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <CalendarDays className="w-4 h-4 text-white" />
                    </div>
                    <Card className="card-gradient border-green-200/50 shadow-lg flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            Job Posted
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {job.title} position posted and made {job.status}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <Card className="card-gradient border-blue-200/50 shadow-lg flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            First Candidates Added
                          </p>
                          <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Initial batch of 5 candidates sourced and added to
                          pipeline
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <Card className="card-gradient border-purple-200/50 shadow-lg flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            Client Screening Call
                          </p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Completed screening calls with top 3 candidates
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <Card className="card-gradient border-yellow-200/50 shadow-lg flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            Offer Extended
                          </p>
                          <p className="text-xs text-gray-500">Today</p>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Offer extended to James Wilson, awaiting candidate
                          response
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Job Statistics
                </h3>
              </div>

              <Card className="card-gradient border-green-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                    Process Timeline Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200/50">
                          <TableHead className="text-green-700 font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-green-700 font-semibold">
                            Start
                          </TableHead>
                          <TableHead className="text-green-700 font-semibold">
                            End
                          </TableHead>
                          <TableHead className="text-green-700 font-semibold">
                            Time elapsed (Hrs)
                          </TableHead>
                          <TableHead className="text-green-700 font-semibold">
                            SLA
                          </TableHead>
                          <TableHead className="text-green-700 font-semibold">
                            KPI
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30">
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Created
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {job.created_at
                              ? new Date(job.created_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {job.updated_at
                              ? new Date(job.updated_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-gray-700 font-medium">
                            {job.created_at && job.updated_at
                              ? (
                                  (new Date(job.updated_at).getTime() -
                                    new Date(job.created_at).getTime()) /
                                  (1000 * 60 * 60)
                                ).toFixed(2)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        {job.status === "active" && (
                          <TableRow className="border-green-100/50 hover:bg-green-50/30 bg-green-50/20">
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {job.updated_at
                                ? new Date(job.updated_at).toLocaleString()
                                : "-"}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              Current
                            </TableCell>
                            <TableCell className="text-gray-700 font-medium">
                              {job.updated_at
                                ? (
                                    (new Date().getTime() -
                                      new Date(job.updated_at).getTime()) /
                                    (1000 * 60 * 60)
                                  ).toFixed(2)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-gray-700">-</TableCell>
                            <TableCell className="text-gray-700">-</TableCell>
                          </TableRow>
                        )}
                        {/* Additional timeline data would come from backend submissions/interviews API */}
                        <TableRow className="border-green-100/50 hover:bg-green-50/30">
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-500 py-8"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Activity className="h-8 w-8 text-gray-400" />
                              <p>
                                Additional timeline data will be loaded from
                                submissions and interviews
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="card-gradient border-blue-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                      Total Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">
                      {job.created_at
                        ? `${(
                            (new Date().getTime() -
                              new Date(job.created_at).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(1)} hrs`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-gray-600">Since job creation</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-purple-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                      Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">
                      {/* This will be loaded from submissions API */}0
                    </div>
                    <p className="text-xs text-gray-600">Total applications</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-orange-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                      Positions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">
                      {job.positions_available || 1}
                    </div>
                    <p className="text-xs text-gray-600">Available positions</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-green-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        job.priority === "high"
                          ? "text-red-600"
                          : job.priority === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {job.priority
                        ? job.priority.charAt(0).toUpperCase() +
                          job.priority.slice(1)
                        : "Medium"}
                    </div>
                    <p className="text-xs text-gray-600">Job priority</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Personalization Settings Dialog */}
      <Dialog
        open={isPersonalizationOpen}
        onOpenChange={setIsPersonalizationOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Personalization Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Customize your job detail view preferences.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setIsPersonalizationOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetail;
