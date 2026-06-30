import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/hooks/use-confirm";
import { formatDate } from "@/lib/format";
import {
  ticketService,
  Ticket,
  TicketAssignee,
  TicketStatus,
  TicketPriority,
  TICKET_CATEGORIES,
} from "@/services/ticketService";

interface TicketFormState {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  assignee_id: string;
}

const EMPTY_FORM: TicketFormState = {
  title: "",
  description: "",
  category: "",
  priority: "medium",
  assignee_id: "",
};

const Tickets = () => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const isStaff = user?.role === "recruiter" || user?.role === "admin";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<TicketAssignee[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<TicketFormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState<TicketFormState & { status: TicketStatus }>({
    ...EMPTY_FORM,
    status: "open",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketService.getTickets();
      setTickets(response.data.tickets);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    if (isStaff) {
      ticketService
        .getAssignees()
        .then((res) => setAssignees(res.data.assignees))
        .catch(() => {
          // Non-fatal: assignee dropdown just stays empty
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetNewTicketForm = () => setNewTicket(EMPTY_FORM);

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category) {
      toast.error("Title, category, and description are required");
      return;
    }
    try {
      setCreating(true);
      await ticketService.createTicket({
        title: newTicket.title.trim(),
        description: newTicket.description.trim(),
        category: newTicket.category,
        priority: newTicket.priority,
        assignee_id: isStaff && newTicket.assignee_id ? newTicket.assignee_id : undefined,
      });
      toast.success("Ticket created successfully");
      setIsNewTicketOpen(false);
      resetNewTicketForm();
      loadTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      assignee_id: ticket.assignee_id || "",
      status: ticket.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTicket) return;
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.category) {
      toast.error("Title, category, and description are required");
      return;
    }
    try {
      setSaving(true);
      await ticketService.updateTicket(editingTicket.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        priority: editForm.priority,
        status: editForm.status,
        assignee_id: editForm.assignee_id || null,
      });
      toast.success("Ticket updated successfully");
      setEditingTicket(null);
      loadTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicket = async (ticket: Ticket) => {
    if (
      !(await confirm({
        title: `Delete ${ticket.ticket_number}?`,
        description: "This action cannot be undone.",
        confirmText: "Delete",
        variant: "destructive",
      }))
    ) {
      return;
    }
    try {
      setDeletingId(ticket.id);
      await ticketService.deleteTicket(ticket.id);
      toast.success("Ticket deleted successfully");
      loadTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete ticket");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <TicketIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
      open: "destructive",
      "in-progress": "secondary",
      resolved: "default",
      closed: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("-", " ").toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return <Badge className={colors[priority] || "bg-gray-100 text-gray-800"}>{priority.toUpperCase()}</Badge>;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      ticket.title.toLowerCase().includes(term) ||
      ticket.description.toLowerCase().includes(term) ||
      ticket.ticket_number.toLowerCase().includes(term);
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const renderTicketFormFields = (
    form: TicketFormState,
    setForm: (updater: (f: TicketFormState) => TicketFormState) => void
  ) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {TICKET_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={form.priority}
            onValueChange={(v) => setForm((f) => ({ ...f, priority: v as TicketPriority }))}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isStaff && (
          <div className="space-y-2">
            <Label htmlFor="assignee">Assign to</Label>
            <Select
              value={form.assignee_id || "unassigned"}
              onValueChange={(v) => setForm((f) => ({ ...f, assignee_id: v === "unassigned" ? "" : v }))}
            >
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the issue..."
          className="min-h-[100px]"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm border border-white/20">
            <TicketIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-roboto-slab">Support Tickets</h1>
            <p className="text-sm lg:text-base text-gray-600 font-roboto-slab">
              {isStaff ? "Manage and track support requests" : "Track your support requests"}
            </p>
          </div>
        </div>

        <Dialog
          open={isNewTicketOpen}
          onOpenChange={(open) => {
            setIsNewTicketOpen(open);
            if (!open) resetNewTicketForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderTicketFormFields(newTicket, setNewTicket)}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewTicketOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-500"
                  onClick={handleCreateTicket}
                  disabled={creating}
                >
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: ticketStats.total, color: "from-blue-400/30 to-blue-600/30", icon: TicketIcon },
          { label: "Open", value: ticketStats.open, color: "from-red-400/30 to-red-600/30", icon: AlertCircle },
          { label: "In Progress", value: ticketStats.inProgress, color: "from-yellow-400/30 to-yellow-600/30", icon: Clock },
          { label: "Resolved", value: ticketStats.resolved, color: "from-green-400/30 to-green-600/30", icon: CheckCircle },
          { label: "Closed", value: ticketStats.closed, color: "from-gray-400/30 to-gray-600/30", icon: XCircle },
        ].map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-md backdrop-blur-xl bg-white/30">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color}`}></div>
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadTickets} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {loading ? (
        <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600 text-sm">Loading tickets...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-3">{error}</p>
            <Button onClick={loadTickets} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-sm text-gray-500 shrink-0">{ticket.ticket_number}</span>
                        <h3 className="font-semibold text-gray-900 truncate">{ticket.title}</h3>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>
                          {ticket.assignee_name ? `Assigned to ${ticket.assignee_name}` : "Unassigned"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDate(ticket.created_at)}</span>
                      </div>
                      <span className="text-gray-400">·</span>
                      <span>Reported by {ticket.reporter_name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 shrink-0">
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={deletingId === ticket.id}>
                          {deletingId === ticket.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="w-4 h-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingTicket(ticket)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {isStaff && (
                          <DropdownMenuItem onClick={() => openEditDialog(ticket)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Ticket
                          </DropdownMenuItem>
                        )}
                        {isStaff && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTicket(ticket)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTickets.length === 0 && (
            <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
              <CardContent className="p-8">
                <EmptyState
                  icon={TicketIcon}
                  iconClassName="w-12 h-12 text-gray-400 mx-auto mb-4"
                  title="No tickets found"
                  description={
                    tickets.length === 0
                      ? isStaff
                        ? "No support tickets have been filed yet."
                        : "You haven't filed any support tickets yet."
                      : "Try adjusting your search criteria or create a new ticket."
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Ticket Dialog */}
      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-lg">
          {viewingTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-500">{viewingTicket.ticket_number}</span>
                  {viewingTicket.title}
                </DialogTitle>
                <DialogDescription>{viewingTicket.category}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusBadge(viewingTicket.status)}
                  {getPriorityBadge(viewingTicket.priority)}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingTicket.description}</p>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Reported by {viewingTicket.reporter_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {viewingTicket.assignee_name ? `Assigned to ${viewingTicket.assignee_name}` : "Unassigned"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Created {formatDate(viewingTicket.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Updated {formatDate(viewingTicket.updated_at)}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setViewingTicket(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog (staff only) */}
      <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ticket {editingTicket?.ticket_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {renderTicketFormFields(editForm, (updater) => setEditForm((f) => ({ ...updater(f), status: f.status })))}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as TicketStatus }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTicket(null)} disabled={saving}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500" onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
