import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Calendar,
  Building,
  User,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Settings,
  Share2,
  UserCheck,
  Activity,
  RotateCcw,
  Star,
  TrendingUp,
  PlusCircle,
  RefreshCw,
  Trash,
  Zap,
  ListChecks,
  FileSpreadsheet,
  Video,
  Phone,
  MessageSquare,
  Search,
  UserPlus,
  Loader2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useInterviews, useInterviewStats, useInterviewManagement } from "@/hooks/useInterviews";
import { interviewService, InterviewStatus, InterviewType } from "@/services/interviewService";
import { useAuth } from "@/contexts/AuthContext";
import { downloadCsv } from "@/utils/csv";

const _interviewsStatsCache = { total: 0, scheduled: 0, completed: 0, totalJobs: 0 };

const Interviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("interviews");
  const [exporting, setExporting] = useState(false);

  // Edit interview dialog state
  const [editingInterview, setEditingInterview] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    interview_type: "video" as InterviewType,
    date: "",
    time: "",
    duration_minutes: "60",
    status: "scheduled" as InterviewStatus,
    location: "",
    meeting_link: "",
    notes: "",
  });

  // Interview hooks
  const { 
    interviews, 
    loading: interviewsLoading, 
    error: interviewsError, 
    pagination, 
    fetchInterviews, 
    refresh: refreshInterviews 
  } = useInterviews();
  
  const { 
    stats, 
    loading: statsLoading, 
    refresh: refreshStats 
  } = useInterviewStats();
  
  const { 
    loading: managementLoading,
    updateInterview,
    deleteInterview,
    completeInterview,
    cancelInterview,
    rescheduleInterview
  } = useInterviewManagement();

  // Filters
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<InterviewType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Apply filters
  const handleApplyFilters = () => {
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (typeFilter) filters.interview_type = typeFilter;
    if (searchQuery) filters.search = searchQuery;
    if (dateFrom) filters.date_from = dateFrom.toISOString();
    if (dateTo) filters.date_to = dateTo.toISOString();
    
    fetchInterviews(filters);
  };

  // Clear filters
  const handleClearFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    fetchInterviews({});
  };

  const handleExport = () => {
    if (user?.role !== "recruiter") {
      toast({
        title: "Export unavailable",
        description: "Only recruiters can export interviews.",
        variant: "destructive",
      });
      return;
    }
    if (!interviews.length) {
      toast({
        title: "Nothing to export",
        description: "No interviews found for current filters.",
      });
      return;
    }
    try {
      setExporting(true);
      const columns = [
        { header: "Interview ID", accessor: (i: any) => i.id },
        { header: "Candidate", accessor: (i: any) => `${i.candidate?.first_name || ""} ${i.candidate?.last_name || ""}`.trim() },
        { header: "Job", accessor: (i: any) => i.job?.title || "" },
        { header: "Type", accessor: (i: any) => i.interview_type },
        { header: "Status", accessor: (i: any) => i.status },
        { header: "Scheduled At", accessor: (i: any) => i.scheduled_at },
        { header: "Meeting Link", accessor: (i: any) => i.meeting_link || "" },
      ];
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadCsv(`interviews-${timestamp}.csv`, interviews, columns);
      toast({ title: "Exported", description: "Interviews exported to CSV." });
    } catch (err: any) {
      toast({
        title: "Export failed",
        description: err?.message || "Unable to export interviews.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle interview actions
  const handleCompleteInterview = async (interviewId: string, feedback?: string, rating?: number) => {
    const result = await completeInterview(interviewId, feedback, rating);
    if (result) {
      refreshInterviews();
      refreshStats();
    }
  };

  const handleCancelInterview = async (interviewId: string, reason?: string) => {
    const result = await cancelInterview(interviewId, reason);
    if (result) {
      refreshInterviews();
      refreshStats();
    }
  };

  const handleRescheduleInterview = async (interviewId: string, newDateTime: string) => {
    const result = await rescheduleInterview(interviewId, newDateTime);
    if (result) {
      refreshInterviews();
      refreshStats();
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (window.confirm("Are you sure you want to delete this interview?")) {
      const result = await deleteInterview(interviewId);
      if (result) {
        refreshInterviews();
        refreshStats();
      }
    }
  };

  const openEditDialog = (interview: any) => {
    const scheduled = new Date(interview.scheduled_at);
    const pad = (n: number) => n.toString().padStart(2, "0");
    setEditForm({
      interview_type: interview.interview_type,
      date: `${scheduled.getFullYear()}-${pad(scheduled.getMonth() + 1)}-${pad(scheduled.getDate())}`,
      time: `${pad(scheduled.getHours())}:${pad(scheduled.getMinutes())}`,
      duration_minutes: String(interview.duration_minutes || 60),
      status: interview.status,
      location: interview.location || "",
      meeting_link: interview.meeting_link || "",
      notes: interview.notes || "",
    });
    setEditingInterview(interview);
  };

  const handleSaveEdit = async () => {
    if (!editingInterview) return;

    const [hours, minutes] = editForm.time.split(":");
    const scheduledDateTime = new Date(editForm.date);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    const result = await updateInterview(editingInterview.id, {
      interview_type: editForm.interview_type,
      scheduled_at: scheduledDateTime.toISOString(),
      duration_minutes: parseInt(editForm.duration_minutes),
      status: editForm.status,
      location: editForm.interview_type === "in_person" ? editForm.location : undefined,
      meeting_link: editForm.interview_type === "video" ? editForm.meeting_link : undefined,
      notes: editForm.notes,
    });

    if (result) {
      setEditingInterview(null);
      refreshInterviews();
      refreshStats();
    }
  };
  
  // Todo state
  const [todos, setTodos] = useState([
    { id: 1, title: "Prepare interview questions for React position", completed: false, dueDate: "2024-01-28", priority: "high", assignee: "Mike Johnson" },
    { id: 2, title: "Review candidate profiles for upcoming interviews", completed: false, dueDate: "2024-01-29", priority: "medium", assignee: "Sarah Wilson" },
    { id: 3, title: "Schedule follow-up interviews", completed: true, dueDate: "2024-01-27", priority: "low", assignee: "John Smith" },
    { id: 4, title: "Send interview reminders to panel members", completed: false, dueDate: "2024-01-30", priority: "high", assignee: "Lisa Chen" }
  ]);
  
  const [newTodo, setNewTodo] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("medium");
  const [newTodoAssignee, setNewTodoAssignee] = useState("");
  const [todoSearch, setTodoSearch] = useState("");
  const [todoFilter, setTodoFilter] = useState("all");
  const [todoSort, setTodoSort] = useState("dueDate");
  const [rescheduleData, setRescheduleData] = useState<{todoId: number | null, newDate: Date | undefined}>({todoId: null, newDate: undefined});
  const [reassignData, setReassignData] = useState<{todoId: number | null, newAssignee: string}>({todoId: null, newAssignee: ""});

  // Mock users data for todo assignees (in production, fetch from API)
  const usersData = {
    users: [
      { id: "1", name: user?.name || "Current User" },
      { id: "2", name: "Sarah Johnson" },
      { id: "3", name: "Mike Chen" },
      { id: "4", name: "Emily Davis" },
      { id: "5", name: "Alex Wilson" },
    ]
  };

  // Todo functions
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todoItem = {
        id: todos.length + 1,
        title: newTodo,
        completed: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: newTodoPriority as "high" | "medium" | "low",
        assignee: newTodoAssignee
      };
      setTodos([...todos, todoItem]);
      setNewTodo("");
      setNewTodoAssignee("");
      toast({ title: "Todo added", description: "New todo item has been added successfully." });
    }
  };

  const toggleTodo = (todoId: number) => {
    setTodos(todos.map(item => item.id === todoId ? { ...item, completed: !item.completed } : item));
  };

  const deleteTodo = (todoId: number) => {
    setTodos(todos.filter(item => item.id !== todoId));
    toast({ title: "Todo deleted", description: "Todo item has been removed." });
  };

  const getFilteredAndSortedTodos = () => {
    let filtered = todos.filter(todo => {
      const matchesFilter = todoFilter === "all" || 
        (todoFilter === "completed" && todo.completed) ||
        (todoFilter === "pending" && !todo.completed) ||
        todo.priority === todoFilter;
      const matchesSearch = todoSearch === "" || 
        todo.title.toLowerCase().includes(todoSearch.toLowerCase()) ||
        (todo.assignee && todo.assignee.toLowerCase().includes(todoSearch.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (todoSort) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "assignee":
          return (a.assignee || "").localeCompare(b.assignee || "");
        default:
          return 0;
      }
    });
  };

  const handleReschedule = (todoId: number) => {
    if (rescheduleData.newDate) {
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, dueDate: format(rescheduleData.newDate!, "yyyy-MM-dd") } : todo
      ));
      setRescheduleData({todoId: null, newDate: undefined});
      toast({ title: "Todo rescheduled", description: "Due date has been updated successfully." });
    }
  };

  const handleReassign = (todoId: number) => {
    if (reassignData.newAssignee) {
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, assignee: reassignData.newAssignee } : todo
      ));
      setReassignData({todoId: null, newAssignee: ""});
      toast({ title: "Todo reassigned", description: "Assignee has been updated successfully." });
    }
  };

  const stages = [
    { id: "scheduled", name: "Scheduled", color: "bg-blue-100 text-blue-800" },
    { id: "in_progress", name: "In Progress", color: "bg-yellow-100 text-yellow-800" },
    { id: "completed", name: "Completed", color: "bg-green-100 text-green-800" },
    { id: "cancelled", name: "Cancelled", color: "bg-red-100 text-red-800" },
    { id: "no_show", name: "No Show", color: "bg-gray-100 text-gray-800" },
  ];

  const getStageForStatus = (status: InterviewStatus) => {
    return status;
  };

  const toggleJobExpansion = (jobKey: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobKey)) {
      newExpanded.delete(jobKey);
    } else {
      newExpanded.add(jobKey);
    }
    setExpandedJobs(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Snapshot stats only when no filter is active so card counts never
  // recompute against a filtered subset when the user clicks a card.
  const [baseInterviewStats, setBaseInterviewStats] = useState({ ..._interviewsStatsCache });

  const safeInterviews = interviews || [];

  // Group interviews by job (safe calculation)
  const interviewsByJob = safeInterviews.reduce((acc, interview) => {
    try {
      const jobKey = interview?.submission?.job?.job_id || interview?.job_id || 'unknown';
      if (!acc[jobKey]) {
        acc[jobKey] = {
          jobId: interview?.submission?.job?.job_id || interview?.job_id || 'Unknown',
          jobTitle: interview?.submission?.job?.title || interview?.job_title || 'Unknown Position',
          company: interview?.submission?.job?.company_name || interview?.company_name || 'Unknown Company',
          interviews: []
        };
      }
      acc[jobKey].interviews.push(interview);
    } catch (err) {
      console.error('Error processing interview:', err, interview);
    }
    return acc;
  }, {} as Record<string, any>);

  // Calculate statistics (safe calculation)
  const totalInterviews = safeInterviews.length;
  const scheduledInterviews = safeInterviews.filter(i => i?.status === "scheduled").length;
  const completedInterviews = safeInterviews.filter(i => i?.status === "completed").length;
  const totalJobs = Object.keys(interviewsByJob).length;

  // Freeze base stats when no filter is active
  useEffect(() => {
    if (!statusFilter && !typeFilter) {
      const next = { total: totalInterviews, scheduled: scheduledInterviews, completed: completedInterviews, totalJobs };
      Object.assign(_interviewsStatsCache, next);
      setBaseInterviewStats(next);
    }
  }, [safeInterviews, statusFilter, typeFilter, totalInterviews, scheduledInterviews, completedInterviews, totalJobs]);

  const activeInterviewCardId =
    statusFilter === "scheduled" ? "scheduled" :
    statusFilter === "completed" ? "completed" : "all";

  const navigationCards = [
    {
      id: "all",
      title: "Total Interviews",
      value: (stats?.totalInterviews ?? baseInterviewStats.total).toString(),
      icon: Users,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: () => handleClearFilters(),
    },
    {
      id: "jobs",
      title: "Active Jobs",
      value: baseInterviewStats.totalJobs.toString(),
      icon: Briefcase,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: () => handleClearFilters(),
    },
    {
      id: "scheduled",
      title: "Scheduled",
      value: baseInterviewStats.scheduled.toString(),
      icon: Clock,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
      onClick: () => {
        setStatusFilter("scheduled");
        fetchInterviews({ status: "scheduled" });
      },
    },
    {
      id: "completed",
      title: "Completed",
      value: baseInterviewStats.completed.toString(),
      icon: CheckCircle,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: () => {
        setStatusFilter("completed");
        fetchInterviews({ status: "completed" });
      },
    },
  ];

  // Don't show early returns - let the component render and show loading/error states inline
  // This prevents blank screens if there are any errors during initialization

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">Interviews</h1>
          {statusFilter && (
            <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <button onClick={handleClearFilters} className="hover:bg-green-100 rounded-full p-0.5 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          {user?.role === "recruiter" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300"
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">
                {exporting ? "Exporting..." : "Export CSV"}
              </span>
            </Button>
          )}
 
          {user?.role === "recruiter" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300">
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
                <DropdownMenuItem onClick={() => navigate("/dashboard/submissions")}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Schedule Interview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user?.role === "recruiter" && (
            <Button
              className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 hover:scale-105"
              onClick={() => navigate("/dashboard/submissions")}
            >
              <Plus className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Schedule Interview</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
        {navigationCards.map((card, index) => {
          const IconComponent = card.icon;
          const isActive = activeInterviewCardId === card.id;
          return (
            <Card
              key={card.title}
              className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20 hover:scale-105 ${
                isActive ? "ring-2 ring-green-500 ring-offset-2 -translate-y-0.5 shadow-md" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={card.onClick}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>

              <CardContent className="relative p-1.5 sm:p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-1 sm:p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20 group-hover:rotate-6 group-hover:scale-110">
                    <IconComponent className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${card.color} transition-transform duration-300`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab truncate">{card.title}</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 font-roboto-slab group-hover:scale-110 transition-transform duration-300">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="interviews" className="text-xs font-medium">Interviews</TabsTrigger>
          <TabsTrigger value="todos" className="text-xs font-medium">Todos</TabsTrigger>
        </TabsList>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4">
          {/* Filters */}
          <Card className="border-gray-200 shadow-sm bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                  <Input
                    placeholder="Search interviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select 
                    value={statusFilter || "all"} 
                    onValueChange={(value) => setStatusFilter(value === "all" ? "" : (value as InterviewStatus))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                  <Select 
                    value={typeFilter || "all"} 
                    onValueChange={(value) => setTypeFilter(value === "all" ? "" : (value as InterviewType))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1 text-sm">
                    <Search className="w-4 h-4 mr-2" />
                    Apply
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters} className="text-sm">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {interviewsLoading && (
            <Card className="border-gray-200 shadow-sm bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading interviews...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {interviewsError && (
            <Card className="border-red-200 shadow-sm bg-red-50/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                <p className="text-red-600 mb-4">{interviewsError}</p>
                <Button onClick={refreshInterviews} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!interviewsLoading && !interviewsError && safeInterviews.length === 0 && (
            <Card className="border-gray-200 shadow-sm bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews found</h3>
                <p className="text-gray-600 mb-4">
                  {statusFilter || typeFilter || searchQuery 
                    ? "No interviews match your current filters." 
                    : "No interviews have been scheduled yet."}
                </p>
                {(statusFilter || typeFilter || searchQuery) && (
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interviews List */}
          {!interviewsLoading && !interviewsError && safeInterviews.length > 0 && (
          <Card className="border-gray-200 shadow-sm overflow-hidden bg-white/95 backdrop-blur-sm">
            <CardContent className="p-0 relative">
              <div className="space-y-0 relative">
                {Object.entries(interviewsByJob).map(([jobKey, jobData], jobIndex) => (
              <div key={jobKey} className="relative">
                <Collapsible 
                  open={expandedJobs.has(jobKey)}
                  onOpenChange={() => toggleJobExpansion(jobKey)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div 
                      className="flex items-center justify-between p-4 border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group relative overflow-hidden"
                      onMouseEnter={() => setHoveredJob(jobKey)}
                      onMouseLeave={() => setHoveredJob(null)}
                    >
                      <div className="flex items-center gap-3 relative z-10 flex-1">
                        <div className="relative">
                          {expandedJobs.has(jobKey) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-300" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-300" />
                          )}
                        </div>
                        <div className="relative">
                          <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-gray-900 font-poppins text-sm group-hover:text-blue-700 transition-colors duration-300">{jobData.jobTitle}</p>
                          <p className="text-xs text-gray-600 font-poppins">{jobData.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 relative z-10">
                        {stages.map((stage) => {
                          const stageInterviews = jobData.interviews.filter(
                            (interview: any) => getStageForStatus(interview.status) === stage.id
                          );
                          if (stageInterviews.length === 0) return null;
                          
                          return (
                            <Badge key={stage.id} className={`${stage.color} border font-medium font-poppins text-xs transition-all duration-300 group-hover:scale-105`}>
                              {stage.name}: {stageInterviews.length}
                            </Badge>
                          );
                        })}
                        
                        <Badge className="bg-blue-100 text-blue-800 border font-medium font-poppins text-xs group-hover:bg-blue-200 transition-colors duration-300 ml-2">
                          Total: {jobData.interviews.length}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="bg-gradient-to-br from-gray-50/50 to-blue-50/30 border-b">
                      <div className="p-4 space-y-3">
                        {jobData.interviews.map((interview: any) => (
                          <div 
                            key={interview.id}
                            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
                            onClick={() => navigate(`/dashboard/interviews/${interview.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                  <User className="w-8 h-8 text-blue-600 mb-1" />
                                  <Badge className={`text-xs ${interviewService.getStatusColor(interview.status)}`}>
                                    {interviewService.getStatusLabel(interview.status)}
                                  </Badge>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           navigate(`/dashboard/interviews/${interview.id}`);
                                         }}>
                                       {interview.submission?.candidate?.first_name} {interview.submission?.candidate?.last_name}
                                     </h4>
                                    <Badge variant="outline" className={`text-xs ${interviewService.getTypeColor(interview.interview_type)}`}>
                                      {interviewService.getTypeLabel(interview.interview_type)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {interviewService.formatDate(interview.scheduled_at)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {interviewService.formatTime(interview.scheduled_at)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {interview.interview_type === 'video' ? <Video className="w-3 h-3" /> : 
                                       interview.interview_type === 'phone' ? <Phone className="w-3 h-3" /> : 
                                       <Building className="w-3 h-3" />}
                                      {interview.location || interview.meeting_link ? 
                                        (interview.interview_type === 'video' ? 'Video Call' : 
                                         interview.interview_type === 'phone' ? 'Phone Call' : 
                                         interview.location) : 
                                        'TBD'}
                                    </div>
                                    {interview.duration_minutes && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {interviewService.formatDuration(interview.duration_minutes)}
                                      </div>
                                    )}
                                  </div>
                                  {interview.interviewer && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-xs text-gray-500">Interviewer:</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {interview.interviewer.recruiterProfile?.first_name} {interview.interviewer.recruiterProfile?.last_name}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div
                                className="flex items-center gap-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {interview.rating && (
                                  <div className="text-center">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Star className="w-4 h-4 text-yellow-500" />
                                      <span className="text-xs text-gray-500">Rating</span>
                                    </div>
                                    <p className="text-lg font-bold text-yellow-600">
                                      {interviewService.getRatingStars(interview.rating)}
                                    </p>
                                  </div>
                                )}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/dashboard/interviews/${interview.id}`)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {interviewService.canEdit(interview, user?.role || '') && (
                                      <DropdownMenuItem onClick={() => openEditDialog(interview)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Interview
                                      </DropdownMenuItem>
                                    )}
                                    {interview.status === 'scheduled' && (
                                      <DropdownMenuItem onClick={() => handleCompleteInterview(interview.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark Complete
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    {interviewService.canCancel(interview, user?.role || '') && (
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleCancelInterview(interview.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Cancel Interview
                                      </DropdownMenuItem>
                                    )}
                                    {user?.role === 'recruiter' && (
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteInterview(interview.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Interview
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Pagination */}
          {!interviewsLoading && !interviewsError && safeInterviews.length > 0 && pagination.totalPages > 1 && (
            <Card className="border-gray-200 shadow-sm bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} interviews
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentFilters: any = {};
                        if (statusFilter) currentFilters.status = statusFilter;
                        if (typeFilter) currentFilters.interview_type = typeFilter;
                        if (searchQuery) currentFilters.search = searchQuery;
                        if (dateFrom) currentFilters.date_from = dateFrom.toISOString();
                        if (dateTo) currentFilters.date_to = dateTo.toISOString();
                        fetchInterviews({ ...currentFilters, page: pagination.currentPage - 1 });
                      }}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentFilters: any = {};
                        if (statusFilter) currentFilters.status = statusFilter;
                        if (typeFilter) currentFilters.interview_type = typeFilter;
                        if (searchQuery) currentFilters.search = searchQuery;
                        if (dateFrom) currentFilters.date_from = dateFrom.toISOString();
                        if (dateTo) currentFilters.date_to = dateTo.toISOString();
                        fetchInterviews({ ...currentFilters, page: pagination.currentPage + 1 });
                      }}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Todos Tab */}
        <TabsContent value="todos" className="space-y-6 mt-0">
          <Card className="border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800">Todo List</CardTitle>
                <Button onClick={handleAddTodo} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Todo
                </Button>
              </div>
              
              <div className="flex justify-between items-center text-sm mt-2">
                <div className="flex gap-4">
                  <span className="text-green-600">Total: {todos.length}</span>
                  <span className="text-blue-600">Completed: {todos.filter(item => item.completed).length}</span>
                  <span className="text-orange-600">Pending: {todos.filter(item => !item.completed).length}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Search todos..."
                    value={todoSearch}
                    onChange={(e) => setTodoSearch(e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                <Select value={todoFilter} onValueChange={setTodoFilter}>
                  <SelectTrigger className="w-40 border-gray-300">
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
                <Select value={todoSort} onValueChange={setTodoSort}>
                  <SelectTrigger className="w-40 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                    <SelectItem value="priority">Sort by Priority</SelectItem>
                    <SelectItem value="assignee">Sort by Assignee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add New Todo */}
              <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Enter new todo..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                />
                <Select value={newTodoPriority} onValueChange={setNewTodoPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTodoAssignee} onValueChange={setNewTodoAssignee}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData.users.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Todo List */}
              <div className="space-y-3">
                {getFilteredAndSortedTodos().map((todo) => (
                  <div key={todo.id} className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {todo.title}
                          </h4>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>Due: {todo.dueDate}</span>
                            {todo.assignee && <span>Assigned to: {todo.assignee}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          todo.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }>
                          {todo.priority}
                        </Badge>
                        
                        {/* Reschedule */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setRescheduleData({todoId: todo.id, newDate: undefined})}>
                              <Calendar className="w-3 h-3 mr-1" />
                              Reschedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reschedule Todo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">Select new due date for: {todo.title}</p>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {rescheduleData.newDate ? format(rescheduleData.newDate, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={rescheduleData.newDate}
                                    onSelect={(date) => setRescheduleData({...rescheduleData, newDate: date})}
                                    className="rounded-md border pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              <div className="flex gap-2">
                                <Button onClick={() => handleReschedule(todo.id)} className="flex-1">
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Reassign */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setReassignData({todoId: todo.id, newAssignee: ""})}>
                              <UserPlus className="w-3 h-3 mr-1" />
                              Reassign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reassign Todo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">Reassign to: {todo.title}</p>
                              <Select value={reassignData.newAssignee} onValueChange={(value) => setReassignData({...reassignData, newAssignee: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select new assignee..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {usersData.users.map((user) => (
                                    <SelectItem key={user.id} value={user.name}>
                                      {user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button onClick={() => handleReassign(todo.id)} className="flex-1">
                                  Reassign
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => deleteTodo(todo.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Interview Dialog */}
      <Dialog open={!!editingInterview} onOpenChange={(open) => !open && setEditingInterview(null)}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select
                value={editForm.interview_type}
                onValueChange={(value) => setEditForm({ ...editForm, interview_type: value as InterviewType })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select
                value={editForm.duration_minutes}
                onValueChange={(value) => setEditForm({ ...editForm, duration_minutes: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editForm.interview_type === "video" && (
              <div className="space-y-2">
                <Label htmlFor="edit-meeting-link">Meeting Link</Label>
                <Input
                  id="edit-meeting-link"
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={editForm.meeting_link}
                  onChange={(e) => setEditForm({ ...editForm, meeting_link: e.target.value })}
                />
              </div>
            )}

            {editForm.interview_type === "in_person" && (
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  placeholder="Office address or meeting room"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as InterviewStatus })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInterview(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={managementLoading}>
              {managementLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interviews;