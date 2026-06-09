import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building,
  Building2,
  Clock,
  Star,
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Save,
  X,
  CheckCircle,
  CheckSquare,
  AlertCircle,
  Send,
  UserCheck,
  Download,
  Eye,
  TrendingUp,
  Award,
  Target,
  Briefcase,
  Globe,
  Users,
  BookOpen,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
  UserCog,
  Bot
} from "lucide-react";
import submissionsData from "@/data/submissions.json";
import SubmissionDetailPersonalizationSettings from "@/components/SubmissionDetailPersonalizationSettings";

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [newTask, setNewTask] = useState("");
  
  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchSubmissionId, setSearchSubmissionId] = useState("");

  // Profitability calculation state
  const [isRevenueOpen, setIsRevenueOpen] = useState(true);
  const [isDirectCostOpen, setIsDirectCostOpen] = useState(true);
  const [isOverheadsOpen, setIsOverheadsOpen] = useState(true);
  const [isOneTimeCostsOpen, setIsOneTimeCostsOpen] = useState(true);

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Load personalization settings and event listener
  useEffect(() => {
    const saved = localStorage.getItem('submissionDetailPersonalization');
    if (saved) {
      try { setPersonalizationSettings(JSON.parse(saved)); } catch (error) {}
    }
    
    const handleOpenPersonalization = () => setIsPersonalizationOpen(true);
    window.addEventListener('openPersonalizationSettings', handleOpenPersonalization);
    return () => window.removeEventListener('openPersonalizationSettings', handleOpenPersonalization);
  }, []);

  // Revenue data state
  const [revenueData, setRevenueData] = useState({
    billRate: { rate: 85, hours: 1920 },
    overTime: { rate: 115, hours: 160 },
    incentives: { rate: 0, hours: 0, amount: 8000 }
  });

  // Direct cost data state  
  const [directCostData, setDirectCostData] = useState({
    payRate: { rate: 70, hours: 1920 },
    otPayRate: { rate: 95, hours: 160 },
    discount: { amount: 2000 },
    vendorCommission: { amount: 1500 }
  });

  // Overheads data state
  const [overheadsData, setOverheadsData] = useState({
    recruiterCommission: 10000,
    employeeBenefits: 4000,
    perDiems: 3000,
    employerTaxes: 3500
  });

  // One time costs data state
  const [oneTimeCostsData, setOneTimeCostsData] = useState({
    placementFee: 12000,
    hardwareCosts: 4000,
    trainingCosts: 2500,
    setupCosts: 1500
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

  // Find submission by ID
  const submission = submissionsData.submissions.find(sub => sub.id === id);

  // Search functionality
  const handleSearchSubmission = () => {
    if (searchSubmissionId.trim()) {
      const submissionExists = submissionsData.submissions.find(s => s.id === searchSubmissionId.trim());
      if (submissionExists) {
        navigate(`/dashboard/submissions/${searchSubmissionId.trim()}`);
        setSearchSubmissionId("");
        setIsSearchExpanded(false);
      } else {
        // Show error feedback - submission not found
        console.log("Submission not found");
      }
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmission();
    }
  };

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-4">The submission you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Interview Scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending Client Review": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      case "Hired": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Low": return "text-green-700 bg-green-50 border-green-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  // Enhanced AI matching data
  const aiMatchingData = [
    { skill: "React", required: "Expert", candidate: "Expert", score: 95, category: "Frontend", yearsExp: 5 },
    { skill: "JavaScript", required: "Expert", candidate: "Advanced", score: 85, category: "Core", yearsExp: 6 },
    { skill: "TypeScript", required: "Advanced", candidate: "Intermediate", score: 70, category: "Core", yearsExp: 3 },
    { skill: "Node.js", required: "Intermediate", candidate: "Expert", score: 90, category: "Backend", yearsExp: 4 },
    { skill: "AWS", required: "Basic", candidate: "Basic", score: 80, category: "Cloud", yearsExp: 2 },
    { skill: "Docker", required: "Intermediate", candidate: "Advanced", score: 88, category: "DevOps", yearsExp: 3 },
    { skill: "GraphQL", required: "Basic", candidate: "Intermediate", score: 85, category: "Backend", yearsExp: 2 },
  ];

  // Enhanced timeline data
  const timelineData = [
    { 
      date: "2024-01-20", 
      time: "09:30 AM",
      type: "Submission", 
      description: "Candidate submitted for review with complete profile", 
      user: "System",
      details: "Initial AI screening completed with 87% match score"
    },
    { 
      date: "2024-01-20", 
      time: "11:15 AM",
      type: "Note", 
      description: "Initial screening completed - strong technical background", 
      user: "Jane Doe",
      details: "Reviewed portfolio and GitHub projects"
    },
    { 
      date: "2024-01-21", 
      time: "02:45 PM",
      type: "Status", 
      description: "Status changed from New to Under Review", 
      user: "Jane Doe",
      details: "Moved to next stage after initial assessment"
    },
    { 
      date: "2024-01-22", 
      time: "10:20 AM",
      type: "Task", 
      description: "Schedule initial interview with hiring manager", 
      user: "Jane Doe",
      details: "High priority task assigned for this week"
    },
    { 
      date: "2024-01-22", 
      time: "03:30 PM",
      type: "Communication", 
      description: "Initial contact email sent to candidate", 
      user: "Sarah Wilson",
      details: "Introduction and next steps communicated"
    },
  ];

  // Enhanced tasks data
  const [tasksData, setTasksData] = useState([
    { 
      id: 1, 
      title: "Schedule initial interview", 
      status: "Pending", 
      priority: "High",
      assignee: "Jane Doe", 
      dueDate: "2024-01-25",
      description: "Coordinate with hiring manager for technical interview",
      estimatedTime: "2 hours",
      category: "interview",
      createdDate: "2024-01-20"
    },
    { 
      id: 2, 
      title: "Send technical assessment", 
      status: "Completed", 
      priority: "Medium",
      assignee: "Mike Johnson", 
      dueDate: "2024-01-23",
      description: "Custom React/Node.js technical challenge",
      estimatedTime: "30 minutes",
      category: "assessment",
      createdDate: "2024-01-18"
    },
    { 
      id: 3, 
      title: "Client feedback review", 
      status: "In Progress", 
      priority: "High",
      assignee: "Sarah Wilson", 
      dueDate: "2024-01-24",
      description: "Review initial client impressions and feedback",
      estimatedTime: "1 hour",
      category: "review",
      createdDate: "2024-01-19"
    },
    { 
      id: 4, 
      title: "Reference check", 
      status: "Pending", 
      priority: "Low",
      assignee: "Mike Johnson", 
      dueDate: "2024-01-28",
      description: "Contact previous employers for verification",
      estimatedTime: "45 minutes",
      category: "verification",
      createdDate: "2024-01-21"
    },
  ]);

  // Task filters and search state
  const [tasksFilter, setTasksFilter] = useState("all");
  const [tasksSort, setTasksSort] = useState("dueDate");
  const [tasksSearch, setTasksSearch] = useState("");

  // Enhanced notes data
  const [notesData, setNotesData] = useState([
    { 
      id: 1, 
      content: "Candidate shows excellent React knowledge", 
      author: "Jane Doe", 
      date: "2024-01-20", 
      category: "technical", 
      priority: "high",
      tags: ["React", "Frontend"]
    },
    { 
      id: 2, 
      content: "Good communication skills during screening", 
      author: "Mike Johnson", 
      date: "2024-01-18", 
      category: "behavioral", 
      priority: "medium",
      tags: ["Communication", "Soft Skills"]
    },
    { 
      id: 3, 
      content: "Salary expectations align with budget", 
      author: "Sarah Wilson", 
      date: "2024-01-19", 
      category: "general", 
      priority: "low",
      tags: ["Salary", "Budget"]
    }
  ]);

  // Notes filter and search state
  const [notesFilter, setNotesFilter] = useState("all");
  const [notesSort, setNotesSort] = useState("newest");
  const [notesSearch, setNotesSearch] = useState("");

  // Todo data
  const [todosData, setTodosData] = useState([
    { 
      id: 1, 
      title: "Follow up with candidate", 
      completed: false, 
      priority: "high", 
      category: "communication", 
      dueDate: "2024-01-25",
      createdDate: "2024-01-20"
    },
    { 
      id: 2, 
      title: "Update client on progress", 
      completed: true, 
      priority: "medium", 
      category: "reporting", 
      dueDate: "2024-01-22",
      createdDate: "2024-01-18"
    },
    { 
      id: 3, 
      title: "Prepare interview questions", 
      completed: false, 
      priority: "low", 
      category: "preparation", 
      dueDate: "2024-01-24",
      createdDate: "2024-01-19"
    }
  ]);

  // Todos filter and search state  
  const [todosFilter, setTodosFilter] = useState("all");
  const [todosSort, setTodosSort] = useState("dueDate");
  const [todosSearch, setTodosSearch] = useState("");

  // Filter and sort functions
  const getFilteredAndSortedTasks = () => {
    let filtered = tasksData.filter(task => {
      const matchesFilter = tasksFilter === "all" || 
        task.status.toLowerCase() === tasksFilter.toLowerCase() ||
        task.priority.toLowerCase() === tasksFilter.toLowerCase() ||
        task.category === tasksFilter;
      const matchesSearch = tasksSearch === "" || 
        task.title.toLowerCase().includes(tasksSearch.toLowerCase()) ||
        task.assignee.toLowerCase().includes(tasksSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(tasksSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (tasksSort) {
        case "dueDate": return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority": 
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status": return a.status.localeCompare(b.status);
        case "assignee": return a.assignee.localeCompare(b.assignee);
        default: return 0;
      }
    });
  };

  const getFilteredAndSortedNotes = () => {
    let filtered = notesData.filter(note => {
      const matchesFilter = notesFilter === "all" || note.category === notesFilter;
      const matchesSearch = notesSearch === "" || 
        note.content.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.author.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(notesSearch.toLowerCase()));
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

  const getFilteredAndSortedTodos = () => {
    let filtered = todosData.filter(todo => {
      const matchesFilter = todosFilter === "all" || 
        (todosFilter === "completed" && todo.completed) ||
        (todosFilter === "pending" && !todo.completed) ||
        todo.priority === todosFilter || todo.category === todosFilter;
      const matchesSearch = todosSearch === "" || 
        todo.title.toLowerCase().includes(todosSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (todosSort) {
        case "dueDate": return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority": 
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status": return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        case "newest": return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        default: return 0;
      }
    });
  };

  // Enhanced documents data
  const documentsData = [
    {
      name: "Resume_JohnDoe_2024.pdf",
      type: "Resume",
      size: "2.4 MB",
      uploadDate: "2024-01-20",
      status: "Reviewed",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      name: "CoverLetter.pdf",
      type: "Cover Letter",
      size: "1.2 MB",
      uploadDate: "2024-01-20",
      status: "Reviewed",
      icon: FileText,
      color: "text-green-600"
    },
    {
      name: "Portfolio_Links.txt",
      type: "Portfolio",
      size: "0.1 MB",
      uploadDate: "2024-01-20",
      status: "Reviewed",
      icon: Globe,
      color: "text-purple-600"
    },
    {
      name: "TechnicalAssessment.pdf",
      type: "Assessment",
      size: "5.7 MB",
      uploadDate: "2024-01-23",
      status: "Pending Review",
      icon: Award,
      color: "text-orange-600"
    },
  ];

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="space-y-6 p-1">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
        {/* Submission ID and Search Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 font-medium">
              Submission ID: #{submission.id}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center transition-all duration-300 ease-in-out ${
              isSearchExpanded ? 'w-64' : 'w-10'
            }`}>
              {isSearchExpanded && (
                <Input
                  value={searchSubmissionId}
                  onChange={(e) => setSearchSubmissionId(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Enter Submission ID..."
                  className="mr-2 border-blue-300 focus:border-blue-500"
                  autoFocus
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isSearchExpanded) {
                    handleSearchSubmission();
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
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
                <DropdownMenuItem className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Submission
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
        <div className="flex items-center gap-4 mb-4">
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Submission #{submission.id}
            </h1>
            <p className="text-lg text-gray-600">{submission.candidateName} • {submission.jobTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(submission.status)} border font-medium px-3 py-1 text-sm`}>
              {submission.status}
            </Badge>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${getScoreColor(submission.aiScore)} border`}>
              <Star className="w-5 h-5 fill-current" />
              {submission.aiScore}%
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Submitted</span>
            </div>
            <p className="font-semibold text-gray-900">{submission.submitDate}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Bill Rate</span>
            </div>
            <p className="font-semibold text-gray-900">$85/hr</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">Notice</span>
            </div>
            <p className="font-semibold text-gray-900">2 weeks</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Experience</span>
            </div>
            <p className="font-semibold text-gray-900">5+ years</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="matching" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">AI Matching</TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Notes</TabsTrigger>
          {user?.role !== 'client' && (
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Tasks</TabsTrigger>
          )}
          <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Documents</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Timeline</TabsTrigger>
          {user?.role !== 'client' && (
            <TabsTrigger value="profitability" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Profitability</TabsTrigger>
          )}
          <TabsTrigger value="pitch" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Pitch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Collapsible Information Cards */}
            <div className="xl:col-span-3">
              <Accordion type="multiple" defaultValue={["job-info", "candidate-info", "client-info"]} className="space-y-4">
                {/* Job Information */}
                <AccordionItem value="job-info" className="border border-gray-200 rounded-lg shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Building className="w-5 h-5 text-blue-600" />
                      Job Information
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Job Details
                          </label>
                          <p className="font-semibold text-gray-900">#{submission.jobId} - {submission.jobTitle}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Location</label>
                            <p className="font-medium flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {submission.location}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Start Date</label>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {submission.submitDate}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <label className="text-sm font-medium text-green-700">Bill Rate</label>
                            <p className="font-bold text-green-800 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              $85/hr
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <label className="text-sm font-medium text-blue-700">Pay Rate</label>
                            <p className="font-bold text-blue-800 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              $70/hr
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Candidate Information */}
                <AccordionItem value="candidate-info" className="border border-gray-200 rounded-lg shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <User className="w-5 h-5 text-green-600" />
                      Candidate Information
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="font-semibold text-gray-900 text-lg">{submission.candidateName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Position</label>
                        <p className="font-medium text-gray-800">Senior Frontend Developer</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="font-medium flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {submission.location}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Notice Period</label>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            2 weeks
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-100">
                        <label className="text-sm font-medium text-purple-700">AI Skill Match</label>
                        <div className={`flex items-center gap-2 mt-1`}>
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-bold text-lg ${getScoreColor(submission.aiScore)} border`}>
                            <Star className="w-5 h-5 fill-current" />
                            {submission.aiScore}%
                          </div>
                          <span className="text-sm text-purple-600">Excellent Match</span>
                        </div>
                      </div>
                      
                      {/* Candidate Rating Table */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Candidate Assessment</label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Technical Skills</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div
                                  key={rating}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                    rating <= 4 
                                      ? 'bg-blue-500 border-blue-500 text-white' 
                                      : 'bg-gray-200 border-gray-300 text-gray-500'
                                  }`}
                                >
                                  {rating}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Soft Skills</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div
                                  key={rating}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                    rating <= 5 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'bg-gray-200 border-gray-300 text-gray-500'
                                  }`}
                                >
                                  {rating}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Attitude</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div
                                  key={rating}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                    rating <= 4 
                                      ? 'bg-purple-500 border-purple-500 text-white' 
                                      : 'bg-gray-200 border-gray-300 text-gray-500'
                                  }`}
                                >
                                  {rating}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Contact Actions */}
                      <div className="pt-4 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-500 block mb-3">Quick Actions</label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCall("+1-555-0101")}
                            className="flex items-center gap-1 hover:bg-green-50 hover:border-green-200"
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEmail(submission.candidateEmail)}
                            className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleWhatsApp("+1-555-0101")}
                            className="flex items-center gap-1 hover:bg-green-50 hover:border-green-200"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Client Information */}
                <AccordionItem value="client-info" className="border border-gray-200 rounded-lg shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="w-5 h-5 text-purple-600" />
                      Client Information
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="text-sm font-medium text-gray-500">Company</label>
                        <p className="font-semibold text-gray-900 text-lg">{submission.company}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Primary Contact</label>
                        <p className="font-medium text-gray-800">{submission.clientContact}</p>
                        <p className="text-sm text-gray-500">Hiring Manager</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="font-medium text-gray-800">Engineering Team</p>
                      </div>
                      
                      {/* Enhanced Client Contact Actions */}
                      <div className="pt-4 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-500 block mb-3">Contact Client</label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCall("+1-555-0202")}
                            className="flex items-center gap-1 hover:bg-green-50 hover:border-green-200"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEmail("client@company.com")}
                            className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleWhatsApp("+1-555-0202")}
                            className="flex items-center gap-1 hover:bg-green-50 hover:border-green-200"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Additional Overview Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Days Active</p>
                    <p className="text-2xl font-bold text-blue-900">12</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Skills Matched</p>
                    <p className="text-2xl font-bold text-green-900">6/7</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Experience</p>
                    <p className="text-2xl font-bold text-purple-900">5+ yrs</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Interviews</p>
                    <p className="text-2xl font-bold text-orange-900">Pending</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matching">
          <div className="space-y-6">
            {/* AI Score Summary */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Overall AI Match Score</h3>
                    <p className="text-gray-600">Comprehensive skill analysis based on job requirements</p>
                  </div>
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-3xl ${getScoreColor(submission.aiScore)} border-2`}>
                    <Star className="w-8 h-8 fill-current" />
                    {submission.aiScore}%
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">6</div>
                    <div className="text-sm text-gray-600">Skills Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">83%</div>
                    <div className="text-sm text-gray-600">Avg. Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">High</div>
                    <div className="text-sm text-gray-600">Match Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Skills Analysis Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Detailed Skills Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-gray-200 hover:bg-gray-50">
                        <TableHead className="font-medium text-gray-600">Skill</TableHead>
                        <TableHead className="font-medium text-gray-600">Category</TableHead>
                        <TableHead className="font-medium text-gray-600">Required</TableHead>
                        <TableHead className="font-medium text-gray-600">Candidate</TableHead>
                        <TableHead className="font-medium text-gray-600">Experience</TableHead>
                        <TableHead className="font-medium text-gray-600 text-center">Match Score</TableHead>
                        <TableHead className="font-medium text-gray-600">Match Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiMatchingData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-gray-50 transition-colors border-gray-200">
                          <TableCell className="font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              {item.skill}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-gray-700">{item.required}</TableCell>
                          <TableCell className="font-medium text-gray-700">{item.candidate}</TableCell>
                          <TableCell className="text-gray-600">{item.yearsExp} years</TableCell>
                          <TableCell className="text-center">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm ${getScoreColor(item.score)} border`}>
                              {item.score}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-gray-700">
                              {item.score >= 90 ? "Excellent" : 
                               item.score >= 80 ? "Very Good" : 
                               item.score >= 70 ? "Good" : "Fair"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Submission Notes
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Keep track of important observations and updates</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                variant={isEditingNotes ? "outline" : "default"}
                className="min-w-[100px]"
              >
                {isEditingNotes ? (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Notes
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">💡 Pro Tip</p>
                    <p className="text-sm text-blue-700">
                      Use @mentions to notify team members, add #tags for categorization, 
                      and include specific dates for better tracking.
                    </p>
                  </div>
                  <Textarea
                    value={notes || submission.notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your detailed notes here..."
                    rows={8}
                    className="resize-none text-sm leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditingNotes(false)} className="flex-1">
                      <Save className="w-4 h-4 mr-1" />
                      Save Notes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingNotes(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {notes || submission.notes}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                    <span>Last updated: January 22, 2024 at 3:45 PM</span>
                    <span>By: Jane Doe</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-6">
            {/* Task Creation */}
            <Card className="shadow-sm border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Create New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter task description..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" className="px-6">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Task Management
                </CardTitle>
                
                {/* Task Filters and Search */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={tasksSearch}
                      onChange={(e) => setTasksSearch(e.target.value)}
                      className="pl-10 border-green-200 focus:border-green-400"
                    />
                  </div>
                  <Select value={tasksFilter} onValueChange={setTasksFilter}>
                    <SelectTrigger className="w-40 border-green-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tasksSort} onValueChange={setTasksSort}>
                    <SelectTrigger className="w-32 border-green-200">
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
                    <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.assignee}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {task.dueDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Est: {task.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge 
                            variant={task.status === "Completed" ? "default" : "outline"}
                            className={task.status === "Completed" ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {task.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                              <DropdownMenuItem className="hover:bg-gray-50">
                                <Send className="w-4 h-4 mr-2 text-blue-600" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-50">
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                Send SMS
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-50">
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                Send WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-50">
                                <Edit className="w-4 h-4 mr-2 text-gray-600" />
                                Edit Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="todos">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                Todo List
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Manage your personal todos for this submission</p>
              
              {/* Todo Filters and Search */}
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
                  <div key={todo.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => {
                            setTodosData(prev => prev.map(t => 
                              t.id === todo.id ? { ...t, completed: !t.completed } : t
                            ));
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <div className="flex-1">
                          <h4 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {todo.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Due: {todo.dueDate}</span>
                            <span>Category: {todo.category}</span>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Document Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">View and manage all candidate documents</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentsData.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 ${doc.color}`}>
                          <doc.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={doc.status === "Reviewed" ? "text-green-700 bg-green-50 border-green-200" : "text-yellow-700 bg-yellow-50 border-yellow-200"}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium">{doc.size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Uploaded:</span>
                        <span className="font-medium">{doc.uploadDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 hover:bg-blue-50 hover:border-blue-200">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 hover:bg-green-50 hover:border-green-200">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Upload New Document */}
              <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drag & drop files here or click to browse</p>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Activity Timeline
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Complete history of submission activities and changes</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timelineData.map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                        item.type === 'Submission' ? 'bg-blue-100 text-blue-600 border-2 border-blue-200' :
                        item.type === 'Note' ? 'bg-green-100 text-green-600 border-2 border-green-200' :
                        item.type === 'Status' ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-200' :
                        item.type === 'Task' ? 'bg-purple-100 text-purple-600 border-2 border-purple-200' :
                        'bg-orange-100 text-orange-600 border-2 border-orange-200'
                      }`}>
                        {item.type === 'Submission' && <UserCheck className="w-5 h-5" />}
                        {item.type === 'Note' && <FileText className="w-5 h-5" />}
                        {item.type === 'Status' && <AlertCircle className="w-5 h-5" />}
                        {item.type === 'Task' && <CheckCircle className="w-5 h-5" />}
                        {item.type === 'Communication' && <Mail className="w-5 h-5" />}
                      </div>
                      {index < timelineData.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2 group-hover:bg-gray-300 transition-colors"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <Card className="hover:shadow-md transition-shadow border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">by {item.user}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.date} • {item.time}
                            </div>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.description}</h4>
                          <p className="text-sm text-gray-600">{item.details}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <Edit className="w-4 h-4 mr-2" />
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
        </TabsContent>

        {/* Pitch Tab */}
        <TabsContent value="pitch" className="space-y-6">
          {/* Job Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Position</h4>
                  <p className="text-gray-900">{submission.jobTitle}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Company</h4>
                  <p className="text-gray-900">{submission.company}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Location</h4>
                  <p className="text-gray-900">{submission.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Job Type</h4>
                  <p className="text-gray-900">Full-time</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Key Requirements</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>5+ years of React development experience</li>
                  <li>Strong knowledge of JavaScript/TypeScript</li>
                  <li>Experience with modern frontend tools and workflows</li>
                  <li>Bachelor's degree in Computer Science or related field</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Client Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Company</h4>
                  <p className="text-gray-900">{submission.company}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Industry</h4>
                  <p className="text-gray-900">Technology</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Company Size</h4>
                  <p className="text-gray-900">500-1000 employees</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Partnership Status</h4>
                  <p className="text-gray-900">Active Client</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">About the Company</h4>
                <p className="text-gray-700">A leading technology company focused on innovative software solutions, serving Fortune 500 clients globally with cutting-edge digital transformation services.</p>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Skill Matching Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Candidate Skill Matching Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Required Level</TableHead>
                      <TableHead>Candidate Level</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiMatchingData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.skill}</TableCell>
                        <TableCell>{item.required}</TableCell>
                        <TableCell>{item.candidate}</TableCell>
                        <TableCell>
                          <Badge variant={item.score >= 90 ? "default" : item.score >= 80 ? "secondary" : "outline"}>
                            {item.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>{item.yearsExp} years</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Areas of Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Areas of Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">TypeScript Proficiency</h4>
                  <p className="text-yellow-700 text-sm">While the candidate has intermediate TypeScript skills, advancing to expert level would enhance their match score from 70% to 90%.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Cloud Technologies</h4>
                  <p className="text-blue-700 text-sm">Expanding knowledge in advanced AWS services and cloud architecture patterns would be beneficial for senior-level responsibilities.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Leadership Experience</h4>
                  <p className="text-green-700 text-sm">Gaining more experience in team leadership and mentoring would align with the senior developer role requirements.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Jobs of Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Other Jobs That Could Be of Interest
              </CardTitle>
              <p className="text-sm text-gray-600">Based on candidate skills and location preferences</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">Frontend Tech Lead</h4>
                    <Badge variant="default" className="bg-green-100 text-green-800">95% match</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">FinanceFlow • Remote • $140k-160k</p>
                  <p className="text-gray-700 text-sm">Leading a team of frontend developers building fintech applications with React and TypeScript.</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">Senior Full Stack Developer</h4>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">88% match</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">CloudTech Solutions • San Francisco, CA • $130k-150k</p>
                  <p className="text-gray-700 text-sm">Building scalable web applications using React, Node.js, and AWS cloud services.</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">React Developer</h4>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">82% match</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">AI Innovations • San Francisco, CA • $120k-140k</p>
                  <p className="text-gray-700 text-sm">Developing user interfaces for AI-powered applications using modern React ecosystem.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Personalization Settings Dialog */}
      <SubmissionDetailPersonalizationSettings
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        currentSettings={personalizationSettings}
        onSave={(settings) => {
          setPersonalizationSettings(settings);
          localStorage.setItem('submissionDetailPersonalization', JSON.stringify(settings));
        }}
      />
    </div>
  );
};

export default SubmissionDetail;
