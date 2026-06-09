import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Mail,
  Bot,
  RotateCcw,
  Star,
  TrendingUp,
  PlusCircle,
  Send,
  RefreshCw,
  Trash,
  Zap,
  ListChecks,
  FileSpreadsheet,
  Video,
  Phone,
  MessageSquare,
  Search,
  RotateCw,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import usersData from "@/data/users.json";

const Interviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("interviews");
  
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

  // Mock interview data
  const interviewsByJob = {
    "JOB-2024-001-TechCorp": {
      jobId: "JOB-2024-001",
      jobTitle: "Senior React Developer",
      company: "TechCorp Inc",
      interviews: [
        {
          id: "INT-2024-001",
          candidateName: "Sarah Johnson",
          interviewType: "Technical Round",
          date: "2024-01-25",
          time: "2:00 PM",
          status: "Scheduled",
          skillMatch: 92,
          panel: ["John Smith", "David Wilson"],
          medium: "Video Call"
        },
        {
          id: "INT-2024-002", 
          candidateName: "Mike Chen",
          interviewType: "HR Interview",
          date: "2024-01-26",
          time: "10:00 AM",
          status: "Completed",
          skillMatch: 88,
          panel: ["Lisa Chen"],
          medium: "In Person"
        }
      ]
    },
    "JOB-2024-002-InnovateLabs": {
      jobId: "JOB-2024-002",
      jobTitle: "Full Stack Engineer",
      company: "InnovateLabs",
      interviews: [
        {
          id: "INT-2024-003",
          candidateName: "Emily Rodriguez",
          interviewType: "Final Round",
          date: "2024-01-27",
          time: "3:00 PM", 
          status: "Scheduled",
          skillMatch: 95,
          panel: ["Alex Johnson", "Maria Garcia"],
          medium: "Video Call"
        }
      ]
    }
  };

  const stages = [
    { id: "scheduled", name: "Scheduled", color: "bg-blue-100 text-blue-800" },
    { id: "in-progress", name: "In Progress", color: "bg-yellow-100 text-yellow-800" },
    { id: "completed", name: "Completed", color: "bg-green-100 text-green-800" },
    { id: "cancelled", name: "Cancelled", color: "bg-red-100 text-red-800" },
  ];

  const getStageForStatus = (status: string) => {
    switch (status) {
      case "Scheduled": return "scheduled";
      case "In Progress": return "in-progress";
      case "Completed": return "completed";
      case "Cancelled": return "cancelled";
      default: return "scheduled";
    }
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

  const allInterviews = Object.values(interviewsByJob).flatMap(job => job.interviews);
  const totalInterviews = allInterviews.length;
  const totalJobs = Object.keys(interviewsByJob).length;
  const scheduledInterviews = allInterviews.filter(i => i.status === "Scheduled").length;
  const completedInterviews = allInterviews.filter(i => i.status === "Completed").length;

  const navigationCards = [
    {
      title: "Total Interviews",
      value: totalInterviews.toString(),
      icon: Users,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
    },
    {
      title: "Active Jobs",
      value: totalJobs.toString(),
      icon: Briefcase,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
    },
    {
      title: "Scheduled",
      value: scheduledInterviews.toString(),
      icon: Clock,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
    },
    {
      title: "Completed",
      value: completedInterviews.toString(),
      icon: CheckCircle,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
    },
  ];

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">Interviews</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300">
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <PlusCircle className="w-4 h-4 mr-2" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Scheduler
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 hover:scale-105">
            <Plus className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Schedule Interview</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
        {navigationCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title} 
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
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
                                  <Badge className={`text-xs ${interview.status === 'Completed' ? 'bg-green-100 text-green-800' : interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {interview.status}
                                  </Badge>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors duration-200"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           navigate(`/dashboard/interviews/${interview.id}`);
                                         }}>
                                       {interview.candidateName}
                                     </h4>
                                    <Badge variant="outline" className="text-xs">{interview.interviewType}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {interview.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {interview.time}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {interview.medium === 'Video Call' ? <Video className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                                      {interview.medium}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-500">Panel:</span>
                                    {interview.panel.map((panelist: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {panelist}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs text-gray-500">Skill Match</span>
                                  </div>
                                  <p className={`text-lg font-bold ${getScoreColor(interview.skillMatch)}`}>
                                    {interview.skillMatch}%
                                  </p>
                                </div>
                                
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
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Interview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="w-4 h-4 mr-2" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Cancel Interview
                                    </DropdownMenuItem>
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
    </div>
  );
};

export default Interviews;