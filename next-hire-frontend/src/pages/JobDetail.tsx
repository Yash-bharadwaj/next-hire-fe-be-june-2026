import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
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
  CalendarDays,
  User,
  Star,
  Edit3,
  Trash2,
  ChevronUp,
  Save,
  Search,
  Brain,
  Bot,
  Sparkles,
  UserCog,
  Settings,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { JobProfitabilityPanel } from "@/components/JobProfitabilityPanel";
import { useJobProfitability, formatPct } from "@/hooks/useJobProfitability";
import { formatCompactRange, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TeamMember, Task, TaskPriority, TaskStatus, JobTeamMember, JobTeamMemberRole } from "@/services/recruiterService";
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "@/services/recruiterService";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MAX_PAGE_SIZE } from "@/lib/constants";
import { PageLoadingState } from "@/components/PageLoadingState";
import { ActionsMenuTrigger } from "@/components/ActionsMenuTrigger";
import { NotesPanel, NoteRecord } from "@/components/NotesPanel";
import { DocumentsPanel, DocumentRecord } from "@/components/DocumentsPanel";

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

const kanbanColumns = [
  { id: "new_candidate",   title: "Pipeline",                color: "bg-gray-50",   border: "border-gray-300" },
  { id: "initial_scanning", title: "Initial Scanning",       color: "bg-blue-50",   border: "border-blue-300" },
  { id: "first_round",    title: "First Round",              color: "bg-purple-50", border: "border-purple-300" },
  { id: "technical_round", title: "Technical Manager Round", color: "bg-yellow-50", border: "border-yellow-300" },
  { id: "final_round",    title: "Final Round",              color: "bg-orange-50", border: "border-orange-300" },
  { id: "hired",          title: "Hired",                    color: "bg-green-50",  border: "border-green-400" },
  { id: "rejected",       title: "Rejected",                 color: "bg-red-50",    border: "border-red-300" },
];

// Card body shared between the column list and the floating DragOverlay
// preview, so the dragged card looks identical to its resting state.
const KanbanCardBody = ({
  candidate,
  onMoveCandidate,
  onOpenSubmission,
  dragging,
}: {
  candidate: any;
  onMoveCandidate?: (submissionId: string, newStatus: string) => void;
  onOpenSubmission?: (submissionId: string) => void;
  dragging?: boolean;
}) => (
  <div
    className={`p-3 bg-white rounded-lg border shadow-sm transition-shadow ${
      dragging ? "border-blue-300 shadow-lg rotate-1" : "border-gray-100 hover:shadow-md"
    }`}
  >
    <div className="flex items-start justify-between gap-1 mb-1">
      <h4
        className={`font-semibold text-sm leading-tight ${
          onOpenSubmission && candidate.submission?.id
            ? "text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            : "text-gray-800"
        }`}
        onClick={(e) => {
          if (!onOpenSubmission || !candidate.submission?.id) return;
          e.stopPropagation();
          onOpenSubmission(candidate.submission.id);
        }}
      >
        {candidate.name}
      </h4>
      <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0">
        {candidate.score != null ? `${candidate.score}%` : "—"}
      </Badge>
    </div>
    <p className="text-xs text-gray-500 mb-1">{candidate.experience}</p>
    <p className="text-xs text-gray-400 mb-2">{candidate.location}</p>
    {onMoveCandidate && (
      <Select
        value={candidate.submission?.status || candidate.stage}
        onValueChange={(newStatus) => {
          if (!candidate.submission?.id) return;
          onMoveCandidate(candidate.submission.id, newStatus);
        }}
      >
        <SelectTrigger
          className="h-7 text-xs border-gray-200 bg-gray-50"
          onPointerDown={(e) => e.stopPropagation()}
        >
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
    )}
  </div>
);

const DraggableCandidateCard = ({
  candidate,
  onMoveCandidate,
  onOpenSubmission,
}: {
  candidate: any;
  onMoveCandidate: (submissionId: string, newStatus: string) => void;
  onOpenSubmission?: (submissionId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: candidate.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing touch-none ${isDragging ? "opacity-30" : ""}`}
    >
      <KanbanCardBody candidate={candidate} onMoveCandidate={onMoveCandidate} onOpenSubmission={onOpenSubmission} />
    </div>
  );
};

const DroppableKanbanColumn = ({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-colors duration-150 ${
        isOver ? "bg-blue-50 ring-2 ring-inset ring-blue-300" : ""
      }`}
    >
      {children}
    </div>
  );
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const profitabilityState = useJobProfitability(id);

  // Warn (don't block) if the user switches away from the Profitability tab
  // with unsaved edits - the panel has no autosave, so those edits are
  // otherwise silently lost the moment another tab unmounts the inputs.
  const handleTabChange = (next: string) => {
    if (activeTab === "profitability" && next !== "profitability" && profitabilityState.isDirty) {
      toast({
        title: "Unsaved profitability changes",
        description: "Your edits on the Profitability tab haven't been saved.",
        variant: "destructive",
      });
    }
    setActiveTab(next);
  };

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

  // ── AI pay rate estimate ────────────────────────────────────────────────
  const [reestimatingPayRate, setReestimatingPayRate] = useState(false);
  const handleReestimatePayRate = async () => {
    if (!id) return;
    setReestimatingPayRate(true);
    try {
      await recruiterService.reestimateJobPayRate(id);
      toast({ title: "Pay rate estimate updated" });
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to estimate pay rate",
        variant: "destructive",
      });
    } finally {
      setReestimatingPayRate(false);
    }
  };

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
            ? `${formatCompactRange(apiJob.bill_rate_min, apiJob.bill_rate_max, { suffix: "/hr", currency: apiJob.salary_currency })}`
            : "Rate negotiable"
          : apiJob.salary_min || apiJob.salary_max
          ? formatCompactRange(apiJob.salary_min, apiJob.salary_max, { currency: apiJob.salary_currency })
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

  // Normalize notes_history/attachments into the shapes NotesPanel/
  // DocumentsPanel expect. Entries written before the backend moved to the
  // richer createNoteHandlers shape lack id/category/etc (notes) or
  // id/document_type/valid_from (attachments) - synthesize stable
  // placeholders for those so they still display (edit/delete on a legacy
  // entry will cleanly 404, since it never had a real backend id).
  const normalizedJobNotes: NoteRecord[] = ((job as any)?.notes_history || []).map(
    (note: any, idx: number) =>
      note.id
        ? note
        : {
            id: `legacy-${idx}`,
            title: "",
            content: note.note || "",
            category: "general" as const,
            isPrivate: false,
            tags: [],
            author: note.by === user?.id ? "You" : "Recruiter",
            at: note.at,
          }
  );

  const normalizedJobAttachments: DocumentRecord[] = ((job as any)?.attachments || []).map(
    (att: any, idx: number) =>
      att.id
        ? att
        : {
            id: `legacy-${idx}`,
            url: att.url,
            name: att.name,
            document_type: "OTHER" as const,
            valid_from: att.at,
            at: att.at,
          }
  );

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

  // ── Team tab state ─────────────────────────────────────────────────────
  const [teamOptions, setTeamOptions] = useState<TeamMember[]>([]);
  const [assigningRole, setAssigningRole] = useState<
    "assigned_to" | "primary_recruiter_id" | "account_manager_id" | null
  >(null);
  const [assigningValue, setAssigningValue] = useState("");
  const [savingAssignment, setSavingAssignment] = useState(false);

  useEffect(() => {
    if (user?.role !== "recruiter") return;
    recruiterService
      .getTeamMembers()
      .then(setTeamOptions)
      .catch(() => {});
  }, [user?.role]);

  const formatTeamMemberName = (member: TeamMember) => {
    const name = [member.recruiterProfile?.first_name, member.recruiterProfile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || member.email;
  };

  const handleSaveAssignment = async () => {
    if (!id || !assigningRole) return;
    setSavingAssignment(true);
    try {
      await recruiterService.updateJob(id, { [assigningRole]: assigningValue || undefined } as any);
      toast({ title: "Team updated" });
      setAssigningRole(null);
      setAssigningValue("");
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSavingAssignment(false);
    }
  };

  // ── Additional team roster (free-form, beyond the 4 fixed roles above) ──
  const [additionalTeamMembers, setAdditionalTeamMembers] = useState<JobTeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersLoaded, setTeamMembersLoaded] = useState(false);
  const [showTeamManageDialog, setShowTeamManageDialog] = useState(false);
  const [newTeamMemberUserId, setNewTeamMemberUserId] = useState("");
  const [addingTeamMember, setAddingTeamMember] = useState(false);
  const [updatingTeamMemberId, setUpdatingTeamMemberId] = useState<string | null>(null);
  const [removingTeamMemberId, setRemovingTeamMemberId] = useState<string | null>(null);

  const TEAM_ROLE_LABELS: Record<JobTeamMemberRole, string> = {
    recruiter: "Recruiter",
    sourcer: "Sourcer",
    account_manager: "Account Manager",
    coordinator: "Coordinator",
    other: "Other",
  };

  const fetchJobTeamMembers = useCallback(async () => {
    if (!id) return;
    setTeamMembersLoading(true);
    try {
      const res = await recruiterService.getJobTeamMembers(id);
      setAdditionalTeamMembers(res.data.teamMembers || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setTeamMembersLoading(false);
      setTeamMembersLoaded(true);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "team" && !teamMembersLoaded) {
      fetchJobTeamMembers();
    }
  }, [activeTab, teamMembersLoaded, fetchJobTeamMembers]);

  // Selecting a person in the management dialog's "add new member" row adds
  // them immediately (matching frontend-previous) - role defaults to "other"
  // and can be refined right away via that row's own role dropdown.
  const handleAddTeamMember = async (userId: string) => {
    if (!id || !userId) return;
    setAddingTeamMember(true);
    try {
      await recruiterService.addJobTeamMember(id, { user_id: userId, role: "other" });
      toast({ title: "Team member added" });
      setNewTeamMemberUserId("");
      fetchJobTeamMembers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setAddingTeamMember(false);
    }
  };

  const handleUpdateTeamMemberRole = async (teamMemberId: string, role: JobTeamMemberRole) => {
    setUpdatingTeamMemberId(teamMemberId);
    try {
      await recruiterService.updateJobTeamMember(teamMemberId, { role });
      setAdditionalTeamMembers((prev) =>
        prev.map((m) => (m.id === teamMemberId ? { ...m, role } : m))
      );
      toast({ title: "Role updated" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setUpdatingTeamMemberId(null);
    }
  };

  const handleRemoveTeamMember = async (teamMemberId: string) => {
    setRemovingTeamMemberId(teamMemberId);
    try {
      await recruiterService.removeJobTeamMember(teamMemberId);
      setAdditionalTeamMembers((prev) => prev.filter((m) => m.id !== teamMemberId));
      toast({ title: "Team member removed" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setRemovingTeamMemberId(null);
    }
  };

  // Unified roster for both the management dialog's table and the card grid
  // below it - the 4 fixed singular roles on Job, plus the free-form roster.
  const fixedTeamRoles = [
    { key: "created_by" as const, label: "Created By", person: job?.creator, editable: false },
    { key: "assigned_to" as const, label: "Assigned To", person: job?.assignee, editable: true },
    { key: "primary_recruiter_id" as const, label: "Primary Recruiter", person: job?.primaryRecruiter, editable: true },
    { key: "account_manager_id" as const, label: "Account Manager", person: job?.accountManager, editable: true },
  ];

  const statusBadgeClass = (status?: string) =>
    status === "active"
      ? "border-green-300 text-green-700 bg-green-50/50"
      : status === "suspended"
      ? "border-red-300 text-red-700 bg-red-50/50"
      : status === "inactive"
      ? "border-gray-300 text-gray-600 bg-gray-50/50"
      : "border-gray-200 text-gray-400";

  const teamMemberInitials = (person: TeamMember) =>
    formatTeamMemberName(person)
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // ── ToDos tab state ────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskSort, setTaskSort] = useState<"due_date" | "priority" | "status" | "newest">("due_date");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPlannedCompletionDate, setNewTaskPlannedCompletionDate] = useState("");
  const [newTaskComments, setNewTaskComments] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    setTasksLoading(true);
    try {
      const res = await recruiterService.getTasks({ job_id: id, limit: MAX_PAGE_SIZE });
      setTasks((res as any)?.data?.tasks || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setTasksLoading(false);
      setTasksLoaded(true);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "todos" && !tasksLoaded) {
      fetchTasks();
    }
  }, [activeTab, tasksLoaded, fetchTasks]);

  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status !== "completed").length,
  };

  const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const TASK_PRIORITY_FILTER_VALUES = ["high", "medium", "low"];

  const filteredTasks = tasks
    .filter((t) => {
      if (taskStatusFilter === "all") return true;
      if (TASK_PRIORITY_FILTER_VALUES.includes(taskStatusFilter)) return t.priority === taskStatusFilter;
      return t.status === taskStatusFilter;
    })
    .filter(
      (t) =>
        t.title.toLowerCase().includes(taskSearch.trim().toLowerCase()) ||
        (t.assignee && formatTeamMemberName(t.assignee).toLowerCase().includes(taskSearch.trim().toLowerCase()))
    )
    .sort((a, b) => {
      if (taskSort === "priority") {
        return (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
      }
      if (taskSort === "status") {
        // Incomplete tasks first, completed last (matches frontend-previous's binary sort)
        const rank = (s: string) => (s === "completed" ? 1 : 0);
        return rank(a.status) - rank(b.status);
      }
      if (taskSort === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      // due_date: tasks without a due date sort last
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const handleAddTask = async () => {
    if (!id || !newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await recruiterService.createTask({
        title: newTaskTitle.trim(),
        job_id: id,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        planned_completion_date: newTaskPlannedCompletionDate || undefined,
        description: newTaskComments || undefined,
        assigned_to: newTaskAssignee || undefined,
      });
      toast({ title: "Task added" });
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskPlannedCompletionDate("");
      setNewTaskComments("");
      setNewTaskPriority("medium");
      setNewTaskAssignee("");
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const nextStatus = task.status === "completed" ? "not_started" : "completed";
      await recruiterService.updateTask(task.id, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleRescheduleTask = async (taskId: string, dueDate: Date) => {
    try {
      await recruiterService.updateTask(taskId, { due_date: dueDate.toISOString() });
      toast({ title: "Task rescheduled" });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to reschedule task",
        variant: "destructive",
      });
    }
  };

  const handleReassignTask = async (taskId: string, assigneeId: string) => {
    try {
      await recruiterService.updateTask(taskId, { assigned_to: assigneeId });
      toast({ title: "Task reassigned" });
      setReassigningTaskId(null);
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to reassign task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await recruiterService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleAddCandidate = (stageId: string) => {
    console.log(`Adding candidate to ${stageId}`);
  };

  // Optimistically moves a candidate's card to the new stage immediately
  // (so drag-and-drop feels instant), then persists the status change and
  // rolls back + shows an error toast if the request fails.
  const handleMoveCandidate = async (submissionId: string, newStatus: string) => {
    const previousCandidates = candidates;
    const previousSubmissions = submissions;

    setCandidates((prev) =>
      prev.map((c) =>
        c.submission?.id === submissionId
          ? {
              ...c,
              stage: mapSubmissionStatusToStage(newStatus),
              submission: { ...c.submission, status: newStatus },
            }
          : c
      )
    );
    setSubmissions((prev: any[]) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
    );

    try {
      await recruiterService.updateSubmissionStatus(submissionId, { status: newStatus as any });
    } catch (e: any) {
      setCandidates(previousCandidates);
      setSubmissions(previousSubmissions);
      toast({
        title: "Error",
        description: e?.response?.data?.message || e?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter((candidate) => candidate.stage === stageId);
  };

  const getStageCount = (stageId: string) => {
    return getCandidatesByStage(stageId).length;
  };

  // ── Sourcing funnel drag-and-drop ──────────────────────────────────────
  const [draggingCandidate, setDraggingCandidate] = useState<any | null>(null);
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleKanbanDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find((c) => c.id === event.active.id);
    setDraggingCandidate(candidate || null);
  };

  const handleKanbanDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingCandidate(null);
    if (!over) return;

    const candidate = candidates.find((c) => c.id === active.id);
    const newStatus = String(over.id);
    if (!candidate?.submission?.id || candidate.submission.status === newStatus) return;

    handleMoveCandidate(candidate.submission.id, newStatus);
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
  const [personalizationSettings] = useLocalStorage(
    "jobDetailPersonalization",
    (error) => console.error("Failed to parse personalization settings:", error)
  );

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

  const fetchSubmissionStats = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id && user?.role === "recruiter") {
      fetchSubmissionStats();
    }
  }, [id, user?.role, fetchSubmissionStats]);

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

  // Deep-link from elsewhere (e.g. Interview Detail's "Manual Search" action)
  // straight into this job's existing Manual Search dialog, rather than
  // duplicating the AI-ranked search logic on another page.
  useEffect(() => {
    if (job?.id && searchParams.get("openManualSearch") === "1") {
      handleOpenManualSearch();
      const next = new URLSearchParams(searchParams);
      next.delete("openManualSearch");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id]);

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
      // Carry the AI match score already computed during this search over
      // onto the submission, instead of leaving it blank and re-deriving it
      // later (or never).
      const aiScores: Record<string, number> = {};
      matchResults.forEach((c: any) => {
        if (selectedCandidates.has(c.id) && typeof c.matchScore === "number") {
          aiScores[c.id] = c.matchScore;
        }
      });

      const res = await recruiterService.sourceCandidates(
        job!.id,
        Array.from(selectedCandidates),
        aiScores
      );
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
      // Refresh submissions, candidates (kanban board), and stats together so
      // the newly added candidate(s) appear immediately instead of only after
      // a page reload.
      await fetchSubmissionStats();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to add candidates", variant: "destructive" });
    } finally {
      setSourcingLoading(false);
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

    normalizedJobNotes.forEach((note) => {
      events.push({
        label: "Note Added",
        detail: note.content.substring(0, 100) + (note.content.length > 100 ? "…" : ""),
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
    return <PageLoadingState label="Loading job details..." />;
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

  // Real per-stage elapsed-time stats (Process Timeline Stats table + Stats tab summary cards).
  // Clamp every duration to >= 0 - clock skew or an out-of-order updated_at
  // should never surface as a negative/nonsensical duration in the UI.
  const stageDurations: { label: string; hours: number }[] = [];
  if (job.created_at && job.updated_at) {
    stageDurations.push({
      label: "Created",
      hours: Math.max(0, (new Date(job.updated_at).getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60)),
    });
  }
  if (job.status === "active" && job.updated_at) {
    stageDurations.push({
      label: "Active",
      hours: Math.max(0, (new Date().getTime() - new Date(job.updated_at).getTime()) / (1000 * 60 * 60)),
    });
  }
  kanbanColumns.forEach((col) => {
    const colSubs = (submissions as any[]).filter((s: any) => mapSubmissionStatusToStage(s.status) === col.id);
    if (colSubs.length === 0) return;
    const oldest = colSubs.reduce((a: any, b: any) =>
      new Date(a.updated_at || a.created_at) < new Date(b.updated_at || b.created_at) ? a : b
    );
    const newest = colSubs.reduce((a: any, b: any) =>
      new Date(a.updated_at || a.created_at) > new Date(b.updated_at || b.created_at) ? a : b
    );
    stageDurations.push({
      label: col.title,
      hours: Math.max(
        0,
        (new Date(newest.updated_at || newest.created_at).getTime() -
          new Date(oldest.updated_at || oldest.created_at).getTime()) /
          (1000 * 60 * 60)
      ),
    });
  });
  const hasStageData = stageDurations.length > 0;
  const avgStageTime = hasStageData ? stageDurations.reduce((sum, s) => sum + s.hours, 0) / stageDurations.length : 0;
  const longestStage = stageDurations.reduce(
    (max, s) => (s.hours > max.hours ? s : max),
    { label: "—", hours: 0 }
  );
  // Hiring efficiency: % of sourced candidates who were ultimately hired.
  // Undefined (not 0%) until there's at least one candidate to measure against.
  const hasEfficiencyData = totalCandidates > 0;
  const efficiencyScore = hasEfficiencyData ? (hiredCandidates / totalCandidates) * 100 : 0;

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
                  <ActionsMenuTrigger
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"
                    iconClassName="w-4 h-4 mr-1"
                    chevronClassName="w-3 h-3 ml-1"
                  />
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
                          ? formatCurrency(Math.round((Number(job.bill_rate_min) + Number(job.bill_rate_max)) / 2), job.salary_currency)
                          : job.bill_rate_min
                          ? formatCurrency(Number(job.bill_rate_min), job.salary_currency)
                          : "N/A"
                        : job.salary_min && job.salary_max
                        ? formatCurrency(
                            Math.round((Number(job.salary_min) + Number(job.salary_max)) / 2 / 2080),
                            job.salary_currency
                          )
                        : job.salary_min
                        ? formatCurrency(Math.round(Number(job.salary_min) / 2080), job.salary_currency)
                        : "N/A"}
                      /hr
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.job_type === "contract" ? "Bill Rate" : "Estimated Pay Rate"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profitabilityState.loading
                        ? "…"
                        : formatPct(profitabilityState.totals.grossMargin, profitabilityState.totals.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-600">Gross Margin %</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {profitabilityState.loading
                        ? "…"
                        : formatPct(profitabilityState.totals.netMargin, profitabilityState.totals.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-600">Net Margin %</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Tabs */}
      <Card className="card-gradient border-green-200/50 shadow-lg">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="px-6 pt-6 pb-2">
            <TabsList className={`grid w-full lg:w-auto bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 ${user?.role === "recruiter" ? "grid-cols-9" : "grid-cols-5"}`}>
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
              {user?.role === "recruiter" && (
                <>
                  <TabsTrigger
                    value="todos"
                    className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                  >
                    ToDos
                  </TabsTrigger>
                  <TabsTrigger
                    value="team"
                    className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                  >
                    Team
                  </TabsTrigger>
                </>
              )}
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
              {user?.role === "recruiter" && (
                <TabsTrigger
                  value="profitability"
                  className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  Profitability
                </TabsTrigger>
              )}
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

                {/* AI Estimated Pay Rate */}
                {user?.role === "recruiter" && (
                  <Card className="card-gradient border-indigo-200/50 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-xl bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                          <Bot className="w-5 h-5 text-indigo-600" />
                          AI Estimated Pay Rate
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                          onClick={handleReestimatePayRate}
                          disabled={reestimatingPayRate}
                        >
                          {reestimatingPayRate ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-1" />
                          )}
                          {reestimatingPayRate ? "Estimating..." : "Re-estimate"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {job.ai_estimated_pay_min != null && job.ai_estimated_pay_max != null ? (
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-indigo-700">
                            {formatCompactRange(job.ai_estimated_pay_min, job.ai_estimated_pay_max, {
                              suffix: job.ai_estimated_pay_basis === "hourly" ? "/hr" : "/yr",
                              currency: job.ai_estimated_pay_currency || "USD",
                            })}
                          </p>
                          {job.ai_estimated_pay_rationale && (
                            <p className="text-sm text-gray-600">{job.ai_estimated_pay_rationale}</p>
                          )}
                          {job.ai_estimated_pay_at && (
                            <p className="text-xs text-gray-400">
                              Estimated {new Date(job.ai_estimated_pay_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No AI estimate yet. New jobs get one automatically - click "Re-estimate" to generate one now.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

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
                            ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, { suffix: "/hr", currency: job.salary_currency })
                            : formatCompactRange(job.salary_min, job.salary_max, { currency: job.salary_currency })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sourcing-funnel" className="space-y-4 mt-0">
              {/* Kanban Sourcing Funnel */}
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragStart={handleKanbanDragStart}
                onDragEnd={handleKanbanDragEnd}
                onDragCancel={() => setDraggingCandidate(null)}
              >
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {kanbanColumns.map((column) => (
                    <Card
                      key={column.id}
                      className={`min-w-[270px] max-w-[270px] ${column.color} border-2 ${column.border}`}
                    >
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            {column.title}
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {getStageCount(column.id)}
                            </Badge>
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleOpenManualSearch}
                            className="h-6 w-6 p-0"
                            title="Add candidate"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <DroppableKanbanColumn id={column.id} className="space-y-2 px-3 pb-3 min-h-[80px] rounded-b-lg">
                        {getCandidatesByStage(column.id).map((candidate: any) => (
                          <DraggableCandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onMoveCandidate={handleMoveCandidate}
                            onOpenSubmission={(submissionId) => navigate(`/dashboard/submissions/${submissionId}`)}
                          />
                        ))}
                        {getCandidatesByStage(column.id).length === 0 && (
                          <div className="text-center py-6 text-gray-400 text-xs">
                            <p className="mb-2">No candidates in this stage</p>
                            <Button size="sm" variant="outline" onClick={handleOpenManualSearch}>
                              <Plus className="w-3 h-3 mr-1" />
                              Add First
                            </Button>
                          </div>
                        )}
                      </DroppableKanbanColumn>
                    </Card>
                  ))}
                </div>
                <DragOverlay>
                  {draggingCandidate && <KanbanCardBody candidate={draggingCandidate} dragging />}
                </DragOverlay>
              </DndContext>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-0">
              <NotesPanel
                title="Job Notes & Comments"
                description="Internal notes and feedback about this job"
                notes={normalizedJobNotes}
                onAdd={async (data) => {
                  if (!id) return;
                  await recruiterService.addJobNote(id, data);
                  refresh();
                }}
                onUpdate={async (noteId, data) => {
                  if (!id) return;
                  await recruiterService.updateJobNote(id, noteId, data);
                  refresh();
                }}
                onDelete={async (noteId) => {
                  if (!id) return;
                  await recruiterService.deleteJobNote(id, noteId);
                  refresh();
                }}
              />
            </TabsContent>

            <TabsContent value="attachments" className="space-y-6 mt-0">
              <DocumentsPanel
                title="Job Attachments"
                documents={normalizedJobAttachments}
                onUpload={async (data) => {
                  if (!id) return;
                  await recruiterService.addJobAttachment(id, data);
                  refresh();
                }}
                onDelete={async (attachmentId) => {
                  if (!id) return;
                  await recruiterService.deleteJobAttachment(id, attachmentId);
                  refresh();
                }}
              />
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

                <Card className="card-gradient border-indigo-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent">
                      Avg Stage Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">
                      {hasStageData ? `${avgStageTime.toFixed(1)} hrs` : "N/A"}
                    </div>
                    <p className="text-xs text-gray-600">Average per stage</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-pink-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-pink-700 to-pink-600 bg-clip-text text-transparent">
                      Longest Stage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">
                      {hasStageData ? `${longestStage.hours.toFixed(1)} hrs` : "N/A"}
                    </div>
                    <p className="text-xs text-gray-600">{hasStageData ? `${longestStage.label} stage` : "No stage data yet"}</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-emerald-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                      Efficiency Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        !hasEfficiencyData
                          ? "text-gray-800"
                          : efficiencyScore >= 50
                          ? "text-green-600"
                          : efficiencyScore >= 20
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {hasEfficiencyData ? `${efficiencyScore.toFixed(1)}%` : "N/A"}
                    </div>
                    <p className="text-xs text-gray-600">
                      {hasEfficiencyData ? `${hiredCandidates} of ${totalCandidates} hired` : "No candidates sourced yet"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {user?.role === "recruiter" && (
              <TabsContent value="todos" className="space-y-6 mt-0">
                <Card className="card-gradient border-green-200/50 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                          Job Tasks
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600">Total: {taskCounts.total}</span>
                          <span className="text-blue-600">Completed: {taskCounts.completed}</span>
                          <span className="text-orange-600">Pending: {taskCounts.pending}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative w-44">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={taskSearch}
                            onChange={(e) => setTaskSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="pl-10 border-green-200 focus:border-green-400"
                          />
                        </div>
                        <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                          <SelectTrigger className="w-40 border-green-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            {TASK_STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {TASK_STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={taskSort} onValueChange={(v) => setTaskSort(v as typeof taskSort)}>
                          <SelectTrigger className="w-32 border-green-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="due_date">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                          </SelectContent>
                        </Select>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-green-200"
                              onClick={() => fetchTasks()}
                              disabled={tasksLoading}
                            >
                              <RefreshCw className={`w-4 h-4 ${tasksLoading ? "animate-spin" : ""}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Refresh</TooltipContent>
                        </Tooltip>
                        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600">
                              <Plus className="w-4 h-4 mr-1" />
                              Add Task
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Task</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Input
                                placeholder="Task title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-500">Due Date</Label>
                                  <Input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-500">Planned Completion Date</Label>
                                  <Input
                                    type="date"
                                    value={newTaskPlannedCompletionDate}
                                    onChange={(e) => setNewTaskPlannedCompletionDate(e.target.value)}
                                  />
                                </div>
                              </div>
                              <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Assign to (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamOptions.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {formatTeamMemberName(member)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea
                              placeholder="Comments (optional)"
                              value={newTaskComments}
                              onChange={(e) => setNewTaskComments(e.target.value)}
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  await handleAddTask();
                                  setShowAddTask(false);
                                }}
                                disabled={!newTaskTitle.trim() || savingTask}
                              >
                                {savingTask ? "Adding..." : "Add Task"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tasksLoading ? (
                      <div className="flex items-center justify-center py-10 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading tasks...
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No tasks for this job yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTasks.map((todo) => (
                          <div
                            key={todo.id}
                            className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3 min-w-0">
                                <Checkbox
                                  checked={todo.status === "completed"}
                                  onCheckedChange={() => handleToggleTask(todo)}
                                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <div className="min-w-0">
                                  <h4
                                    className={`font-semibold truncate ${
                                      todo.status === "completed" ? "line-through text-gray-500" : "text-gray-900"
                                    }`}
                                  >
                                    {todo.title}
                                  </h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>
                                      Due: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : "—"}
                                    </span>
                                    {todo.planned_completion_date && (
                                      <span>
                                        Planned: {new Date(todo.planned_completion_date).toLocaleDateString()}
                                      </span>
                                    )}
                                    {todo.assignee && (
                                      <span>Assigned to: {formatTeamMemberName(todo.assignee)}</span>
                                    )}
                                  </div>
                                  {todo.description && (
                                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{todo.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
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

                                <Select
                                  value={todo.status}
                                  onValueChange={async (status) => {
                                    try {
                                      await recruiterService.updateTask(todo.id, { status: status as TaskStatus });
                                      setTasks((prev) => prev.map((t) => (t.id === todo.id ? { ...t, status: status as TaskStatus } : t)));
                                    } catch (err: any) {
                                      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update status", variant: "destructive" });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-36 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TASK_STATUS_OPTIONS.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {TASK_STATUS_LABELS[status]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                                      <Calendar className="w-4 h-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarComponent
                                      mode="single"
                                      selected={todo.due_date ? new Date(todo.due_date) : undefined}
                                      onSelect={(date) => date && handleRescheduleTask(todo.id, date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>

                                <Dialog
                                  open={reassigningTaskId === todo.id}
                                  onOpenChange={(open) => setReassigningTaskId(open ? todo.id : null)}
                                >
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-purple-600 hover:bg-purple-50">
                                      <User className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reassign Task</DialogTitle>
                                    </DialogHeader>
                                    <Select onValueChange={(v) => handleReassignTask(todo.id, v)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {teamOptions.map((member) => (
                                          <SelectItem key={member.id} value={member.id}>
                                            {formatTeamMemberName(member)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteTask(todo.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {user?.role === "recruiter" && (
              <TabsContent value="team" className="space-y-6 mt-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                    Team Members
                  </h3>
                  <Dialog open={showTeamManageDialog} onOpenChange={setShowTeamManageDialog}>
                    <DialogTrigger asChild>
                      <Button className="button-gradient shadow-md bg-gradient-to-r from-green-500 to-green-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add/Edit Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-white border border-green-200/50 shadow-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                          Manage Team Members
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200/30">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-green-200/50">
                                <TableHead className="text-green-700 font-semibold">Name</TableHead>
                                <TableHead className="text-green-700 font-semibold">Role</TableHead>
                                <TableHead className="text-green-700 font-semibold">Email</TableHead>
                                <TableHead className="text-green-700 font-semibold">Status</TableHead>
                                <TableHead className="text-green-700 font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {fixedTeamRoles.map((role) => (
                                <TableRow key={role.key} className="border-green-100/50 hover:bg-green-50/50">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {role.person ? teamMemberInitials(role.person as TeamMember) : "—"}
                                      </div>
                                      <span className="font-medium text-gray-800">
                                        {role.person ? formatTeamMemberName(role.person as TeamMember) : "Not assigned"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-gray-700">{role.label}</TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-600">{role.person?.email || "—"}</span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={statusBadgeClass((role.person as any)?.status)}>
                                      {(role.person as any)?.status || "—"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {role.editable && (
                                      <Dialog
                                        open={assigningRole === role.key}
                                        onOpenChange={(open) => {
                                          setAssigningRole(open ? (role.key as any) : null);
                                          setAssigningValue(role.person?.id || "");
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                            <Edit3 className="w-3 h-3" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Change {role.label}</DialogTitle>
                                          </DialogHeader>
                                          <Select value={assigningValue} onValueChange={setAssigningValue}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select recruiter" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {teamOptions.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                  {formatTeamMemberName(member)}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <div className="flex justify-end gap-2 pt-2">
                                            <Button variant="outline" onClick={() => setAssigningRole(null)}>
                                              Cancel
                                            </Button>
                                            <Button onClick={handleSaveAssignment} disabled={savingAssignment || !assigningValue}>
                                              {savingAssignment ? "Saving..." : "Save"}
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}

                              {teamMembersLoading ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    Loading team members...
                                  </TableCell>
                                </TableRow>
                              ) : (
                                additionalTeamMembers.map((tm) => (
                                  <TableRow key={tm.id} className="border-green-100/50 hover:bg-green-50/50">
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                          {tm.member ? teamMemberInitials(tm.member) : "—"}
                                        </div>
                                        <span className="font-medium text-gray-800">
                                          {tm.member ? formatTeamMemberName(tm.member) : "Unknown"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        value={tm.role}
                                        onValueChange={(v) => handleUpdateTeamMemberRole(tm.id, v as JobTeamMemberRole)}
                                        disabled={updatingTeamMemberId === tm.id}
                                      >
                                        <SelectTrigger className="border-green-200 focus:border-green-500 w-40">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-green-200">
                                          {(Object.keys(TEAM_ROLE_LABELS) as JobTeamMemberRole[]).map((r) => (
                                            <SelectItem key={r} value={r}>
                                              {TEAM_ROLE_LABELS[r]}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-gray-600">{tm.member?.email || "—"}</span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={statusBadgeClass(tm.member?.status)}>
                                        {tm.member?.status || "—"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRemoveTeamMember(tm.id)}
                                        disabled={removingTeamMemberId === tm.id}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                      >
                                        {removingTeamMemberId === tm.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}

                              {/* Add new member row */}
                              <TableRow className="border-green-100/50 hover:bg-green-50/50">
                                <TableCell>
                                  <Select
                                    value={newTeamMemberUserId}
                                    onValueChange={(v) => {
                                      setNewTeamMemberUserId(v);
                                      handleAddTeamMember(v);
                                    }}
                                    disabled={addingTeamMember}
                                  >
                                    <SelectTrigger className="border-green-200 focus:border-green-500">
                                      <SelectValue placeholder={addingTeamMember ? "Adding..." : "Select user to add..."} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-green-200">
                                      {teamOptions
                                        .filter(
                                          (m) =>
                                            !additionalTeamMembers.some((atm) => atm.user_id === m.id) &&
                                            !fixedTeamRoles.some((r) => r.person?.id === m.id)
                                        )
                                        .map((member) => (
                                          <SelectItem key={member.id} value={member.id}>
                                            {formatTeamMemberName(member)}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell colSpan={4} className="text-gray-500 text-sm">
                                  Select a user from the dropdown to add them to the team
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowTeamManageDialog(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {fixedTeamRoles.map((role) => {
                    const phone = (role.person as any)?.recruiterProfile?.phone;
                    return (
                      <Card
                        key={role.key}
                        className="group relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-green-100/20 border border-green-200/60 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-green-300/80"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="relative p-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-500/30 group-hover:scale-105">
                                {role.person ? teamMemberInitials(role.person as TeamMember) : "—"}
                              </div>
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                                {role.person ? formatTeamMemberName(role.person as TeamMember) : "Not assigned"}
                              </h4>
                              <p className="text-sm font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                {role.label}
                              </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <Badge variant="outline" className={cn("text-xs px-3 py-1", statusBadgeClass((role.person as any)?.status))}>
                                {(role.person as any)?.status || "Unassigned"}
                              </Badge>
                            </div>

                            {role.person && (
                              <div className="space-y-3 w-full">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <button
                                    onClick={() => (window.location.href = `mailto:${role.person!.email}`)}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium truncate max-w-[180px]"
                                  >
                                    {role.person.email}
                                  </button>
                                </div>
                                {phone && (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                      <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    <button
                                      onClick={() => (window.location.href = `tel:${phone}`)}
                                      className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                                    >
                                      {phone}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {role.person && (
                              <div className="flex gap-2 w-full pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => (window.location.href = `mailto:${role.person!.email}`)}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-1"
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </Button>
                                {phone && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => (window.location.href = `tel:${phone}`)}
                                    className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 flex-1 transition-all duration-200"
                                  >
                                    <Phone className="w-3 h-3 mr-1" />
                                    Call
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {teamMembersLoading ? (
                    <div className="col-span-full flex items-center justify-center py-10 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Loading team members...
                    </div>
                  ) : (
                    additionalTeamMembers.map((tm) => {
                      const phone = tm.member?.recruiterProfile?.phone;
                      return (
                        <Card
                          key={tm.id}
                          className="group relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-green-100/20 border border-green-200/60 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-green-300/80"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <CardContent className="relative p-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                                  {tm.member ? teamMemberInitials(tm.member) : "—"}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                                  {tm.member ? formatTeamMemberName(tm.member) : "Unknown"}
                                </h4>
                                <p className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                  {TEAM_ROLE_LABELS[tm.role]}
                                </p>
                              </div>

                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <Badge variant="outline" className={cn("text-xs px-3 py-1", statusBadgeClass(tm.member?.status))}>
                                  {tm.member?.status || "Unknown"}
                                </Badge>
                              </div>

                              {tm.member && (
                                <div className="space-y-3 w-full">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                      <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <button
                                      onClick={() => (window.location.href = `mailto:${tm.member!.email}`)}
                                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium truncate max-w-[180px]"
                                    >
                                      {tm.member.email}
                                    </button>
                                  </div>
                                  {phone && (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-green-600" />
                                      </div>
                                      <button
                                        onClick={() => (window.location.href = `tel:${phone}`)}
                                        className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                                      >
                                        {phone}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {tm.member && (
                                <div className="flex gap-2 w-full pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => (window.location.href = `mailto:${tm.member!.email}`)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-1"
                                  >
                                    <Mail className="w-3 h-3 mr-1" />
                                    Email
                                  </Button>
                                  {phone && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => (window.location.href = `tel:${phone}`)}
                                      className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 flex-1 transition-all duration-200"
                                    >
                                      <Phone className="w-3 h-3 mr-1" />
                                      Call
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            )}

            {user?.role === "recruiter" && (
              <TabsContent value="profitability" className="space-y-6 mt-0">
                <JobProfitabilityPanel
                  profitability={profitabilityState.profitability}
                  loading={profitabilityState.loading}
                  saving={profitabilityState.saving}
                  totals={profitabilityState.totals}
                  currency={job.salary_currency || "USD"}
                  updateDraft={profitabilityState.updateDraft}
                  onSave={profitabilityState.handleSave}
                />
              </TabsContent>
            )}
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
