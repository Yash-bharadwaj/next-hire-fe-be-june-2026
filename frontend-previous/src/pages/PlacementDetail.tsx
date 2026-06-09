import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  User,
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Edit,
  Save,
  Upload,
  Download,
  Plus,
  Clock,
  Target,
  AlertCircle,
  Star,
  Award,
  Shield,
  ChevronRight,
  ChevronDown,
  BarChart3,
  PieChart,
  LineChart,
  Timer,
  MapPin,
  Wallet,
  CreditCard,
  FileCheck,
  UserCheck,
  Building2,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  StickyNote,
  CheckSquare,
  FolderOpen,
  ClipboardList,
  MoreVertical,
  Send,
  MessageCircle,
  Zap,
  ExternalLink,
  Brain,
  Calculator,
  MoreHorizontal,
  Search,
  UserCog,
  Bot
} from "lucide-react";
import PlacementDetailPersonalizationSettings from "@/components/PlacementDetailPersonalizationSettings";

// Mock placement data
const mockPlacementData = {
  placementId: "PL-2024-001",
  candidateId: "1", // Matches submissions.json candidate ID
  candidateName: "Sarah Johnson",
  candidateEmail: "sarah.johnson@email.com",
  candidatePhone: "+1 (555) 123-4567",
  jobId: "JOB-2024-001", // Matches jobs.json jobId
  jobTitle: "Senior React Developer",
  jobDescription: "We are looking for a senior React developer to join our growing team and lead frontend development initiatives.",
  clientId: "1",
  clientName: "TechCorp Inc",
  clientContact: "John Smith",
  contactEmail: "john.smith@techcorp.com",
  contactPhone: "+1 (555) 987-6543",
  accountManager: "Lisa Chen",
  accountManagerEmail: "lisa.chen@company.com",
  accountManagerPhone: "+1 (555) 234-5678",
  poNumber: "PO-2024-1234",
  poValidity: "2024-12-31",
  plannedStartDate: "2024-02-01",
  plannedEndDate: "2024-12-31",
  actualStartDate: "2024-02-05",
  actualEndDate: "",
  billRate: "$150/hour",
  payRate: "$120/hour",
  payrollStartDate: "2024-02-05",
  payrollFrequency: "Bi-weekly",
  status: "Active",
  supplierId: "SUP-2024-008",
  supplierName: "Global Staffing Solutions",
  supplierPONumber: "SPO-2024-567",
  supplierPOValidity: "2024-12-31",
  primaryRecruiter: "Jane Doe",
  teamLead: "Mike Johnson",
  hiringManager: "David Wilson",
  salesRepresentative: "Lisa Chen",
  supplierContact: "Robert Kim",
  onboardingOwner: "Amanda Foster",
  aiMatchingScore: 92,
  profitability: {
    totalRevenue: 240000,
    totalCosts: 180000,
    grossProfit: 60000,
    marginPercentage: 25
  }
};

const mockNotes = [
  { id: 1, content: "Initial placement agreement signed", author: "Jane Doe", date: "2024-01-15", type: "general" },
  { id: 2, content: "Candidate successfully passed background check", author: "HR Team", date: "2024-01-20", type: "compliance" },
  { id: 3, content: "Client requested extension of contract", author: "Mike Johnson", date: "2024-01-25", type: "update" }
];

const mockTasks = [
  { id: 1, title: "Complete onboarding documents", assignee: "Amanda Foster", dueDate: "2024-02-01", status: "completed", priority: "high" },
  { id: 2, title: "Schedule quarterly review", assignee: "Jane Doe", dueDate: "2024-04-15", status: "pending", priority: "medium" },
  { id: 3, title: "Renewal discussion with client", assignee: "Lisa Chen", dueDate: "2024-11-01", status: "pending", priority: "high" }
];

const mockDocuments = [
  { id: 1, name: "Employment Agreement", type: "PDF", uploadDate: "2024-01-15", uploadedBy: "Jane Doe", size: "2.5 MB" },
  { id: 2, name: "Background Check Report", type: "PDF", uploadDate: "2024-01-20", uploadedBy: "HR Team", size: "1.2 MB" },
  { id: 3, name: "Tax Forms (W4)", type: "PDF", uploadDate: "2024-01-25", uploadedBy: "Payroll", size: "850 KB" }
];

const mockActivityLog = [
  { id: 1, action: "Placement created", user: "Jane Doe", timestamp: "2024-01-15 10:30 AM", details: "Initial placement record created" },
  { id: 2, action: "Contract uploaded", user: "Legal Team", timestamp: "2024-01-15 2:45 PM", details: "Employment agreement uploaded" },
  { id: 3, action: "Candidate started", user: "Amanda Foster", timestamp: "2024-02-05 9:00 AM", details: "Candidate officially started position" },
  { id: 4, action: "First invoice sent", user: "Billing", timestamp: "2024-02-15 4:30 PM", details: "First billing cycle processed" }
];

const mockOnboardingDocuments = [
  { id: 1, name: "Employee Handbook", required: true, completed: true, completedDate: "2024-02-01" },
  { id: 2, name: "IT Security Training", required: true, completed: true, completedDate: "2024-02-02" },
  { id: 3, name: "Company Policies Acknowledgment", required: true, completed: false, completedDate: null },
  { id: 4, name: "Emergency Contact Form", required: true, completed: true, completedDate: "2024-02-01" }
];

const mockOnboardingChecklist = [
  { id: 1, task: "Background check completed", completed: true, completedBy: "HR Team", completedDate: "2024-01-20" },
  { id: 2, task: "Drug screening passed", completed: true, completedBy: "HR Team", completedDate: "2024-01-22" },
  { id: 3, task: "IT equipment assigned", completed: true, completedBy: "IT Department", completedDate: "2024-02-01" },
  { id: 4, task: "Office access card issued", completed: true, completedBy: "Security", completedDate: "2024-02-01" },
  { id: 5, task: "Payroll setup completed", completed: false, completedBy: "", completedDate: null },
  { id: 6, task: "Benefits enrollment", completed: false, completedBy: "", completedDate: null }
];

const mockSubmissionComments = [
  { id: 1, content: "Candidate has excellent React skills and fits perfectly with the team culture", author: "Jane Doe", date: "2024-01-15", type: "relevancy" },
  { id: 2, content: "Client interview went very well. They're excited to have Sarah on board", author: "Lisa Chen", date: "2024-01-18", type: "submission" },
  { id: 3, content: "Rate negotiation successful. Both parties satisfied with the agreement", author: "Mike Johnson", date: "2024-01-20", type: "submission" }
];

const mockInternalComments = [
  { id: 1, content: "Need to follow up on background check status", author: "HR Team", date: "2024-01-16", type: "internal", priority: "medium" },
  { id: 2, content: "Client mentioned possible extension after 6 months", author: "Lisa Chen", date: "2024-01-22", type: "internal", priority: "high" },
  { id: 3, content: "Candidate requested flexible work arrangements", author: "Jane Doe", date: "2024-01-25", type: "internal", priority: "low" }
];

const mockEvaluations = [
  { id: 1, title: "30-Day Review", status: "completed", date: "2024-03-05", score: 4.5, reviewer: "David Wilson", notes: "Excellent performance, exceeding expectations" },
  { id: 2, title: "60-Day Review", status: "pending", date: "2024-04-05", score: null, reviewer: "David Wilson", notes: "" },
  { id: 3, title: "90-Day Review", status: "scheduled", date: "2024-05-05", score: null, reviewer: "David Wilson", notes: "" }
];

const PlacementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState(mockNotes);
  const [newNote, setNewNote] = useState("");
  const [tasks, setTasks] = useState(mockTasks);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", dueDate: "", priority: "medium" });
  const [submissionComments, setSubmissionComments] = useState(mockSubmissionComments);
  const [newSubmissionComment, setNewSubmissionComment] = useState("");
  const [internalComments, setInternalComments] = useState(mockInternalComments);
  const [newInternalComment, setNewInternalComment] = useState("");
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  
  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Load personalization settings and event listener
  useEffect(() => {
    const saved = localStorage.getItem('placementDetailPersonalization');
    if (saved) {
      try { setPersonalizationSettings(JSON.parse(saved)); } catch (error) {}
    }
    
    const handleOpenPersonalization = () => setIsPersonalizationOpen(true);
    window.addEventListener('openPersonalizationSettings', handleOpenPersonalization);
    return () => window.removeEventListener('openPersonalizationSettings', handleOpenPersonalization);
  }, []);
  
  // Collapsible states for each section
  const [collapsedSections, setCollapsedSections] = useState({
    headerJob: true,
    headerCandidate: true,
    headerClient: true,
    headerContract: true,
    candidate: false,
    job: false,
    client: false,
    timeline: false,
    contract: false,
    financial: false,
    supplier: false,
    team: false,
    documents: false,
    activity: false,
    profitability: false,
    onboardingDocs: false,
    onboardingChecklist: false,
    submissionComments: false,
    internalComments: false,
    evaluations: false
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: notes.length + 1,
        content: newNote,
        author: "Current User",
        date: new Date().toISOString().split('T')[0],
        type: "general"
      };
      setNotes([...notes, note]);
      setNewNote("");
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: tasks.length + 1,
        title: newTask.title,
        assignee: newTask.assignee,
        dueDate: newTask.dueDate,
        status: "pending",
        priority: newTask.priority
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", assignee: "", dueDate: "", priority: "medium" });
    }
  };

  const handleAddSubmissionComment = () => {
    if (newSubmissionComment.trim()) {
      const comment = {
        id: submissionComments.length + 1,
        content: newSubmissionComment,
        author: "Current User",
        date: new Date().toISOString().split('T')[0],
        type: "submission"
      };
      setSubmissionComments([...submissionComments, comment]);
      setNewSubmissionComment("");
    }
  };

  const handleAddInternalComment = () => {
    if (newInternalComment.trim()) {
      const comment = {
        id: internalComments.length + 1,
        content: newInternalComment,
        author: "Current User",
        date: new Date().toISOString().split('T')[0],
        type: "internal",
        priority: "medium"
      };
      setInternalComments([...internalComments, comment]);
      setNewInternalComment("");
    }
  };

  const handleActionTrigger = (action: string) => {
    // Placeholder for action handling
    console.log(`Triggered action: ${action}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
        {/* Enhanced Header Section with Key Details */}
        <Card className="border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
            {/* Main Placement Info */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg backdrop-blur-sm border border-primary/20">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">
                      {mockPlacementData.placementId}
                    </h1>
                    <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {mockPlacementData.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    <span className="font-semibold">{mockPlacementData.candidateName}</span> • 
                    <span className="ml-2">{mockPlacementData.jobTitle}</span> • 
                    <span className="ml-2">{mockPlacementData.clientName}</span>
                  </p>
                </div>
              </div>
              
              {/* AI Score & Profitability */}
              <div className="flex items-center gap-6">
                <div className="text-center bg-primary/5 rounded-lg p-3 backdrop-blur-sm border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-primary" />
                    <p className="text-muted-foreground text-sm">AI Match Score</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{mockPlacementData.aiMatchingScore}%</p>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-3 backdrop-blur-sm border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <p className="text-muted-foreground text-sm">Profitability</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{mockPlacementData.profitability.marginPercentage}%</p>
                </div>
                
                {/* Actions Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                      <MoreVertical className="w-4 h-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Communication</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleActionTrigger('email')}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionTrigger('text')}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Text
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Tasks</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleActionTrigger('task')}>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Create Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionTrigger('reminder')}>
                      <Clock className="w-4 h-4 mr-2" />
                      Set Reminder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      className="flex items-center gap-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      Actions
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
                    <DropdownMenuItem 
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                      {isEditing ? "Save Changes" : "Edit Placement"}
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

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Collapsible open={!collapsedSections.headerJob} onOpenChange={() => toggleSection('headerJob')}>
                <Card className="bg-blue-50 border-blue-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Briefcase className="w-4 h-4" />
                          Job Details
                        </div>
                        {collapsedSections.headerJob ? <ChevronRight className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Job ID</p>
                        <button 
                          onClick={() => navigate(`/dashboard/jobs`)}
                          className="text-sm font-semibold hover:underline flex items-center gap-1 cursor-pointer text-blue-700"
                        >
                          {mockPlacementData.jobId}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <button 
                          onClick={() => navigate(`/dashboard/jobs`)}
                          className="text-xs text-blue-600 hover:underline line-clamp-2 flex items-start gap-1 cursor-pointer text-left"
                        >
                          {mockPlacementData.jobDescription}
                          <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        </button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible open={!collapsedSections.headerCandidate} onOpenChange={() => toggleSection('headerCandidate')}>
                <Card className="bg-purple-50 border-purple-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-purple-700">
                          <User className="w-4 h-4" />
                          Applicant
                        </div>
                        {collapsedSections.headerCandidate ? <ChevronRight className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Candidate ID</p>
                        <button 
                          onClick={() => navigate(`/dashboard/candidates`)}
                          className="text-sm font-semibold hover:underline flex items-center gap-1 cursor-pointer text-purple-700"
                        >
                          {mockPlacementData.candidateId}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <button 
                          onClick={() => navigate(`/dashboard/candidates`)}
                          className="text-sm hover:underline flex items-center gap-1 cursor-pointer text-purple-700"
                        >
                          {mockPlacementData.candidateName}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible open={!collapsedSections.headerClient} onOpenChange={() => toggleSection('headerClient')}>
                <Card className="bg-amber-50 border-amber-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-amber-700">
                          <Building2 className="w-4 h-4" />
                          Account & Client
                        </div>
                        {collapsedSections.headerClient ? <ChevronRight className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Account Manager</p>
                        <p className="text-sm text-amber-700">{mockPlacementData.accountManager}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Client Contact</p>
                        <p className="text-sm text-amber-700">{mockPlacementData.clientContact}</p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible open={!collapsedSections.headerContract} onOpenChange={() => toggleSection('headerContract')}>
                <Card className="bg-green-50 border-green-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <FileText className="w-4 h-4" />
                          Contract
                        </div>
                        {collapsedSections.headerContract ? <ChevronRight className="w-4 h-4 text-green-600" /> : <ChevronDown className="w-4 h-4 text-green-600" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Bill Rate</p>
                        <p className="text-sm font-semibold text-green-700">{mockPlacementData.billRate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pay Rate</p>
                        <p className="text-sm text-green-700">{mockPlacementData.payRate}</p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Gross Profit", value: `$${mockPlacementData.profitability.grossProfit.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Margin", value: `${mockPlacementData.profitability.marginPercentage}%`, icon: PieChart, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Bill Rate", value: mockPlacementData.billRate, icon: Wallet, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Pay Rate", value: mockPlacementData.payRate, icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Split Screen Layout with Interactive Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <Globe className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submission" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <Send className="w-4 h-4 mr-2" />
              Submission
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="notes-tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <StickyNote className="w-4 h-4 mr-2" />
              Notes & Tasks
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <ClipboardList className="w-4 h-4 mr-2" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <FolderOpen className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="profitability" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <BarChart3 className="w-4 h-4 mr-2" />
              Profitability
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <UserCheck className="w-4 h-4 mr-2" />
              Onboarding
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Split Screen Layout */}
          <TabsContent value="overview" className="space-y-6">
            {/* Split Screen: Job Details & Candidate Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Details Pane */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-600" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Label className="text-sm font-medium text-green-800">Job ID</Label>
                      <Link to={`/dashboard/jobs/${mockPlacementData.jobId}`} className="text-sm font-mono text-green-600 hover:underline flex items-center gap-1">
                        {mockPlacementData.jobId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Label className="text-sm font-medium text-green-800">Job Title</Label>
                      <p className="text-sm font-semibold">{mockPlacementData.jobTitle}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Label className="text-sm font-medium text-green-800">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{mockPlacementData.jobDescription}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Label className="text-sm font-medium text-green-800">Bill Rate</Label>
                      <p className="text-lg font-bold text-green-600">{mockPlacementData.billRate}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Label className="text-sm font-medium text-green-800">Pay Rate</Label>
                      <p className="text-lg font-bold text-green-600">{mockPlacementData.payRate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Details Pane */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Candidate Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Label className="text-sm font-medium text-blue-800">Candidate ID</Label>
                      <Link to={`/dashboard/candidates/${mockPlacementData.candidateId}`} className="text-sm font-mono text-blue-600 hover:underline flex items-center gap-1">
                        {mockPlacementData.candidateId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Label className="text-sm font-medium text-blue-800">AI Match Score</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-blue-600">{mockPlacementData.aiMatchingScore}%</p>
                        <Brain className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800">Name</Label>
                    <Link to={`/dashboard/candidates/${mockPlacementData.candidateId}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                      {mockPlacementData.candidateName}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Label className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        Email
                      </Label>
                      <p className="text-sm text-blue-600">{mockPlacementData.candidateEmail}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Label className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Phone
                      </Label>
                      <p className="text-sm text-blue-600">{mockPlacementData.candidatePhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collapsible Information Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Candidate Information */}
              <Collapsible open={!collapsedSections.candidate} onOpenChange={() => toggleSection('candidate')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Candidate Information</span>
                        {collapsedSections.candidate ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Star className="w-3 h-3" />
                            Candidate ID
                          </Label>
                          <p className="text-sm font-mono bg-green-50 px-2 py-1 rounded mt-1">{mockPlacementData.candidateId}</p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Name</Label>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{mockPlacementData.candidateName}</p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            Email
                          </Label>
                          <p className="text-sm text-green-600 hover:text-green-800 cursor-pointer mt-1">
                            {mockPlacementData.candidateEmail}
                          </p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            Phone
                          </Label>
                          <p className="text-sm text-green-600 hover:text-green-800 cursor-pointer mt-1">
                            {mockPlacementData.candidatePhone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Job Information */}
              <Collapsible open={!collapsedSections.job} onOpenChange={() => toggleSection('job')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <Briefcase className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Job Information</span>
                        {collapsedSections.job ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Job ID</Label>
                          <p className="text-sm font-mono bg-green-50 px-2 py-1 rounded mt-1">{mockPlacementData.jobId}</p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Job Title</Label>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{mockPlacementData.jobTitle}</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Client Information */}
              <Collapsible open={!collapsedSections.client} onOpenChange={() => toggleSection('client')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Client Information</span>
                        {collapsedSections.client ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Client ID</Label>
                          <p className="text-sm font-mono bg-green-50 px-2 py-1 rounded mt-1">{mockPlacementData.clientId}</p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Client Name</Label>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{mockPlacementData.clientName}</p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Contact Person</Label>
                          <p className="text-sm text-gray-600 mt-1">{mockPlacementData.clientContact}</p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            Contact Email
                          </Label>
                          <p className="text-sm text-green-600 hover:text-green-800 cursor-pointer mt-1">
                            {mockPlacementData.contactEmail}
                          </p>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            Contact Phone
                          </Label>
                          <p className="text-sm text-green-600 hover:text-green-800 cursor-pointer mt-1">
                            {mockPlacementData.contactPhone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Timeline Progress Bar */}
            <Collapsible open={!collapsedSections.timeline} onOpenChange={() => toggleSection('timeline')}>
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Timer className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Contract Timeline</span>
                      {collapsedSections.timeline ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Planned Start: {mockPlacementData.plannedStartDate}</span>
                        <span>Planned End: {mockPlacementData.plannedEndDate}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Started: {mockPlacementData.actualStartDate}</span>
                        <span>75% Complete</span>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Contract & Financial Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contract Details */}
              <Collapsible open={!collapsedSections.contract} onOpenChange={() => toggleSection('contract')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Contract Details</span>
                        <div className="ml-auto flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          {collapsedSections.contract ? (
                            <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">PO Number</Label>
                          <p className="text-sm font-mono bg-green-50 px-2 py-1 rounded mt-1">{mockPlacementData.poNumber}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">PO Validity</Label>
                          <p className="text-sm mt-1">{mockPlacementData.poValidity}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Planned Start
                          </Label>
                          <p className="text-sm mt-1">{mockPlacementData.plannedStartDate}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Planned End
                          </Label>
                          <p className="text-sm mt-1">{mockPlacementData.plannedEndDate}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Actual Start
                          </Label>
                          <p className="text-sm font-semibold text-green-700 mt-1">{mockPlacementData.actualStartDate}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Label className="text-sm font-medium text-gray-600">Actual End</Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {mockPlacementData.actualEndDate || "Ongoing"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Financial Details */}
              <Collapsible open={!collapsedSections.financial} onOpenChange={() => toggleSection('financial')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Financial Details</span>
                        {collapsedSections.financial ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Bill Rate</Label>
                          <p className="text-lg font-bold text-green-600 mt-1">{mockPlacementData.billRate}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Pay Rate</Label>
                          <p className="text-lg font-bold text-green-600 mt-1">{mockPlacementData.payRate}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Payroll Start</Label>
                          <p className="text-sm mt-1">{mockPlacementData.payrollStartDate}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Payroll Frequency</Label>
                          <p className="text-sm mt-1">{mockPlacementData.payrollFrequency}</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Supplier & Team Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Supplier Information */}
              <Collapsible open={!collapsedSections.supplier} onOpenChange={() => toggleSection('supplier')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <Building className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Supplier Information</span>
                        {collapsedSections.supplier ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Supplier ID</Label>
                          <p className="text-sm font-mono bg-green-50 px-2 py-1 rounded mt-1">{mockPlacementData.supplierId}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Supplier Name</Label>
                          <p className="text-sm font-semibold mt-1">{mockPlacementData.supplierName}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Supplier PO</Label>
                          <p className="text-sm mt-1">{mockPlacementData.supplierPONumber}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">PO Validity</Label>
                          <p className="text-sm mt-1">{mockPlacementData.supplierPOValidity}</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Team & Contacts */}
              <Collapsible open={!collapsedSections.team} onOpenChange={() => toggleSection('team')}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-100/30 -z-10"></div>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="relative cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <span>Team & Contacts</span>
                        {collapsedSections.team ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Primary Recruiter</Label>
                          <p className="text-sm mt-1">{mockPlacementData.primaryRecruiter}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Team Lead</Label>
                          <p className="text-sm mt-1">{mockPlacementData.teamLead}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Hiring Manager</Label>
                          <p className="text-sm mt-1">{mockPlacementData.hiringManager}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Sales Rep</Label>
                          <p className="text-sm mt-1">{mockPlacementData.salesRepresentative}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Supplier Contact</Label>
                          <p className="text-sm mt-1">{mockPlacementData.supplierContact}</p>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg border border-green-100">
                          <Label className="text-sm font-medium text-green-800">Onboarding Owner</Label>
                          <p className="text-sm mt-1">{mockPlacementData.onboardingOwner}</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </TabsContent>

          {/* Submission Tab */}
          <TabsContent value="submission" className="space-y-6">
            <Collapsible open={!collapsedSections.submissionComments} onOpenChange={() => toggleSection('submissionComments')}>
              <Card className="border-0 shadow-lg">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-green-600" />
                      Relevancy & Submission Comments
                      {collapsedSections.submissionComments ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Comments related to client submission and candidate relevancy
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add submission comment or relevancy note..."
                        value={newSubmissionComment}
                        onChange={(e) => setNewSubmissionComment(e.target.value)}
                        className="min-h-20"
                      />
                      <Button onClick={handleAddSubmissionComment} size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Submission Comment
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {submissionComments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 border-0">
                              {comment.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          <div className="text-xs text-gray-500">
                            <span>by {comment.author}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Collapsible open={!collapsedSections.internalComments} onOpenChange={() => toggleSection('internalComments')}>
              <Card className="border-0 shadow-lg">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Internal Comments
                      {collapsedSections.internalComments ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Internal team comments and notes not visible to client
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add internal comment..."
                        value={newInternalComment}
                        onChange={(e) => setNewInternalComment(e.target.value)}
                        className="min-h-20"
                      />
                      <Button onClick={handleAddInternalComment} size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Internal Comment
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {internalComments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800 border-0">
                                Internal
                              </Badge>
                              <Badge className={`${getPriorityColor(comment.priority)} border-0`} variant="secondary">
                                {comment.priority}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          <div className="text-xs text-gray-500">
                            <span>by {comment.author}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Notes & Tasks Tab */}
          <TabsContent value="notes-tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notes Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a new note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-20"
                    />
                    <Button onClick={handleAddNote} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <p className="text-sm">{note.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{note.author}</span>
                          <span>{note.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Assignee"
                        value={newTask.assignee}
                        onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                      />
                      <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      />
                    </div>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddTask} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)} variant="secondary">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Assigned to: {task.assignee}</span>
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <Collapsible open={!collapsedSections.evaluations} onOpenChange={() => toggleSection('evaluations')}>
              <Card className="border-0 shadow-lg">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-purple-600" />
                      Performance Evaluations
                      {collapsedSections.evaluations ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Track candidate performance reviews and evaluations
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Evaluation
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {evaluations.map((evaluation) => (
                        <Card key={evaluation.id} className="border border-purple-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-purple-800">{evaluation.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={`${
                                    evaluation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    evaluation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  } border-0`}
                                >
                                  {evaluation.status}
                                </Badge>
                                <span className="text-sm text-gray-500">{evaluation.date}</span>
                              </div>
                            </div>
                            {evaluation.score && (
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-sm text-gray-600">Score:</span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`w-4 h-4 ${
                                        star <= evaluation.score 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm font-semibold ml-2">{evaluation.score}/5</span>
                                </div>
                              </div>
                            )}
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Reviewer:</span> {evaluation.reviewer}
                            </div>
                            {evaluation.notes && (
                              <div className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                                <span className="font-medium">Notes:</span> {evaluation.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Collapsible open={!collapsedSections.documents} onOpenChange={() => toggleSection('documents')}>
              <Card className="border-0 shadow-lg">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      Documents
                      {collapsedSections.documents ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Upload and manage placement-related documents
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      {mockDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Collapsible open={!collapsedSections.activity} onOpenChange={() => toggleSection('activity')}>
              <Card className="border-0 shadow-lg">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center gap-3">
                      <Activity className="w-5 h-5" />
                      Activity Log
                      {collapsedSections.activity ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Track all activities and changes related to this placement
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      {mockActivityLog.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <span className="text-xs text-gray-500">{activity.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                            <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Enhanced Profitability Tab */}
          <TabsContent value="profitability" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${mockPlacementData.profitability.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">↗ +12% vs last quarter</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Total Costs</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${mockPlacementData.profitability.totalCosts.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">↘ -5% vs last quarter</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-full">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Gross Profit</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ${mockPlacementData.profitability.grossProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">↗ +18% vs last quarter</p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-full">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Margin %</p>
                      <p className="text-3xl font-bold text-amber-600">
                        {mockPlacementData.profitability.marginPercentage}%
                      </p>
                      <p className="text-xs text-amber-600 mt-1">↗ +3% vs last quarter</p>
                    </div>
                    <div className="p-3 bg-amber-200 rounded-full">
                      <PieChart className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Billable Hours</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">$180,000</p>
                        <p className="text-xs text-gray-500">75%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Fixed Fee</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">$40,000</p>
                        <p className="text-xs text-gray-500">17%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Bonus/Incentives</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">$20,000</p>
                        <p className="text-xs text-gray-500">8%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Candidate Salary</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">$120,000</p>
                        <p className="text-xs text-gray-500">67%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Benefits & Taxes</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">$36,000</p>
                        <p className="text-xs text-gray-500">20%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Admin & Overhead</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">$24,000</p>
                        <p className="text-xs text-gray-500">13%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <h3 className="text-sm font-medium text-green-700 mb-2">ROI</h3>
                    <p className="text-2xl font-bold text-green-600">33.3%</p>
                    <p className="text-xs text-green-600 mt-1">Return on Investment</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Cost Per Hour</h3>
                    <p className="text-2xl font-bold text-blue-600">$90</p>
                    <p className="text-xs text-blue-600 mt-1">Average hourly cost</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">Efficiency</h3>
                    <p className="text-2xl font-bold text-purple-600">87%</p>
                    <p className="text-xs text-purple-600 mt-1">Billable vs Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Onboarding Documents */}
              <Collapsible open={!collapsedSections.onboardingDocs} onOpenChange={() => toggleSection('onboardingDocs')}>
                <Card className="border-0 shadow-lg">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <FileText className="w-5 h-5" />
                        Onboarding Documents
                        {collapsedSections.onboardingDocs ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {mockOnboardingDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${doc.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              {doc.required && (
                                <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {doc.completed ? (
                              <div className="text-xs text-green-600">
                                <p>Completed</p>
                                <p>{doc.completedDate}</p>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Onboarding Checklist */}
              <Collapsible open={!collapsedSections.onboardingChecklist} onOpenChange={() => toggleSection('onboardingChecklist')}>
                <Card className="border-0 shadow-lg">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <CardTitle className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5" />
                        Onboarding Checklist
                        {collapsedSections.onboardingChecklist ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto transition-transform duration-300" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {mockOnboardingChecklist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={item.completed}
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                            <div>
                              <p className="text-sm font-medium">{item.task}</p>
                              {item.completed && (
                                <p className="text-xs text-gray-500">
                                  Completed by {item.completedBy} on {item.completedDate}
                                </p>
                              )}
                            </div>
                          </div>
                          {!item.completed && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </TabsContent>

        </Tabs>

        {/* Personalization Settings Dialog */}
        <PlacementDetailPersonalizationSettings
          isOpen={isPersonalizationOpen}
          onClose={() => setIsPersonalizationOpen(false)}
          currentSettings={personalizationSettings}
          onSave={(settings) => {
            setPersonalizationSettings(settings);
            localStorage.setItem('placementDetailPersonalization', JSON.stringify(settings));
          }}
        />
    </div>
  );
};

export default PlacementDetail;