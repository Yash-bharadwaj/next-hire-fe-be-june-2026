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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DocumentsManager, Document } from "@/components/DocumentsManager";
import CandidateDetailPersonalizationSettings from "@/components/CandidateDetailPersonalizationSettings";
import { candidateSearchService } from "@/services/candidateSearchService";
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

  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchCandidateId, setSearchCandidateId] = useState("");

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Notes derived from real submission history (populated after fetch)
  const [notes, setNotes] = useState<any[]>([]);

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

  // Mock documents with expiration tracking (will be replaced by backend data)
  const [candidateDocuments, setCandidateDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Resume.pdf",
      type: "PDF",
      uploadDate: "2024-01-05T10:00:00Z",
      uploadedBy: "Jack Collins",
      size: "245 KB",
      validFrom: "2024-01-05T00:00:00Z",
      validTo: "2025-01-05T00:00:00Z",
      description: "Latest updated resume",
    },
    {
      id: 2,
      name: "Cover_Letter.pdf",
      type: "PDF",
      uploadDate: "2024-01-05T10:15:00Z",
      uploadedBy: "Jack Collins",
      size: "98 KB",
      validFrom: "2024-01-05T00:00:00Z",
      validTo: "2024-12-31T00:00:00Z",
      description: "Cover letter for current applications",
    },
    {
      id: 3,
      name: "AWS_Certificate.pdf",
      type: "PDF",
      uploadDate: "2023-06-15T00:00:00Z",
      uploadedBy: "Jack Collins",
      size: "156 KB",
      validFrom: "2023-06-15T00:00:00Z",
      validTo: "2024-06-15T00:00:00Z",
      description: "AWS Certified Developer certificate",
    },
    {
      id: 4,
      name: "Background_Check.pdf",
      type: "PDF",
      uploadDate: "2024-01-10T00:00:00Z",
      uploadedBy: "HR Team",
      size: "89 KB",
      validFrom: "2024-01-10T00:00:00Z",
      validTo: "2024-02-28T00:00:00Z",
      description: "Background verification document",
    },
  ]);

  // Fetch candidate data from API
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await candidateSearchService.getCandidateDetails(id);
        setCandidate(response.data.candidate);

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

  // Mock interview history
  const interviews = [
    {
      id: 1,
      jobTitle: "Senior React Developer",
      company: "TechCorp",
      date: "2024-01-18",
      type: "Technical",
      status: "Completed",
      feedback: "Strong technical skills, good problem-solving approach",
    },
    {
      id: 2,
      jobTitle: "Frontend Lead",
      company: "StartupXYZ",
      date: "2024-01-12",
      type: "HR Screen",
      status: "Completed",
      feedback: "Great cultural fit, enthusiastic about the role",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Candidate Header Card */}
      <Card className="card-gradient border-green-200/50 shadow-xl shadow-green-500/10">
        <CardHeader className="pb-4">
          {/* Candidate ID and Search Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-medium">
                Candidate ID: #{candidate.id}
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
                  <DropdownMenuItem className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
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
                      {candidate.summary}
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
                    {candidate.linkedin_profile && (
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-blue-600" />
                        <a
                          href={candidate.linkedin_profile}
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
                    {interviews.map((interview) => (
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
                            <p className="text-sm text-gray-700 mt-2">
                              {interview.feedback}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              interview.status === "Completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            } border font-medium`}
                          >
                            {interview.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-0">
              <Card className="card-gradient border-orange-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                      Notes & Comments
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
                        <SelectItem value="interview">Interview</SelectItem>
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
                    {getFilteredAndSortedNotes().map((note) => (
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
                        {(note.jobTitle || note.company) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {note.jobTitle && <span>{note.jobTitle}</span>}
                            {note.jobTitle && note.company && <span> • </span>}
                            {note.company && <span>{note.company}</span>}
                          </p>
                        )}
                      </div>
                    ))}
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
                  <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          Interview Completed
                        </p>
                        <p className="text-sm text-gray-600">
                          Technical interview with TechCorp Inc.
                        </p>
                        <p className="text-xs text-gray-500">
                          January 18, 2024 at 2:00 PM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <Send className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          Submitted to Job
                        </p>
                        <p className="text-sm text-gray-600">
                          Senior React Developer position at TechCorp Inc.
                        </p>
                        <p className="text-xs text-gray-500">
                          January 15, 2024 at 10:30 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          Initial Contact
                        </p>
                        <p className="text-sm text-gray-600">
                          First conversation about career opportunities
                        </p>
                        <p className="text-xs text-gray-500">
                          January 10, 2024 at 3:15 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

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
