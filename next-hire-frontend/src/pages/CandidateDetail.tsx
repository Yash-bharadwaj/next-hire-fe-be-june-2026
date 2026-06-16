import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  MessageSquare,
  Video,
  Edit,
  Download,
  UserCheck,
  Clock,
  TrendingUp,
  Building,
  DollarSign,
  Plus,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
  Search,
  MoreHorizontal,
  ChevronDown,
  Bot,
  UserCog,
  Settings,
  Save,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentsManager, Document } from "@/components/DocumentsManager";
import CandidateDetailPersonalizationSettings from "@/components/CandidateDetailPersonalizationSettings";
import { candidateSearchService } from "@/services/candidateSearchService";
import { recruiterService } from "@/services/recruiterService";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Candidate data will be fetched from API - no static data needed

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // All state hooks must be called before any conditional returns
  const [candidate, setCandidate] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit candidate dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchCandidateId, setSearchCandidateId] = useState("");

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Notes derived from real submission history (populated after fetch)
  const [notes, setNotes] = useState<any[]>([]);

  // Submit to Job dialog state
  const [isSubmitJobOpen, setIsSubmitJobOpen] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [submitJobId, setSubmitJobId] = useState("");
  const [submitJobSaving, setSubmitJobSaving] = useState(false);

  // Add Note inline state
  const [showAddNote, setShowAddNote] = useState(false);
  const [addNoteText, setAddNoteText] = useState("");
  const [addNoteSubmissionId, setAddNoteSubmissionId] = useState("");
  const [addNoteSaving, setAddNoteSaving] = useState(false);

  // Notes filter and sort state
  const [notesFilter, setNotesFilter] = useState("all");
  const [notesSort, setNotesSort] = useState("newest");
  const [notesSearch, setNotesSearch] = useState("");

  // Mock tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Schedule technical interview",
      status: "pending",
      priority: "high",
      assignee: "Sarah Johnson",
      dueDate: "2024-01-25",
      category: "interview",
      createdDate: "2024-01-20",
    },
    {
      id: 2,
      title: "Send reference check email",
      status: "completed",
      priority: "medium",
      assignee: "Mike Rodriguez",
      dueDate: "2024-01-22",
      category: "verification",
      createdDate: "2024-01-18",
    },
    {
      id: 3,
      title: "Review portfolio projects",
      status: "in-progress",
      priority: "low",
      assignee: "Emma Davis",
      dueDate: "2024-01-24",
      category: "review",
      createdDate: "2024-01-15",
    },
  ]);

  // Tasks filter and sort state
  const [tasksFilter, setTasksFilter] = useState("all");
  const [tasksSort, setTasksSort] = useState("dueDate");
  const [tasksSearch, setTasksSearch] = useState("");

  // Mock todos
  const [todos, setTodos] = useState([
    {
      id: 1,
      title: "Update candidate profile",
      completed: false,
      priority: "high",
      category: "administrative",
      dueDate: "2024-01-25",
      createdDate: "2024-01-20",
    },
    {
      id: 2,
      title: "Follow up on salary expectations",
      completed: true,
      priority: "medium",
      category: "negotiation",
      dueDate: "2024-01-22",
      createdDate: "2024-01-18",
    },
    {
      id: 3,
      title: "Prepare interview questions",
      completed: false,
      priority: "low",
      category: "preparation",
      dueDate: "2024-01-24",
      createdDate: "2024-01-15",
    },
  ]);

  // Todos filter and sort state
  const [todosFilter, setTodosFilter] = useState("all");
  const [todosSort, setTodosSort] = useState("dueDate");
  const [todosSearch, setTodosSearch] = useState("");

  // Documents tab: derived from the candidate's uploaded resumes (real data,
  // loaded alongside the candidate below). Locally-added uploads (via
  // handleDocumentUpload) are appended on top of that.
  const [candidateDocuments, setCandidateDocuments] = useState<Document[]>([]);

  // Fetch candidate data from API
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await candidateSearchService.getCandidateDetails(id);
        const candidateData = response.data.candidate;
        setCandidate(candidateData);

        const candidateName = candidateSearchService.formatCandidateName(candidateData);
        setCandidateDocuments(
          (candidateData.resumes || []).map((resume) => ({
            id: resume.id,
            name: resume.file_name,
            type: (resume.file_name.split(".").pop() || "FILE").toUpperCase(),
            uploadDate: resume.created_at || new Date().toISOString(),
            uploadedBy: candidateName,
            url: `${API_BASE_URL}${resume.file_url}`,
            description: resume.is_primary ? "Primary resume" : undefined,
          }))
        );

        const apiSubmissions = response.data.submissions || [];
        setSubmissions(apiSubmissions);

        // Derive notes from submissions' notes_history / notes fields
        const aggregatedNotes: any[] = [];
        apiSubmissions.forEach((submission: any) => {
          const history = Array.isArray(submission.notes_history)
            ? submission.notes_history
            : [];

          // If no history but a latest notes string exists, synthesize one entry
          const effectiveHistory =
            history.length > 0 || !submission.notes
              ? history
              : [
                  {
                    note: submission.notes,
                    at: submission.submitted_at,
                  },
                ];

          effectiveHistory.forEach((entry: any, idx: number) => {
            if (!entry?.note) return;
            aggregatedNotes.push({
              id: `${submission.id}-${idx}`,
              date: entry.at || submission.submitted_at,
              author: "Recruiter",
              content: entry.note,
              category: "general",
              priority: "medium",
              jobTitle: submission.job?.title,
              company: submission.job?.company_name,
            });
          });
        });
        setNotes(aggregatedNotes);
      } catch (err: any) {
        console.error("Error fetching candidate:", err);
        setError(
          err.response?.data?.message || "Failed to load candidate details"
        );
        toast({
          title: "Error",
          description: "Failed to load candidate details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [id, toast]);

  const openEditDialog = () => {
    if (!candidate) return;
    const validStatuses = ["available", "not_available", "interviewing"];
    setEditForm({
      first_name: candidate.first_name || "",
      last_name: candidate.last_name || "",
      phone: candidate.phone || "",
      location: candidate.location || "",
      bio: candidate.bio || "",
      experience_years: candidate.experience_years ?? "",
      availability_status: validStatuses.includes(candidate.availability_status) ? candidate.availability_status : "available",
      current_salary: candidate.current_salary ?? "",
      expected_salary: candidate.expected_salary ?? "",
      linkedin_url: candidate.linkedin_url || "",
      portfolio_url: candidate.portfolio_url || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!id) return;
    setEditSaving(true);
    try {
      const payload: any = { ...editForm };
      // Strip empty strings — Sequelize isUrl validator rejects "" on URL fields
      ["linkedin_url", "portfolio_url", "phone", "location", "bio"].forEach(
        (f) => { if (payload[f] === "") delete payload[f]; }
      );
      if (payload.experience_years === "") delete payload.experience_years;
      if (payload.current_salary === "") delete payload.current_salary;
      if (payload.expected_salary === "") delete payload.expected_salary;
      const result = await candidateSearchService.updateCandidate(id, payload);
      setCandidate(result.data.candidate);
      setIsEditOpen(false);
      toast({ title: "Candidate updated", description: "Profile saved successfully." });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || err?.message || "Could not save changes.";
      toast({ title: "Update failed", description: msg, variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!addNoteText.trim() || !addNoteSubmissionId) return;
    setAddNoteSaving(true);
    try {
      await recruiterService.addSubmissionNote(addNoteSubmissionId, addNoteText.trim());
      const linkedSub = (submissions as any[]).find((s: any) => s.id === addNoteSubmissionId);
      setNotes((prev) => [
        {
          id: `local-${Date.now()}`,
          date: new Date().toISOString(),
          author: "Recruiter",
          content: addNoteText.trim(),
          category: "general",
          priority: "medium",
          jobTitle: linkedSub?.job?.title,
          company: linkedSub?.job?.company_name,
        },
        ...prev,
      ]);
      setAddNoteText("");
      setShowAddNote(false);
      toast({ title: "Note added", description: "Note saved successfully." });
    } catch (err: any) {
      toast({ title: "Failed to save note", description: err?.response?.data?.message || err?.message || "Unknown error", variant: "destructive" });
    } finally {
      setAddNoteSaving(false);
    }
  };

  const openAddNote = () => {
    if (submissions.length === 1) setAddNoteSubmissionId((submissions as any[])[0].id);
    else setAddNoteSubmissionId("");
    setAddNoteText("");
    setShowAddNote(true);
  };

  const openSubmitToJob = async () => {
    setSubmitJobId("");
    setIsSubmitJobOpen(true);
    try {
      const res = await recruiterService.getJobs({ status: "active", limit: 100 });
      const alreadySubmittedJobIds = new Set(
        (submissions as any[]).map((s: any) => s.job_id)
      );
      setAvailableJobs(
        (res.data?.jobs || []).filter((j: any) => !alreadySubmittedJobIds.has(j.id))
      );
    } catch {
      setAvailableJobs([]);
    }
  };

  const handleSubmitToJob = async () => {
    if (!submitJobId || !candidate) return;
    setSubmitJobSaving(true);
    try {
      await recruiterService.sourceCandidates(submitJobId, [candidate.id]);
      toast({ title: "Candidate submitted", description: "Candidate added to the job pipeline." });
      setIsSubmitJobOpen(false);
      // Refresh submissions list
      const res = await candidateSearchService.getCandidateDetails(id!);
      setSubmissions(res.data.submissions || []);
    } catch (err: any) {
      toast({ title: "Submit failed", description: err?.response?.data?.message || err?.message || "Unknown error", variant: "destructive" });
    } finally {
      setSubmitJobSaving(false);
    }
  };

  // Load personalization settings from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("candidateDetailPersonalization");
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

  // Search functionality
  const handleSearchCandidate = () => {
    if (searchCandidateId.trim()) {
      // Navigate to the candidate page - let the page handle if candidate exists
      navigate(`/dashboard/candidates/${searchCandidateId.trim()}`);
      setSearchCandidateId("");
      setIsSearchExpanded(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchCandidate();
    }
  };

  // Filter and sort functions
  const getFilteredAndSortedNotes = () => {
    let filtered = notes.filter((note) => {
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
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        default:
          return 0;
      }
    });
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter((task) => {
      const matchesFilter =
        tasksFilter === "all" ||
        (tasksFilter === "status" && task.status) ||
        (tasksFilter === "priority" && task.priority) ||
        task.status === tasksFilter ||
        task.priority === tasksFilter ||
        task.category === tasksFilter;
      const matchesSearch =
        tasksSearch === "" ||
        task.title.toLowerCase().includes(tasksSearch.toLowerCase()) ||
        task.assignee.toLowerCase().includes(tasksSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (tasksSort) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        case "status":
          return a.status.localeCompare(b.status);
        case "assignee":
          return a.assignee.localeCompare(b.assignee);
        default:
          return 0;
      }
    });
  };

  const getFilteredAndSortedTodos = () => {
    let filtered = todos.filter((todo) => {
      const matchesFilter =
        todosFilter === "all" ||
        (todosFilter === "completed" && todo.completed) ||
        (todosFilter === "pending" && !todo.completed) ||
        todo.priority === todosFilter ||
        todo.category === todosFilter;
      const matchesSearch =
        todosSearch === "" ||
        todo.title.toLowerCase().includes(todosSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (todosSort) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        case "status":
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        case "newest":
          return (
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
          );
        default:
          return 0;
      }
    });
  };

  // Document upload handler
  const handleDocumentUpload = (newDocument: Omit<Document, "id">) => {
    const documentWithId = {
      ...newDocument,
      id: candidateDocuments.length + 1,
    };
    setCandidateDocuments((prev) => [...prev, documentWithId]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Available":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Interview":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Placed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "Interview":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading candidate details...</span>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "The candidate you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => navigate("/dashboard/candidates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  const interviewStages = new Set([
    "first_round", "technical_round", "final_round",
    "interview_scheduled", "interviewed",
  ]);
  const interviews = submissions
    .filter((s: any) => interviewStages.has(s.status))
    .map((s: any) => ({
      id: s.id,
      jobTitle: s.job?.title || "—",
      company: s.job?.company_name || "—",
      date: s.updated_at ? new Date(s.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—",
      type: s.status === "technical_round" ? "Technical" : s.status === "first_round" ? "First Round" : s.status === "final_round" ? "Final Round" : "Interview",
      status: s.status === "hired" ? "Hired" : s.status === "rejected" ? "Rejected" : "In Progress",
      feedback: s.notes || "",
    }));

  // Dynamic timeline built from candidate profile + submissions + notes
  const timelineEvents = (() => {
    const events: Array<{ label: string; detail: string; date: Date; color: string; icon: string }> = [];

    if (candidate?.created_at) {
      events.push({
        label: "Profile Created",
        detail: `${candidate.first_name} ${candidate.last_name} added to the talent pool`,
        date: new Date(candidate.created_at),
        color: "from-green-500 to-green-600",
        icon: "user",
      });
    }

    (submissions as any[]).forEach((s: any) => {
      const submittedAt = s.submitted_at || s.created_at;
      events.push({
        label: "Submitted to Job",
        detail: `${s.job?.title || "a position"}${s.job?.company_name ? " at " + s.job.company_name : ""}`,
        date: new Date(submittedAt),
        color: "from-blue-500 to-blue-600",
        icon: "send",
      });

      if (["first_round", "technical_round", "final_round", "interview_scheduled", "interviewed"].includes(s.status)) {
        events.push({
          label: "Moved to Interview",
          detail: `${s.status.replace(/_/g, " ")} stage for ${s.job?.title || "a position"}`,
          date: new Date(s.updated_at || s.created_at),
          color: "from-purple-500 to-purple-600",
          icon: "video",
        });
      }

      if (s.status === "hired") {
        events.push({
          label: "Hired",
          detail: `Placed at ${s.job?.company_name || s.job?.title || "a company"}`,
          date: new Date(s.updated_at || s.created_at),
          color: "from-yellow-500 to-orange-500",
          icon: "check",
        });
      }

      if (s.status === "rejected") {
        events.push({
          label: "Not Selected",
          detail: `For ${s.job?.title || "a position"}`,
          date: new Date(s.updated_at || s.created_at),
          color: "from-red-400 to-red-500",
          icon: "x",
        });
      }

      const noteHistory = Array.isArray(s.notes_history) ? s.notes_history : [];
      noteHistory.forEach((n: any) => {
        if (!n?.note) return;
        events.push({
          label: "Note Added",
          detail: n.note.substring(0, 100) + (n.note.length > 100 ? "…" : ""),
          date: new Date(n.at || s.created_at),
          color: "from-orange-400 to-orange-500",
          icon: "message",
        });
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  })();

  return (
    <div className="space-y-6">
      {/* Candidate Header Card */}
      <Card className="card-gradient border-green-200/50 shadow-xl shadow-green-500/10">
        <CardHeader className="pb-4">
          {/* Candidate ID and Search Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-medium">
                Candidate ID: #{candidate.candidate_id || candidate.id}
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
                    value={searchCandidateId}
                    onChange={(e) => setSearchCandidateId(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Enter Candidate ID..."
                    className="mr-2 border-blue-300 focus:border-blue-500"
                    autoFocus
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isSearchExpanded) {
                      handleSearchCandidate();
                    } else {
                      setIsSearchExpanded(true);
                    }
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 min-w-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

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
                  <DropdownMenuItem onClick={openEditDialog} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Candidate
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
            </div>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Candidate Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/30 flex-shrink-0">
                <User className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <CardTitle className="text-3xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                    {candidate.first_name} {candidate.last_name}
                  </CardTitle>
                  <Badge
                    className={`${candidateSearchService.getAvailabilityColor(
                      candidate.availability_status
                    )} border font-medium`}
                  >
                    {candidateSearchService.getAvailabilityLabel(
                      candidate.availability_status
                    )}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                  <span className="font-medium whitespace-nowrap">
                    {candidate.experiences?.[0]?.job_title ||
                      "No title specified"}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {candidateSearchService.formatExperience(
                      candidate.experience_years
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700 whitespace-nowrap">
                      {candidate.expected_salary
                        ? `$${candidate.expected_salary}`
                        : "Not specified"}{" "}
                      Expected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700 whitespace-nowrap">
                      {candidate.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full flex-shrink-0">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-700 whitespace-nowrap">
                      {candidateSearchService.getAvailabilityLabel(
                        candidate.availability_status
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-8 flex-shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {submissions.length || 0}
                </div>
                <div className="text-sm text-gray-600">Submissions</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-gray-800">
                    {candidate.rating || "N/A"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-green-200/50">
            <Button className="button-gradient shadow-md hover:shadow-lg transition-shadow">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Video className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={openSubmitToJob}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit to Job
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card className="card-gradient border-green-200/50 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-6 pb-2">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50">
              <TabsTrigger
                value="overview"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Submissions
              </TabsTrigger>
              <TabsTrigger
                value="interviews"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Interviews
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                Timeline
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Candidate Summary */}
                <Card className="card-gradient border-green-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {candidate.bio}
                    </p>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="card-gradient border-blue-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">
                        {candidate.user?.email ||
                          candidate.email ||
                          "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">
                        {candidate.location}
                      </span>
                    </div>
                    {candidate.linkedin_url && (
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-blue-600" />
                        <a
                          href={candidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skills */}
              <Card className="card-gradient border-purple-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills || []).map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Work History */}
              {candidate.experiences && candidate.experiences.length > 0 && (
                <Card className="card-gradient border-orange-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                      Work History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {candidate.experiences.map((experience, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-green-500 pl-4"
                      >
                        <h4 className="font-semibold text-gray-800">
                          {experience.job_title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {experience.company_name} • {experience.start_date} -{" "}
                          {experience.end_date || "Present"}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {experience.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submissions" className="space-y-6 mt-0">
              <Card className="card-gradient border-blue-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                    Job Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submissions.map((submission: any) => (
                      <div
                        key={submission.id}
                        className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {submission.job?.title || "Job"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {submission.job?.company_name || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted:{" "}
                              {submission.submitted_at
                                ? new Date(
                                    submission.submitted_at
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${getSubmissionStatusColor(
                                submission.status
                              )} border font-medium mb-2`}
                            >
                              {submission.status}
                            </Badge>
                          </div>
                        </div>
                        {Array.isArray((submission as any).notes_history) &&
                          (submission as any).notes_history.length > 0 && (
                            <div className="mt-2 text-sm text-gray-700">
                              <p className="font-medium mb-1">Latest Note</p>
                              {(() => {
                                const history = (submission as any)
                                  .notes_history as any[];
                                const latest = history[history.length - 1];
                                return (
                                  <>
                                    <p className="line-clamp-2">
                                      {latest.note}
                                    </p>
                                    {latest.at && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(
                                          latest.at
                                        ).toLocaleString()}
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interviews" className="space-y-6 mt-0">
              <Card className="card-gradient border-purple-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                    Interview History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interviews.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <Video className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p>No interview history yet</p>
                      </div>
                    ) : (
                      interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {interview.jobTitle}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {interview.company} • {interview.type}
                              </p>
                              <p className="text-xs text-gray-500">
                                Date: {interview.date}
                              </p>
                              {interview.feedback && (
                                <p className="text-sm text-gray-700 mt-2">
                                  {interview.feedback}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={`${
                                interview.status === "Hired"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : interview.status === "Rejected"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              } border font-medium`}
                            >
                              {interview.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-0">
              <Card className="card-gradient border-orange-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                      Candidate Notes & Comments
                    </CardTitle>
                    <Button size="sm" className="button-gradient" onClick={openAddNote} disabled={submissions.length === 0}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Note
                    </Button>
                  </div>

                  {/* Inline Add Note form */}
                  {showAddNote && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {submissions.length > 1 && (
                        <Select value={addNoteSubmissionId} onValueChange={setAddNoteSubmissionId}>
                          <SelectTrigger className="border-orange-300">
                            <SelectValue placeholder="Select a job / submission..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(submissions as any[]).map((s: any) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.job?.title || "Unknown job"}{s.job?.company_name ? ` — ${s.job.company_name}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Textarea
                        placeholder="Write your note..."
                        value={addNoteText}
                        onChange={(e) => setAddNoteText(e.target.value)}
                        className="min-h-[80px] border-orange-300 focus:border-orange-500"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => { setShowAddNote(false); setAddNoteText(""); }}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="button-gradient"
                          onClick={handleAddNote}
                          disabled={addNoteSaving || !addNoteText.trim() || !addNoteSubmissionId}
                        >
                          {addNoteSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                          Save Note
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.map((note, idx) => (
                      <div
                        key={note.id ?? idx}
                        className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{note.author}</p>
                              <p className="text-xs text-gray-500">
                                {note.date ? new Date(note.date).toLocaleString() : ""}
                              </p>
                            </div>
                          </div>
                          {(note.jobTitle || note.company) && (
                            <p className="text-xs text-gray-400">
                              {[note.jobTitle, note.company].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                    {notes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No notes yet. Add the first note above.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6 mt-0">
              <Card className="card-gradient border-blue-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                      Tasks Management
                    </CardTitle>
                    <Button size="sm" className="button-gradient">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {/* Tasks Filters and Search */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={tasksSearch}
                        onChange={(e) => setTasksSearch(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    <Select value={tasksFilter} onValueChange={setTasksFilter}>
                      <SelectTrigger className="w-40 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tasks</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tasksSort} onValueChange={setTasksSort}>
                      <SelectTrigger className="w-32 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="assignee">Assignee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFilteredAndSortedTasks().map((task) => (
                      <div
                        key={task.id}
                        className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {task.title}
                              </h4>
                              <Badge
                                className={`text-xs ${
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-green-100 text-green-800 border-green-200"
                                }`}
                              >
                                {task.priority}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  task.status === "completed"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : task.status === "in-progress"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {task.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Assignee: {task.assignee}</span>
                              <span>Due: {task.dueDate}</span>
                              <span>Category: {task.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="todos" className="space-y-6 mt-0">
              <Card className="card-gradient border-purple-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                      Todo List
                    </CardTitle>
                    <Button size="sm" className="button-gradient">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Todo
                    </Button>
                  </div>

                  {/* Todos Filters and Search */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search todos..."
                        value={todosSearch}
                        onChange={(e) => setTodosSearch(e.target.value)}
                        className="pl-10 border-purple-200 focus:border-purple-400"
                      />
                    </div>
                    <Select value={todosFilter} onValueChange={setTodosFilter}>
                      <SelectTrigger className="w-40 border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Todos</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={todosSort} onValueChange={setTodosSort}>
                      <SelectTrigger className="w-32 border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFilteredAndSortedTodos().map((todo) => (
                      <div
                        key={todo.id}
                        className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => {
                                setTodos((prev) =>
                                  prev.map((t) =>
                                    t.id === todo.id
                                      ? { ...t, completed: !t.completed }
                                      : t
                                  )
                                );
                              }}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <div className="flex-1">
                              <h4
                                className={`font-semibold ${
                                  todo.completed
                                    ? "line-through text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {todo.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Due: {todo.dueDate}</span>
                                <span>Category: {todo.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-xs ${
                                todo.priority === "high"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : todo.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                              }`}
                            >
                              {todo.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-0">
              <DocumentsManager
                documents={candidateDocuments}
                onUpload={handleDocumentUpload}
                title="Candidate Documents"
              />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 mt-0">
              <Card className="card-gradient border-green-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      Activity Timeline
                    </CardTitle>
                    <span className="text-sm text-gray-500">{timelineEvents.length} event{timelineEvents.length !== 1 ? "s" : ""}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {timelineEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p>No activity yet. Timeline will populate as the candidate progresses.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {timelineEvents.map((evt, idx) => {
                        const isLast = idx === timelineEvents.length - 1;
                        const IconComp =
                          evt.icon === "send" ? Send :
                          evt.icon === "video" ? Video :
                          evt.icon === "check" ? CheckCircle :
                          evt.icon === "message" ? MessageSquare :
                          evt.icon === "x" ? AlertCircle :
                          User;
                        return (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 bg-gradient-to-br ${evt.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[24px]" />}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="font-medium text-gray-800">{evt.label}</p>
                              <p className="text-sm text-gray-600">{evt.detail}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {evt.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Submit to Job Dialog */}
      <Dialog open={isSubmitJobOpen} onOpenChange={setIsSubmitJobOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Select an open job to add <strong>{candidate?.first_name} {candidate?.last_name}</strong> to the pipeline.
            </p>
            {availableJobs.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                {submissions.length === 0
                  ? "Loading active jobs…"
                  : "This candidate is already submitted to all active jobs."}
              </p>
            ) : (
              <Select value={submitJobId} onValueChange={setSubmitJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job…" />
                </SelectTrigger>
                <SelectContent>
                  {availableJobs.map((job: any) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}{job.company_name ? ` — ${job.company_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitJobOpen(false)} disabled={submitJobSaving}>Cancel</Button>
            <Button
              className="button-gradient"
              onClick={handleSubmitToJob}
              disabled={submitJobSaving || !submitJobId}
            >
              {submitJobSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Candidate Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">First Name</Label>
                <Input value={editForm.first_name || ""} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Last Name</Label>
                <Input value={editForm.last_name || ""} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Phone</Label>
                <Input value={editForm.phone || ""} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="h-9 text-sm" placeholder="+1 555 000 0000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Location</Label>
                <Input value={editForm.location || ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} className="h-9 text-sm" placeholder="City, State" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Bio</Label>
              <Textarea value={editForm.bio || ""} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} className="text-sm resize-none" rows={3} placeholder="Brief summary..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Availability</Label>
                <Select value={editForm.availability_status || "available"} onValueChange={v => setEditForm(p => ({ ...p, availability_status: v }))}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="not_available">Not Available</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Years of Experience</Label>
                <Input type="number" min={0} max={50} value={editForm.experience_years ?? ""} onChange={e => setEditForm(p => ({ ...p, experience_years: e.target.value === "" ? "" : Number(e.target.value) }))} className="h-9 text-sm" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Current Salary (USD)</Label>
                <Input type="number" min={0} value={editForm.current_salary ?? ""} onChange={e => setEditForm(p => ({ ...p, current_salary: e.target.value === "" ? "" : Number(e.target.value) }))} className="h-9 text-sm" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Expected Salary (USD)</Label>
                <Input type="number" min={0} value={editForm.expected_salary ?? ""} onChange={e => setEditForm(p => ({ ...p, expected_salary: e.target.value === "" ? "" : Number(e.target.value) }))} className="h-9 text-sm" placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">LinkedIn URL</Label>
              <Input value={editForm.linkedin_url || ""} onChange={e => setEditForm(p => ({ ...p, linkedin_url: e.target.value }))} className="h-9 text-sm" placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Portfolio URL</Label>
              <Input value={editForm.portfolio_url || ""} onChange={e => setEditForm(p => ({ ...p, portfolio_url: e.target.value }))} className="h-9 text-sm" placeholder="https://..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={editSaving}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving} className="bg-green-600 hover:bg-green-700 text-white">
              {editSaving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Personalization Settings Dialog */}
      <CandidateDetailPersonalizationSettings
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        onSave={(settings) => {
          setPersonalizationSettings(settings);
          localStorage.setItem(
            "candidateDetailPersonalization",
            JSON.stringify(settings)
          );
        }}
        currentSettings={personalizationSettings}
      />
    </div>
  );
};

export default CandidateDetail;
