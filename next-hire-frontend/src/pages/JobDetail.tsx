import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { recruiterService } from "@/services/recruiterService";
import { candidateSearchService } from "@/services/candidateSearchService";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExpandableText } from "@/components/ExpandableText";
import { ExpandableBadgeList } from "@/components/ExpandableBadgeList";
import { formatCompactRange } from "@/lib/format";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Job data - fetched from the recruiter-scoped endpoint so the same
  // request resolves the client, client contact, primary recruiter, and
  // account manager associations needed throughout this page.
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await recruiterService.getJobDetails(id);
      setJob(res.data.job);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch job");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const refresh = fetchJob;

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-300";
      case "low":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "medium":
      default:
        return "bg-orange-100 text-orange-700 border border-orange-300";
    }
  };

  const formatPriority = (priority?: string) =>
    priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Medium";

  // Resolve a User (with an included Recruiter profile) to a display name.
  const formatPersonName = (person: any): string | null => {
    if (!person) return null;
    const profile = person.recruiterProfile;
    const name = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || person.email || null;
  };

  // Map API job data to the format the rest of this page renders.
  const mapJobData = (apiJob: any) => {
    if (!apiJob) return null;

    return {
      ...apiJob,
      jobTitle: apiJob.title,
      customer: apiJob.client?.name || apiJob.company_name,
      jobDescription: apiJob.description,
      externalJobDescription: apiJob.external_description || "",
      jobType: apiJob.job_type,
      createdOn: apiJob.created_at,
      minExperience: apiJob.experience_min || 0,
      maxExperience: apiJob.experience_max || 0,
      salary:
        apiJob.job_type === "contract"
          ? apiJob.bill_rate_min || apiJob.bill_rate_max
            ? `${formatCompactRange(apiJob.bill_rate_min, apiJob.bill_rate_max, { suffix: "/hr" })}`
            : "Rate negotiable"
          : apiJob.salary_min || apiJob.salary_max
          ? formatCompactRange(apiJob.salary_min, apiJob.salary_max)
          : "Competitive",
      primarySkills: apiJob.required_skills || [],
      secondarySkills: apiJob.preferred_skills || [],
      state: apiJob.location || apiJob.city || apiJob.state || "Remote",
      clientContactName: apiJob.clientContact?.name || null,
      clientContactEmail: apiJob.clientContact?.email || apiJob.client?.primary_email || null,
      clientContactPhone: apiJob.clientContact?.phone || apiJob.client?.primary_phone || null,
      endClient: apiJob.client?.name || apiJob.company_name,
      primaryRecruiterName: formatPersonName(apiJob.primaryRecruiter),
      accountManagerName: formatPersonName(apiJob.accountManager),
      assignedToName: formatPersonName(apiJob.assignee),
      educationRequirements: apiJob.education_requirements || "Not specified",
      positionsAvailable: apiJob.positions_available || 1,
      applicationDeadline: apiJob.application_deadline,
      startDate: apiJob.start_date,
      endDate: apiJob.end_date,
    };
  };

  // Sync notes from job data
  useEffect(() => {
    if (job) {
      setJobNotes((job as any).notes_history || []);
    }
  }, [job]);

  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchJobId, setSearchJobId] = useState("");

  const currentJob = mapJobData(job);

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

  // ── Manual Search state ────────────────────────────────────────────────
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [matchScoreRange, setMatchScoreRange] = useState<[number, number]>([0, 100]);
  const [matchLocationFilter, setMatchLocationFilter] = useState("");
  const [matchResumeUpdated, setMatchResumeUpdated] = useState("");
  const [sourcingLoading, setSourcingLoading] = useState(false);

  // ── Notes state ────────────────────────────────────────────────────────
  const [jobNotes, setJobNotes] = useState<any[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  // ── Attachments state ──────────────────────────────────────────────────
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

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
    { id: "new_candidate",   title: "Pipeline",                color: "bg-gray-50",   border: "border-gray-300" },
    { id: "initial_scanning", title: "Initial Scanning",       color: "bg-blue-50",   border: "border-blue-300" },
    { id: "first_round",    title: "First Round",              color: "bg-purple-50", border: "border-purple-300" },
    { id: "technical_round", title: "Technical Manager Round", color: "bg-yellow-50", border: "border-yellow-300" },
    { id: "final_round",    title: "Final Round",              color: "bg-orange-50", border: "border-orange-300" },
    { id: "hired",          title: "Hired",                    color: "bg-green-50",  border: "border-green-400" },
    { id: "rejected",       title: "Rejected",                 color: "bg-red-50",    border: "border-red-300" },
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

  // Map submission status to kanban column id
  const mapSubmissionStatusToStage = (status: string): string => {
    const statusMap: Record<string, string> = {
      // New statuses map directly
      new_candidate:    "new_candidate",
      initial_scanning: "initial_scanning",
      first_round:      "first_round",
      technical_round:  "technical_round",
      final_round:      "final_round",
      hired:            "hired",
      rejected:         "rejected",
      // Legacy status backward compat
      sourcing:              "new_candidate",
      submitted:             "first_round",
      under_review:          "initial_scanning",
      shortlisted:           "first_round",
      interview_scheduled:   "technical_round",
      interviewed:           "final_round",
      offered:               "final_round",
    };
    return statusMap[status] || "new_candidate";
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
          score: sub.ai_score ?? null,
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
            !["hired", "rejected"].includes(s.status)
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

  // ── Manual Search handlers ─────────────────────────────────────────────
  const handleOpenManualSearch = async () => {
    setShowManualSearch(true);
    if (matchResults.length > 0) return; // already loaded
    setMatchLoading(true);
    setMatchError(null);
    try {
      const res = await candidateSearchService.matchCandidatesForJob(job!.id);
      setMatchResults(res.data?.candidates || []);
    } catch (err: any) {
      setMatchError(err?.response?.data?.message || err?.message || "Failed to load candidates");
    } finally {
      setMatchLoading(false);
    }
  };

  const filteredMatchResults = matchResults.filter((c) => {
    const score = c.matchScore ?? 0;
    if (score < matchScoreRange[0] || score > matchScoreRange[1]) return false;
    if (matchLocationFilter && !c.location?.toLowerCase().includes(matchLocationFilter.toLowerCase())) return false;
    if (matchResumeUpdated) {
      const updatedAt = new Date(c.updated_at || c.created_at);
      const filterDate = new Date(matchResumeUpdated);
      if (updatedAt < filterDate) return false;
    }
    return true;
  });

  const handleToggleCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      next.has(candidateId) ? next.delete(candidateId) : next.add(candidateId);
      return next;
    });
  };

  // Candidates already in this job's pipeline - shown as "Already added" in
  // Manual Search instead of letting the user pick them and silently no-op,
  // which read as "Add to Sourcing Funnel doesn't work" when they were
  // actually already submitted from an earlier click.
  const alreadySourcedCandidateIds = new Set(
    (submissions as any[]).map((s) => s.candidate_id || s.candidate?.id).filter(Boolean)
  );

  const handleAddToSourcingFunnel = async () => {
    if (selectedCandidates.size === 0) return;
    setSourcingLoading(true);
    try {
      const res = await recruiterService.sourceCandidates(job!.id, Array.from(selectedCandidates));
      const { added = [], skipped = [] } = (res as any).data || {};
      if (added.length > 0 && skipped.length === 0) {
        toast({ title: "Added to pipeline", description: `${added.length} candidate(s) added to the sourcing funnel.` });
      } else if (added.length > 0 && skipped.length > 0) {
        toast({ title: "Added to pipeline", description: `${added.length} added; ${skipped.length} were already in the pipeline.` });
      } else {
        toast({ title: "Already in pipeline", description: "The selected candidate(s) are already in this job's sourcing funnel.", variant: "destructive" });
      }
      setSelectedCandidates(new Set());
      setShowManualSearch(false);
      // Refresh submission stats
      const statsRes = await recruiterService.getJobSubmissions(job!.id, { limit: 100 });
      const subs = statsRes.data?.submissions || [];
      setSubmissions(subs as any);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add candidates", variant: "destructive" });
    } finally {
      setSourcingLoading(false);
    }
  };

  // ── Notes handlers ────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !id) return;
    setAddingNote(true);
    try {
      const res = await recruiterService.addJobNote(id, newNoteText.trim());
      const updated = (res as any)?.data?.notes_history || [...jobNotes, { note: newNoteText.trim(), by: user?.id, at: new Date().toISOString() }];
      setJobNotes(updated);
      setNewNoteText("");
      setShowAddNote(false);
      toast({ title: "Note added" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add note", variant: "destructive" });
    } finally {
      setAddingNote(false);
    }
  };

  // ── Attachment handler ─────────────────────────────────────────────────
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploadingAttachment(true);
    try {
      await recruiterService.uploadJobAttachment(id, file);
      toast({ title: "Attachment uploaded" });
      refresh(); // reload job to get updated attachments
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to upload attachment", variant: "destructive" });
    } finally {
      setUploadingAttachment(false);
      e.target.value = "";
    }
  };


  // ── Timeline events (dynamic) ─────────────────────────────────────────
  const timelineEvents = (() => {
    if (!job) return [];
    const events: Array<{ label: string; detail: string; date: Date; color: string; icon: string }> = [];

    events.push({
      label: "Job Posted",
      detail: `${job.title} position created with status: ${job.status}`,
      date: new Date(job.created_at),
      color: "from-green-500 to-green-600",
      icon: "calendar",
    });

    if (submissions.length > 0) {
      const firstSourcing = [...submissions].sort((a: any, b: any) => new Date(a.submitted_at || a.created_at).getTime() - new Date(b.submitted_at || b.created_at).getTime())[0];
      if (firstSourcing) {
        events.push({
          label: "First Candidate Sourced",
          detail: `${firstSourcing.candidate?.first_name || "Candidate"} ${firstSourcing.candidate?.last_name || ""} added to pipeline`,
          date: new Date(firstSourcing.submitted_at || firstSourcing.created_at),
          color: "from-blue-500 to-blue-600",
          icon: "users",
        });
      }
      const inInterview = (submissions as any[]).filter((s: any) =>
        ["first_round", "technical_round", "final_round", "interview_scheduled", "interviewed"].includes(s.status)
      );
      if (inInterview.length > 0) {
        events.push({
          label: `${inInterview.length} Candidate(s) in Interview Rounds`,
          detail: `Candidates progressed to interview stages`,
          date: new Date(inInterview[0].updated_at || inInterview[0].created_at),
          color: "from-purple-500 to-purple-600",
          icon: "video",
        });
      }
      const hired = (submissions as any[]).filter((s: any) => s.status === "hired");
      if (hired.length > 0) {
        events.push({
          label: `${hired.length} Candidate(s) Hired`,
          detail: `Successfully placed for ${job.title}`,
          date: new Date(hired[0].updated_at || hired[0].created_at),
          color: "from-yellow-500 to-orange-500",
          icon: "target",
        });
      }
    }

    (jobNotes as any[]).forEach((note: any) => {
      events.push({
        label: "Note Added",
        detail: note.note?.substring(0, 100) + (note.note?.length > 100 ? "…" : ""),
        date: new Date(note.at),
        color: "from-orange-400 to-orange-500",
        icon: "message",
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  })();

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
              <div className="text-sm text-gray-500 font-medium font-mono">
                {job.job_id || `#${currentJob.id?.slice(0, 8)}`}
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
                  <DropdownMenuItem
                    onClick={handleOpenManualSearch}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
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
            </div>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Job Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/30 flex-shrink-0">
                <Briefcase className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <CardTitle className="text-3xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                    {currentJob.jobTitle}
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-shadow flex-shrink-0">
                    Public
                  </Badge>
                  <Badge className={`${getPriorityBadgeClass(job.priority)} shadow-sm flex-shrink-0`}>
                    {formatPriority(job.priority)} Priority
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                  <span className="font-medium whitespace-nowrap">
                    {currentJob.minExperience}-{currentJob.maxExperience} Years
                    Experience
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700 whitespace-nowrap">
                      {currentJob.salary}
                    </span>
                  </div>
                  {job.job_type !== "contract" && (
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
                  )}
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
                  <div className="flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full flex-shrink-0">
                    <User className="w-4 h-4 text-teal-600" />
                    <span className="font-medium text-teal-700 whitespace-nowrap">
                      Assigned to {currentJob.assignedToName || currentJob.primaryRecruiterName || "Unassigned"}
                    </span>
                  </div>
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
                      {job.job_type === "contract"
                        ? job.bill_rate_min && job.bill_rate_max
                          ? `$${Math.round((Number(job.bill_rate_min) + Number(job.bill_rate_max)) / 2)}`
                          : job.bill_rate_min
                          ? `$${job.bill_rate_min}`
                          : "N/A"
                        : job.salary_min && job.salary_max
                        ? `$${Math.round(
                            (Number(job.salary_min) + Number(job.salary_max)) / 2 / 2080
                          )}`
                        : job.salary_min
                        ? `$${Math.round(Number(job.salary_min) / 2080)}`
                        : "N/A"}
                      /hr
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.job_type === "contract" ? "Bill Rate" : "Estimated Pay Rate"}
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
            <TabsList className={`grid w-full lg:w-auto bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 ${user?.role === "recruiter" ? "grid-cols-6" : "grid-cols-5"}`}>
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
                    <ExpandableText
                      text={currentJob.jobDescription}
                      maxLength={400}
                      className="text-gray-700 leading-relaxed"
                    />
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
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-700">
                          Primary Skills
                        </h4>
                        <ExpandableBadgeList
                          items={currentJob.primarySkills}
                          initialCount={8}
                          badgeClassName="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                        />
                      </div>
                      {currentJob.secondarySkills.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-gray-700">
                            Secondary Skills
                          </h4>
                          <ExpandableBadgeList
                            items={currentJob.secondarySkills}
                            initialCount={8}
                            badgeVariant="outline"
                            badgeClassName="border-green-300 text-green-700 hover:bg-green-50"
                          />
                        </div>
                      )}
                    </div>
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
                      <div>
                        <p className="font-semibold text-gray-800">
                          {currentJob.clientContactName || "No contact on file"}
                        </p>
                        <p className="text-sm text-gray-600">{currentJob.endClient}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          disabled={!currentJob.clientContactEmail}
                          onClick={() => handleEmailClick(currentJob.clientContactEmail)}
                          className="button-gradient shadow-md hover:shadow-lg transition-shadow w-full justify-center disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!currentJob.clientContactPhone}
                          onClick={() => handlePhoneClick(currentJob.clientContactPhone)}
                          className="border-green-300 text-green-700 hover:bg-green-50 w-full justify-center disabled:opacity-50"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Primary Recruiter Card */}
                  <Card className="card-gradient border-teal-200/50 shadow-lg card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                        Primary Recruiter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-gray-800">
                        {currentJob.primaryRecruiterName || "Unassigned"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Owns sourcing for this role
                      </p>
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
                        {currentJob.accountManagerName || "Unassigned"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Owns the client relationship
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
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-semibold text-gray-800">
                          {job.end_date ? new Date(job.end_date).toLocaleDateString() : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Application Deadline</p>
                        <p className="font-semibold text-gray-800">
                          {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-semibold text-gray-800">
                          {job.experience_min || 0}-{job.experience_max || 0} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {job.job_type === "contract" ? "Bill Rate Range" : "Salary Range"}
                        </p>
                        <p className="font-semibold text-gray-800 whitespace-nowrap">
                          {job.job_type === "contract"
                            ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, { suffix: "/hr" })
                            : formatCompactRange(job.salary_min, job.salary_max)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sourcing-funnel" className="space-y-4 mt-0">
              {/* Kanban Sourcing Funnel */}
              <div className="flex gap-4 overflow-x-auto pb-4">
                {kanbanColumns.map((column) => (
                  <Card
                    key={column.id}
                    className={`min-w-[270px] max-w-[270px] ${column.color} border-2 ${column.border}`}
                  >
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          {column.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {getStageCount(column.id)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 pb-3">
                      {getCandidatesByStage(column.id).map((candidate: any) => (
                        <div
                          key={candidate.id}
                          className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="font-semibold text-sm text-gray-800 leading-tight">
                              {candidate.name}
                            </h4>
                            <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0">
                              {candidate.score != null ? `${candidate.score}%` : "—"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{candidate.experience}</p>
                          <p className="text-xs text-gray-400 mb-2">{candidate.location}</p>
                          {/* Move to stage dropdown */}
                          <Select
                            value={candidate.submission?.status || column.id}
                            onValueChange={async (newStatus) => {
                              if (!candidate.submission?.id) return;
                              try {
                                await recruiterService.updateSubmissionStatus(candidate.submission.id, { status: newStatus as any });
                                // Refresh kanban
                                const statsRes = await recruiterService.getJobSubmissions(id!, { limit: 100 });
                                const subs = statsRes.data?.submissions || [];
                                setSubmissions(subs as any);
                                const mapped = subs.map((sub: any, i: number) => ({
                                  id: sub.id || `sub-${i}`,
                                  name: `${sub.candidate?.first_name || ""} ${sub.candidate?.last_name || ""}`.trim() || "Unknown",
                                  experience: `${sub.candidate?.experience_years || 0} years`,
                                  location: sub.candidate?.location || "Unknown",
                                  score: sub.ai_score ?? null,
                                  stage: mapSubmissionStatusToStage(sub.status),
                                  notes: sub.notes,
                                  submission: sub,
                                }));
                                setCandidates(mapped);
                              } catch (e: any) {
                                toast({ title: "Error", description: e?.message || "Failed to update status", variant: "destructive" });
                              }
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs border-gray-200 bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {kanbanColumns.map((col) => (
                                <SelectItem key={col.id} value={col.id} className="text-xs">
                                  {col.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      {getCandidatesByStage(column.id).length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-xs">
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
                    {user?.role === "recruiter" && (
                      <Button size="sm" className="button-gradient" onClick={() => setShowAddNote(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Note
                      </Button>
                    )}
                  </div>

                  {/* Add Note inline form */}
                  {showAddNote && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <Textarea
                        placeholder="Write your note..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="min-h-[80px] border-orange-300 focus:border-orange-500"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => { setShowAddNote(false); setNewNoteText(""); }}>
                          Cancel
                        </Button>
                        <Button size="sm" className="button-gradient" onClick={handleAddNote} disabled={addingNote || !newNoteText.trim()}>
                          {addingNote ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                          Save Note
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...(jobNotes as any[])].reverse().map((note: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {note.by === user?.id ? "You" : "Recruiter"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {note.at ? new Date(note.at).toLocaleString() : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.note}</p>
                      </div>
                    ))}
                    {jobNotes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No notes yet. Add the first note above.</p>
                      </div>
                    )}
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
                    {user?.role === "recruiter" && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleAttachmentUpload}
                          disabled={uploadingAttachment}
                        />
                        <Button size="sm" className="button-gradient pointer-events-none" disabled={uploadingAttachment}>
                          {uploadingAttachment ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                          Upload Document
                        </Button>
                      </label>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((job as any)?.attachments || []).map((att: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{att.name || att.url}</h4>
                            <p className="text-sm text-gray-600">
                              Uploaded {att.at ? new Date(att.at).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => window.open(att.url, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {(((job as any)?.attachments) || []).length === 0 && (
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
                <Badge variant="outline" className="text-xs text-gray-500">
                  {timelineEvents.length} event{timelineEvents.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {timelineEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Activity className="w-14 h-14 mb-4 text-gray-200" />
                  <p className="text-sm text-center max-w-xs">
                    No events yet. Timeline will populate as candidates are sourced,
                    interviewed, and notes are added.
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {timelineEvents.map((evt, idx) => {
                    const isLast = idx === timelineEvents.length - 1;
                    return (
                      <div key={idx} className="flex gap-4">
                        {/* ── Left column: icon + connector ── */}
                        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
                          {/* Icon circle */}
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${evt.color} flex items-center justify-center shadow-md ring-4 ring-white z-10 flex-shrink-0`}
                          >
                            {evt.icon === "calendar" && <CalendarDays className="w-4 h-4 text-white" />}
                            {evt.icon === "users"    && <Users className="w-4 h-4 text-white" />}
                            {evt.icon === "video"    && <Video className="w-4 h-4 text-white" />}
                            {evt.icon === "target"   && <Target className="w-4 h-4 text-white" />}
                            {evt.icon === "message"  && <MessageSquare className="w-4 h-4 text-white" />}
                          </div>
                          {/* Connector line — hidden on last item */}
                          {!isLast && (
                            <div className="w-0.5 flex-1 mt-1 mb-0 bg-gradient-to-b from-gray-300 to-gray-200 min-h-[32px]" />
                          )}
                        </div>

                        {/* ── Right column: card ── */}
                        <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-6"}`}>
                          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-gray-800 text-sm leading-tight">
                                {evt.label}
                              </p>
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-xs text-gray-500 font-medium">
                                  {evt.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {evt.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">{evt.detail}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                        {kanbanColumns.map((col) => {
                          const colSubs = (submissions as any[]).filter(
                            (s: any) => mapSubmissionStatusToStage(s.status) === col.id
                          );
                          if (colSubs.length === 0) return null;
                          const oldest = colSubs.reduce((a: any, b: any) =>
                            new Date(a.updated_at || a.created_at) < new Date(b.updated_at || b.created_at) ? a : b
                          );
                          const newest = colSubs.reduce((a: any, b: any) =>
                            new Date(a.updated_at || a.created_at) > new Date(b.updated_at || b.created_at) ? a : b
                          );
                          const elapsed = (
                            (new Date(newest.updated_at || newest.created_at).getTime() -
                              new Date(oldest.updated_at || oldest.created_at).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(1);
                          return (
                            <TableRow key={col.id} className="border-green-100/50 hover:bg-green-50/30">
                              <TableCell>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  {col.title} ({colSubs.length})
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-700 text-xs">
                                {new Date(oldest.updated_at || oldest.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-gray-700 text-xs">
                                {new Date(newest.updated_at || newest.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-gray-700 font-medium text-xs">{elapsed}h</TableCell>
                              <TableCell className="text-gray-700 text-xs">-</TableCell>
                              <TableCell className="text-gray-700 text-xs">-</TableCell>
                            </TableRow>
                          );
                        })}
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
      <Dialog open={isPersonalizationOpen} onOpenChange={setIsPersonalizationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Personalization Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Customize your job detail view preferences.</p>
            <div className="flex gap-2">
              <Button onClick={() => setIsPersonalizationOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Manual Search Dialog ────────────────────────────────────────────── */}
      <Dialog open={showManualSearch} onOpenChange={(open) => { setShowManualSearch(open); if (!open) setSelectedCandidates(new Set()); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-green-600" />
              Manual Search — Candidates for{" "}
              <span className="text-green-700 font-bold">{job?.title}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Filters */}
          <div className="px-6 py-4 border-b bg-gray-50/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Match Score Slider */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">
                  Match Score: {matchScoreRange[0]}% – {matchScoreRange[1]}%
                </label>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={matchScoreRange}
                  onValueChange={(v) => setMatchScoreRange(v as [number, number])}
                  className="w-full"
                />
              </div>
              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Location</label>
                <Input
                  placeholder="Filter by location..."
                  value={matchLocationFilter}
                  onChange={(e) => setMatchLocationFilter(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              {/* Resume Updated */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Resume Updated After</label>
                <Input
                  type="date"
                  value={matchResumeUpdated}
                  onChange={(e) => setMatchResumeUpdated(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {filteredMatchResults.length} candidate{filteredMatchResults.length !== 1 ? "s" : ""} shown
                {selectedCandidates.size > 0 && (
                  <span className="ml-2 text-green-700 font-semibold">• {selectedCandidates.size} selected</span>
                )}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMatchScoreRange([0, 100]);
                  setMatchLocationFilter("");
                  setMatchResumeUpdated("");
                }}
                className="text-xs h-7"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          <ScrollArea className="flex-1 px-6">
            {matchLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mr-3" />
                <span className="text-gray-600">AI is ranking candidates by match…</span>
              </div>
            ) : matchError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                <p className="text-gray-600">{matchError}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={handleOpenManualSearch}>Retry</Button>
              </div>
            ) : filteredMatchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500">No candidates match the current filters.</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {filteredMatchResults.map((c: any) => {
                  const isAlreadySourced = alreadySourcedCandidateIds.has(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => !isAlreadySourced && handleToggleCandidate(c.id)}
                      className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
                        isAlreadySourced
                          ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
                          : selectedCandidates.has(c.id)
                          ? "border-green-400 bg-green-50 shadow-sm cursor-pointer"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <Checkbox
                        checked={selectedCandidates.has(c.id)}
                        disabled={isAlreadySourced}
                        onCheckedChange={() => handleToggleCandidate(c.id)}
                        className="mt-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {c.first_name} {c.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {c.location || "—"} • {c.experience_years != null ? `${c.experience_years} yrs exp` : "—"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {isAlreadySourced ? (
                              <Badge className="text-xs font-bold bg-blue-100 text-blue-800 border-blue-200">
                                Already in pipeline
                              </Badge>
                            ) : (
                              <Badge
                                className={`text-xs font-bold ${
                                  (c.matchScore ?? 0) >= 75
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : (c.matchScore ?? 0) >= 50
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {Math.round(c.matchScore ?? 0)}% match
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400">
                              Updated {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </div>
                        {c.matchReasoning && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.matchReasoning}</p>
                        )}
                        {c.skills && c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.skills.slice(0, 5).map((skill: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs py-0">{skill}</Badge>
                            ))}
                            {c.skills.length > 5 && <Badge variant="secondary" className="text-xs py-0">+{c.skills.length - 5}</Badge>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50/60 flex items-center justify-between">
            <Button variant="outline" onClick={() => setShowManualSearch(false)}>
              Cancel
            </Button>
            <Button
              className="button-gradient"
              disabled={selectedCandidates.size === 0 || sourcingLoading}
              onClick={handleAddToSourcingFunnel}
            >
              {sourcingLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Add {selectedCandidates.size > 0 ? `${selectedCandidates.size} ` : ""}to Sourcing Funnel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetail;
