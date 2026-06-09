import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Plus,
  Search,
  Filter,
  Send,
  Reply,
  Forward,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  Download,
  Paperclip,
  Calendar,
  Users,
  Flag,
  Edit,
  Eye,
  Folder,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Phone,
  Settings
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Mock email data
const emailData = [
  {
    id: "1",
    from: "jack.collins@email.com",
    to: ["hr@company.com"],
    cc: [],
    bcc: [],
    subject: "Thank you for the interview opportunity",
    body: "Dear Hiring Team,\n\nThank you for taking the time to interview me for the Senior React Developer position. I was very impressed with the team and the company culture.\n\nI look forward to hearing from you regarding the next steps.\n\nBest regards,\nJack Collins",
    timestamp: "2024-07-07T10:30:00",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    folder: "inbox",
    labels: ["candidate", "interview"],
    priority: "normal",
    type: "received",
    candidateId: "1",
    jobId: "1"
  },
  {
    id: "2",
    from: "hr@company.com",
    to: ["sarah.johnson@email.com"],
    cc: ["mike.rodriguez@company.com"],
    bcc: [],
    subject: "Interview Invitation - Product Manager Position",
    body: "Dear Sarah,\n\nWe are pleased to invite you for an interview for the Product Manager position at our company.\n\nInterview Details:\nDate: July 8, 2024\nTime: 2:00 PM EST\nLocation: Conference Room B\n\nPlease confirm your attendance.\n\nBest regards,\nHR Team",
    timestamp: "2024-07-06T14:15:00",
    isRead: true,
    isStarred: true,
    hasAttachments: false,
    folder: "sent",
    labels: ["interview", "important"],
    priority: "high",
    type: "sent",
    candidateId: "2",
    jobId: "2"
  },
  {
    id: "3",
    from: "alex.chen@email.com",
    to: ["hr@company.com"],
    cc: [],
    bcc: [],
    subject: "Portfolio and Design Samples - UX Designer Application",
    body: "Hello,\n\nAttached you will find my portfolio and design samples for the UX Designer position.\n\nI have included:\n- Portfolio PDF\n- Case study examples\n- Design process documentation\n\nPlease let me know if you need any additional information.\n\nBest,\nAlex Chen",
    timestamp: "2024-07-05T09:45:00",
    isRead: false,
    isStarred: false,
    hasAttachments: true,
    folder: "inbox",
    labels: ["candidate", "portfolio"],
    priority: "normal",
    type: "received",
    candidateId: "3",
    jobId: "3"
  },
  {
    id: "4",
    from: "maria.garcia@email.com",
    to: ["hr@company.com"],
    cc: [],
    bcc: [],
    subject: "Accepting the Data Scientist Position Offer",
    body: "Dear Team,\n\nI am delighted to accept the offer for the Data Scientist position. Thank you for this wonderful opportunity.\n\nI understand my start date is July 15, 2024, and I am excited to join the team.\n\nLooking forward to contributing to the company's success.\n\nWarm regards,\nMaria Garcia",
    timestamp: "2024-07-04T16:20:00",
    isRead: true,
    isStarred: true,
    hasAttachments: false,
    folder: "inbox",
    labels: ["offer", "accepted"],
    priority: "high",
    type: "received",
    candidateId: "4",
    jobId: "4"
  },
  {
    id: "5",
    from: "hr@company.com",
    to: ["john.smith@techcorp.com"],
    cc: [],
    bcc: [],
    subject: "Weekly Recruitment Update - July 1st Week",
    body: "Dear John,\n\nHere's our weekly recruitment update:\n\n- 5 new candidates submitted\n- 3 interviews scheduled\n- 1 offer extended\n- 2 positions filled\n\nDetailed report is attached.\n\nBest regards,\nRecruitment Team",
    timestamp: "2024-07-03T11:00:00",
    isRead: true,
    isStarred: false,
    hasAttachments: true,
    folder: "sent",
    labels: ["client", "report"],
    priority: "normal",
    type: "sent",
    clientId: "1"
  },
  {
    id: "6",
    from: "noreply@jobboard.com",
    to: ["hr@company.com"],
    cc: [],
    bcc: [],
    subject: "New Application Received - Software Engineer",
    body: "A new application has been received for the Software Engineer position.\n\nCandidate: David Kim\nExperience: 7 years\nSkills: React, Node.js, Python\n\nView application: [Link]\n\nJobBoard Team",
    timestamp: "2024-07-02T08:30:00",
    isRead: false,
    isStarred: false,
    hasAttachments: false,
    folder: "inbox",
    labels: ["application", "jobboard"],
    priority: "normal",
    type: "received"
  }
];

// Email templates
const emailTemplates = [
  {
    id: "1",
    name: "Interview Invitation",
    subject: "Interview Invitation - {{position}} Position",
    body: "Dear {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{position}} position at our company.\n\nInterview Details:\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}\n\nPlease confirm your attendance.\n\nBest regards,\n{{senderName}}"
  },
  {
    id: "2",
    name: "Interview Follow-up",
    subject: "Thank you for your interview - {{position}}",
    body: "Dear {{candidateName}},\n\nThank you for taking the time to interview with us for the {{position}} position.\n\nWe were impressed with your background and experience. We will be in touch with you regarding the next steps within the next few days.\n\nBest regards,\n{{senderName}}"
  },
  {
    id: "3",
    name: "Job Offer",
    subject: "Job Offer - {{position}} Position",
    body: "Dear {{candidateName}},\n\nWe are delighted to offer you the position of {{position}} at our company.\n\nPosition Details:\n- Start Date: {{startDate}}\n- Salary: {{salary}}\n- Benefits: {{benefits}}\n\nPlease review the attached offer letter and let us know your decision by {{responseDate}}.\n\nCongratulations!\n\n{{senderName}}"
  },
  {
    id: "4",
    name: "Application Rejection",
    subject: "Update on your application - {{position}}",
    body: "Dear {{candidateName}},\n\nThank you for your interest in the {{position}} position at our company.\n\nAfter careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.\n\nWe encourage you to apply for future opportunities that match your background.\n\nBest regards,\n{{senderName}}"
  }
];

const EmailCenter = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState("all");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Compose email state
  const [composeEmail, setComposeEmail] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    template: ""
  });

  const filteredEmails = emailData.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLabel = filterLabel === "all" || email.labels.includes(filterLabel);
    
    const matchesTab = 
      activeTab === "inbox" ? email.folder === "inbox" :
      activeTab === "sent" ? email.folder === "sent" :
      activeTab === "starred" ? email.isStarred :
      activeTab === "archived" ? email.folder === "archived" :
      true;
    
    return matchesSearch && matchesLabel && matchesTab;
  });

  const unreadCount = emailData.filter(email => !email.isRead && email.folder === "inbox").length;
  const starredCount = emailData.filter(email => email.isStarred).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'normal': return 'text-muted-foreground';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email);
    // Mark as read
    if (!email.isRead) {
      email.isRead = true;
    }
  };

  const handleComposeEmail = () => {
    console.log("Sending email:", composeEmail);
    setIsComposeOpen(false);
    setComposeEmail({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      template: ""
    });
  };

  const handleUseTemplate = (template: any) => {
    setComposeEmail(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      template: template.id
    }));
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(false);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on emails:`, selectedEmails);
    setSelectedEmails([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-roboto-slab">Email Center</h1>
          <p className="text-muted-foreground font-roboto-slab">Manage candidate communications and email templates</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 font-poppins"
            />
          </div>
          
          <Select value={filterLabel} onValueChange={setFilterLabel}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="important">Important</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsTemplateDialogOpen(true)} variant="outline" className="hover:bg-accent transition-colors duration-200">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>

          <Button onClick={() => setIsComposeOpen(true)} className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Email Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card className="card-gradient border-primary/20 shadow-lg card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent font-roboto-slab">
                Email Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-poppins">Unread</span>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-poppins">{unreadCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-poppins">Starred</span>
                <Badge className="bg-accent text-accent-foreground border-accent/30 font-poppins">{starredCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-poppins">Total</span>
                <Badge className="bg-muted text-muted-foreground border-border font-poppins">{emailData.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Folders */}
          <Card className="card-gradient border-green-200/50 shadow-lg card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent font-roboto-slab">
                Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setActiveTab("inbox")}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-accent transition-colors duration-200",
                  activeTab === "inbox" && "bg-primary/10 text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-poppins">Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-poppins">{unreadCount}</Badge>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab("sent")}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-accent transition-colors duration-200",
                  activeTab === "sent" && "bg-primary/10 text-primary"
                )}
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-poppins">Sent</span>
              </button>
              
              <button
                onClick={() => setActiveTab("starred")}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-accent transition-colors duration-200",
                  activeTab === "starred" && "bg-primary/10 text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-poppins">Starred</span>
                </div>
                {starredCount > 0 && (
                  <Badge className="bg-accent text-accent-foreground border-accent/30 text-xs font-poppins">{starredCount}</Badge>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab("archived")}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-accent transition-colors duration-200",
                  activeTab === "archived" && "bg-primary/10 text-primary"
                )}
              >
                <Archive className="w-4 h-4" />
                <span className="text-sm font-poppins">Archived</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <div className="lg:col-span-2">
          <Card className="card-gradient border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <h2 className="text-lg font-semibold capitalize font-roboto-slab">{activeTab}</h2>
                  <Badge className="bg-muted text-muted-foreground border-border font-poppins">{filteredEmails.length}</Badge>
                </div>
                
                {selectedEmails.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction("archive")} className="hover:bg-accent">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction("delete")} className="hover:bg-accent">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction("star")} className="hover:bg-accent">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <Button size="sm" variant="outline" className="hover:bg-accent">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2 font-roboto-slab">No emails found</h3>
                    <p className="text-muted-foreground font-poppins">
                      {searchTerm || filterLabel !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Your inbox is empty."
                      }
                    </p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={cn(
                        "flex items-center gap-3 p-4 border-b border-border hover:bg-accent cursor-pointer transition-colors duration-200",
                        !email.isRead && "bg-primary/5",
                        selectedEmail?.id === email.id && "bg-primary/10"
                      )}
                    >
                      <Checkbox 
                        checked={selectedEmails.includes(email.id)}
                        onCheckedChange={() => handleEmailSelect(email.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          email.isStarred = !email.isStarred;
                        }}
                        className="text-muted-foreground hover:text-accent-foreground transition-colors duration-200"
                      >
                        <Star className={cn("w-4 h-4", email.isStarred && "fill-accent-foreground text-accent-foreground")} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-sm truncate font-poppins",
                            !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}>
                            {email.type === "sent" ? `To: ${email.to.join(", ")}` : email.from}
                          </span>
                          
                          {email.hasAttachments && (
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                          )}
                          
                          <Flag className={cn("w-3 h-3", getPriorityColor(email.priority))} />
                          
                          {email.labels.map((label) => (
                            <Badge key={label} className="text-xs bg-muted text-muted-foreground border-border font-poppins">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className={cn(
                          "text-sm truncate mb-1 font-poppins",
                          !email.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {email.subject}
                        </p>
                        
                        <p className="text-xs text-muted-foreground truncate font-poppins">
                          {email.body.substring(0, 100)}...
                        </p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-right font-poppins">
                        {format(parseISO(email.timestamp), "MMM d")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Details */}
        <div>
          {selectedEmail ? (
            <Card className="card-gradient border-secondary/50 shadow-lg card-hover">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2 font-roboto-slab">{selectedEmail.subject}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground font-poppins">
                      <p><strong>From:</strong> {selectedEmail.from}</p>
                      <p><strong>To:</strong> {selectedEmail.to.join(", ")}</p>
                      {selectedEmail.cc.length > 0 && (
                        <p><strong>CC:</strong> {selectedEmail.cc.join(", ")}</p>
                      )}
                      <p><strong>Date:</strong> {format(parseISO(selectedEmail.timestamp), "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="w-4 h-4 mr-2" />
                        Forward
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Star
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-foreground font-poppins">
                    {selectedEmail.body}
                  </div>
                </div>
                
                {selectedEmail.hasAttachments && (
                  <div className="mt-4 p-3 nav-card-gradient rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-poppins">
                      <Paperclip className="w-4 h-4" />
                      <span>Attachments (2)</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-card rounded border border-border">
                        <span className="text-sm font-poppins">portfolio.pdf</span>
                        <Button size="sm" variant="ghost" className="hover:bg-accent">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-card rounded border border-border">
                        <span className="text-sm font-poppins">resume.pdf</span>
                        <Button size="sm" variant="ghost" className="hover:bg-accent">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="button-gradient">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" className="hover:bg-accent">
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-gradient border-border/50 shadow-lg">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2 font-roboto-slab">Select an email</h3>
                  <p className="text-muted-foreground font-poppins">Choose an email from the list to view its contents</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-roboto-slab">Compose Email</DialogTitle>
            <DialogDescription className="font-poppins">
              Send a new email to candidates, clients, or team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium font-poppins">To</label>
                <Input
                  value={composeEmail.to}
                  onChange={(e) => setComposeEmail({...composeEmail, to: e.target.value})}
                  placeholder="recipient@email.com"
                  className="font-poppins"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium font-poppins">Template</label>
                <Select value={composeEmail.template} onValueChange={(value) => {
                  const template = emailTemplates.find(t => t.id === value);
                  if (template) handleUseTemplate(template);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium font-poppins">CC</label>
                <Input
                  value={composeEmail.cc}
                  onChange={(e) => setComposeEmail({...composeEmail, cc: e.target.value})}
                  placeholder="cc@email.com"
                  className="font-poppins"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium font-poppins">BCC</label>
                <Input
                  value={composeEmail.bcc}
                  onChange={(e) => setComposeEmail({...composeEmail, bcc: e.target.value})}
                  placeholder="bcc@email.com"
                  className="font-poppins"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium font-poppins">Subject</label>
              <Input
                value={composeEmail.subject}
                onChange={(e) => setComposeEmail({...composeEmail, subject: e.target.value})}
                placeholder="Email subject"
                className="font-poppins"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium font-poppins">Message</label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // AI writing functionality to be implemented
                    console.log("Write with AI clicked");
                  }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Write with AI
                </Button>
              </div>
              <Textarea
                value={composeEmail.body}
                onChange={(e) => setComposeEmail({...composeEmail, body: e.target.value})}
                placeholder="Type your message here..."
                rows={12}
                className="font-poppins"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComposeEmail} className="button-gradient">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Templates Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-roboto-slab">Email Templates</DialogTitle>
            <DialogDescription className="font-poppins">
              Choose from pre-made templates to speed up your email composition
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="nav-card-gradient border-border/50 hover:shadow-md transition-all duration-200 cursor-pointer card-hover"
                    onClick={() => handleUseTemplate(template)}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-roboto-slab">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 font-poppins"><strong>Subject:</strong> {template.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 font-poppins">{template.body.substring(0, 150)}...</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailCenter;