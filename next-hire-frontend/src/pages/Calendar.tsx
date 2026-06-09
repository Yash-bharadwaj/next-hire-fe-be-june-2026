import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  RotateCcw,
  Settings,
  CalendarClock,
  Filter,
  Search,
  User,
  FileText,
  Phone,
  Building,
  Briefcase,
  Target,
  PlayCircle,
  PauseCircle,
  XCircle,
  ArrowRight,
  Zap,
  CalendarDays,
  SkipForward,
  TrendingUp,
  Brain,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import tasksData from "@/data/tasks.json";

const Calendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tasks } = tasksData;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isMassActionOpen, setIsMassActionOpen] = useState(false);
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [selectedTaskForReschedule, setSelectedTaskForReschedule] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    category: "",
    estimatedTime: ""
  });

  // Statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => task.status === "Pending").length;
  const inProgressTasks = tasks.filter(task => task.status === "In Progress").length;
  const completedTasks = tasks.filter(task => task.status === "Completed").length;
  const overdueTasks = tasks.filter(task => task.status === "Overdue").length;
  const myTasks = tasks.filter(task => task.assignedTo === "Mike Johnson").length;

  const handleAddTask = () => {
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Task created successfully"
    });
    
    setIsAddDialogOpen(false);
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      priority: "Medium",
      status: "Pending", 
      dueDate: "",
      category: "",
      estimatedTime: ""
    });
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      category: task.category,
      estimatedTime: task.estimatedTime
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Task updated successfully"
    });
    
    setIsEditDialogOpen(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      priority: "Medium",
      status: "Pending",
      dueDate: "",
      category: "",
      estimatedTime: ""
    });
  };

  const handleDeleteTask = (task: any) => {
    toast({
      title: "Success",
      description: `Task "${task.title}" deleted successfully`
    });
  };

  const handleMassReassign = () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "Error",
        description: "Please select tasks to reassign",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: `${selectedTasks.length} tasks reassigned successfully`
    });
    
    setSelectedTasks([]);
    setIsMassActionOpen(false);
  };

  const handleAutoSchedule = () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "Error",
        description: "Please select tasks to auto-schedule",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: `${selectedTasks.length} tasks auto-scheduled successfully`
    });
    
    setSelectedTasks([]);
    setIsMassActionOpen(false);
  };

  const handleFilterByMyTasks = () => {
    setActiveFilters({
      assignedTo: ["Mike Johnson"]
    });
  };

  const handleFilterByPending = () => {
    setActiveFilters({
      status: ["Pending"]
    });
  };

  const handleFilterByInProgress = () => {
    setActiveFilters({
      status: ["In Progress"]
    });
  };

  const handleFilterByOverdue = () => {
    setActiveFilters({
      status: ["Overdue"]
    });
  };

  const handleFilterByCompleted = () => {
    setActiveFilters({
      status: ["Completed"]
    });
  };

  // AI-like features handlers
  const handlePostponeToTomorrow = (task: any) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    toast({
      title: "Task Postponed",
      description: `"${task.title}" postponed to tomorrow (${new Date(tomorrowString).toLocaleDateString()})`
    });
  };

  const handleRescheduleTask = (task: any) => {
    setSelectedTaskForReschedule(task);
    setIsCalendarPickerOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && selectedTaskForReschedule) {
      const dateString = date.toISOString().split('T')[0];
      toast({
        title: "Task Rescheduled",
        description: `"${selectedTaskForReschedule.title}" rescheduled to ${date.toLocaleDateString()}`
      });
      setIsCalendarPickerOpen(false);
      setSelectedTaskForReschedule(null);
      setSelectedDate(undefined);
    }
  };

  const handleSmartSuggestion = (task: any, action: string) => {
    switch (action) {
      case 'priority':
        toast({
          title: "AI Suggestion",
          description: `Based on due date and workload, this task should be High priority`
        });
        break;
      case 'reassign':
        toast({
          title: "AI Suggestion",
          description: `Consider reassigning to Sarah Johnson - she has availability for ${task.category} tasks`
        });
        break;
      case 'break-down':
        toast({
          title: "AI Suggestion",
          description: `This task could be broken into 3 smaller tasks for better management`
        });
        break;
      default:
        break;
    }
  };

  const navigationCards = [
    {
      title: "My Tasks",
      value: myTasks.toString(),
      icon: User,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: handleFilterByMyTasks
    },
    {
      title: "Pending",
      value: pendingTasks.toString(),
      icon: Clock,
      color: "text-yellow-700",
      gradientOverlay: "bg-gradient-to-br from-yellow-400/30 via-yellow-500/20 to-yellow-600/30",
      onClick: handleFilterByPending
    },
    {
      title: "In Progress",
      value: inProgressTasks.toString(),
      icon: PlayCircle,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleFilterByInProgress
    },
    {
      title: "Completed",
      value: completedTasks.toString(),
      icon: CheckCircle,
      color: "text-emerald-700",
      gradientOverlay: "bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-emerald-600/30",
      onClick: handleFilterByCompleted
    },
    {
      title: "Overdue",
      value: overdueTasks.toString(),
      icon: AlertCircle,
      color: "text-red-700",
      gradientOverlay: "bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/30",
      onClick: handleFilterByOverdue
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'Recurring': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Interview': return Phone;
      case 'Review': return FileText;
      case 'Job Posting': return Briefcase;
      case 'Screening': return Phone;
      case 'Administration': return Settings;
      case 'Client Meeting': return Building;
      case 'Reference Check': return UserCheck;
      case 'Onboarding': return Users;
      case 'Assessment': return Target;
      case 'Meeting': return Users;
      default: return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (value: any, row: any) => (
        <Checkbox
          checked={selectedTasks.includes(row.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedTasks([...selectedTasks, row.id]);
            } else {
              setSelectedTasks(selectedTasks.filter(id => id !== row.id));
            }
          }}
        />
      )
    },
    {
      field: 'title',
      headerName: 'Task',
      width: 300,
      renderCell: (value: string, row: any) => {
        const CategoryIcon = getCategoryIcon(row.category);
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gray-100">
              <CategoryIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 font-poppins text-sm">{value}</span>
              <span className="text-gray-500 font-poppins text-xs truncate max-w-64">{row.description}</span>
            </div>
          </div>
        );
      }
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 140,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{value}</span>
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (value: string) => (
        <Badge className={`${getPriorityColor(value)} border font-medium font-poppins text-xs`}>{value}</Badge>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (value: string) => (
        <Badge className={`${getStatusColor(value)} border font-medium font-poppins text-xs`}>{value}</Badge>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{value}</span>
      )
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 110,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{formatDate(value)}</span>
      )
    },
    {
      field: 'estimatedTime',
      headerName: 'Est. Time',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-600 font-poppins text-sm">{value}</span>
      )
    },
    {
      field: 'quickActions',
      headerName: 'Quick Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (value: any, row: any) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => handlePostponeToTomorrow(row)}
                >
                  <SkipForward className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Postpone to tomorrow</p>
              </TooltipContent>
            </Tooltip>

            <Popover open={isCalendarPickerOpen && selectedTaskForReschedule?.id === row.id} onOpenChange={setIsCalendarPickerOpen}>
              <PopoverTrigger asChild>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleRescheduleTask(row)}
                      >
                        <CalendarDays className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reschedule task</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
                      >
                        <Brain className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI Suggestions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200">
                <DropdownMenuItem onClick={() => handleSmartSuggestion(row, 'priority')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Suggest Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSmartSuggestion(row, 'reassign')}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Suggest Reassign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSmartSuggestion(row, 'break-down')}>
                  <Target className="w-4 h-4 mr-2" />
                  Break Down Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      )
    },
    {
      field: 'actions',
      headerName: 'More',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (value: any, row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-200">
            <DropdownMenuItem onClick={() => handleEditTask(row)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditTask(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(row)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">Task Management</h1>
          <p className="text-gray-600">All tasks assigned to you or your team</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* AI Smart Suggestions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 text-purple-600">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Smart Actions
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 w-56">
              <DropdownMenuItem onClick={() => toast({ title: "AI Analysis", description: "Analyzing task dependencies and suggesting optimal schedule..." })}>
                <Brain className="w-4 h-4 mr-2" />
                Optimize Schedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "AI Workload", description: "Analyzing team workload and suggesting task redistribution..." })}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Balance Workload
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "AI Priorities", description: "Re-prioritizing tasks based on deadlines and importance..." })}>
                <Zap className="w-4 h-4 mr-2" />
                Smart Prioritize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast({ title: "AI Insights", description: "Your team is 15% more productive with morning task assignments!" })}>
                <Eye className="w-4 h-4 mr-2" />
                View Insights
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedTasks.length > 0 && (
            <DropdownMenu open={isMassActionOpen} onOpenChange={setIsMassActionOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Mass Actions ({selectedTasks.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200">
                <DropdownMenuItem onClick={handleMassReassign}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Reassign Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAutoSchedule}>
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Auto Schedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Mark In Progress
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Completed
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Mark Pending
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Postpone All to Tomorrow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned-to">Assigned To *</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                        <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                        <SelectItem value="David Wilson">David Wilson</SelectItem>
                        <SelectItem value="Lisa Thompson">Lisa Thompson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="due-date">Due Date *</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Job Posting">Job Posting</SelectItem>
                        <SelectItem value="Screening">Screening</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Client Meeting">Client Meeting</SelectItem>
                        <SelectItem value="Reference Check">Reference Check</SelectItem>
                        <SelectItem value="Onboarding">Onboarding</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="estimated-time">Estimated Time</Label>
                    <Input
                      id="estimated-time"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="e.g., 30 minutes"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask} className="button-gradient text-white">
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title} 
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20"
              onClick={card.onClick}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardContent className="relative p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                    <IconComponent className={`h-3 w-3 ${card.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab truncate">{card.title}</p>
                    <p className="text-sm font-bold text-gray-900 font-roboto-slab">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-0">
            <div className="min-w-full">
              <DataGrid
                rows={tasks}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection={false}
                onRowClick={(row) => console.log('Row clicked:', row)}
                initialFilters={activeFilters}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Detail/Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {editingTask ? 'Task Details & Edit' : 'Task Details'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTask && (
            <div className="space-y-6">
              {/* Task Header Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      {React.createElement(getCategoryIcon(editingTask.category), { 
                        className: "w-5 h-5 text-blue-600" 
                      })}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Task ID: #{editingTask.id}</p>
                      <p className="text-sm text-gray-500">Created: {formatDate(editingTask.createdDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(editingTask.priority)} border font-medium`}>
                      {editingTask.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(editingTask.status)} border font-medium`}>
                      {editingTask.status}
                    </Badge>
                  </div>
                </div>
                
                {editingTask.tags && editingTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {editingTask.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-task-title">Task Title *</Label>
                  <Input
                    id="edit-task-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-task-description">Description</Label>
                  <Textarea
                    id="edit-task-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-assigned-to">Assigned To *</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                        <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                        <SelectItem value="David Wilson">David Wilson</SelectItem>
                        <SelectItem value="Lisa Thompson">Lisa Thompson</SelectItem>
                        <SelectItem value="Robert Garcia">Robert Garcia</SelectItem>
                        <SelectItem value="Amanda Rodriguez">Amanda Rodriguez</SelectItem>
                        <SelectItem value="Jessica Lee">Jessica Lee</SelectItem>
                        <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                        <SelectItem value="John Smith">John Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-due-date">Due Date *</Label>
                    <Input
                      id="edit-due-date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-estimated-time">Estimated Time</Label>
                    <Input
                      id="edit-estimated-time"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="e.g., 30 minutes"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                      <SelectItem value="Job Posting">Job Posting</SelectItem>
                      <SelectItem value="Screening">Screening</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Client Meeting">Client Meeting</SelectItem>
                      <SelectItem value="Reference Check">Reference Check</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Task Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Assigned By:</span>
                      <p className="font-medium">{editingTask.assignedBy}</p>
                    </div>
                    {editingTask.jobId && (
                      <div>
                        <span className="text-gray-500">Related Job ID:</span>
                        <p className="font-medium">#{editingTask.jobId}</p>
                      </div>
                    )}
                    {editingTask.candidateId && (
                      <div>
                        <span className="text-gray-500">Related Candidate ID:</span>
                        <p className="font-medium">#{editingTask.candidateId}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Created Date:</span>
                      <p className="font-medium">{formatDate(editingTask.createdDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeleteTask(editingTask)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTask} className="button-gradient text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Task
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;