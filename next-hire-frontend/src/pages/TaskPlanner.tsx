import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  recruiterService,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
} from "@/services/recruiterService";
import { MAX_PAGE_SIZE } from "@/lib/constants";
import { PageLoadingState } from "@/components/PageLoadingState";
import { EmptyState } from "@/components/EmptyState";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  UserPlus,
  Trash2,
  ListTodo,
  Briefcase,
  FileText,
  Building2,
} from "lucide-react";

const formatTeamMemberName = (member?: TeamMember) => {
  if (!member) return "Unassigned";
  const name = [member.recruiterProfile?.first_name, member.recruiterProfile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || member.email;
};

// Where a task came from - every task is either tied to a job, a submission
// (interview/placement ToDo tabs both create submission-scoped tasks), a
// business partner, or nothing ("General", created from this page).
const taskContext = (task: Task): { label: string; icon: typeof Briefcase; path?: string } => {
  if (task.job) return { label: task.job.title, icon: Briefcase, path: `/dashboard/jobs/${task.job_id}` };
  if (task.submission_id) return { label: "Submission", icon: FileText, path: `/dashboard/submissions/${task.submission_id}` };
  if (task.businessPartner) return { label: task.businessPartner.name, icon: Building2, path: `/dashboard/business-partners/${task.business_partner_id}` };
  return { label: "General", icon: ListTodo };
};

const TaskPlanner = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamOptions, setTeamOptions] = useState<TeamMember[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sort, setSort] = useState<"dueDate" | "priority" | "assignee">("dueDate");

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPlannedCompletionDate, setNewTaskPlannedCompletionDate] = useState("");
  const [newTaskComments, setNewTaskComments] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const [rescheduleData, setRescheduleData] = useState<{ taskId: string | null; newDate?: Date }>({ taskId: null });
  const [reassignData, setReassignData] = useState<{ taskId: string | null; newAssignee: string }>({ taskId: null, newAssignee: "" });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruiterService.getTasks({ limit: MAX_PAGE_SIZE });
      setTasks((res as any)?.data?.tasks || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
    recruiterService.getTeamMembers().then(setTeamOptions).catch(() => {});
  }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await recruiterService.createTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        planned_completion_date: newTaskPlannedCompletionDate || undefined,
        description: newTaskComments || undefined,
        assigned_to: newTaskAssignee || undefined,
      });
      toast({ title: "Task added" });
      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      setNewTaskPlannedCompletionDate("");
      setNewTaskComments("");
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

  const handleSetStatus = async (task: Task, status: TaskStatus) => {
    try {
      await recruiterService.updateTask(task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = (task: Task) =>
    handleSetStatus(task, task.status === "completed" ? "not_started" : "completed");

  const handleDelete = async (taskId: string) => {
    try {
      await recruiterService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast({ title: "Task deleted" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.taskId || !rescheduleData.newDate) return;
    try {
      await recruiterService.updateTask(rescheduleData.taskId, { due_date: rescheduleData.newDate.toISOString() });
      toast({ title: "Task rescheduled" });
      setRescheduleData({ taskId: null });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to reschedule task",
        variant: "destructive",
      });
    }
  };

  const handleReassign = async () => {
    if (!reassignData.taskId || !reassignData.newAssignee) return;
    try {
      await recruiterService.updateTask(reassignData.taskId, { assigned_to: reassignData.newAssignee });
      toast({ title: "Task reassigned" });
      setReassignData({ taskId: null, newAssignee: "" });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to reassign task",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        formatTeamMemberName(task.assignee).toLowerCase().includes(q);
      return matchesStatus && matchesPriority && matchesSearch;
    })
    .sort((a, b) => {
      switch (sort) {
        case "priority": {
          const order = { high: 3, medium: 2, low: 1 };
          return order[b.priority] - order[a.priority];
        }
        case "assignee":
          return formatTeamMemberName(a.assignee).localeCompare(formatTeamMemberName(b.assignee));
        default:
          return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime();
      }
    });

  const statusCounts = TASK_STATUS_OPTIONS.reduce(
    (acc, status) => ({ ...acc, [status]: tasks.filter((t) => t.status === status).length }),
    {} as Record<TaskStatus, number>
  );

  if (loading) {
    return <PageLoadingState label="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Planner</h1>
          <p className="text-sm text-gray-500">
            Every ToDo across Jobs, Submissions, and Business Partners, plus general tasks, in one place.
          </p>
        </div>
        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
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
              <Textarea
                placeholder="Comments (optional)"
                value={newTaskComments}
                onChange={(e) => setNewTaskComments(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim() || savingTask}>
                {savingTask ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
        {TASK_STATUS_OPTIONS.map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-gray-900">{statusCounts[status]}</p>
              <p className="text-sm text-gray-500">{TASK_STATUS_LABELS[status]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {TASK_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="assignee">Sort by Assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title={tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
              description={
                tasks.length === 0
                  ? "Tasks created here or from any Job, Submission, or Business Partner ToDo tab will show up in this list."
                  : "Try adjusting your search or filters."
              }
            />
          ) : (
            filteredTasks.map((task) => {
              const context = taskContext(task);
              const ContextIcon = context.icon;
              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <h4
                          className={`font-semibold truncate ${
                            task.status === "completed" ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap mt-1">
                          <span>Due: {task.due_date ? format(new Date(task.due_date), "PPP") : "—"}</span>
                          {task.planned_completion_date && (
                            <span>Planned: {format(new Date(task.planned_completion_date), "PPP")}</span>
                          )}
                          <span>Assigned to: {formatTeamMemberName(task.assignee)}</span>
                          <button
                            onClick={() => context.path && navigate(context.path)}
                            disabled={!context.path}
                            className={`flex items-center gap-1 ${context.path ? "text-blue-600 hover:underline" : "text-gray-400"}`}
                          >
                            <ContextIcon className="w-3.5 h-3.5" />
                            {context.label}
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        className={
                          task.priority === "high"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }
                      >
                        {task.priority}
                      </Badge>
                      <Select value={task.status} onValueChange={(v) => handleSetStatus(task, v as TaskStatus)}>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRescheduleData({ taskId: task.id, newDate: undefined })}
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={rescheduleData.taskId === task.id ? rescheduleData.newDate : undefined}
                            onSelect={(date) => {
                              setRescheduleData({ taskId: task.id, newDate: date });
                              if (date) {
                                recruiterService
                                  .updateTask(task.id, { due_date: date.toISOString() })
                                  .then(() => {
                                    toast({ title: "Task rescheduled" });
                                    fetchTasks();
                                  })
                                  .catch((err: any) =>
                                    toast({
                                      title: "Error",
                                      description: err?.response?.data?.message || "Failed to reschedule task",
                                      variant: "destructive",
                                    })
                                  );
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Dialog
                        open={reassignData.taskId === task.id}
                        onOpenChange={(open) => setReassignData(open ? { taskId: task.id, newAssignee: "" } : { taskId: null, newAssignee: "" })}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reassign Task</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">Reassign: {task.title}</p>
                            <Select
                              value={reassignData.newAssignee}
                              onValueChange={(value) => setReassignData({ taskId: task.id, newAssignee: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select new assignee..." />
                              </SelectTrigger>
                              <SelectContent>
                                {teamOptions.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {formatTeamMemberName(member)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={handleReassign} disabled={!reassignData.newAssignee} className="w-full">
                              Reassign
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskPlanner;
