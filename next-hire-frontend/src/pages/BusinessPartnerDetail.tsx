import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Settings,
  Search,
  UserCog,
  CheckSquare,
  StickyNote,
  BarChart3,
  Newspaper,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  Sparkles,
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
import { NotesPanel } from "@/components/NotesPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import {
  useBusinessPartner,
  useBusinessPartnerManagement,
} from "@/hooks/useBusinessPartners";
import {
  businessPartnerService,
  UpdateBusinessPartnerRequest,
  BusinessPartnerContact,
  BusinessPartnerDetailStats,
  BusinessPartnerActivityItem,
  BusinessPartnerRevenueTrendPoint,
  BusinessPartnerJob,
} from "@/services/businessPartnerService";
import { recruiterService, Task, TaskPriority, TaskStatus, TeamMember, TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "@/services/recruiterService";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MAX_PAGE_SIZE } from "@/lib/constants";
import { PageLoadingState } from "@/components/PageLoadingState";
import { formatCurrency } from "@/lib/format";
import { ActionsMenuTrigger } from "@/components/ActionsMenuTrigger";

const formatTeamMemberName = (member: TeamMember) => {
  const name = [member.recruiterProfile?.first_name, member.recruiterProfile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || member.email;
};

const activityIcon = (type: BusinessPartnerActivityItem["type"]) => {
  if (type === "job") return Briefcase;
  if (type === "placement") return Users;
  return User;
};

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
  const [personalizationSettings, setPersonalizationSettings] = useLocalStorage('businessPartnerDetailPersonalization');

  // Edit/delete state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { businessPartner: partner, loading, error, refresh } = useBusinessPartner(id || "");
  const { updateBusinessPartner, deleteBusinessPartner } = useBusinessPartnerManagement();

  // ── Real per-partner stats / activity / revenue trend / jobs ───────────
  const [detailStats, setDetailStats] = useState<BusinessPartnerDetailStats | null>(null);
  const [activity, setActivity] = useState<BusinessPartnerActivityItem[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<BusinessPartnerRevenueTrendPoint[]>([]);
  const [partnerJobs, setPartnerJobs] = useState<BusinessPartnerJob[]>([]);

  const fetchDetailStats = useCallback(async () => {
    if (!id) return;
    try {
      const res = await businessPartnerService.getDetailStats(id);
      setDetailStats(res.data);
    } catch {
      // stat cards just stay empty on failure
    }
  }, [id]);

  const fetchActivity = useCallback(async () => {
    if (!id) return;
    try {
      const res = await businessPartnerService.getActivity(id);
      setActivity(res.data.activity);
    } catch {
      // empty timeline on failure
    }
  }, [id]);

  const fetchRevenueTrend = useCallback(async () => {
    if (!id) return;
    try {
      const res = await businessPartnerService.getRevenueTrend(id);
      setRevenueTrend(res.data.trend);
    } catch {
      // empty chart on failure
    }
  }, [id]);

  const fetchPartnerJobs = useCallback(async () => {
    if (!id) return;
    try {
      const res = await businessPartnerService.getJobs(id);
      setPartnerJobs(res.data.jobs);
    } catch {
      // empty list on failure
    }
  }, [id]);

  useEffect(() => {
    fetchDetailStats();
    fetchActivity();
    fetchRevenueTrend();
    fetchPartnerJobs();
  }, [fetchDetailStats, fetchActivity, fetchRevenueTrend, fetchPartnerJobs]);

  // ── Contacts ─────────────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<BusinessPartnerContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<BusinessPartnerContact | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", title: "", email: "", phone: "", comments: "", is_primary: false });
  const [savingContact, setSavingContact] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!id) return;
    setContactsLoading(true);
    try {
      const data = await businessPartnerService.getContacts(id);
      setContacts(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const openAddContact = () => {
    setContactForm({ name: "", title: "", email: "", phone: "", comments: "", is_primary: false });
    setShowAddContact(true);
  };

  const openEditContact = (contact: BusinessPartnerContact) => {
    setContactForm({
      name: contact.name,
      title: contact.title || "",
      email: contact.email || "",
      phone: contact.phone || "",
      comments: contact.comments || "",
      is_primary: contact.is_primary,
    });
    setEditingContact(contact);
  };

  const handleSaveContact = async () => {
    if (!id || !contactForm.name.trim()) return;
    setSavingContact(true);
    try {
      if (editingContact) {
        await businessPartnerService.updateContact(id, editingContact.id, contactForm);
        toast.success("Contact updated");
        setEditingContact(null);
      } else {
        await businessPartnerService.createContact(id, contactForm);
        toast.success("Contact added");
        setShowAddContact(false);
      }
      fetchContacts();
      fetchDetailStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save contact");
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (contact: BusinessPartnerContact) => {
    if (!id) return;
    if (!window.confirm(`Delete contact ${contact.name}?`)) return;
    try {
      await businessPartnerService.deleteContact(id, contact.id);
      toast.success("Contact deleted");
      fetchContacts();
      fetchDetailStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete contact");
    }
  };

  // ── To dos (Tasks scoped to this business partner) ──────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [teamOptions, setTeamOptions] = useState<TeamMember[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPlannedCompletionDate, setNewTaskPlannedCompletionDate] = useState("");
  const [newTaskComments, setNewTaskComments] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    setTasksLoading(true);
    try {
      const res = await recruiterService.getTasks({ business_partner_id: id, limit: MAX_PAGE_SIZE });
      setTasks(res.data.tasks || []);
    } catch {
      // empty state handles failures gracefully
    } finally {
      setTasksLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    recruiterService.getTeamMembers().then(setTeamOptions).catch(() => {});
  }, []);

  const handleAddTask = async () => {
    if (!id || !newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await recruiterService.createTask({
        title: newTaskTitle.trim(),
        business_partner_id: id,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        planned_completion_date: newTaskPlannedCompletionDate || undefined,
        description: newTaskComments || undefined,
        assigned_to: newTaskAssignee || undefined,
      });
      toast.success("Task added");
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskComments("");
      setNewTaskPlannedCompletionDate("");
      setNewTaskPriority("medium");
      setNewTaskAssignee("");
      setShowAddTask(false);
      fetchTasks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "not_started" : "completed";
    try {
      await recruiterService.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await recruiterService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete task");
    }
  };

  // ── Change Assignment (reassign account manager) ────────────────────────
  const [showChangeAssignment, setShowChangeAssignment] = useState(false);
  const [reassignUserId, setReassignUserId] = useState("");
  const [savingAssignment, setSavingAssignment] = useState(false);

  const handleChangeAssignment = async () => {
    if (!id || !reassignUserId) return;
    setSavingAssignment(true);
    const result = await updateBusinessPartner(id, { assigned_to: reassignUserId });
    setSavingAssignment(false);
    if (result) {
      setShowChangeAssignment(false);
      refresh();
    }
  };

  // Personalization settings event listener
  useEffect(() => {
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

  const handleEmail = () => {
    if (!partner?.primary_email) {
      toast.error("No email address on file for this partner");
      return;
    }
    window.location.href = `mailto:${partner.primary_email}`;
  };

  const handleShare = async () => {
    if (!partner) return;
    const text = [
      partner.name,
      partner.business_partner_number,
      partner.primary_email,
      partner.primary_phone,
      partner.website,
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Contact info copied to clipboard");
  };

  if (loading) {
    return (
      <PageLoadingState
        label="Loading business partner..."
        minHeightClassName="h-96"
        iconClassName="w-8 h-8 animate-spin text-blue-600"
        contentClassName="flex items-center space-x-2 text-gray-600"
      />
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

  const partnerStats = [
    { label: "Active Jobs", value: String(detailStats?.activeJobs ?? "—"), icon: Briefcase, color: "text-blue-600" },
    { label: "Total Placements", value: String(detailStats?.totalPlacements ?? "—"), icon: Users, color: "text-green-600" },
    {
      label: "Revenue Generated",
      value: !detailStats
        ? "—"
        : detailStats.revenueCurrency
        ? formatCurrency(detailStats.revenueGenerated, detailStats.revenueCurrency)
        : "Mixed",
      icon: DollarSign,
      color: "text-purple-600",
    },
    { label: "Total Contacts", value: String(detailStats?.totalContacts ?? "—"), icon: User, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6 px-1 sm:px-0">
      {/* Partner ID and Search Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">
            Business Partner ID: {partner.business_partner_number}
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
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
          <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionsMenuTrigger
                className="button-gradient text-white bg-blue-600 hover:bg-blue-700"
                iconClassName="w-4 h-4 mr-1"
                chevronClassName="w-3 h-3 ml-1"
              />
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
              <DropdownMenuItem
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setShowChangeAssignment(true)}
              >
                <UserCog className="w-4 h-4 mr-2" />
                Change Assignment
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
              <DropdownMenuItem onClick={() => setIsPersonalizationOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Settings
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
              {activity.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No activity recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => {
                    const IconComponent = activityIcon(item.type);
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <IconComponent className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.description}</p>
                          <p className="text-xs text-gray-500">{new Date(item.at).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                <Button size="sm" className="button-gradient text-white" onClick={openAddContact}>
                  <User className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading contacts...
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No contacts yet. Add the first one.</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                              {contact.is_primary && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Primary</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{contact.title}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </a>
                              )}
                              {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="text-green-600 hover:underline text-sm flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {contact.phone}
                                </a>
                              )}
                            </div>
                            {contact.comments && (
                              <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">{contact.comments}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-gray-200">
                              <DropdownMenuItem onClick={() => openEditContact(contact)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteContact(contact)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
              {activity.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No activity recorded yet.</p>
              ) : (
                <div className="space-y-6">
                  {activity.map((item, index) => {
                    const IconComponent = activityIcon(item.type);
                    return (
                      <div key={item.id} className="relative">
                        {index !== activity.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{item.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(item.at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="button-gradient text-white">
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
                    </div>
                    <Textarea
                      placeholder="Comments (optional)"
                      value={newTaskComments}
                      onChange={(e) => setNewTaskComments(e.target.value)}
                      rows={2}
                    />
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No tasks for this partner yet.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={todo.status === "completed"} onCheckedChange={() => handleToggleTask(todo)} />
                        <div>
                          <p className={`font-medium ${todo.status === "completed" ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {todo.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={todo.priority === 'high' ? 'destructive' : todo.priority === 'medium' ? 'default' : 'secondary'}>
                              {todo.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Due: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : "—"}
                            </span>
                            {todo.planned_completion_date && (
                              <span className="text-xs text-gray-500">
                                Planned: {new Date(todo.planned_completion_date).toLocaleDateString()}
                              </span>
                            )}
                            {todo.assignee && (
                              <span className="text-xs text-gray-500">Assigned to: {formatTeamMemberName(todo.assignee)}</span>
                            )}
                          </div>
                          {todo.description && (
                            <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{todo.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={todo.status}
                          onValueChange={async (status) => {
                            try {
                              await recruiterService.updateTask(todo.id, { status: status as TaskStatus });
                              setTasks((prev) => prev.map((t) => (t.id === todo.id ? { ...t, status: status as TaskStatus } : t)));
                            } catch (err: any) {
                              toast.error(err?.response?.data?.message || "Failed to update status");
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
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteTask(todo.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentsPanel
            title="Partner Documents"
            documents={partner.attachments || []}
            onUpload={async (data) => {
              await businessPartnerService.addAttachment(partner.id, data);
              refresh();
            }}
            onDelete={async (attachmentId) => {
              await businessPartnerService.deleteAttachment(partner.id, attachmentId);
              refresh();
            }}
          />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <NotesPanel
            title="Partner Notes"
            description="Notes and feedback about this business relationship"
            notes={partner.notes_history || []}
            onAdd={async (data) => {
              await businessPartnerService.addNote(partner.id, data);
              refresh();
            }}
            onUpdate={async (noteId, data) => {
              await businessPartnerService.updateNote(partner.id, noteId, data);
              refresh();
            }}
            onDelete={async (noteId) => {
              await businessPartnerService.deleteNote(partner.id, noteId);
              refresh();
            }}
          />
        </TabsContent>

        <TabsContent value="snapshot" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Revenue Trend
                </CardTitle>
                <p className="text-xs text-gray-500">Last 6 months, from real placements for this client</p>
              </CardHeader>
              <CardContent>
                {revenueTrend.length === 0 ? (
                  <p className="text-sm text-gray-500 py-10 text-center">No placement revenue recorded yet.</p>
                ) : (
                  <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(220, 70%, 50%)" } }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={revenueTrend}>
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
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Placement Metrics
                </CardTitle>
                <p className="text-xs text-gray-500">Last 6 months, from real placements for this client</p>
              </CardHeader>
              <CardContent>
                {revenueTrend.length === 0 ? (
                  <p className="text-sm text-gray-500 py-10 text-center">No placements recorded yet.</p>
                ) : (
                  <ChartContainer config={{ placements: { label: "Placements", color: "hsl(150, 70%, 50%)" } }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="placements" fill="hsl(150, 70%, 50%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whats-new" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-red-600" />
                What's New - Recent Job Postings
              </CardTitle>
              <p className="text-xs text-gray-500">Real jobs this client has posted with us, most recent first</p>
            </CardHeader>
            <CardContent>
              {partnerJobs.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No job postings from this client yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posted</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnerJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{job.title}</TableCell>
                        <TableCell className="text-gray-600 capitalize">{job.job_type?.replace(/_/g, " ") || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{job.status}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{job.location || "—"}</TableCell>
                        <TableCell>
                          <Link
                            to={`/dashboard/jobs/${job.id}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Personalization Settings Dialog */}
      <BusinessPartnerDetailPersonalizationSettings
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        currentSettings={personalizationSettings}
        onSave={setPersonalizationSettings}
      />

      {/* Edit Partner Dialog */}
      <BusinessPartnerFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        initialData={partner}
        onSubmit={handleUpdatePartner}
      />

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={showAddContact || !!editingContact}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddContact(false);
            setEditingContact(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={contactForm.title} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Comments</Label>
              <Textarea
                value={contactForm.comments}
                onChange={(e) => setContactForm({ ...contactForm, comments: e.target.value })}
                rows={3}
                placeholder="Notes about this contact..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-primary"
                checked={contactForm.is_primary}
                onCheckedChange={(checked) => setContactForm({ ...contactForm, is_primary: !!checked })}
              />
              <Label htmlFor="is-primary">Primary contact</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddContact(false); setEditingContact(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact} disabled={!contactForm.name.trim() || savingContact}>
              {savingContact ? "Saving..." : editingContact ? "Save Changes" : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Assignment Dialog */}
      <Dialog open={showChangeAssignment} onOpenChange={setShowChangeAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Assignment</DialogTitle>
          </DialogHeader>
          <Select value={reassignUserId} onValueChange={setReassignUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an account manager" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {formatTeamMemberName(member)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeAssignment(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeAssignment} disabled={!reassignUserId || savingAssignment}>
              {savingAssignment ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPartnerDetail;
