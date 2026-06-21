import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Briefcase,
  Building,
  DollarSign,
  Calendar as CalendarIcon,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  Layers,
  UserCheck,
  Globe,
  Send,
  MessageSquare,
  StickyNote,
  ClipboardList,
  FolderOpen,
  BarChart3,
  Plus,
  Trash2,
  Loader2,
  CheckSquare,
  Linkedin,
  Link2,
  ExternalLink,
  Download,
  Pencil,
  Sparkles,
} from "lucide-react";
import { usePlacementDetail, usePlacementManagement } from "@/hooks/usePlacements";
import { placementService, UpdatePlacementRequest, OnboardingStatus, RenewalStatus } from "@/services/placementService";
import { recruiterService, Task, TaskPriority, TeamMember } from "@/services/recruiterService";
import { useToast } from "@/hooks/use-toast";
import { NotesPanel } from "@/components/NotesPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { JobProfitabilityPanel } from "@/components/JobProfitabilityPanel";

const tabTriggerClass =
  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const formatDateOnly = (iso?: string) => (iso ? format(new Date(iso), "PPP") : "—");

const formatCurrency = (amount?: number, currency = "USD") =>
  amount != null
    ? new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount)
    : "—";

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <div className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</div>
    </div>
  </div>
);

const StarRatingInput = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)} className="focus:outline-none">
        <Star className={`w-6 h-6 ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      </button>
    ))}
  </div>
);

const PlacementDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { placement, loading, error, refresh } = usePlacementDetail(id);
  const { updatePlacement, updateOnboardingStatus, loading: saving } = usePlacementManagement();

  const statusColor = placement?.status
    ? placementService.getStatusColor(placement.status)
    : "bg-gray-100 text-gray-800";

  const candidateName = placement?.candidate
    ? `${placement.candidate.first_name || ""} ${placement.candidate.last_name || ""}`.trim()
    : "—";

  const recruiterName = placement?.recruiter
    ? placement.recruiter.recruiterProfile
      ? `${placement.recruiter.recruiterProfile.first_name || ""} ${placement.recruiter.recruiterProfile.last_name || ""}`.trim()
      : placement.recruiter.email
    : "—";

  // ── Edit Placement (status / salary / end date) ────────────────────────
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStatus, setEditStatus] = useState<UpdatePlacementRequest["status"]>("active");
  const [editSalary, setEditSalary] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const openEditDialog = () => {
    if (!placement) return;
    setEditStatus(placement.status);
    setEditSalary(String(placement.salary ?? ""));
    setEditEndDate(placement.end_date ? placement.end_date.slice(0, 10) : "");
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!placement) return;
    const result = await updatePlacement(placement.id, {
      status: editStatus,
      salary: editSalary ? Number(editSalary) : undefined,
      end_date: editEndDate || undefined,
    });
    if (result) {
      setShowEditDialog(false);
      refresh();
    }
  };

  // ── Comments (flat internal notes field) ────────────────────────────────
  const [commentsDraft, setCommentsDraft] = useState("");
  const [savingComments, setSavingComments] = useState(false);
  useEffect(() => {
    setCommentsDraft(placement?.notes || "");
  }, [placement?.notes]);

  const handleSaveComments = async () => {
    if (!placement) return;
    setSavingComments(true);
    try {
      await placementService.updatePlacement(placement.id, { notes: commentsDraft.trim() || undefined });
      toast({ title: "Comments saved" });
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save comments",
        variant: "destructive",
      });
    } finally {
      setSavingComments(false);
    }
  };

  // ── Evaluation (performance rating / notes) ─────────────────────────────
  const [ratingDraft, setRatingDraft] = useState(0);
  const [performanceNotesDraft, setPerformanceNotesDraft] = useState("");
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  useEffect(() => {
    setRatingDraft(placement?.performance_rating || 0);
    setPerformanceNotesDraft(placement?.performance_notes || "");
  }, [placement?.performance_rating, placement?.performance_notes]);

  const handleSaveEvaluation = async () => {
    if (!placement) return;
    setSavingEvaluation(true);
    try {
      await placementService.updatePlacement(placement.id, {
        performance_rating: ratingDraft || undefined,
        performance_notes: performanceNotesDraft.trim() || undefined,
      });
      toast({ title: "Evaluation saved" });
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save evaluation",
        variant: "destructive",
      });
    } finally {
      setSavingEvaluation(false);
    }
  };

  // ── Onboarding & Renewal ─────────────────────────────────────────────────
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingStatus>("pending");
  const [renewalStatusDraft, setRenewalStatusDraft] = useState<RenewalStatus | "">("");
  const [renewalDateDraft, setRenewalDateDraft] = useState("");
  const [savingRenewal, setSavingRenewal] = useState(false);
  useEffect(() => {
    setOnboardingDraft(placement?.onboarding_status || "pending");
    setRenewalStatusDraft(placement?.renewal_status || "");
    setRenewalDateDraft(placement?.renewal_date ? placement.renewal_date.slice(0, 10) : "");
  }, [placement?.onboarding_status, placement?.renewal_status, placement?.renewal_date]);

  const handleOnboardingChange = async (status: OnboardingStatus) => {
    if (!placement) return;
    setOnboardingDraft(status);
    const result = await updateOnboardingStatus(placement.id, status);
    if (result) refresh();
  };

  const handleSaveRenewal = async () => {
    if (!placement) return;
    setSavingRenewal(true);
    try {
      await placementService.updatePlacement(placement.id, {
        renewal_status: renewalStatusDraft || undefined,
        renewal_date: renewalDateDraft || undefined,
      });
      toast({ title: "Renewal details saved" });
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save renewal details",
        variant: "destructive",
      });
    } finally {
      setSavingRenewal(false);
    }
  };

  // ── Tasks (scoped to this placement's submission) ──────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [teamOptions, setTeamOptions] = useState<TeamMember[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [todoFilter, setTodoFilter] = useState<"all" | "pending" | "completed" | TaskPriority>("all");

  const formatTeamMemberName = (member: TeamMember) => {
    const name = [member.recruiterProfile?.first_name, member.recruiterProfile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || member.email;
  };

  const filteredTasks = tasks.filter((task) => {
    if (todoFilter === "all") return true;
    if (todoFilter === "pending") return task.status !== "completed";
    if (todoFilter === "completed") return task.status === "completed";
    return task.priority === todoFilter;
  });

  const fetchTasks = useCallback(async () => {
    if (!placement?.submission_id) return;
    setTasksLoading(true);
    try {
      const res = await recruiterService.getTasks({ submission_id: placement.submission_id, limit: 100 });
      setTasks(res.data.tasks || []);
    } catch {
      // empty state handles failures gracefully
    } finally {
      setTasksLoading(false);
    }
  }, [placement?.submission_id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    recruiterService.getTeamMembers().then(setTeamOptions).catch(() => {});
  }, []);

  const handleAddTask = async () => {
    if (!placement?.submission_id || !newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await recruiterService.createTask({
        title: newTaskTitle.trim(),
        submission_id: placement.submission_id,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        assigned_to: newTaskAssignee || undefined,
      });
      toast({ title: "Task added" });
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskPriority("medium");
      setNewTaskAssignee("");
      setShowAddTask(false);
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
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await recruiterService.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {placement?.placement_id || "Placement Details"}
            </h1>
            {placement && (
              <p className="text-sm text-gray-500">
                {placement.job?.title || "Job"} · {placement.job?.company_name || ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {placement && (
            <Badge className={`${statusColor} capitalize`}>
              {placementService.getStatusLabel(placement.status)}
            </Badge>
          )}
          {placement?.submission?.ai_score != null && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Match {placement.submission.ai_score}%
            </Badge>
          )}
          {placement?.commission_percentage != null && (
            <Badge className="bg-teal-100 text-teal-800 border-teal-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              Margin {placement.commission_percentage}%
            </Badge>
          )}
          {placement && (
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {placement && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 bg-gradient-to-br from-green-50 to-white shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Salary / Gross Value</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(placement.salary, placement.salary_currency)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-white shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Commission</p>
              <p className="text-lg font-bold text-purple-700">
                {placement.commission_amount != null ? formatCurrency(placement.commission_amount) : "—"}
              </p>
            </CardContent>
          </Card>
          {placement.placement_type !== "permanent" ? (
            <>
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Bill Rate</p>
                  <p className="text-lg font-bold text-blue-700">
                    {placement.job?.bill_rate_min != null ? `${formatCurrency(placement.job.bill_rate_min)}/hr` : "—"}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-orange-50 to-white shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Pay Rate</p>
                  <p className="text-lg font-bold text-orange-700">
                    {placement.billing_rate != null ? `${formatCurrency(placement.billing_rate)}/hr` : "—"}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Onboarding</p>
                  <p className="text-lg font-bold text-blue-700 capitalize">{placement.onboarding_status?.replace(/_/g, " ")}</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-orange-50 to-white shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Performance</p>
                  <p className="text-lg font-bold text-orange-700">
                    {placement.performance_rating != null ? `${placement.performance_rating} / 5` : "—"}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {loading && <div className="text-gray-500 py-8 text-center">Loading placement…</div>}
      {error && (
        <div className="flex items-center gap-2 text-red-600 py-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {!loading && !error && !placement && (
        <div className="text-gray-500 py-8 text-center">Placement not found.</div>
      )}

      {placement && (
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap h-auto bg-white shadow-lg rounded-xl p-1 gap-1">
            <TabsTrigger value="overview" className={tabTriggerClass}>
              <Globe className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submission" className={tabTriggerClass}>
              <Send className="w-4 h-4 mr-2" />
              Submission
            </TabsTrigger>
            <TabsTrigger value="comments" className={tabTriggerClass}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="notes-tasks" className={tabTriggerClass}>
              <StickyNote className="w-4 h-4 mr-2" />
              Notes & Tasks
            </TabsTrigger>
            <TabsTrigger value="evaluation" className={tabTriggerClass}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="documents" className={tabTriggerClass}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="profitability" className={tabTriggerClass}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Profitability
            </TabsTrigger>
            <TabsTrigger value="onboarding" className={tabTriggerClass}>
              <UserCheck className="w-4 h-4 mr-2" />
              Onboarding
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Candidate card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" /> Candidate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(placement.candidate?.first_name?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{candidateName}</p>
                      {placement.candidate?.candidate_id && (
                        <p className="text-xs text-gray-400 font-mono">{placement.candidate.candidate_id}</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {placement.candidate?.user?.email && (
                      <InfoRow icon={Mail} label="Email" value={placement.candidate.user.email} />
                    )}
                    {placement.candidate?.phone && (
                      <InfoRow icon={Phone} label="Phone" value={placement.candidate.phone} />
                    )}
                    {placement.candidate?.location && (
                      <InfoRow icon={MapPin} label="Location" value={placement.candidate.location} />
                    )}
                    {placement.candidate?.experience_years != null && (
                      <InfoRow icon={TrendingUp} label="Experience" value={`${placement.candidate.experience_years} years`} />
                    )}
                    {placement.candidate?.skills && placement.candidate.skills.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {placement.candidate.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      {placement.candidate?.linkedin_url && (
                        <a
                          href={placement.candidate.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                        </a>
                      )}
                      {placement.candidate?.portfolio_url && (
                        <a
                          href={placement.candidate.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Link2 className="h-3.5 w-3.5" /> Portfolio
                        </a>
                      )}
                      {placement.candidate?.resume_url && (
                        <a
                          href={placement.candidate.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" /> Resume
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-500" /> Job
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900">{placement.job?.title || "—"}</p>
                    <p className="text-sm text-gray-500">{placement.job?.company_name || ""}</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <InfoRow icon={FileText} label="Job ID" value={placement.job?.job_id || placement.job?.id} />
                    {placement.job?.location && (
                      <InfoRow icon={MapPin} label="Location" value={placement.job.location} />
                    )}
                    {placement.job?.job_type && (
                      <InfoRow icon={Layers} label="Job Type" value={placement.job.job_type.replace(/_/g, " ")} />
                    )}
                    {(placement.job?.bill_rate_min != null || placement.job?.bill_rate_max != null) && (
                      <InfoRow
                        icon={DollarSign}
                        label="Bill Rate"
                        value={`${formatCurrency(placement.job.bill_rate_min)} - ${formatCurrency(placement.job.bill_rate_max)}/hr`}
                      />
                    )}
                    {placement.job?.client?.name && (
                      <InfoRow icon={Building} label="Client" value={placement.job.client.name} />
                    )}
                    {placement.job?.clientContact?.name && (
                      <InfoRow
                        icon={User}
                        label="Client Contact"
                        value={`${placement.job.clientContact.name}${placement.job.clientContact.title ? ` · ${placement.job.clientContact.title}` : ""}`}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Placement terms card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" /> Placement Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow icon={DollarSign} label="Salary / Rate" value={formatCurrency(placement.salary, placement.salary_currency)} />
                  {placement.billing_rate != null && (
                    <InfoRow icon={DollarSign} label="Billing Rate" value={formatCurrency(placement.billing_rate, placement.salary_currency) + "/hr"} />
                  )}
                  {placement.commission_amount != null && (
                    <InfoRow icon={TrendingUp} label="Commission" value={formatCurrency(placement.commission_amount)} />
                  )}
                  {placement.commission_percentage != null && (
                    <InfoRow icon={TrendingUp} label="Commission %" value={`${placement.commission_percentage}%`} />
                  )}
                  <InfoRow icon={CalendarIcon} label="Start Date" value={formatDate(placement.start_date as any)} />
                  {placement.end_date && (
                    <InfoRow icon={CalendarIcon} label="End Date" value={formatDate(placement.end_date as any)} />
                  )}
                  <InfoRow icon={MapPin} label="Location" value={placement.location} />
                  <InfoRow icon={Layers} label="Work Arrangement" value={placement.work_arrangement?.replace(/_/g, " ")} />
                  <InfoRow icon={Layers} label="Placement Type" value={placement.placement_type?.replace(/_/g, " ")} />
                </CardContent>
              </Card>

              {/* Meta / Recruiter card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-orange-500" /> Details & Recruiter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow icon={FileText} label="Placement ID" value={placement.placement_id} />
                  <InfoRow
                    icon={CheckCircle}
                    label="Status"
                    value={
                      <Badge className={`${statusColor} capitalize text-xs`}>
                        {placementService.getStatusLabel(placement.status)}
                      </Badge>
                    }
                  />
                  <InfoRow
                    icon={CheckCircle}
                    label="Onboarding"
                    value={placement.onboarding_status?.replace(/_/g, " ")}
                  />
                  {placement.department && (
                    <InfoRow icon={Building} label="Department" value={placement.department} />
                  )}
                  {placement.reporting_manager && (
                    <InfoRow icon={User} label="Reporting Manager" value={placement.reporting_manager} />
                  )}
                  <InfoRow icon={UserCheck} label="Recruiter" value={recruiterName} />
                  {placement.recruiter?.email && recruiterName !== placement.recruiter.email && (
                    <InfoRow icon={Mail} label="Recruiter Email" value={placement.recruiter.email} />
                  )}
                  {placement.performance_rating != null && (
                    <InfoRow icon={Star} label="Performance Rating" value={`${placement.performance_rating} / 5`} />
                  )}
                  <InfoRow icon={Clock} label="Created" value={formatDate(placement.created_at)} />
                </CardContent>
              </Card>

              {/* Vendor / Supplier card */}
              {placement.vendor && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="h-4 w-4 text-cyan-500" /> Vendor / Supplier
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow icon={Mail} label="Vendor Email" value={placement.vendor.email} />
                    <InfoRow icon={FileText} label="Vendor ID" value={placement.vendor_id} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contract Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-green-500" /> Contract Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {placement.end_date ? (
                  (() => {
                    const start = new Date(placement.start_date as any).getTime();
                    const end = new Date(placement.end_date as any).getTime();
                    const now = Date.now();
                    const pct = end > start ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)) : 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatDate(placement.start_date as any)}</span>
                          <span>{formatDate(placement.end_date as any)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-500">{pct.toFixed(0)}% elapsed</p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-500">
                    Ongoing since {formatDate(placement.start_date as any)} — no end date set.
                  </p>
                )}
              </CardContent>
            </Card>

            {placement.termination_reason && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Termination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{placement.termination_reason}</p>
                  {placement.termination_date && (
                    <p className="text-xs text-gray-500 mt-2">Terminated on {formatDate(placement.termination_date)}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submission */}
          <TabsContent value="submission" className="mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-500" /> Linked Submission
                </CardTitle>
                {placement.submission_id && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/submissions/${placement.submission_id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Submission
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {placement.submission ? (
                  <>
                    {placement.submission.submission_id && (
                      <InfoRow icon={FileText} label="Submission ID" value={placement.submission.submission_id} />
                    )}
                    <InfoRow
                      icon={CheckCircle}
                      label="Status"
                      value={
                        <Badge variant="outline" className="text-xs capitalize">
                          {placement.submission.status?.replace(/_/g, " ")}
                        </Badge>
                      }
                    />
                    <InfoRow icon={CalendarIcon} label="Submitted" value={formatDate(placement.submission.submitted_at)} />
                    {placement.submission.ai_score != null && (
                      <InfoRow icon={TrendingUp} label="AI Match Score" value={`${placement.submission.ai_score}%`} />
                    )}
                    {placement.submission.ai_reasoning && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">AI Reasoning</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{placement.submission.ai_reasoning}</p>
                      </div>
                    )}
                    {placement.submission.notes && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Submission Notes</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{placement.submission.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No linked submission data available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments (internal, flat notes field) */}
          <TabsContent value="comments" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-orange-500" /> Internal Comments
                </CardTitle>
                <p className="text-sm text-gray-500">Internal notes about this placement — not visible to the candidate.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={commentsDraft}
                  onChange={(e) => setCommentsDraft(e.target.value)}
                  placeholder="Add internal comments about this placement..."
                  className="min-h-[140px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveComments} disabled={savingComments}>
                    {savingComments ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {savingComments ? "Saving..." : "Save Comments"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes & Tasks */}
          <TabsContent value="notes-tasks" className="mt-4 space-y-6">
            <NotesPanel
              title="Placement Notes"
              description="Structured notes and feedback about this placement"
              notes={placement.notes_history || []}
              onAdd={async (data) => {
                await placementService.addPlacementNote(placement.id, data);
                refresh();
              }}
              onUpdate={async (noteId, data) => {
                await placementService.updatePlacementNote(placement.id, noteId, data);
                refresh();
              }}
              onDelete={async (noteId) => {
                await placementService.deletePlacementNote(placement.id, noteId);
                refresh();
              }}
            />

            <Card>
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={todoFilter} onValueChange={(v) => setTodoFilter(v as typeof todoFilter)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={!placement.submission_id}>
                          <Plus className="h-4 w-4 mr-2" />
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
                            <Input
                              type="date"
                              value={newTaskDueDate}
                              onChange={(e) => setNewTaskDueDate(e.target.value)}
                            />
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
                          </div>
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
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddTask(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddTask} disabled={!newTaskTitle.trim() || savingTask}>
                            {savingTask ? "Adding..." : "Add Task"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t text-sm">
                  <span className="text-blue-600">Total: {tasks.length}</span>
                  <span className="text-green-600">Completed: {tasks.filter((t) => t.status === "completed").length}</span>
                  <span className="text-orange-600">Pending: {tasks.filter((t) => t.status !== "completed").length}</span>
                </div>
              </CardHeader>
              <CardContent>
                {!placement.submission_id ? (
                  <p className="text-center text-gray-500 py-8">No linked submission to scope tasks to.</p>
                ) : tasksLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {tasks.length === 0 ? "No tasks for this placement yet." : "No tasks match the selected filter."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((todo) => (
                      <div key={todo.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <Checkbox
                              checked={todo.status === "completed"}
                              onCheckedChange={() => handleToggleTask(todo)}
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
                                <span>Due: {todo.due_date ? formatDateOnly(todo.due_date) : "—"}</span>
                                {todo.assignee && <span>Assigned to: {formatTeamMemberName(todo.assignee)}</span>}
                              </div>
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                                  <CalendarIcon className="w-4 h-4" />
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

          {/* Evaluation */}
          <TabsContent value="evaluation" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-purple-500" /> Performance Evaluation
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {placement.updated_at ? `Last updated ${formatDate(placement.updated_at)}` : "No evaluation recorded yet."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Rating</Label>
                  <StarRatingInput value={ratingDraft} onChange={setRatingDraft} />
                </div>
                <div>
                  <Label className="mb-2 block">Performance Notes</Label>
                  <Textarea
                    value={performanceNotesDraft}
                    onChange={(e) => setPerformanceNotesDraft(e.target.value)}
                    placeholder="How is the candidate performing in this placement?"
                    className="min-h-[140px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveEvaluation} disabled={savingEvaluation}>
                    {savingEvaluation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {savingEvaluation ? "Saving..." : "Save Evaluation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-4">
            <DocumentsPanel
              title="Placement Documents"
              documents={placement.attachments || []}
              onUpload={async (data) => {
                await placementService.addPlacementAttachment(placement.id, data);
                refresh();
              }}
            />
          </TabsContent>

          {/* Profitability */}
          <TabsContent value="profitability" className="mt-4">
            {placement.job_id ? (
              <JobProfitabilityPanel jobId={placement.job_id} />
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-gray-500">No linked job to analyze profitability for.</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onboarding */}
          <TabsContent value="onboarding" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" /> Onboarding Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Select value={onboardingDraft} onValueChange={(v) => handleOnboardingChange(v as OnboardingStatus)} disabled={saving}>
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={`${placementService.getOnboardingStatusColor(onboardingDraft)} capitalize`}>
                    {placementService.getOnboardingStatusLabel(onboardingDraft)}
                  </Badge>
                </div>
                {placement.onboarding_completed_at && (
                  <p className="text-sm text-gray-500">Completed on {formatDate(placement.onboarding_completed_at)}</p>
                )}
              </CardContent>
            </Card>

            {placement.placement_type !== "permanent" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-500" /> Renewal
                  </CardTitle>
                  <p className="text-sm text-gray-500">Tracks whether this contract placement will be renewed.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1 block">Renewal Status</Label>
                      <Select value={renewalStatusDraft} onValueChange={(v) => setRenewalStatusDraft(v as RenewalStatus)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Not set" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="renewed">Renewed</SelectItem>
                          <SelectItem value="not_renewed">Not Renewed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1 block">Renewal Date</Label>
                      <Input type="date" value={renewalDateDraft} onChange={(e) => setRenewalDateDraft(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveRenewal} disabled={savingRenewal}>
                      {savingRenewal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {savingRenewal ? "Saving..." : "Save Renewal Details"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Placement Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Placement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block">Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as UpdatePlacementRequest["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Salary / Rate</Label>
              <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">End Date</Label>
              <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlacementDetail;
