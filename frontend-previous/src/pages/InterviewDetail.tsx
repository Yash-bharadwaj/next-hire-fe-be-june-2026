import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  MapPin,
  FileText,
  CheckSquare,
  Upload,
  Save,
  Edit,
  Phone,
  Mail,
  MessageSquare,
  Briefcase,
  User,
  Building,
  DollarSign,
  Star,
  ExternalLink,
  Award,
  Download,
  Plus,
  CheckCircle2,
  Circle,
  Clock4,
  PlayCircle,
  Search,
  Filter,
  Tags,
  BookOpen,
  PenTool,
  History,
  Archive,
  Share2,
  Bookmark,
  Bot,
  UserCog,
  MoreHorizontal,
  ChevronDown,
  Trash2,
  Calendar
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DocumentsManager, Document as DocumentType } from "@/components/DocumentsManager";
import InterviewDetailPersonalizationSettings from "@/components/InterviewDetailPersonalizationSettings";

// Mock interview data
const mockInterviewData = {
  interviewId: "INT-2024-001",
  // Job Information
  jobId: "JOB-2024-001",
  jobTitle: "Senior React Developer",
  jobLocation: "San Francisco, CA",
  billRate: "$150/hour",
  payRate: "$120/hour",
  jobStartDate: "2024-02-01",
  
  // Applicant Information
  applicantName: "Sarah Johnson",
  currentJobTitle: "Frontend Developer",
  applicantLocation: "San Francisco Bay Area",
  noticePeriod: "2 weeks",
  skillMatchingScore: 92,
  applicantPhone: "+1 (555) 123-4567",
  applicantEmail: "sarah.johnson@email.com",
  applicantWhatsapp: "+1 (555) 123-4567",
  
  // Client Information
  clientName: "TechCorp Inc",
  clientContactName: "John Smith",
  clientPhone: "+1 (555) 987-6543",
  clientEmail: "john.smith@techcorp.com",
  clientWhatsapp: "+1 (555) 987-6543",
  
  // Interview Details
  interviewType: "Technical Round",
  interviewDate: "2024-01-25",
  interviewTime: "2:00 PM",
  interviewPanel: ["John Smith", "David Wilson", "Lisa Chen"],
  interviewMedium: "Video Call",
  meetingDetails: "Zoom Link: https://zoom.us/j/123456789",
  evaluationTemplate: "Technical Assessment Template",
  notes: "Candidate shows strong React skills and good communication",
  
  // Notes Structure
  notesData: [
    {
      id: 1,
      title: "Technical Assessment",
      content: "Candidate demonstrates excellent React knowledge with strong understanding of hooks, state management, and component architecture. Showed great problem-solving skills during the coding challenge.",
      author: "John Smith",
      timestamp: "2024-01-25T14:30:00Z",
      tags: ["technical", "react", "positive"],
      category: "technical",
      isPrivate: false
    },
    {
      id: 2,
      title: "Communication Skills",
      content: "Excellent communication throughout the interview. Clear explanations of technical concepts and good questions about the role and company culture.",
      author: "David Wilson",
      timestamp: "2024-01-25T15:15:00Z",
      tags: ["communication", "soft-skills", "positive"],
      category: "behavioral",
      isPrivate: false
    },
    {
      id: 3,
      title: "Areas for Improvement",
      content: "While strong in React, could benefit from more experience with testing frameworks. Suggested resources for Jest and React Testing Library.",
      author: "Lisa Chen",
      timestamp: "2024-01-25T15:45:00Z",
      tags: ["improvement", "testing", "development"],
      category: "feedback",
      isPrivate: true
    }
  ],
  
  // Interview Rounds Structure
  interviewRounds: [
    { 
      id: 1, 
      name: "Phone Screening", 
      status: "completed", 
      date: "2024-01-18", 
      duration: "30 min",
      interviewer: "HR Team",
      feedback: "Good communication skills, cultural fit"
    },
    { 
      id: 2, 
      name: "Technical Round", 
      status: "in-progress", 
      date: "2024-01-25", 
      duration: "60 min",
      interviewer: "John Smith, David Wilson",
      feedback: "Currently scheduled"
    },
    { 
      id: 3, 
      name: "System Design", 
      status: "scheduled", 
      date: "2024-01-30", 
      duration: "45 min",
      interviewer: "Lisa Chen",
      feedback: "Pending completion of technical round"
    },
    { 
      id: 4, 
      name: "Final Interview", 
      status: "pending", 
      date: "TBD", 
      duration: "30 min",
      interviewer: "CEO",
      feedback: "Dependent on previous rounds"
    }
  ],
  todo: [
    { id: 1, title: "Send calendar invite", completed: true, priority: "high", dueDate: "2024-01-20", category: "preparation", assignee: "John Smith" },
    { id: 2, title: "Prepare technical questions", completed: true, priority: "high", dueDate: "2024-01-22", category: "preparation", assignee: "Sarah Johnson" },
    { id: 3, title: "Follow up with feedback", completed: false, priority: "medium", dueDate: "2024-01-26", category: "follow-up", assignee: "Mike Davis" },
    { id: 4, title: "Schedule next round", completed: false, priority: "low", dueDate: "2024-01-28", category: "scheduling", assignee: "Jane Wilson" }
  ],
  documents: [
    { 
      id: 1,
      name: "Interview Notes.pdf", 
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2024-01-15T10:30:00Z",
      uploadedBy: "Sarah Johnson",
      validFrom: "2024-01-15T00:00:00Z",
      validTo: "2025-01-15T23:59:59Z",
      description: "Interview assessment and notes"
    },
    { 
      id: 2,
      name: "Technical Assessment.docx", 
      type: "DOCX",
      size: "1.1 MB",
      uploadDate: "2024-01-16T14:20:00Z",
      uploadedBy: "Michael Chen",
      validFrom: "2024-01-16T00:00:00Z",
      validTo: "2025-01-16T23:59:59Z",
      description: "Technical evaluation results"
    },
    { 
      id: 3,
      name: "Background Check.pdf", 
      type: "PDF",
      size: "856 KB",
      uploadDate: "2024-01-17T09:15:00Z",
      uploadedBy: "HR Department",
      validFrom: "2024-01-17T00:00:00Z",
      validTo: "2025-01-17T23:59:59Z",
      description: "Background verification report"
    }
  ]
};

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(new Date(mockInterviewData.interviewDate));
  const [notes, setNotes] = useState(mockInterviewData.notes);
  const [todo, setTodo] = useState(mockInterviewData.todo);
  const [documents, setDocuments] = useState<DocumentType[]>(mockInterviewData.documents);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("medium");
  const [newTodoCategory, setNewTodoCategory] = useState("general");
  const [todoFilter, setTodoFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rescheduleData, setRescheduleData] = useState<{todoId: number | null, newDate: Date | undefined}>({todoId: null, newDate: undefined});
  const [reassignData, setReassignData] = useState<{todoId: number | null, newAssignee: string}>({todoId: null, newAssignee: ""});
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [notesData, setNotesData] = useState(mockInterviewData.notesData);
  const [notesFilter, setNotesFilter] = useState("all");
  const [notesSearch, setNotesSearch] = useState("");
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general", isPrivate: false });
  const { toast } = useToast();

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Load personalization settings and event listener
  useEffect(() => {
    const saved = localStorage.getItem('interviewDetailPersonalization');
    if (saved) {
      try { setPersonalizationSettings(JSON.parse(saved)); } catch (error) {}
    }
    
    const handleOpenPersonalization = () => setIsPersonalizationOpen(true);
    window.addEventListener('openPersonalizationSettings', handleOpenPersonalization);
    return () => window.removeEventListener('openPersonalizationSettings', handleOpenPersonalization);
  }, []);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todoItem = {
        id: todo.length + 1,
        title: newTodo,
        completed: false,
        priority: newTodoPriority as "high" | "medium" | "low",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        category: newTodoCategory,
        assignee: "John Smith"
      };
      setTodo([...todo, todoItem]);
      setNewTodo("");
      toast({
        title: "Todo added",
        description: "New todo item has been added successfully.",
      });
    }
  };

  const toggleTodo = (todoId: number) => {
    setTodo(todo.map(item => 
      item.id === todoId ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteTodo = (todoId: number) => {
    setTodo(todo.filter(item => item.id !== todoId));
    toast({
      title: "Todo deleted",
      description: "Todo item has been removed.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "preparation": return "bg-blue-100 text-blue-800 border-blue-200";
      case "follow-up": return "bg-purple-100 text-purple-800 border-purple-200";
      case "scheduling": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredTodo = todo.filter(item => {
    const matchesFilter = todoFilter === "all" || 
      (todoFilter === "completed" && item.completed) ||
      (todoFilter === "pending" && !item.completed) ||
      item.priority === todoFilter;
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignee && item.assignee.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleWhatsApp = (phoneNumber: string) => {
    window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`, '_blank');
  };

  

  const handleDocumentUpload = (newDocument: Omit<DocumentType, 'id'>) => {
    const documentWithId = {
      ...newDocument,
      id: Math.max(...documents.map(d => d.id)) + 1
    };
    setDocuments(prev => [...prev, documentWithId]);
    toast({
      title: "Document uploaded",
      description: "The document has been successfully uploaded.",
    });
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <Card className="border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="hover:bg-primary/10 p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg backdrop-blur-sm border border-primary/20">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h1 className="text-4xl font-bold text-foreground">
                        {mockInterviewData.interviewId}
                      </h1>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {mockInterviewData.interviewType}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      <span className="font-semibold">{mockInterviewData.applicantName}</span> • 
                      <span className="ml-2">{mockInterviewData.jobTitle}</span> • 
                      <span className="ml-2">{mockInterviewData.clientName}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center bg-primary/5 rounded-lg p-3 backdrop-blur-sm border border-primary/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-primary" />
                      <p className="text-muted-foreground text-sm">Skill Match</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{mockInterviewData.skillMatchingScore}%</p>
                  </div>
                  
                  
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
                        {isEditing ? "Save Changes" : "Edit Interview"}
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
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <Briefcase className="w-4 h-4 mr-2" />
              Job Info
            </TabsTrigger>
            <TabsTrigger value="applicant" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <User className="w-4 h-4 mr-2" />
              Applicant
            </TabsTrigger>
            <TabsTrigger value="client" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <Building className="w-4 h-4 mr-2" />
              Client
            </TabsTrigger>
            <TabsTrigger value="interview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <Users className="w-4 h-4 mr-2" />
              Interview
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="todo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <CheckSquare className="w-4 h-4 mr-2" />
              Todo
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300">
              <Upload className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Job Information Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <Label className="text-sm font-medium text-green-800">Job ID</Label>
                    <p className="text-sm font-mono text-green-600 flex items-center gap-1">
                      {mockInterviewData.jobId}
                      <ExternalLink className="w-3 h-3 cursor-pointer" />
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <Label className="text-sm font-medium text-green-800">Job Title</Label>
                    <p className="text-sm font-semibold">{mockInterviewData.jobTitle}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <Label className="text-sm font-medium text-green-800">Location</Label>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {mockInterviewData.jobLocation}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <Label className="text-sm font-medium text-green-800">Start Date</Label>
                    <p className="text-sm flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      {mockInterviewData.jobStartDate}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <Label className="text-sm font-medium text-green-800">Bill Rate</Label>
                    <p className="text-lg font-bold text-green-600">{mockInterviewData.billRate}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <Label className="text-sm font-medium text-green-800">Pay Rate</Label>
                    <p className="text-lg font-bold text-green-600">{mockInterviewData.payRate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicant Information Tab */}
          <TabsContent value="applicant" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <Label className="text-sm font-medium text-blue-800">Name</Label>
                    <p className="text-sm font-semibold">{mockInterviewData.applicantName}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <Label className="text-sm font-medium text-blue-800">Current Title</Label>
                    <p className="text-sm">{mockInterviewData.currentJobTitle}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <Label className="text-sm font-medium text-blue-800">Location</Label>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {mockInterviewData.applicantLocation}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <Label className="text-sm font-medium text-blue-800">Notice Period</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {mockInterviewData.noticePeriod}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-100 bg-gradient-to-r from-yellow-50 to-yellow-100 md:col-span-2">
                    <Label className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Skill Matching Score
                    </Label>
                    <p className="text-2xl font-bold text-yellow-600">{mockInterviewData.skillMatchingScore}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                    <Label className="text-sm font-medium text-blue-800">Phone</Label>
                    <p 
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-2 mt-1"
                      onClick={() => handleCall(mockInterviewData.applicantPhone)}
                    >
                      <Phone className="w-4 h-4" />
                      {mockInterviewData.applicantPhone}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                    <Label className="text-sm font-medium text-blue-800">Email</Label>
                    <p 
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-2 mt-1"
                      onClick={() => handleEmail(mockInterviewData.applicantEmail)}
                    >
                      <Mail className="w-4 h-4" />
                      {mockInterviewData.applicantEmail}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                    <Label className="text-sm font-medium text-blue-800">WhatsApp</Label>
                    <p 
                      className="text-sm text-green-600 hover:text-green-800 cursor-pointer flex items-center gap-2 mt-1"
                      onClick={() => handleWhatsApp(mockInterviewData.applicantWhatsapp)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {mockInterviewData.applicantWhatsapp}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Information Tab */}
          <TabsContent value="client" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <Label className="text-sm font-medium text-purple-800">Client Name</Label>
                    <p className="text-sm font-semibold">{mockInterviewData.clientName}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <Label className="text-sm font-medium text-purple-800">Contact Name</Label>
                    <p className="text-sm">{mockInterviewData.clientContactName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                    <Label className="text-sm font-medium text-purple-800">Phone</Label>
                    <p 
                      className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer flex items-center gap-2 mt-1"
                      onClick={() => handleCall(mockInterviewData.clientPhone)}
                    >
                      <Phone className="w-4 h-4" />
                      {mockInterviewData.clientPhone}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                    <Label className="text-sm font-medium text-purple-800">Email</Label>
                    <p 
                      className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer flex items-center gap-2 mt-1"
                      onClick={() => handleEmail(mockInterviewData.clientEmail)}
                    >
                      <Mail className="w-4 h-4" />
                      {mockInterviewData.clientEmail}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                    <Label className="text-sm font-medium text-purple-800">WhatsApp</Label>
                    <p 
                      className="text-sm text-green-600 hover:text-green-800 cursor-pointer flex items-center gap-2 mt-1"
                      onClick={() => handleWhatsApp(mockInterviewData.clientWhatsapp)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {mockInterviewData.clientWhatsapp}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interview Details Tab */}
          <TabsContent value="interview" className="space-y-6">
            {/* Interview Rounds Visualization */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">
                  Interview Process Flow
                </CardTitle>
                <CardDescription>
                  Track the progress of all interview rounds for this candidate
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Process Timeline Stepper */}
                  <div className="relative">
                    <div className="flex items-center justify-between relative">
                      {/* Background connecting line */}
                      <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200"></div>
                      
                      {mockInterviewData.interviewRounds.map((round, index) => {
                        const isCompleted = round.status === 'completed';
                        const isInProgress = round.status === 'in-progress';
                        const isScheduled = round.status === 'scheduled';
                        const isPending = round.status === 'pending';
                        
                        // Calculate progress line width
                        const completedCount = mockInterviewData.interviewRounds.slice(0, index).filter(r => r.status === 'completed').length;
                        const progressWidth = (completedCount / (mockInterviewData.interviewRounds.length - 1)) * 100;
                        
                        return (
                          <div key={round.id} className="flex flex-col items-center relative z-10" style={{ width: `${100 / mockInterviewData.interviewRounds.length}%` }}>
                            {/* Step Circle */}
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 border-4",
                              isCompleted && "bg-green-500 border-green-400 text-white",
                              isInProgress && "bg-orange-500 border-orange-400 text-white animate-pulse",
                              isScheduled && "bg-blue-500 border-blue-400 text-white",
                              isPending && "bg-white border-gray-300 text-gray-400"
                            )}>
                              {isCompleted && <CheckCircle2 className="w-8 h-8" />}
                              {isInProgress && <PlayCircle className="w-8 h-8" />}
                              {isScheduled && <Clock4 className="w-8 h-8" />}
                              {isPending && <Circle className="w-8 h-8" />}
                            </div>
                            
                            {/* Step Label */}
                            <div className="text-center mt-4 px-2">
                              <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                {round.name}
                              </h4>
                              <Badge className={cn(
                                "text-xs font-medium",
                                isCompleted && "bg-green-100 text-green-800 border-green-200",
                                isInProgress && "bg-orange-100 text-orange-800 border-orange-200",
                                isScheduled && "bg-blue-100 text-blue-800 border-blue-200",
                                isPending && "bg-gray-100 text-gray-600 border-gray-200"
                              )}>
                                {round.status.charAt(0).toUpperCase() + round.status.slice(1).replace('-', ' ')}
                              </Badge>
                              {round.date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {round.date}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Progress line overlay */}
                      <div 
                        className="absolute top-8 left-0 h-0.5 bg-green-400 transition-all duration-500 ease-in-out"
                        style={{ 
                          width: `${(mockInterviewData.interviewRounds.filter(r => r.status === 'completed').length / (mockInterviewData.interviewRounds.length - 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Round Details Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockInterviewData.interviewRounds.map((round) => (
                      <Card key={round.id} className={cn(
                        "border-2 transition-all duration-300 hover:shadow-md",
                        round.status === 'completed' && "border-green-200 bg-green-50/30",
                        round.status === 'in-progress' && "border-orange-200 bg-orange-50/30",
                        round.status === 'scheduled' && "border-blue-200 bg-blue-50/30",
                        round.status === 'pending' && "border-gray-200 bg-gray-50/30"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">{round.name}</h4>
                            <Badge className={cn(
                              "text-xs",
                              round.status === 'completed' && "bg-green-100 text-green-800 border-green-200",
                              round.status === 'in-progress' && "bg-orange-100 text-orange-800 border-orange-200",
                              round.status === 'scheduled' && "bg-blue-100 text-blue-800 border-blue-200",
                              round.status === 'pending' && "bg-gray-100 text-gray-800 border-gray-200"
                            )}>
                              {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{round.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{round.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{round.interviewer}</span>
                            </div>
                            <div className="mt-3 p-2 bg-white/70 rounded text-xs">
                              <strong>Feedback:</strong> {round.feedback}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {mockInterviewData.interviewRounds.filter(r => r.status === 'completed').length}
                      </div>
                      <div className="text-sm text-green-700">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-orange-100 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {mockInterviewData.interviewRounds.filter(r => r.status === 'in-progress').length}
                      </div>
                      <div className="text-sm text-orange-700">In Progress</div>
                    </div>
                    <div className="text-center p-3 bg-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {mockInterviewData.interviewRounds.filter(r => r.status === 'scheduled').length}
                      </div>
                      <div className="text-sm text-blue-700">Scheduled</div>
                    </div>
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {mockInterviewData.interviewRounds.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-700">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting & Technical Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Current Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <Label className="text-sm font-medium text-orange-800">Medium</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Video className="w-4 h-4 text-orange-600" />
                      <p className="text-sm">{mockInterviewData.interviewMedium}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <Label className="text-sm font-medium text-orange-800">Time</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <p className="text-sm">{mockInterviewData.interviewTime}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Label className="text-sm font-medium text-orange-800">Interview Panel</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mockInterviewData.interviewPanel.map((panelist, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200">
                        {panelist}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Label className="text-sm font-medium text-orange-800">Meeting Details</Label>
                  <p className="text-sm text-blue-600 hover:underline cursor-pointer mt-1">
                    {mockInterviewData.meetingDetails}
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Label className="text-sm font-medium text-orange-800">Evaluation Template</Label>
                  <p className="text-sm mt-1">{mockInterviewData.evaluationTemplate}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {/* Notes Management Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      Interview Notes
                    </CardTitle>
                    <CardDescription>
                      Comprehensive notes and feedback from all interview stages
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={notesFilter} onValueChange={setNotesFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Notes</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search and Stats */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notes..."
                      value={notesSearch}
                      onChange={(e) => setNotesSearch(e.target.value)}
                      className="pl-10 border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">Total: {notesData.length}</span>
                    <span className="text-blue-600">Public: {notesData.filter(note => !note.isPrivate).length}</span>
                    <span className="text-orange-600">Private: {notesData.filter(note => note.isPrivate).length}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
              {notesData
                .filter(note => {
                  const matchesFilter = notesFilter === "all" || note.category === notesFilter;
                  const matchesSearch = notesSearch === "" || 
                    note.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                    note.content.toLowerCase().includes(notesSearch.toLowerCase()) ||
                    note.tags.some(tag => tag.toLowerCase().includes(notesSearch.toLowerCase()));
                  return matchesFilter && matchesSearch;
                })
                .map((note) => (
                  <Card key={note.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">{note.title}</h3>
                            {note.isPrivate && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                Private
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <PenTool className="w-3 h-3" />
                              {note.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <History className="w-3 h-3" />
                              {format(new Date(note.timestamp), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs",
                            note.category === 'technical' && "bg-blue-100 text-blue-800 border-blue-200",
                            note.category === 'behavioral' && "bg-purple-100 text-purple-800 border-purple-200",
                            note.category === 'feedback' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                            note.category === 'general' && "bg-gray-100 text-gray-800 border-gray-200"
                          )}>
                            {note.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-700 leading-relaxed mb-4">{note.content}</p>
                      
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3">
                        <Tags className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Note Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-gray-600 border-gray-200 hover:bg-gray-50"
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        >
                          <Bookmark className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Add New Note */}
            {isEditing && (
              <Card className="border-2 border-dashed border-green-300 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-green-800">Title</Label>
                    <Input
                      value={newNote.title}
                      onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                      placeholder="Note title..."
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-green-800">Content</Label>
                    <Textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                      placeholder="Write your note..."
                      className="min-h-[120px] border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-green-800">Category</Label>
                      <Select value={newNote.category} onValueChange={(value) => setNewNote({...newNote, category: value})}>
                        <SelectTrigger className="border-green-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        id="private-note"
                        type="checkbox"
                        checked={newNote.isPrivate}
                        onChange={(e) => setNewNote({...newNote, isPrivate: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <Label htmlFor="private-note" className="text-sm text-green-800">
                        Private Note
                      </Label>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      if (newNote.title.trim() && newNote.content.trim()) {
                        const note = {
                          id: notesData.length + 1,
                          ...newNote,
                          author: "Current User",
                          timestamp: new Date().toISOString(),
                          tags: ["new"]
                        };
                        setNotesData([...notesData, note]);
                        setNewNote({ title: "", content: "", category: "general", isPrivate: false });
                        toast({
                          title: "Note added",
                          description: "Your note has been saved successfully.",
                        });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {notesData.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No notes yet</h3>
                  <p className="text-gray-500 mb-4">Start taking notes about this interview to keep track of important details.</p>
                  <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-green-500 to-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Todo Tab */}
          <TabsContent value="todo" className="space-y-6 mt-0">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                    Todo Management
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={todoFilter} onValueChange={setTodoFilter}>
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
                  </div>
                </div>
                
                {/* Status Summary */}
                <div className="flex items-center gap-4 pt-4 border-t text-sm">
                  <span className="text-blue-600">Total: {todo.length}</span>
                  <span className="text-green-600">Completed: {todo.filter(item => item.completed).length}</span>
                  <span className="text-orange-600">Pending: {todo.filter(item => !item.completed).length}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredTodo.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No todo items found for the selected filter.</p>
                    </div>
                  ) : (
                    filteredTodo.map((item) => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "border rounded-lg p-4 hover:shadow-md transition-all duration-200",
                          item.completed ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleTodo(item.id)}
                              className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-blue-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                  "font-medium",
                                  item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                )}>
                                  {item.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>Due: {format(new Date(item.dueDate), "MMM d, yyyy")}</span>
                                {item.assignee && <span>Assigned to: {item.assignee}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            
                            {/* Reschedule Button */}
                            <Popover open={isRescheduleOpen && rescheduleData.todoId === item.id} onOpenChange={(open) => {
                              setIsRescheduleOpen(open);
                              if (!open) setRescheduleData({todoId: null, newDate: undefined});
                            }}>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRescheduleData({todoId: item.id, newDate: undefined});
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
                                      setTodo(prev => prev.map(t => 
                                        t.id === rescheduleData.todoId 
                                          ? { ...t, dueDate: format(date, "yyyy-MM-dd") }
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
                            <Dialog open={isReassignOpen && reassignData.todoId === item.id} onOpenChange={(open) => {
                              setIsReassignOpen(open);
                              if (!open) setReassignData({todoId: null, newAssignee: ""});
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReassignData({todoId: item.id, newAssignee: item.assignee || ""});
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
                                    <label className="text-sm font-medium">Task: {item.title}</label>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Assign to:</label>
                                    <Select value={reassignData.newAssignee} onValueChange={(value) => setReassignData(prev => ({...prev, newAssignee: value}))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                                        <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                                        <SelectItem value="John Smith">John Smith</SelectItem>
                                        <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                                        <SelectItem value="David Rodriguez">David Rodriguez</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => {
                                        if (reassignData.todoId && reassignData.newAssignee) {
                                          setTodo(prev => prev.map(t => 
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
                              onClick={() => deleteTodo(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {isEditing && (
                  <div className="mt-6 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30">
                    <h4 className="font-medium text-blue-800 mb-3">Add New Todo Item</h4>
                    <div className="space-y-3">
                      <Input
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Enter todo item..."
                        className="border-blue-200 focus:border-blue-400"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-blue-800">Priority</Label>
                          <Select value={newTodoPriority} onValueChange={setNewTodoPriority}>
                            <SelectTrigger className="border-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-800">Category</Label>
                          <Select value={newTodoCategory} onValueChange={setNewTodoCategory}>
                            <SelectTrigger className="border-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preparation">Preparation</SelectItem>
                              <SelectItem value="follow-up">Follow-up</SelectItem>
                              <SelectItem value="scheduling">Scheduling</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={handleAddTodo} 
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Todo Item
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-0">
            <DocumentsManager 
              documents={documents}
              onUpload={handleDocumentUpload}
              title="Interview Documents"
            />
          </TabsContent>
        </Tabs>

        {/* Personalization Settings Dialog */}
        <InterviewDetailPersonalizationSettings
          isOpen={isPersonalizationOpen}
          onClose={() => setIsPersonalizationOpen(false)}
          currentSettings={personalizationSettings}
          onSave={(settings) => {
            setPersonalizationSettings(settings);
            localStorage.setItem('interviewDetailPersonalization', JSON.stringify(settings));
          }}
        />
    </div>
  );
};

export default InterviewDetail;