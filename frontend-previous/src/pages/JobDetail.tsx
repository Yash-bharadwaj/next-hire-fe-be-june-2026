import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { KanbanColumn } from "@/components/KanbanColumn";
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
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DocumentsManager, Document } from "@/components/DocumentsManager";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import jobsData from "@/data/jobs.json";
import usersData from "@/data/users.json";
import rolesData from "@/data/roles.json";
import JobDetailPersonalizationSettings from "@/components/JobDetailPersonalizationSettings";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const job = jobsData.jobs.find(j => j.id === Number(id));
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
  const [editedJob, setEditedJob] = useState(job ? { ...job } : null);
  
  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchJobId, setSearchJobId] = useState("");

  // Profitability calculation state
  const [isRevenueOpen, setIsRevenueOpen] = useState(true);
  const [isDirectCostOpen, setIsDirectCostOpen] = useState(true);
  const [isOverheadsOpen, setIsOverheadsOpen] = useState(true);
  const [isOneTimeCostsOpen, setIsOneTimeCostsOpen] = useState(true);

  // Revenue data state
  const [revenueData, setRevenueData] = useState({
    billRate: { rate: 95, hours: 1920 },
    overTime: { rate: 125, hours: 160 },
    incentives: { rate: 0, hours: 0, amount: 10000 }
  });

  // Direct cost data state  
  const [directCostData, setDirectCostData] = useState({
    payRate: { rate: 70, hours: 1920 },
    otPayRate: { rate: 95, hours: 160 },
    discount: { amount: 2500 },
    vendorCommission: { amount: 2500 }
  });

  // Overheads data state
  const [overheadsData, setOverheadsData] = useState({
    recruiterCommission: 12000,
    employeeBenefits: 5000,
    perDiems: 4000,
    employerTaxes: 4000
  });

  // One time costs data state
  const [oneTimeCostsData, setOneTimeCostsData] = useState({
    placementFee: 15000,
    hardwareCosts: 5000,
    trainingCosts: 3000,
    setupCosts: 2000
  });

  // Calculate totals
  const calculateRevenue = () => {
    const billAmount = revenueData.billRate.rate * revenueData.billRate.hours;
    const otAmount = revenueData.overTime.rate * revenueData.overTime.hours;
    const incentiveAmount = revenueData.incentives.amount;
    return billAmount + otAmount + incentiveAmount;
  };

  const calculateDirectCosts = () => {
    const payAmount = directCostData.payRate.rate * directCostData.payRate.hours;
    const otPayAmount = directCostData.otPayRate.rate * directCostData.otPayRate.hours;
    const discountAmount = directCostData.discount.amount;
    const vendorCommissionAmount = directCostData.vendorCommission.amount;
    return payAmount + otPayAmount + discountAmount + vendorCommissionAmount;
  };

  const calculateOverheads = () => {
    return Object.values(overheadsData).reduce((sum, value) => sum + value, 0);
  };

  const calculateOneTimeCosts = () => {
    return Object.values(oneTimeCostsData).reduce((sum, value) => sum + value, 0);
  };

  const totalRevenue = calculateRevenue();
  const totalDirectCosts = calculateDirectCosts();
  const totalOverheads = calculateOverheads();
  const totalOneTimeCosts = calculateOneTimeCosts();
  const netMargin = totalRevenue - totalDirectCosts - totalOverheads - totalOneTimeCosts;

  // Handle edit mode changes
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditMode(true);
    }
  }, [searchParams]);

  const handleSave = () => {
    // Here you would save the editedJob data to your backend
    console.log('Saving job data:', editedJob);
    setIsEditMode(false);
    // Remove edit parameter from URL
    navigate(`/dashboard/jobs/${id}`, { replace: true });
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

  const currentJob = isEditMode ? editedJob : job;

  // Search functionality
  const handleSearchJob = () => {
    if (searchJobId.trim()) {
      const jobExists = jobsData.jobs.find(j => j.id === Number(searchJobId.trim()));
      if (jobExists) {
        navigate(`/dashboard/jobs/${searchJobId.trim()}`);
        setSearchJobId("");
        setIsSearchExpanded(false);
      } else {
        // Show error feedback - job not found
        console.log("Job not found");
      }
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchJob();
    }
  };

  const [candidates, setCandidates] = useState([
    { id: 1, name: "Sarah Johnson", stage: "sourced", email: "sarah.johnson@email.com", phone: "+1 (555) 123-4567", score: 85, experience: "6 years React", location: "San Francisco, CA", notes: "Strong portfolio, open to new opportunities", lastContact: "2 days ago" },
    { id: 2, name: "Alex Chen", stage: "sourced", email: "alex.chen@email.com", phone: "+1 (555) 234-5678", score: 92, experience: "8 years Full-stack", location: "Seattle, WA", notes: "Senior developer at tech startup", lastContact: "1 week ago" },
    { id: 3, name: "Maria Garcia", stage: "sourced", email: "maria.garcia@email.com", score: 78, experience: "4 years Frontend", location: "Austin, TX", notes: "Looking for remote opportunities" },
    { id: 4, name: "David Kim", stage: "screening", email: "david.kim@email.com", phone: "+1 (555) 345-6789", score: 88, experience: "7 years React/Node", location: "New York, NY", notes: "Passed initial phone screen", lastContact: "Yesterday" },
    { id: 5, name: "Emily Rodriguez", stage: "screening", email: "emily.r@email.com", score: 91, experience: "5 years Frontend", location: "Denver, CO", notes: "Excellent technical skills" },
    { id: 6, name: "Michael Brown", stage: "submitted", email: "m.brown@email.com", phone: "+1 (555) 456-7890", score: 83, experience: "6 years React", location: "Chicago, IL", notes: "Client reviewing resume", lastContact: "3 days ago" },
    { id: 7, name: "Lisa Wang", stage: "interview", email: "lisa.wang@email.com", score: 95, experience: "9 years Full-stack", location: "San Francisco, CA", notes: "Technical interview scheduled for Friday", lastContact: "Today" },
    { id: 8, name: "James Wilson", stage: "offer", email: "j.wilson@email.com", phone: "+1 (555) 567-8901", score: 89, experience: "7 years React/TypeScript", location: "Boston, MA", notes: "Offer extended, awaiting response", lastContact: "Today" }
  ]);

  // Job notes data and state
  const [jobNotes, setJobNotes] = useState([
    { 
      id: 1, 
      author: "Sarah Johnson", 
      date: "2024-01-20", 
      content: "Client meeting scheduled with hiring manager to discuss requirements and timeline. Need to prepare candidate profiles.", 
      category: "client", 
      priority: "high" 
    },
    { 
      id: 2, 
      author: "Mike Rodriguez", 
      date: "2024-01-18", 
      content: "Found 3 strong candidates with React expertise. Lisa Wang and James Wilson are top picks for this role.", 
      category: "planning", 
      priority: "medium" 
    },
    { 
      id: 3, 
      author: "Emma Davis", 
      date: "2024-01-15", 
      content: "Updated job requirements based on client feedback. Added TypeScript as a nice-to-have skill.", 
      category: "technical", 
      priority: "low" 
    }
  ]);

  // Notes filter and sort state
  const [notesFilter, setNotesFilter] = useState("all");
  const [notesSort, setNotesSort] = useState("newest");
  const [notesSearch, setNotesSearch] = useState("");

  // Filter and sort function for job notes
  const getFilteredAndSortedJobNotes = () => {
    let filtered = jobNotes.filter(note => {
      const matchesFilter = notesFilter === "all" || note.category === notesFilter;
      const matchesSearch = notesSearch === "" || 
        note.content.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.author.toLowerCase().includes(notesSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (notesSort) {
        case "newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "author": return a.author.localeCompare(b.author);
        case "priority": 
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default: return 0;
      }
    });
  };

  const kanbanColumns = [
    { id: "sourced", title: "New Candidates", color: "bg-gray-50" },
    { id: "screening", title: "Initial Scanning", color: "bg-blue-50" },
    { id: "submitted", title: "First Round", color: "bg-purple-50" },
    { id: "interview", title: "Technical Manager Round", color: "bg-yellow-50" },
    { id: "offer", title: "Final Round", color: "bg-green-50" },
  ];

  const handleAddCandidate = (stageId: string) => {
    console.log(`Adding candidate to ${stageId}`);
  };

  const handleMoveCandidate = (candidateId: number, newStage: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, stage: newStage }
          : candidate
      )
    );
  };

  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter(candidate => candidate.stage === stageId);
  };

  const getStageCount = (stageId: string) => {
    return getCandidatesByStage(stageId).length;
  };

  // Team management state
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      userId: 2,
      name: "Sarah Johnson",
      role: "Lead Recruiter",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 123-4567",
      initials: "SJ",
      color: "from-blue-500 to-blue-600",
      badge: "Owner",
      badgeColor: "from-green-500 to-green-600",
      status: "Active",
      statusColor: "border-blue-300 text-blue-700"
    },
    {
      id: 2,
      userId: 4,
      name: "Emily Davis",
      role: "Account Manager",
      email: "emily.davis@company.com",
      phone: "+1 (555) 234-5678",
      initials: "ED",
      color: "from-purple-500 to-purple-600",
      badge: "Collaborator",
      badgeColor: "border-purple-300 text-purple-700",
      status: "Active",
      statusColor: "border-green-300 text-green-700"
    },
    {
      id: 3,
      userId: 1,
      name: "John Smith",
      role: "Technical Interviewer",
      email: "john.smith@company.com",
      phone: "+1 (555) 345-6789",
      initials: "JS",
      color: "from-green-500 to-green-600",
      badge: "Reviewer",
      badgeColor: "border-green-300 text-green-700",
      status: "On-demand",
      statusColor: "border-yellow-300 text-yellow-700"
    }
  ]);

  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const handleAddEditMember = (member?: any) => {
    setEditingMember(member || null);
    setIsTeamDialogOpen(true);
  };

  const handleSaveTeamMember = (memberData: any) => {
    if (editingMember) {
      // Edit existing member
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === editingMember.id 
            ? { ...member, ...memberData }
            : member
        )
      );
    } else {
      // Add new member
      const newMember = {
        id: teamMembers.length + 1,
        ...memberData
      };
      setTeamMembers(prev => [...prev, newMember]);
    }
    setIsTeamDialogOpen(false);
    setEditingMember(null);
  };

  const handleRemoveTeamMember = (memberId: number) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  // Mock job documents with expiration tracking
  const [jobDocuments, setJobDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Job_Description_Final.pdf",
      type: "PDF",
      uploadDate: "2024-01-10T00:00:00Z",
      uploadedBy: "Sarah Johnson",
      size: "125 KB",
      validFrom: "2024-01-10T00:00:00Z",
      validTo: "2024-12-31T00:00:00Z",
      description: "Final approved job description"
    },
    {
      id: 2,
      name: "Client_Requirements.docx",
      type: "DOCX",
      uploadDate: "2024-01-08T00:00:00Z",
      uploadedBy: "Mike Chen",
      size: "89 KB",
      validFrom: "2024-01-08T00:00:00Z",
      validTo: "2024-06-30T00:00:00Z",
      description: "Detailed client requirements document"
    },
    {
      id: 3,
      name: "Contract_Template.pdf",
      type: "PDF",
      uploadDate: "2023-12-15T00:00:00Z",
      uploadedBy: "Legal Team",
      size: "234 KB",
      validFrom: "2023-12-15T00:00:00Z",
      validTo: "2024-02-15T00:00:00Z",
      description: "Standard employment contract template"
    }
  ]);

  const handleJobDocumentUpload = (newDocument: Omit<Document, 'id'>) => {
    const documentWithId = {
      ...newDocument,
      id: jobDocuments.length + 1
    };
    setJobDocuments(prev => [...prev, documentWithId]);
  };

  // Todo state
  const [todos, setTodos] = useState([
    { id: 1, title: "Follow up with James Wilson on offer response", dueDate: "Today", priority: "high", completed: false, assignee: "John Smith" },
    { id: 2, title: "Prepare interview questions for Lisa Wang", dueDate: "Tomorrow", priority: "medium", completed: false, assignee: "Sarah Johnson" },
    { id: 3, title: "Schedule vendor meeting for next week", dueDate: "Dec 30", priority: "low", completed: false, assignee: "Mike Davis" },
    { id: 4, title: "Post job description updates", dueDate: "Dec 20", priority: "high", completed: true, assignee: "Jane Wilson" }
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("medium");
  const [newTodoAssignee, setNewTodoAssignee] = useState("");
  const [todoSearch, setTodoSearch] = useState("");
  const [todoFilter, setTodoFilter] = useState("all");
  const [todoSort, setTodoSort] = useState("dueDate");
  const [rescheduleData, setRescheduleData] = useState<{todoId: number | null, newDate: Date | undefined}>({todoId: null, newDate: undefined});
  const [reassignData, setReassignData] = useState<{todoId: number | null, newAssignee: string}>({todoId: null, newAssignee: ""});
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Load personalization settings from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('jobDetailPersonalization');
    if (saved) {
      try {
        setPersonalizationSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse personalization settings:', error);
      }
    }
  }, []);

  // Listen for personalization settings event from TopNavbar
  useEffect(() => {
    const handleOpenPersonalization = () => {
      setIsPersonalizationOpen(true);
    };

    window.addEventListener('openPersonalizationSettings', handleOpenPersonalization);
    return () => window.removeEventListener('openPersonalizationSettings', handleOpenPersonalization);
  }, []);

  // Todo functions
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todoItem = {
        id: todos.length + 1,
        title: newTodo,
        dueDate: "Today",
        priority: newTodoPriority as "high" | "medium" | "low",
        completed: false,
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
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status":
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        case "newest":
          return b.id - a.id;
        default:
          return a.dueDate.localeCompare(b.dueDate);
      }
    });
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Calculate statistics
  const totalCandidates = candidates.length;
  const sourcingFunnelCandidates = candidates.filter(c => c.stage !== "offer" && c.stage !== "rejected").length;
  const hiredCandidates = 2; // Mock data
  const rejectedCandidates = 168; // Mock data

  if (!currentJob) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Job not found</h2>
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
              <div className={`flex items-center transition-all duration-300 ease-in-out ${
                isSearchExpanded ? 'w-64' : 'w-10'
              }`}>
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
                  <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
                    <DropdownMenuItem 
                      onClick={() => setIsEditMode(true)}
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
                      onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                      className="text-2xl font-bold border-2 border-blue-300 focus:border-blue-500"
                      placeholder="Job Title"
                    />
                    <Input
                      value={currentJob.customer}
                      onChange={(e) => handleFieldChange('customer', e.target.value)}
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
                  <span className="font-medium whitespace-nowrap">{currentJob.minExperience}-{currentJob.maxExperience} Years Experience</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  {isEditMode ? (
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <Input
                          value={currentJob.salary}
                          onChange={(e) => handleFieldChange('salary', e.target.value)}
                          className="w-24 text-center border-blue-300"
                          placeholder="Salary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <Input
                          value={currentJob.state || 'Remote'}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                          className="w-32 text-center border-blue-300"
                          placeholder="Location"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700 whitespace-nowrap">{currentJob.salary}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full flex-shrink-0">
                        <span className="font-medium text-orange-700 whitespace-nowrap">
                          ${Math.round(parseFloat(currentJob.salary.replace(/[$,k]/g, '')) * 1000 * 1.55 / 1000)}k (Estimated)
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
                        <span className="font-medium text-blue-700 whitespace-nowrap">Remote</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full flex-shrink-0">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-700 whitespace-nowrap">Posted {new Date(currentJob.createdOn).toLocaleDateString()}</span>
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
                  <div className="text-2xl font-bold text-gray-800">{totalCandidates}</div>
                  <div className="text-sm text-gray-600">Total Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{sourcingFunnelCandidates}</div>
                  <div className="text-sm text-gray-600">Sourcing Funnel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{hiredCandidates}</div>
                  <div className="text-sm text-gray-600">Hired</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{rejectedCandidates}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
              
              {/* Second Row - New Financial Statistics */}
              {user?.role !== 'client' && (
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${directCostData.payRate.rate}/hr</div>
                    <div className="text-sm text-gray-600">Estimated Pay Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{((totalRevenue - totalDirectCosts) / totalRevenue * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Gross Margin %</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{(netMargin / totalRevenue * 100).toFixed(1)}%</div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-6 pb-2">
            <TabsList className="grid w-full grid-cols-7 lg:grid-cols-9 lg:w-auto bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50">
              <TabsTrigger value="overview" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="sourcing-funnel" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                Sourcing Funnel
              </TabsTrigger>
              {user?.role !== 'client' && (
                <TabsTrigger value="notes" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                  Notes
                </TabsTrigger>
              )}
              <TabsTrigger value="attachments" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                Attachments
              </TabsTrigger>
              {user?.role !== 'client' && (
                <TabsTrigger value="todos" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                  Todos
                </TabsTrigger>
              )}
              <TabsTrigger value="team" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                Team
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
                Stats
              </TabsTrigger>
              {user?.role !== 'client' && (
                <TabsTrigger value="profitability" className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
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
                    {isEditMode ? (
                      <Textarea
                        value={currentJob.jobDescription}
                        onChange={(e) => handleFieldChange('jobDescription', e.target.value)}
                        className="min-h-32 border-2 border-blue-300 focus:border-blue-500"
                        placeholder="Enter job description..."
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{currentJob.jobDescription}</p>
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
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Skills</label>
                          <Input
                            value={currentJob.primarySkills.join(', ')}
                            onChange={(e) => handleFieldChange('primarySkills', e.target.value.split(', '))}
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="React, TypeScript, Node.js"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Secondary Skills</label>
                          <Input
                            value={currentJob.secondarySkills.join(', ')}
                            onChange={(e) => handleFieldChange('secondarySkills', e.target.value.split(', '))}
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="AWS, Docker, GraphQL"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3 text-gray-700">Primary Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentJob.primarySkills.map((skill: string, index: number) => (
                              <Badge key={index} className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {currentJob.secondarySkills.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Secondary Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {currentJob.secondarySkills.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                                  {skill}
                                </Badge>
                              ))}
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
                            onChange={(e) => handleFieldChange('clientContact', e.target.value)}
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="Client Contact Name"
                          />
                          <Input
                            value={currentJob.endClient}
                            onChange={(e) => handleFieldChange('endClient', e.target.value)}
                            className="border-2 border-blue-300 focus:border-blue-500"
                            placeholder="End Client"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold text-gray-800">{currentJob.clientContact}</p>
                            <p className="text-sm text-gray-600">Hiring Manager</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" className="button-gradient shadow-md hover:shadow-lg transition-shadow w-full justify-center">
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                            <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 w-full justify-center">
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
                      <p className="font-semibold text-gray-800">{job.accountManager}</p>
                      <p className="text-sm text-gray-600">Responsible for this placement</p>
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
                      <Badge variant={job.priority === "High" ? "destructive" : "secondary"} className="mb-2">
                        {job.priority} Priority
                      </Badge>
                      <p className="text-sm text-gray-600">Job Type: {job.jobType}</p>
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
                        <p className="font-semibold text-gray-800">{job.industry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-semibold text-gray-800">{job.minExperience}-{job.maxExperience} years</p>
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
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    count={getStageCount(column.id)}
                    color={column.color}
                    candidates={getCandidatesByStage(column.id)}
                    onAddCandidate={handleAddCandidate}
                    onMoveCandidate={handleMoveCandidate}
                  />
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
                      <div key={note.id} className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {note.author.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{note.author}</p>
                              <p className="text-xs text-gray-500">{note.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              note.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                              note.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
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
              <DocumentsManager 
                documents={jobDocuments}
                onUpload={handleJobDocumentUpload}
                title="Job Attachments"
              />
            </TabsContent>

            <TabsContent value="todos" className="space-y-6 mt-0">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      Job Tasks
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleAddTodo}
                        className="bg-gradient-to-r from-green-500 to-green-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-green-600">Total: {todos.length}</span>
                    <span className="text-blue-600">Completed: {todos.filter(item => item.completed).length}</span>
                    <span className="text-orange-600">Pending: {todos.filter(item => !item.completed).length}</span>
                  </div>
                  
                  {/* Filters and Search */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search todos..."
                        value={todoSearch}
                        onChange={(e) => setTodoSearch(e.target.value)}
                        className="pl-10 border-green-200 focus:border-green-400"
                      />
                    </div>
                    <Select value={todoFilter} onValueChange={setTodoFilter}>
                      <SelectTrigger className="w-40 border-green-200">
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
                      <SelectTrigger className="w-32 border-green-200">
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
                  
                  {/* Add New Todo */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Input
                      placeholder="Enter new todo..."
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      className="flex-1 border-green-200"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    />
                    <Select value={newTodoPriority} onValueChange={setNewTodoPriority}>
                      <SelectTrigger className="w-32 border-green-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newTodoAssignee} onValueChange={setNewTodoAssignee}>
                      <SelectTrigger className="w-40 border-green-200">
                        <SelectValue placeholder="Assign to" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersData.users.filter(user => user.status === "Active").map(user => (
                          <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Task Items */}
                  <div className="space-y-4">
                    {getFilteredAndSortedTodos().map((todo) => (
                      <div key={todo.id} className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() => toggleTodo(todo.id)}
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <div className="flex-1">
                              <h4 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {todo.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Due: {todo.dueDate}</span>
                                {todo.assignee && <span>Assigned to: {todo.assignee}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              todo.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                              todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {todo.priority}
                            </Badge>
                            
                            {/* Reschedule Button */}
                            <Popover open={isRescheduleOpen && rescheduleData.todoId === todo.id} onOpenChange={(open) => {
                              setIsRescheduleOpen(open);
                              if (!open) setRescheduleData({todoId: null, newDate: undefined});
                            }}>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRescheduleData({todoId: todo.id, newDate: undefined});
                                    setIsRescheduleOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Calendar className="w-4 h-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={rescheduleData.newDate}
                                  onSelect={(date) => {
                                    if (date && rescheduleData.todoId) {
                                      setTodos(prev => prev.map(t => 
                                        t.id === rescheduleData.todoId 
                                          ? { ...t, dueDate: format(date, "MMM dd, yyyy") }
                                          : t
                                      ));
                                      setIsRescheduleOpen(false);
                                      setRescheduleData({todoId: null, newDate: undefined});
                                      toast({
                                        title: "Todo rescheduled",
                                        description: `Task has been rescheduled to ${format(date, "MMM dd, yyyy")}`,
                                      });
                                    }
                                  }}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>

                            {/* Reassign Button */}
                            <Dialog open={isReassignOpen && reassignData.todoId === todo.id} onOpenChange={(open) => {
                              setIsReassignOpen(open);
                              if (!open) setReassignData({todoId: null, newAssignee: ""});
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReassignData({todoId: todo.id, newAssignee: todo.assignee || ""});
                                    setIsReassignOpen(true);
                                  }}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                >
                                  <User className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reassign Task</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Task: {todo.title}</label>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Assign to:</label>
                                    <Select value={reassignData.newAssignee} onValueChange={(value) => setReassignData(prev => ({...prev, newAssignee: value}))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {usersData.users.filter(user => user.status === "Active").map(user => (
                                          <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => {
                                        if (reassignData.todoId && reassignData.newAssignee) {
                                          setTodos(prev => prev.map(t => 
                                            t.id === reassignData.todoId 
                                              ? { ...t, assignee: reassignData.newAssignee }
                                              : t
                                          ));
                                          setIsReassignOpen(false);
                                          setReassignData({todoId: null, newAssignee: ""});
                                          toast({
                                            title: "Todo reassigned",
                                            description: `Task has been reassigned to ${reassignData.newAssignee}`,
                                          });
                                        }
                                      }}
                                      className="flex-1"
                                    >
                                      Reassign
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsReassignOpen(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTodo(todo.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">Team Members</h3>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="button-gradient shadow-md"
                      onClick={() => handleAddEditMember()}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add/Edit Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-white border border-green-200/50 shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                        {editingMember ? 'Edit Team Member' : 'Manage Team Members'}
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
                            {teamMembers.map((member) => (
                              <TableRow key={member.id} className="border-green-100/50 hover:bg-green-50/50">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                      {member.initials}
                                    </div>
                                    <span className="font-medium text-gray-800">{member.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Select 
                                    value={member.role} 
                                    onValueChange={(value) => {
                                      setTeamMembers(prev => 
                                        prev.map(m => 
                                          m.id === member.id 
                                            ? { ...m, role: value }
                                            : m
                                        )
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="border-green-200 focus:border-green-500">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-green-200">
                                      {rolesData.roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                          {role.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">{member.email}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-green-300 text-green-700">
                                    {member.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddEditMember(member)}
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRemoveTeamMember(member.id)}
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Add new member row */}
                            <TableRow className="border-green-100/50 hover:bg-green-50/50">
                              <TableCell>
                                <Select onValueChange={(value) => {
                                  const selectedUser = usersData.users.find(u => u.id === parseInt(value));
                                  if (selectedUser && !teamMembers.find(m => m.userId === selectedUser.id)) {
                                    const colors = [
                                      "from-blue-500 to-blue-600",
                                      "from-purple-500 to-purple-600", 
                                      "from-green-500 to-green-600",
                                      "from-orange-500 to-orange-600",
                                      "from-red-500 to-red-600",
                                      "from-indigo-500 to-indigo-600"
                                    ];
                                    const newMember = {
                                      id: teamMembers.length + 1,
                                      userId: selectedUser.id,
                                      name: selectedUser.name,
                                      role: selectedUser.role,
                                      email: selectedUser.email,
                                      phone: "+1 (555) 000-0000",
                                      initials: selectedUser.avatar,
                                      color: colors[teamMembers.length % colors.length],
                                      badge: "Collaborator",
                                      badgeColor: "border-purple-300 text-purple-700",
                                      status: "Active",
                                      statusColor: "border-green-300 text-green-700"
                                    };
                                    setTeamMembers(prev => [...prev, newMember]);
                                  }
                                }}>
                                  <SelectTrigger className="border-green-200 focus:border-green-500">
                                    <SelectValue placeholder="Select user to add..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-green-200">
                                    {usersData.users
                                      .filter(user => user.status === "Active" && !teamMembers.find(m => m.userId === user.id))
                                      .map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                              {user.avatar}
                                            </div>
                                            {user.name} - {user.role}
                                          </div>
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
                          onClick={() => setIsTeamDialogOpen(false)}
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
                {teamMembers.map((member) => (
                  <Card key={member.id} className="group relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-green-100/20 border border-green-200/60 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-green-300/80">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="relative p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                          <div className={`w-20 h-20 bg-gradient-to-br ${member.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-500/30 group-hover:scale-105`}>
                            {member.initials}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Member Info */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">{member.name}</h4>
                          <p className="text-sm font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{member.role}</p>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 shadow-md">
                            {member.badge}
                          </Badge>
                          <Badge variant="outline" className="border-green-300 text-green-700 text-xs px-3 py-1 bg-green-50/50">
                            {member.status}
                          </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 w-full">
                          <div className="flex items-center justify-center gap-2 group/email">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover/email:from-blue-500 group-hover/email:to-blue-600 transition-all duration-200">
                              <Mail className="w-4 h-4 text-blue-600 group-hover/email:text-white" />
                            </div>
                            <button 
                              onClick={() => handleEmailClick(member.email)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium truncate max-w-[180px] group-hover/email:text-blue-700"
                            >
                              {member.email.split('@')[0]}@...
                            </button>
                          </div>
                          <div className="flex items-center justify-center gap-2 group/phone">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover/phone:from-green-500 group-hover/phone:to-green-600 transition-all duration-200">
                              <Phone className="w-4 h-4 text-green-600 group-hover/phone:text-white" />
                            </div>
                            <button 
                              onClick={() => handlePhoneClick(member.phone)}
                              className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium group-hover/phone:text-green-700"
                            >
                              {member.phone}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full pt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEmailClick(member.email)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-1 group-hover:scale-105"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePhoneClick(member.phone)}
                            className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 flex-1 group-hover:scale-105 transition-all duration-200"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">Job Timeline</h3>
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
                          <p className="font-semibold text-gray-800">Job Posted</p>
                          <p className="text-xs text-gray-500">{new Date(job.createdOn).toLocaleDateString()}</p>
                        </div>
                        <p className="text-gray-600 text-sm">Senior React Developer position posted and made public</p>
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
                          <p className="font-semibold text-gray-800">First Candidates Added</p>
                          <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                        <p className="text-gray-600 text-sm">Initial batch of 5 candidates sourced and added to pipeline</p>
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
                          <p className="font-semibold text-gray-800">Client Screening Call</p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                        <p className="text-gray-600 text-sm">Completed screening calls with top 3 candidates</p>
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
                          <p className="font-semibold text-gray-800">Offer Extended</p>
                          <p className="text-xs text-gray-500">Today</p>
                        </div>
                        <p className="text-gray-600 text-sm">Offer extended to James Wilson, awaiting candidate response</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">Job Statistics</h3>
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
                          <TableHead className="text-green-700 font-semibold">Status</TableHead>
                          <TableHead className="text-green-700 font-semibold">Start</TableHead>
                          <TableHead className="text-green-700 font-semibold">End</TableHead>
                          <TableHead className="text-green-700 font-semibold">Time elapsed (Hrs)</TableHead>
                          <TableHead className="text-green-700 font-semibold">SLA</TableHead>
                          <TableHead className="text-green-700 font-semibold">KPI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30">
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Created
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/24/2025 15:06:08</TableCell>
                          <TableCell className="text-gray-700">7/24/2025 16:21:08</TableCell>
                          <TableCell className="text-gray-700 font-medium">1.25</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30 bg-green-50/20">
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Assigned
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/24/2025 16:21:08</TableCell>
                          <TableCell className="text-gray-700">7/25/2025 8:41:32</TableCell>
                          <TableCell className="text-gray-700 font-medium">16.34</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30">
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Internal Submission
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/25/2025 8:41:32</TableCell>
                          <TableCell className="text-gray-700">7/25/2025 12:15:08</TableCell>
                          <TableCell className="text-gray-700 font-medium">3.56</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30 bg-green-50/20">
                          <TableCell>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Client Submission
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/25/2025 12:15:08</TableCell>
                          <TableCell className="text-gray-700">7/26/2025 9:38:32</TableCell>
                          <TableCell className="text-gray-700 font-medium">21.39</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30">
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Interview
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/26/2025 9:38:32</TableCell>
                          <TableCell className="text-gray-700">7/27/2025 22:08:32</TableCell>
                          <TableCell className="text-gray-700 font-medium">36.50</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30 bg-green-50/20">
                          <TableCell>
                            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                              Confirmation
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/27/2025 22:08:32</TableCell>
                          <TableCell className="text-gray-700">7/30/2025 22:24:44</TableCell>
                          <TableCell className="text-gray-700 font-medium">72.27</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                        </TableRow>
                        <TableRow className="border-green-100/50 hover:bg-green-50/30">
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              Placement
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">7/30/2025 22:24:44</TableCell>
                          <TableCell className="text-gray-700">8/6/2025 22:36:08</TableCell>
                          <TableCell className="text-gray-700 font-medium">168.19</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
                          <TableCell className="text-gray-700">-</TableCell>
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
                    <div className="text-2xl font-bold text-gray-800">319.5 hrs</div>
                    <p className="text-xs text-gray-600">From creation to placement</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-purple-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                      Avg Stage Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">45.6 hrs</div>
                    <p className="text-xs text-gray-600">Average per stage</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-orange-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                      Longest Stage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">168.2 hrs</div>
                    <p className="text-xs text-gray-600">Placement stage</p>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-green-200/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      Efficiency Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <p className="text-xs text-gray-600">Above average</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profitability" className="space-y-6 mt-0">
              {/* Profitability Analysis Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Profitability Analysis
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className="button-gradient shadow-md">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Values
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card className="card-gradient border-green-200/50 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </CardContent>
                </Card>
                <Card className="card-gradient border-red-200/50 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">${totalDirectCosts.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Direct Cost</div>
                  </CardContent>
                </Card>
                <Card className="card-gradient border-orange-200/50 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">${totalOverheads.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Overheads</div>
                  </CardContent>
                </Card>
                <Card className="card-gradient border-blue-200/50 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">${totalOneTimeCosts.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">One Time Costs</div>
                  </CardContent>
                </Card>
                <Card className="card-gradient border-purple-200/50 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">${netMargin.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Net Margin</div>
                    <div className="text-xs text-purple-600 mt-1">{((netMargin/totalRevenue)*100).toFixed(1)}% margin</div>
                  </CardContent>
                </Card>
              </div>

              {/* Total Revenue Section */}
              <Card className="card-gradient border-green-200/50 shadow-lg">
                <Collapsible open={isRevenueOpen} onOpenChange={setIsRevenueOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200/50 cursor-pointer hover:bg-green-100 transition-colors">
                      <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Total Revenue - ${totalRevenue.toLocaleString()}
                        </div>
                        {isRevenueOpen ? <ChevronUp className="w-5 h-5 text-green-600" /> : <ChevronDown className="w-5 h-5 text-green-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-green-50 border-b border-green-200/50">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-700">Component</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Hourly Rate</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Hours</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                              <th className="text-left p-4 font-semibold text-gray-700">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-green-100 hover:bg-green-50/50">
                              <td className="p-4 font-medium">Bill Rate</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={revenueData.billRate.rate}
                                  onChange={(e) => setRevenueData(prev => ({
                                    ...prev,
                                    billRate: { ...prev.billRate, rate: Number(e.target.value) }
                                  }))}
                                  className="w-20 text-center"
                                />
                              </td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={revenueData.billRate.hours}
                                  onChange={(e) => setRevenueData(prev => ({
                                    ...prev,
                                    billRate: { ...prev.billRate, hours: Number(e.target.value) }
                                  }))}
                                  className="w-24 text-center"
                                />
                              </td>
                              <td className="p-4 font-bold text-green-600">
                                ${(revenueData.billRate.rate * revenueData.billRate.hours).toLocaleString()}
                              </td>
                              <td className="p-4 font-semibold">
                                {((revenueData.billRate.rate * revenueData.billRate.hours / totalRevenue) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-green-100 hover:bg-green-50/50">
                              <td className="p-4 font-medium">Over time</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={revenueData.overTime.rate}
                                  onChange={(e) => setRevenueData(prev => ({
                                    ...prev,
                                    overTime: { ...prev.overTime, rate: Number(e.target.value) }
                                  }))}
                                  className="w-20 text-center"
                                />
                              </td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={revenueData.overTime.hours}
                                  onChange={(e) => setRevenueData(prev => ({
                                    ...prev,
                                    overTime: { ...prev.overTime, hours: Number(e.target.value) }
                                  }))}
                                  className="w-24 text-center"
                                />
                              </td>
                              <td className="p-4 font-bold text-green-600">
                                ${(revenueData.overTime.rate * revenueData.overTime.hours).toLocaleString()}
                              </td>
                              <td className="p-4 font-semibold">
                                {((revenueData.overTime.rate * revenueData.overTime.hours / totalRevenue) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-green-100 hover:bg-green-50/50">
                              <td className="p-4 font-medium">Incentives</td>
                              <td className="p-4 text-gray-400">-</td>
                              <td className="p-4 text-gray-400">-</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={revenueData.incentives.amount}
                                  onChange={(e) => setRevenueData(prev => ({
                                    ...prev,
                                    incentives: { ...prev.incentives, amount: Number(e.target.value) }
                                  }))}
                                  className="w-28 text-center font-bold text-green-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((revenueData.incentives.amount / totalRevenue) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          </tbody>
                          <tfoot className="bg-green-100 border-t-2 border-green-300">
                            <tr>
                              <td className="p-4 font-bold text-green-800" colSpan={3}>Total Revenue</td>
                              <td className="p-4 font-bold text-green-800 text-lg">${totalRevenue.toLocaleString()}</td>
                              <td className="p-4 font-bold text-green-800">100%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Direct Cost Section */}
              <Card className="card-gradient border-red-200/50 shadow-lg">
                <Collapsible open={isDirectCostOpen} onOpenChange={setIsDirectCostOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200/50 cursor-pointer hover:bg-red-100 transition-colors">
                      <CardTitle className="text-lg bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-red-600" />
                          Direct Cost - ${totalDirectCosts.toLocaleString()}
                        </div>
                        {isDirectCostOpen ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-red-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-red-50 border-b border-red-200/50">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-700">Component</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Hourly Rate</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Hours</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                              <th className="text-left p-4 font-semibold text-gray-700">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-red-100 hover:bg-red-50/50">
                              <td className="p-4 font-medium">Pay rate</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={directCostData.payRate.rate}
                                  onChange={(e) => setDirectCostData(prev => ({
                                    ...prev,
                                    payRate: { ...prev.payRate, rate: Number(e.target.value) }
                                  }))}
                                  className="w-20 text-center"
                                />
                              </td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={directCostData.payRate.hours}
                                  onChange={(e) => setDirectCostData(prev => ({
                                    ...prev,
                                    payRate: { ...prev.payRate, hours: Number(e.target.value) }
                                  }))}
                                  className="w-24 text-center"
                                />
                              </td>
                              <td className="p-4 font-bold text-red-600">
                                ${(directCostData.payRate.rate * directCostData.payRate.hours).toLocaleString()}
                              </td>
                              <td className="p-4 font-semibold">
                                {((directCostData.payRate.rate * directCostData.payRate.hours / totalDirectCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-red-100 hover:bg-red-50/50">
                              <td className="p-4 font-medium">OT Pay rate</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={directCostData.otPayRate.rate}
                                  onChange={(e) => setDirectCostData(prev => ({
                                    ...prev,
                                    otPayRate: { ...prev.otPayRate, rate: Number(e.target.value) }
                                  }))}
                                  className="w-20 text-center"
                                />
                              </td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={directCostData.otPayRate.hours}
                                  onChange={(e) => setDirectCostData(prev => ({
                                    ...prev,
                                    otPayRate: { ...prev.otPayRate, hours: Number(e.target.value) }
                                  }))}
                                  className="w-24 text-center"
                                />
                              </td>
                              <td className="p-4 font-bold text-red-600">
                                ${(directCostData.otPayRate.rate * directCostData.otPayRate.hours).toLocaleString()}
                              </td>
                              <td className="p-4 font-semibold">
                                {((directCostData.otPayRate.rate * directCostData.otPayRate.hours / totalDirectCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-red-100 hover:bg-red-50/50">
                              <td className="p-4 font-medium">Discount</td>
                              <td className="p-4 text-gray-400">-</td>
                              <td className="p-4 text-gray-400">-</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={directCostData.discount.amount}
                                  onChange={(e) => setDirectCostData(prev => ({
                                    ...prev,
                                    discount: { amount: Number(e.target.value) }
                                  }))}
                                  className="w-28 text-center font-bold text-red-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((directCostData.discount.amount / totalDirectCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-red-100 hover:bg-red-50/50">
                              <td className="p-4 font-medium">Vendor Commission</td>
                              <td className="p-4 text-gray-400">-</td>
                              <td className="p-4 text-gray-400">-</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={directCostData.vendorCommission.amount}
                                  onChange={(e) => setDirectCostData(prev => ({
                                    ...prev,
                                    vendorCommission: { amount: Number(e.target.value) }
                                  }))}
                                  className="w-28 text-center font-bold text-red-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((directCostData.vendorCommission.amount / totalDirectCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          </tbody>
                          <tfoot className="bg-red-100 border-t-2 border-red-300">
                            <tr>
                              <td className="p-4 font-bold text-red-800" colSpan={3}>Total Direct Cost</td>
                              <td className="p-4 font-bold text-red-800 text-lg">${totalDirectCosts.toLocaleString()}</td>
                              <td className="p-4 font-bold text-red-800">100%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Overheads Section */}
              <Card className="card-gradient border-blue-200/50 shadow-lg">
                <Collapsible open={isOverheadsOpen} onOpenChange={setIsOverheadsOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200/50 cursor-pointer hover:bg-blue-100 transition-colors">
                      <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-5 h-5 text-blue-600" />
                          Overheads - ${totalOverheads.toLocaleString()}
                        </div>
                        {isOverheadsOpen ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-blue-50 border-b border-blue-200/50">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-700">Component</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                              <th className="text-left p-4 font-semibold text-gray-700">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-blue-100 hover:bg-blue-50/50">
                              <td className="p-4 font-medium">Recruiter commission</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={overheadsData.recruiterCommission}
                                  onChange={(e) => setOverheadsData(prev => ({
                                    ...prev,
                                    recruiterCommission: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-blue-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((overheadsData.recruiterCommission / totalOverheads) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-blue-100 hover:bg-blue-50/50">
                              <td className="p-4 font-medium">Employee benefits</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={overheadsData.employeeBenefits}
                                  onChange={(e) => setOverheadsData(prev => ({
                                    ...prev,
                                    employeeBenefits: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-blue-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((overheadsData.employeeBenefits / totalOverheads) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-blue-100 hover:bg-blue-50/50">
                              <td className="p-4 font-medium">Per Diems</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={overheadsData.perDiems}
                                  onChange={(e) => setOverheadsData(prev => ({
                                    ...prev,
                                    perDiems: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-blue-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((overheadsData.perDiems / totalOverheads) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-blue-100 hover:bg-blue-50/50">
                              <td className="p-4 font-medium">Employer taxes</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={overheadsData.employerTaxes}
                                  onChange={(e) => setOverheadsData(prev => ({
                                    ...prev,
                                    employerTaxes: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-blue-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((overheadsData.employerTaxes / totalOverheads) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          </tbody>
                          <tfoot className="bg-blue-100 border-t-2 border-blue-300">
                            <tr>
                              <td className="p-4 font-bold text-blue-800">Total Overheads</td>
                              <td className="p-4 font-bold text-blue-800 text-lg">${totalOverheads.toLocaleString()}</td>
                              <td className="p-4 font-bold text-blue-800">100%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* One Time Costs Section */}
              <Card className="card-gradient border-yellow-200/50 shadow-lg">
                <Collapsible open={isOneTimeCostsOpen} onOpenChange={setIsOneTimeCostsOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200/50 cursor-pointer hover:bg-yellow-100 transition-colors">
                      <CardTitle className="text-lg bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-transparent flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-yellow-600" />
                          One Time Costs - ${totalOneTimeCosts.toLocaleString()}
                        </div>
                        {isOneTimeCostsOpen ? <ChevronUp className="w-5 h-5 text-yellow-600" /> : <ChevronDown className="w-5 h-5 text-yellow-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-yellow-50 border-b border-yellow-200/50">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-700">Component</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                              <th className="text-left p-4 font-semibold text-gray-700">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-yellow-100 hover:bg-yellow-50/50">
                              <td className="p-4 font-medium">Placement Fee</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={oneTimeCostsData.placementFee}
                                  onChange={(e) => setOneTimeCostsData(prev => ({
                                    ...prev,
                                    placementFee: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-yellow-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((oneTimeCostsData.placementFee / totalOneTimeCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-yellow-100 hover:bg-yellow-50/50">
                              <td className="p-4 font-medium">Hardware Costs</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={oneTimeCostsData.hardwareCosts}
                                  onChange={(e) => setOneTimeCostsData(prev => ({
                                    ...prev,
                                    hardwareCosts: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-yellow-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((oneTimeCostsData.hardwareCosts / totalOneTimeCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-yellow-100 hover:bg-yellow-50/50">
                              <td className="p-4 font-medium">Training Costs</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={oneTimeCostsData.trainingCosts}
                                  onChange={(e) => setOneTimeCostsData(prev => ({
                                    ...prev,
                                    trainingCosts: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-yellow-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((oneTimeCostsData.trainingCosts / totalOneTimeCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr className="border-b border-yellow-100 hover:bg-yellow-50/50">
                              <td className="p-4 font-medium">Setup Costs</td>
                              <td className="p-4">
                                <Input
                                  type="number"
                                  value={oneTimeCostsData.setupCosts}
                                  onChange={(e) => setOneTimeCostsData(prev => ({
                                    ...prev,
                                    setupCosts: Number(e.target.value)
                                  }))}
                                  className="w-32 text-center font-bold text-yellow-600"
                                />
                              </td>
                              <td className="p-4 font-semibold">
                                {((oneTimeCostsData.setupCosts / totalOneTimeCosts) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          </tbody>
                          <tfoot className="bg-yellow-100 border-t-2 border-yellow-300">
                            <tr>
                              <td className="p-4 font-bold text-yellow-800">Total One Time Costs</td>
                              <td className="p-4 font-bold text-yellow-800 text-lg">${totalOneTimeCosts.toLocaleString()}</td>
                              <td className="p-4 font-bold text-yellow-800">100%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Net Margin & Overall Profitability */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-gradient border-yellow-200/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200/50">
                    <CardTitle className="text-lg bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-600" />
                      Net Margin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Gross Margin</span>
                        <span className="font-semibold text-gray-800">$55,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Overheads</span>
                        <span className="font-semibold text-red-600">-$25,000</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-yellow-50 px-4 rounded-lg border border-yellow-200">
                        <span className="font-bold text-yellow-800">Net Margin</span>
                        <span className="font-bold text-yellow-800 text-xl">$30,000</span>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        16.7% of total revenue
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-indigo-200/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200/50">
                    <CardTitle className="text-lg bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                      <Star className="w-5 h-5 text-indigo-600" />
                      Overall Profitability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Net Margin</span>
                        <span className="font-semibold text-gray-800">$30,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">General Overhead of total revenue</span>
                        <span className="font-semibold text-red-600">-$20,000</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-indigo-50 px-4 rounded-lg border border-indigo-200">
                        <span className="font-bold text-indigo-800">Overall Profitability</span>
                        <span className="font-bold text-indigo-800 text-xl">$10,000</span>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        5.6% of total revenue
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Personalization Settings Dialog */}
      <JobDetailPersonalizationSettings
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        onSave={(settings) => {
          setPersonalizationSettings(settings);
          // Here you could save to localStorage or backend
          localStorage.setItem('jobDetailPersonalization', JSON.stringify(settings));
        }}
        currentSettings={personalizationSettings}
      />
    </div>
  );
};

export default JobDetail;
