import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User,
  FileText,
  Activity,
  Edit,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Star,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Tag,
  Briefcase,
  MessageSquare,
  Settings,
  Search,
  ChevronDown,
  Bot,
  UserCog,
  CheckSquare,
  StickyNote,
  BarChart3,
  Newspaper,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import BusinessPartnerDetailPersonalizationSettings from "@/components/BusinessPartnerDetailPersonalizationSettings";
import BusinessPartnerFormDialog from "@/components/BusinessPartnerFormDialog";
import {
  useBusinessPartner,
  useBusinessPartnerManagement,
} from "@/hooks/useBusinessPartners";
import {
  businessPartnerService,
  UpdateBusinessPartnerRequest,
} from "@/services/businessPartnerService";

const BusinessPartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Search functionality state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchPartnerId, setSearchPartnerId] = useState("");

  // Personalization settings state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [personalizationSettings, setPersonalizationSettings] = useState(null);

  // Edit/delete state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { businessPartner: partner, loading, error, refresh } = useBusinessPartner(id || "");
  const { updateBusinessPartner, deleteBusinessPartner } = useBusinessPartnerManagement();

  // Load personalization settings and event listener
  useEffect(() => {
    const saved = localStorage.getItem('businessPartnerDetailPersonalization');
    if (saved) {
      try { setPersonalizationSettings(JSON.parse(saved)); } catch (error) {}
    }

    const handleOpenPersonalization = () => setIsPersonalizationOpen(true);
    window.addEventListener('openPersonalizationSettings', handleOpenPersonalization);
    return () => window.removeEventListener('openPersonalizationSettings', handleOpenPersonalization);
  }, []);

  // Auto-open edit dialog when navigated here with ?edit=true (from the list page's edit icon)
  useEffect(() => {
    if (searchParams.get("edit") === "true" && partner) {
      setShowEditDialog(true);
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, partner]);

  // Search functionality
  const handleSearchPartner = () => {
    if (searchPartnerId.trim()) {
      navigate(`/dashboard/business-partners/${searchPartnerId.trim()}`);
      setSearchPartnerId("");
      setIsSearchExpanded(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchPartner();
    }
  };

  const handleUpdatePartner = async (data: UpdateBusinessPartnerRequest) => {
    if (!id) return false;
    const updated = await updateBusinessPartner(id, data);
    if (updated) {
      refresh();
      return true;
    }
    return false;
  };

  const handleArchivePartner = async () => {
    if (!id || !partner) return;
    if (!window.confirm(`Are you sure you want to delete ${partner.name}? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    const success = await deleteBusinessPartner(id);
    setDeleting(false);
    if (success) {
      navigate('/dashboard/business-partners');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading business partner...</span>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Business Partner Not Found</h2>
          <p className="text-gray-600 mt-2">{error || "The requested business partner could not be found."}</p>
          <Button onClick={() => navigate('/dashboard/business-partners')} className="mt-4">
            Back to Business Partners
          </Button>
        </div>
      </div>
    );
  }

  // Mock additional data for demonstration
  const partnerStats = [
    { label: "Active Jobs", value: "12", icon: Briefcase, color: "text-blue-600" },
    { label: "Total Placements", value: "45", icon: Users, color: "text-green-600" },
    { label: "Revenue Generated", value: "$125K", icon: DollarSign, color: "text-purple-600" },
    { label: "Avg. Response Time", value: "2.5h", icon: Clock, color: "text-orange-600" }
  ];

  const recentActivities = [
    { id: 1, type: "placement", description: "New placement for Senior Developer position", time: "2 hours ago", icon: Users },
    { id: 2, type: "communication", description: "Email exchange regarding job requirements", time: "1 day ago", icon: Mail },
    { id: 3, type: "meeting", description: "Quarterly business review meeting", time: "3 days ago", icon: Calendar },
    { id: 4, type: "contract", description: "Contract renewal discussion", time: "1 week ago", icon: FileText }
  ];

  const partnerDomain = partner.domain || "example.com";
  const contacts = [
    { id: 1, name: "John Smith", role: "Account Manager", email: "john.smith@" + partnerDomain, phone: "+1 (555) 123-4567" },
    { id: 2, name: "Sarah Johnson", role: "HR Director", email: "sarah.johnson@" + partnerDomain, phone: "+1 (555) 123-4568" }
  ];

  // Mock data for new tabs
  const todos = [
    { id: 1, task: "Follow up on contract renewal", priority: "High", dueDate: "2024-07-25", completed: false },
    { id: 2, task: "Schedule quarterly review meeting", priority: "Medium", dueDate: "2024-07-30", completed: true },
    { id: 3, task: "Update contact information", priority: "Low", dueDate: "2024-08-05", completed: false }
  ];

  const documents = [
    { id: 1, name: "Master Service Agreement", type: "Contract", uploadDate: "2024-06-15", size: "2.3 MB" },
    { id: 2, name: "Partnership Proposal", type: "Proposal", uploadDate: "2024-06-10", size: "1.8 MB" },
    { id: 3, name: "Compliance Certificate", type: "Certificate", uploadDate: "2024-05-20", size: "856 KB" }
  ];

  const notes = [
    { id: 1, content: "Great partnership potential. Strong technical team.", author: "John Doe", date: "2024-06-20", type: "Meeting Note" },
    { id: 2, content: "Discussed expanding our relationship to include more service areas.", author: "Jane Smith", date: "2024-06-18", type: "Call Note" },
    { id: 3, content: "Client showed interest in AI-powered solutions.", author: "Mike Johnson", date: "2024-06-15", type: "General Note" }
  ];

  const newsData = [
    { id: 1, date: "2024-07-28", headline: "TechCorp Announces New AI Initiative", summary: "Company launches comprehensive artificial intelligence program", link: "https://techcorp.com/news/ai-initiative" },
    { id: 2, date: "2024-07-25", headline: "Q2 Financial Results Released", summary: "Strong quarterly performance with 15% growth in revenue", link: "https://techcorp.com/news/q2-results" },
    { id: 3, date: "2024-07-20", headline: "Partnership with Global Tech Leader", summary: "Strategic alliance formed to expand market presence", link: "https://techcorp.com/news/partnership" }
  ];

  // Chart data for client snapshot
  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 }
  ];

  const placementData = [
    { month: 'Jan', placements: 5 },
    { month: 'Feb', placements: 8 },
    { month: 'Mar', placements: 12 },
    { month: 'Apr', placements: 15 },
    { month: 'May', placements: 18 },
    { month: 'Jun', placements: 22 }
  ];

  return (
    <div className="space-y-6 px-1 sm:px-0">
      {/* Partner ID and Search Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">
            Business Partner ID: #{partner.id}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${
            isSearchExpanded ? 'w-64' : 'w-10'
          }`}>
            {isSearchExpanded && (
              <Input
                value={searchPartnerId}
                onChange={(e) => setSearchPartnerId(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Enter Partner ID..."
                className="mr-2 border-blue-300 focus:border-blue-500"
                autoFocus
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isSearchExpanded) {
                  handleSearchPartner();
                } else {
                  setIsSearchExpanded(true);
                }
              }}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 min-w-10"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">{partner.name}</h1>
              <Badge className={`${businessPartnerService.getPartnerTypeColor(partner)} border font-medium`}>
                {businessPartnerService.getPartnerType(partner)}
              </Badge>
              <Badge className={`${businessPartnerService.getStatusColor(partner.status)} border font-medium`}>
                {businessPartnerService.getStatusLabel(partner.status)}
              </Badge>
            </div>
            <p className="text-gray-600 font-roboto-slab">Partner ID: {partner.business_partner_number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-gradient text-white bg-blue-600 hover:bg-blue-700">
                <MoreHorizontal className="w-4 h-4 mr-1" />
                Actions
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Partner
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setActiveTab("whats-new")}
              >
                <Newspaper className="w-4 h-4 mr-2" />
                What's New
              </DropdownMenuItem>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Manage Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="w-4 h-4 mr-2" />
                Add to Favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                disabled={deleting}
                onClick={handleArchivePartner}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? "Deleting..." : "Delete Partner"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {partnerStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.label} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-roboto-slab">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 font-roboto-slab">{stat.value}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="todos">To dos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="snapshot">Client Snapshot</TabsTrigger>
          <TabsTrigger value="whats-new">What's New</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Website</p>
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {partner.domain || partner.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-gray-600">{partner.domain || "Not specified"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      {partner.address1 || partner.city || partner.country ? (
                        <p className="text-gray-600">
                          {partner.address1}
                          {partner.address2 && <><br />{partner.address2}</>}
                          {(partner.city || partner.state) && (
                            <>
                              <br />
                              {[partner.city, partner.state].filter(Boolean).join(", ")}
                            </>
                          )}
                          {partner.country && <><br />{partner.country}</>}
                        </p>
                      ) : (
                        <p className="text-gray-600">Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Tax ID</p>
                      <p className="text-gray-600">{partner.tax_id || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Source</p>
                      <p className="text-gray-600">{businessPartnerService.getSourceLabel(partner.source)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      {partner.primary_email ? (
                        <a
                          href={`mailto:${partner.primary_email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {partner.primary_email}
                        </a>
                      ) : (
                        <p className="text-gray-600">Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      {partner.primary_phone ? (
                        <a
                          href={`tel:${partner.primary_phone}`}
                          className="text-green-600 hover:underline"
                        >
                          {partner.primary_phone}
                        </a>
                      ) : (
                        <p className="text-gray-600">Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-gray-600">{new Date(partner.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Last Activity</p>
                      <p className="text-gray-600">
                        {partner.last_activity_at
                          ? new Date(partner.last_activity_at).toLocaleDateString()
                          : "No activity yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <IconComponent className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Contact Directory
                </div>
                <Button size="sm" className="button-gradient text-white">
                  <User className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.role}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </a>
                            <a href={`tel:${contact.phone}`} className="text-green-600 hover:underline text-sm flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="relative">
                      {index !== recentActivities.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todos" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  To Do List
                </div>
                <Button size="sm" className="button-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={todo.completed}
                        className="w-4 h-4 text-blue-600 rounded"
                        readOnly
                      />
                      <div>
                        <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.task}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={todo.priority === 'High' ? 'destructive' : todo.priority === 'Medium' ? 'default' : 'secondary'}>
                            {todo.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">Due: {todo.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Documents
                </div>
                <Button size="sm" className="button-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{doc.type}</Badge>
                          <span className="text-xs text-gray-500">
                            {doc.uploadDate} • {doc.size}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-yellow-600" />
                  Notes
                </div>
                <Button size="sm" className="button-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{note.content}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{note.type}</Badge>
                            <span className="text-xs text-gray-500">
                              by {note.author} on {note.date}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snapshot" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(220, 70%, 50%)" } }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(220, 70%, 50%)" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Placement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ placements: { label: "Placements", color: "hsl(150, 70%, 50%)" } }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={placementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="placements" fill="hsl(150, 70%, 50%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">$2.1M</div>
                <div className="text-sm text-gray-600">Total Contract Value</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">98%</div>
                <div className="text-sm text-gray-600">On-time Delivery</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whats-new" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-red-600" />
                What's New - Latest News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsData.map((news) => (
                    <TableRow key={news.id}>
                      <TableCell className="font-medium">{news.date}</TableCell>
                      <TableCell>{news.headline}</TableCell>
                      <TableCell className="text-gray-600">{news.summary}</TableCell>
                      <TableCell>
                        <a 
                          href={news.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Personalization Settings Dialog */}
      <BusinessPartnerDetailPersonalizationSettings
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        currentSettings={personalizationSettings}
        onSave={(settings) => {
          setPersonalizationSettings(settings);
          localStorage.setItem('businessPartnerDetailPersonalization', JSON.stringify(settings));
        }}
      />

      {/* Edit Partner Dialog */}
      <BusinessPartnerFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        initialData={partner}
        onSubmit={handleUpdatePartner}
      />
    </div>
  );
};

export default BusinessPartnerDetail;
