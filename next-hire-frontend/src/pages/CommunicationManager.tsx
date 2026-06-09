import { useState } from "react";
import { 
  MessageSquare, Mail, Phone, Bell, Send, Eye, TestTube, 
  Plus, Search, Filter, MoreVertical, Copy, Edit, Trash2,
  Globe, Users, Settings, Play, Pause, Download, Upload,
  Calendar, Tag, Clock, CheckCircle, AlertCircle, FileText,
  Brain, Sparkles, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data
const modules = [
  { id: "jobs", name: "Jobs", events: ["job_created", "job_published", "job_closed", "job_expired"] },
  { id: "candidates", name: "Candidates", events: ["candidate_applied", "candidate_shortlisted", "profile_updated"] },
  { id: "interviews", name: "Interviews", events: ["interview_scheduled", "interview_completed", "interview_rescheduled"] },
  { id: "placements", name: "Placements", events: ["placement_confirmed", "placement_started", "placement_completed"] }
];

const channels = [
  { id: "email", name: "Email", icon: Mail, color: "blue" },
  { id: "whatsapp", name: "WhatsApp", icon: MessageSquare, color: "green" },
  { id: "sms", name: "SMS", icon: Phone, color: "purple" },
  { id: "push", name: "Push Notification", icon: Bell, color: "orange" }
];

const recipientTypes = [
  { id: "candidates", name: "Candidates", icon: Users },
  { id: "clients", name: "Clients", icon: Users },
  { id: "recruiters", name: "Recruiters", icon: Users },
  { id: "admins", name: "Administrators", icon: Settings }
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" }
];

const mockTemplates = [
  // Job-related templates
  {
    id: "1",
    name: "Job Application Confirmation",
    module: "jobs",
    event: "candidate_applied",
    channel: "email",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-15",
    version: "1.2",
    subject: "Application Received - {{job_title}}",
    content: "Dear {{candidate_name}}, We have received your application for the position of {{job_title}} at {{company_name}}. Our recruitment team will review your application and get back to you within 3-5 business days. Thank you for your interest in joining our team.\n\nBest regards,\n{{recruiter_name}}"
  },
  {
    id: "2",
    name: "Job Published Notification",
    module: "jobs",
    event: "job_published",
    channel: "email",
    recipientType: "clients",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-14",
    version: "2.0",
    subject: "Your Job Posting is Now Live - {{job_title}}",
    content: "Dear {{client_name}}, Your job posting for {{job_title}} has been successfully published and is now live on our platform. We expect to start receiving applications within the next 24-48 hours.\n\nJob Details:\n- Position: {{job_title}}\n- Location: {{job_location}}\n- Posted Date: {{publish_date}}\n\nWe'll keep you updated on the application progress.\n\nBest regards,\n{{recruiter_name}}"
  },
  {
    id: "3",
    name: "Job Closure Alert",
    module: "jobs",
    event: "job_closed",
    channel: "sms",
    recipientType: "recruiters",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-13",
    version: "1.0",
    content: "Alert: Job {{job_title}} (ID: {{job_id}}) has been closed. Total applications received: {{application_count}}. Please follow up with shortlisted candidates."
  },
  {
    id: "4",
    name: "Job Expiry Warning",
    module: "jobs",
    event: "job_expired",
    channel: "push",
    recipientType: "admins",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-12",
    version: "1.1",
    content: "Job posting for {{job_title}} has expired. Consider extending the deadline or closing the position."
  },

  // Interview-related templates
  {
    id: "5",
    name: "Interview Reminder",
    module: "interviews",
    event: "interview_scheduled",
    channel: "whatsapp",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-14",
    version: "2.1",
    content: "Hi {{candidate_name}}! 👋\n\nReminder: You have an interview scheduled for {{interview_date}} at {{interview_time}} for the position of {{job_title}}.\n\n📍 Location: {{interview_location}}\n👤 Interviewer: {{interviewer_name}}\n\nPlease arrive 10 minutes early. Good luck! 🍀"
  },
  {
    id: "6",
    name: "Interview Completion Follow-up",
    module: "interviews",
    event: "interview_completed",
    channel: "email",
    recipientType: "clients",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-11",
    version: "1.3",
    subject: "Interview Completed - {{candidate_name}} for {{job_title}}",
    content: "Dear {{client_name}},\n\nThe interview for {{candidate_name}} has been completed for the {{job_title}} position.\n\nInterview Details:\n- Date: {{interview_date}}\n- Duration: {{interview_duration}}\n- Interviewer: {{interviewer_name}}\n- Overall Rating: {{interview_rating}}/5\n\nDetailed feedback and next steps will be shared within 24 hours.\n\nBest regards,\n{{recruiter_name}}"
  },
  {
    id: "7",
    name: "Interview Reschedule Alert",
    module: "interviews",
    event: "interview_rescheduled",
    channel: "email",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-10",
    version: "1.0",
    subject: "Interview Rescheduled - {{job_title}}",
    content: "Dear {{candidate_name}},\n\nYour interview for the {{job_title}} position has been rescheduled.\n\nNew Interview Details:\n- Date: {{new_interview_date}}\n- Time: {{new_interview_time}}\n- Location: {{interview_location}}\n- Interviewer: {{interviewer_name}}\n\nWe apologize for any inconvenience caused. Please confirm your availability.\n\nBest regards,\n{{recruiter_name}}"
  },

  // Candidate-related templates
  {
    id: "8",
    name: "Profile Update Confirmation",
    module: "candidates",
    event: "profile_updated",
    channel: "email",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-09",
    version: "1.0",
    subject: "Profile Updated Successfully",
    content: "Dear {{candidate_name}},\n\nYour profile has been successfully updated. The changes will be reflected in your job applications and will help us match you with more relevant opportunities.\n\nUpdated sections:\n{{updated_sections}}\n\nThank you for keeping your profile current.\n\nBest regards,\nThe Recruitment Team"
  },
  {
    id: "9",
    name: "Candidate Shortlisted",
    module: "candidates",
    event: "candidate_shortlisted",
    channel: "whatsapp",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-08",
    version: "1.5",
    content: "🎉 Congratulations {{candidate_name}}!\n\nYou've been shortlisted for the {{job_title}} position at {{company_name}}.\n\nNext steps:\n1. You'll receive an interview invitation within 24-48 hours\n2. Please prepare your portfolio/documents\n3. Research about the company\n\nGood luck! 🌟"
  },
  {
    id: "10",
    name: "New Candidate Registration",
    module: "candidates",
    event: "candidate_applied",
    channel: "sms",
    recipientType: "recruiters",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-07",
    version: "1.0",
    content: "New application received for {{job_title}}. Candidate: {{candidate_name}} | Experience: {{experience_years}} years | Skills: {{key_skills}}. Review profile in dashboard."
  },

  // Placement-related templates
  {
    id: "11",
    name: "Placement Confirmation",
    module: "placements",
    event: "placement_confirmed",
    channel: "email",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-06",
    version: "2.0",
    subject: "Congratulations! Job Offer Confirmed - {{job_title}}",
    content: "Dear {{candidate_name}},\n\nCongratulations! 🎉 Your job offer for the position of {{job_title}} at {{company_name}} has been confirmed.\n\nOffer Details:\n- Position: {{job_title}}\n- Start Date: {{start_date}}\n- Salary: {{salary}}\n- Location: {{work_location}}\n\nPlease sign and return the attached contract by {{contract_deadline}}.\n\nWelcome to the team!\n\nBest regards,\n{{recruiter_name}}"
  },
  {
    id: "12",
    name: "Placement Started",
    module: "placements",
    event: "placement_started",
    channel: "email",
    recipientType: "clients",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-05",
    version: "1.2",
    subject: "Placement Started - {{candidate_name}} has joined {{company_name}}",
    content: "Dear {{client_name}},\n\nWe're pleased to inform you that {{candidate_name}} has successfully started their role as {{job_title}} at {{company_name}} today.\n\nPlacement Details:\n- Employee: {{candidate_name}}\n- Position: {{job_title}}\n- Start Date: {{start_date}}\n- Probation Period: {{probation_period}}\n\nWe'll follow up in 30 days to ensure smooth onboarding.\n\nThank you for choosing our services.\n\nBest regards,\n{{account_manager}}"
  },
  {
    id: "13",
    name: "Placement Completion",
    module: "placements",
    event: "placement_completed",
    channel: "push",
    recipientType: "recruiters",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-04",
    version: "1.0",
    content: "Placement milestone: {{candidate_name}} has successfully completed probation period for {{job_title}} at {{company_name}}. Commission eligible for processing."
  },

  // Multi-language templates
  {
    id: "14",
    name: "Confirmación de Aplicación",
    module: "jobs",
    event: "candidate_applied",
    channel: "email",
    recipientType: "candidates",
    language: "es",
    status: "active",
    lastUpdated: "2024-01-03",
    version: "1.0",
    subject: "Aplicación Recibida - {{job_title}}",
    content: "Estimado/a {{candidate_name}},\n\nHemos recibido su aplicación para el puesto de {{job_title}} en {{company_name}}. Nuestro equipo de reclutamiento revisará su aplicación y se pondrá en contacto con usted en un plazo de 3-5 días hábiles.\n\nGracias por su interés en unirse a nuestro equipo.\n\nSaludos cordiales,\n{{recruiter_name}}"
  },
  {
    id: "15",
    name: "Rappel d'Entretien",
    module: "interviews",
    event: "interview_scheduled",
    channel: "email",
    recipientType: "candidates",
    language: "fr",
    status: "active",
    lastUpdated: "2024-01-02",
    version: "1.0",
    subject: "Rappel d'Entretien - {{job_title}}",
    content: "Cher/Chère {{candidate_name}},\n\nRappel : Vous avez un entretien programmé le {{interview_date}} à {{interview_time}} pour le poste de {{job_title}}.\n\nLieu : {{interview_location}}\nIntervieweur : {{interviewer_name}}\n\nVeuillez arriver 10 minutes en avance.\n\nCordialement,\n{{recruiter_name}}"
  },

  // Additional WhatsApp templates
  {
    id: "16",
    name: "Quick Status Update",
    module: "jobs",
    event: "job_published",
    channel: "whatsapp",
    recipientType: "recruiters",
    language: "en",
    status: "active",
    lastUpdated: "2024-01-01",
    version: "1.0",
    content: "📢 Job Alert: {{job_title}} is now live! Target: {{target_applications}} applications. Current: 0. Let's start sourcing! 💪"
  },
  {
    id: "17",
    name: "Client Welcome Message",
    module: "candidates",
    event: "profile_updated",
    channel: "whatsapp",
    recipientType: "clients",
    language: "en",
    status: "draft",
    lastUpdated: "2023-12-30",
    version: "0.9",
    content: "Welcome to our platform, {{client_name}}! 🎯 We've updated candidate profiles to better match your {{job_title}} requirements. Check your dashboard for new matches!"
  },

  // Push notification templates
  {
    id: "18",
    name: "Urgent Interview Request",
    module: "interviews",
    event: "interview_rescheduled",
    channel: "push",
    recipientType: "candidates",
    language: "en",
    status: "active",
    lastUpdated: "2023-12-29",
    version: "1.0",
    content: "⚡ Interview rescheduled for {{job_title}}. New time: {{new_interview_time}} on {{new_interview_date}}. Please confirm ASAP."
  },
  {
    id: "19",
    name: "System Maintenance Alert",
    module: "jobs",
    event: "job_expired",
    channel: "push",
    recipientType: "admins",
    language: "en",
    status: "active",
    lastUpdated: "2023-12-28",
    version: "1.0",
    content: "🔧 System maintenance in 30 minutes. All job postings and applications will be temporarily unavailable for 2 hours."
  },

  // German template
  {
    id: "20",
    name: "Stellenbestätigung",
    module: "placements",
    event: "placement_confirmed",
    channel: "email",
    recipientType: "candidates",
    language: "de",
    status: "active",
    lastUpdated: "2023-12-27",
    version: "1.0",
    subject: "Stellenangebot bestätigt - {{job_title}}",
    content: "Liebe/r {{candidate_name}},\n\nHerzlichen Glückwunsch! Ihr Stellenangebot für die Position {{job_title}} bei {{company_name}} wurde bestätigt.\n\nDetails:\n- Position: {{job_title}}\n- Startdatum: {{start_date}}\n- Gehalt: {{salary}}\n\nBitte unterschreiben und senden Sie den Vertrag bis {{contract_deadline}} zurück.\n\nMit freundlichen Grüßen,\n{{recruiter_name}}"
  }
];

export default function CommunicationManager() {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // AI Writing states
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState<"subject" | "content">("content");
  const [messageContent, setMessageContent] = useState("");
  const [subjectContent, setSubjectContent] = useState("");

  // AI content generation function
  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI API call - replace with actual AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const prompts = {
        subject: {
          "job application": "Application Received - {{job_title}} Position",
          "interview reminder": "Interview Reminder - {{job_title}} at {{company_name}}",
          "placement confirmation": "Congratulations! Job Offer Confirmed - {{job_title}}",
          "interview scheduled": "Interview Scheduled - {{job_title}} Position",
          "default": "{{job_title}} - Update from {{company_name}}"
        },
        content: {
          "job application": `Dear {{candidate_name}},

Thank you for your application for the {{job_title}} position at {{company_name}}. We have received your application and our recruitment team will review it carefully.

We will contact you within 3-5 business days with an update on your application status. In the meantime, feel free to explore more opportunities on our platform.

Thank you for your interest in joining our team.

Best regards,
{{recruiter_name}}
{{company_name}} Recruitment Team`,
          "interview reminder": `Hi {{candidate_name}}! 👋

This is a friendly reminder about your upcoming interview for the {{job_title}} position at {{company_name}}.

📅 Date: {{interview_date}}
🕐 Time: {{interview_time}}
📍 Location: {{interview_location}}
👤 Interviewer: {{interviewer_name}}

Please arrive 10 minutes early and bring a copy of your resume. If you need to reschedule, please contact us as soon as possible.

Good luck! We're looking forward to meeting you.

Best regards,
{{recruiter_name}}`,
          "placement confirmation": `Dear {{candidate_name}},

Congratulations! 🎉 We are delighted to confirm your job offer for the position of {{job_title}} at {{company_name}}.

Offer Details:
• Position: {{job_title}}
• Start Date: {{start_date}}
• Salary: {{salary}}
• Location: {{work_location}}
• Reporting Manager: {{manager_name}}

Please review the attached contract and return it signed by {{contract_deadline}}. We will also schedule an onboarding session before your start date.

Welcome to the {{company_name}} family! We're excited to have you on board.

Best regards,
{{recruiter_name}}
HR Department, {{company_name}}`,
          "interview scheduled": `Dear {{candidate_name}},

Great news! We would like to invite you for an interview for the {{job_title}} position at {{company_name}}.

Interview Details:
📅 Date: {{interview_date}}
🕐 Time: {{interview_time}}
📍 Location: {{interview_location}}
👤 Interviewer: {{interviewer_name}}
⏱️ Duration: Approximately {{interview_duration}}

What to expect:
• Technical discussion about your experience
• Questions about your motivation and career goals
• Overview of the role and company culture
• Time for your questions

Please confirm your attendance by replying to this message. If you need to reschedule, please let us know at least 24 hours in advance.

Best regards,
{{recruiter_name}}`,
          "default": `Dear {{candidate_name}},

We hope this message finds you well. We wanted to reach out regarding the {{job_title}} position at {{company_name}}.

{{custom_message}}

If you have any questions, please don't hesitate to contact us.

Best regards,
{{recruiter_name}}`
        }
      };
      
      const promptKey = aiPrompt.toLowerCase();
      let content = "";
      
      if (contentType === "subject") {
        content = prompts.subject[promptKey] || prompts.subject.default;
      } else {
        content = prompts.content[promptKey] || prompts.content.default;
      }
      
      setGeneratedContent(content);
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const insertGeneratedContent = () => {
    if (contentType === "subject") {
      setSubjectContent(generatedContent);
      const subjectInput = document.getElementById("subject") as HTMLInputElement;
      if (subjectInput) subjectInput.value = generatedContent;
    } else {
      setMessageContent(generatedContent);
      const contentTextarea = document.getElementById("content") as HTMLTextAreaElement;
      if (contentTextarea) contentTextarea.value = generatedContent;
    }
    setIsAIDialogOpen(false);
    setGeneratedContent("");
    setAiPrompt("");
  };

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === "all" || !selectedModule || template.module === selectedModule;
    const matchesChannel = selectedChannel === "all" || !selectedChannel || template.channel === selectedChannel;
    const matchesRecipient = selectedRecipient === "all" || !selectedRecipient || template.recipientType === selectedRecipient;
    
    return matchesSearch && matchesModule && matchesChannel && matchesRecipient;
  });

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.icon || MessageSquare;
  };

  const getChannelColor = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.color || "gray";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Manager</h1>
          <p className="text-gray-600 mt-2">Manage notification templates across all channels and modules</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Templates</p>
                <p className="text-2xl font-bold text-blue-900">47</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Templates</p>
                <p className="text-2xl font-bold text-green-900">42</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Channels</p>
                <p className="text-2xl font-bold text-purple-900">4</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Languages</p>
                <p className="text-2xl font-bold text-orange-900">{languages.length}</p>
              </div>
              <Globe className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search Templates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                        <channel.icon className="w-4 h-4" />
                        {channel.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Recipients</Label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="All Recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  {recipientTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Module/Event</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => {
                const ChannelIcon = getChannelIcon(template.channel);
                return (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{template.module}</span>
                        <span className="text-sm text-gray-500">{template.event.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ChannelIcon className={`w-4 h-4 text-${getChannelColor(template.channel)}-600`} />
                        <span className="capitalize">{template.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {template.recipientType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{languages.find(l => l.code === template.language)?.flag}</span>
                        <span>{template.language.toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={template.status === 'active' ? 'default' : 'secondary'}
                        className={template.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell>v{template.version}</TableCell>
                    <TableCell>{template.lastUpdated}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsPreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TestTube className="w-4 h-4 mr-2" />
                              Send Test
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new notification template for your communication workflows
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input id="template-name" placeholder="Enter template name" />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input id="template-description" placeholder="Brief description" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Module</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Event</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job_created">Job Created</SelectItem>
                      <SelectItem value="candidate_applied">Candidate Applied</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map(channel => (
                        <SelectItem key={channel.id} value={channel.id}>
                          <div className="flex items-center gap-2">
                            <channel.icon className="w-4 h-4" />
                            {channel.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recipient Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipientTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="subject">Subject Line (for email)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setContentType("subject");
                      setIsAIDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Write with AI
                  </Button>
                </div>
                <Input id="subject" placeholder="{{job_title}} - Application Received" />
                <p className="text-sm text-gray-500 mt-1">
                  Use placeholders like {`{{candidate_name}}, {{job_title}}, {{company_name}}`}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Message Content</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setContentType("content");
                      setIsAIDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Write with AI
                  </Button>
                </div>
                <Textarea 
                  id="content" 
                  rows={8}
                  placeholder="Dear {{candidate_name}},

We have received your application for the position of {{job_title}} at {{company_name}}.

Thank you for your interest in joining our team.

Best regards,
{{recruiter_name}}"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Available Placeholders:</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="bg-blue-100 px-2 py-1 rounded">{"{{candidate_name}}"}</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">{"{{job_title}}"}</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">{"{{company_name}}"}</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">{"{{recruiter_name}}"}</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">{"{{interview_date}}"}</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">{"{{interview_time}}"}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Template Active</Label>
                  <Switch id="active" defaultChecked />
                </div>
                <div>
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            {lang.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-send">Auto Send</Label>
                  <Switch id="auto-send" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="delay">Send Delay (minutes)</Label>
                  <Input id="delay" type="number" defaultValue="0" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="urgent, welcome, reminder (comma separated)" />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Email Preview</h4>
                <div className="bg-white p-4 rounded border">
                  <div className="border-b pb-2 mb-4">
                    <p className="text-sm text-gray-600">Subject:</p>
                    <p className="font-medium">Software Engineer Position - Application Received</p>
                  </div>
                  <div className="space-y-2">
                    <p>Dear John Doe,</p>
                    <p>We have received your application for the position of Software Engineer at TechCorp Inc.</p>
                    <p>Thank you for your interest in joining our team.</p>
                    <p>Best regards,<br />Sarah Johnson</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview All Channels
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how this template will appear to recipients
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Template:</span> {selectedTemplate.name}
                </div>
                <div>
                  <span className="font-medium">Channel:</span> {selectedTemplate.channel}
                </div>
                <div>
                  <span className="font-medium">Recipients:</span> {selectedTemplate.recipientType}
                </div>
                <div>
                  <span className="font-medium">Version:</span> v{selectedTemplate.version}
                </div>
              </div>
              
              <Separator />
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {selectedTemplate.channel === 'email' && selectedTemplate.subject && (
                  <div className="border-b pb-2 mb-4">
                    <p className="text-sm text-gray-600">Subject:</p>
                    <p className="font-medium">{selectedTemplate.subject}</p>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{selectedTemplate.content}</div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <TestTube className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Template
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Writing Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Write with AI
            </DialogTitle>
            <DialogDescription>
              Tell AI what kind of {contentType === "subject" ? "subject line" : "message content"} you want to generate
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">What would you like to write?</Label>
              <Select value={aiPrompt} onValueChange={setAiPrompt}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template type or describe your needs..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job application">Job Application Confirmation</SelectItem>
                  <SelectItem value="interview reminder">Interview Reminder</SelectItem>
                  <SelectItem value="interview scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="placement confirmation">Placement Confirmation</SelectItem>
                  <SelectItem value="custom">Custom (describe below)</SelectItem>
                </SelectContent>
              </Select>
              {aiPrompt === "custom" && (
                <Textarea 
                  placeholder="Describe what you want the AI to write..."
                  className="mt-2"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateAIContent}
                disabled={isGenerating || !aiPrompt}
                className="bg-gradient-to-r from-purple-600 to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {contentType === "subject" ? "Subject" : "Content"}
                  </>
                )}
              </Button>
              {generatedContent && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setGeneratedContent("");
                    setAiPrompt("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {generatedContent && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900">AI Generated {contentType === "subject" ? "Subject" : "Content"}</span>
                  </div>
                  <div className="bg-white rounded border p-3 whitespace-pre-wrap text-sm">
                    {generatedContent}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={insertGeneratedContent} className="bg-gradient-to-r from-green-600 to-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Use This Content
                  </Button>
                  <Button variant="outline" onClick={generateAIContent}>
                    <Brain className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better AI content:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about the purpose (e.g., "job application confirmation")</li>
                <li>• The AI will automatically include placeholders like {`{{candidate_name}}`}</li>
                <li>• Generated content will match the tone appropriate for your audience</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}