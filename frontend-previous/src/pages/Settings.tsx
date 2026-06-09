import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Crown, Settings as SettingsIcon, ExternalLink, Plus, Zap, Linkedin, Github, Mail, Calendar, Briefcase, Users, Globe, Database, Phone, MessageSquare, Monitor, Smartphone, Send, Headphones, Bot, Brain, Sparkles, FileText, Upload, Filter, Search, Clock, Trophy, UserCheck, BarChart3, Building2, Network, AlertTriangle, Bell, TrendingUp, Download, Info, Eye, Activity } from "lucide-react";
import UserManagement from "./UserManagement";
import Permissions from "./Permissions";
import Roles from "./Roles";
import ApplicationUsageReport from "./ApplicationUsageReport";
import IntegrationsTab from "@/components/IntegrationsTab";
import EventBinding from "./EventBinding";
import EventManager from "./EventManager"; 
import MappingBuilder from "./MappingBuilder";

// Form schema for adding new integration
const integrationFormSchema = z.object({
  name: z.string().min(1, "Integration name is required"),
  type: z.string().min(1, "Integration type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  baseUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type IntegrationFormData = z.infer<typeof integrationFormSchema>;

// Form schema for adding new AI agent
const aiAgentFormSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  context: z.string().min(1, "Context is required"),
  type: z.string().min(1, "Agent type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  prompt: z.string().min(20, "Prompt must be at least 20 characters"),
  permission: z.string().min(1, "Permission is required"),
  parameters: z.string().optional(),
});

type AIAgentFormData = z.infer<typeof aiAgentFormSchema>;

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'users';
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>({
    linkedin: true,
    indeed: false,
    ziprecruiter: false,
    monster: false,
    glassdoor: false,
    careerbuilder: false,
    jobboards: false,
    zapier: true,
    outlook: true,
    slack: false,
    github: false,
    zoom: false,
    greenhouse: false,
    twilio: false,
    ringcentral: false,
    voicemail: false,
    sms: false,
    whatsapp: false,
    teams: false,
  });
  const [aiAgentStates, setAiAgentStates] = useState<Record<string, boolean>>({
    'job-description-generator': true,
    'candidate-matcher': true,
    'interview-scheduler': false,
    'email-responder': true,
    'resume-parser': true,
    'skill-extractor': false,
    'sentiment-analyzer': false,
    'report-generator': true,
  });
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [agentDetailsOpen, setAgentDetailsOpen] = useState(false);
  const [addAgentDialogOpen, setAddAgentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [customIntegrationsEnabled, setCustomIntegrationsEnabled] = useState(false);
  const [integrationCredentials, setIntegrationCredentials] = useState<Record<string, { userId?: string; password?: string; apiKey?: string }>>({});
  const { toast } = useToast();

  // Form for adding new AI agent
  const aiAgentForm = useForm<AIAgentFormData>({
    resolver: zodResolver(aiAgentFormSchema),
    defaultValues: {
      name: "",
      context: "",
      type: "",
      description: "",
      prompt: "",
      permission: "",
      parameters: "",
    },
  });

  // Handle AI agent form submission
  const onSubmitAIAgent = (data: AIAgentFormData) => {
    // Generate a unique ID for the new agent
    const newAgentId = data.name.toLowerCase().replace(/\s+/g, '-');
    
    // Add the new agent to the states
    setAiAgentStates(prev => ({
      ...prev,
      [newAgentId]: true
    }));
    
    // Reset form and close dialog
    aiAgentForm.reset();
    setAddAgentDialogOpen(false);
    
    // Show success message
    toast({
      title: "AI Agent Created",
      description: `${data.name} has been successfully created and activated.`,
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrationStates(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  // Helper function to get agent information
  const getAgentInfo = (agentId: string) => {
    const agentMap: Record<string, any> = {
      'job-description-generator': {
        name: 'Job Description Generator',
        module: 'Jobs',
        description: 'Automatically generates comprehensive job descriptions based on role requirements and company culture.',
        icon: FileText,
        color: 'bg-blue-500',
        capabilities: ['Natural Language Generation', 'Template Matching', 'Industry Standards', 'SEO Optimization'],
        metrics: {
          tasksProcessed: 1247,
          successRate: 94.2,
          avgResponseTime: '1.2s',
          errorRate: 5.8,
          lastUsed: '2 hours ago',
          totalSaved: '120 hours',
          costSavings: '$3,200'
        },
        usage: {
          daily: [85, 92, 78, 89, 95, 88, 90],
          weekly: [78, 82, 85, 91, 89, 94, 88],
          monthly: [520, 580, 645, 720, 680, 750, 820, 890, 945, 1020, 1150, 1247]
        }
      },
      'candidate-matcher': {
        name: 'Candidate Matcher',
        module: 'Candidates',
        description: 'Intelligently matches candidates to job opportunities using advanced AI algorithms.',
        icon: Users,
        color: 'bg-green-500',
        capabilities: ['Skill Matching', 'Experience Analysis', 'Cultural Fit Assessment', 'Scoring Algorithm'],
        metrics: {
          tasksProcessed: 2834,
          successRate: 97.8,
          avgResponseTime: '0.8s',
          errorRate: 2.2,
          lastUsed: '5 minutes ago',
          totalSaved: '340 hours',
          costSavings: '$8,500'
        },
        usage: {
          daily: [120, 135, 142, 128, 155, 149, 162],
          weekly: [145, 158, 162, 168, 171, 175, 180],
          monthly: [1200, 1350, 1580, 1820, 2050, 2280, 2450, 2580, 2680, 2750, 2800, 2834]
        }
      },
      'interview-scheduler': {
        name: 'Interview Scheduler',
        module: 'Interviews',
        description: 'Automates interview scheduling by coordinating between candidate and interviewer calendars.',
        icon: Calendar,
        color: 'bg-purple-500',
        capabilities: ['Calendar Integration', 'Timezone Management', 'Automated Reminders', 'Conflict Resolution'],
        metrics: {
          tasksProcessed: 892,
          successRate: 91.5,
          avgResponseTime: '2.1s',
          errorRate: 8.5,
          lastUsed: '1 hour ago',
          totalSaved: '180 hours',
          costSavings: '$4,500'
        },
        usage: {
          daily: [45, 52, 48, 55, 58, 61, 49],
          weekly: [48, 52, 55, 58, 61, 65, 68],
          monthly: [320, 380, 420, 480, 520, 580, 620, 680, 720, 780, 850, 892]
        }
      },
      'email-responder': {
        name: 'Email Responder',
        module: 'Communications',
        description: 'Provides intelligent email responses and follow-ups based on context and intent.',
        icon: Mail,
        color: 'bg-orange-500',
        capabilities: ['Intent Recognition', 'Template Generation', 'Personalization', 'Follow-up Tracking'],
        metrics: {
          tasksProcessed: 3567,
          successRate: 89.7,
          avgResponseTime: '1.5s',
          errorRate: 10.3,
          lastUsed: '10 minutes ago',
          totalSaved: '450 hours',
          costSavings: '$11,250'
        },
        usage: {
          daily: [180, 195, 210, 185, 220, 205, 195],
          weekly: [190, 200, 210, 220, 225, 230, 240],
          monthly: [1500, 1680, 1920, 2180, 2450, 2720, 2980, 3150, 3280, 3380, 3480, 3567]
        }
      },
      'resume-parser': {
        name: 'Resume Parser',
        module: 'Candidates',
        description: 'Extracts and structures information from resumes and CV documents automatically.',
        icon: Upload,
        color: 'bg-red-500',
        capabilities: ['Document Parsing', 'Data Extraction', 'Format Recognition', 'Information Structuring'],
        metrics: {
          tasksProcessed: 1678,
          successRate: 96.3,
          avgResponseTime: '0.9s',
          errorRate: 3.7,
          lastUsed: '30 minutes ago',
          totalSaved: '280 hours',
          costSavings: '$7,000'
        },
        usage: {
          daily: [95, 102, 88, 115, 108, 125, 118],
          weekly: [98, 105, 112, 118, 122, 128, 135],
          monthly: [650, 720, 820, 920, 1050, 1180, 1290, 1380, 1450, 1520, 1600, 1678]
        }
      },
      'skill-extractor': {
        name: 'Skill Extractor',
        module: 'Candidates',
        description: 'Identifies and categorizes skills from job descriptions and candidate profiles.',
        icon: Brain,
        color: 'bg-indigo-500',
        capabilities: ['Skill Recognition', 'Technology Mapping', 'Experience Levels', 'Competency Analysis'],
        metrics: {
          tasksProcessed: 945,
          successRate: 93.8,
          avgResponseTime: '1.1s',
          errorRate: 6.2,
          lastUsed: '45 minutes ago',
          totalSaved: '95 hours',
          costSavings: '$2,375'
        },
        usage: {
          daily: [52, 58, 45, 62, 55, 68, 60],
          weekly: [55, 58, 62, 65, 68, 72, 75],
          monthly: [380, 420, 480, 540, 620, 680, 740, 800, 850, 890, 920, 945]
        }
      },
      'sentiment-analyzer': {
        name: 'Sentiment Analyzer',
        module: 'Communications',
        description: 'Analyzes sentiment in communications to improve candidate and client relationships.',
        icon: Activity,
        color: 'bg-pink-500',
        capabilities: ['Emotion Detection', 'Tone Analysis', 'Engagement Scoring', 'Relationship Insights'],
        metrics: {
          tasksProcessed: 567,
          successRate: 88.4,
          avgResponseTime: '0.7s',
          errorRate: 11.6,
          lastUsed: '1.5 hours ago',
          totalSaved: '85 hours',
          costSavings: '$2,125'
        },
        usage: {
          daily: [28, 32, 25, 35, 30, 38, 32],
          weekly: [30, 32, 35, 38, 40, 42, 45],
          monthly: [180, 210, 250, 290, 340, 380, 420, 460, 500, 530, 550, 567]
        }
      },
      'report-generator': {
        name: 'Report Generator',
        module: 'Reports',
        description: 'Creates comprehensive reports and analytics from recruitment data automatically.',
        icon: BarChart3,
        color: 'bg-cyan-500',
        capabilities: ['Data Visualization', 'Trend Analysis', 'Custom Reports', 'Export Options'],
        metrics: {
          tasksProcessed: 234,
          successRate: 95.7,
          avgResponseTime: '3.2s',
          errorRate: 4.3,
          lastUsed: '3 hours ago',
          totalSaved: '150 hours',
          costSavings: '$3,750'
        },
        usage: {
          daily: [12, 15, 10, 18, 14, 20, 16],
          weekly: [14, 16, 18, 20, 22, 24, 26],
          monthly: [80, 95, 115, 135, 155, 175, 190, 205, 215, 225, 230, 234]
        }
      }
    };
    
    return agentMap[agentId] || {
      name: agentId,
      module: 'Unknown',
      description: 'No description available',
      icon: Bot,
      color: 'bg-gray-500',
      capabilities: [],
      metrics: {
        tasksProcessed: 0,
        successRate: 0,
        avgResponseTime: '0s',
        errorRate: 0,
        lastUsed: 'Never',
        totalSaved: '0 hours',
        costSavings: '$0'
      },
      usage: {
        daily: [0, 0, 0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    };
  };

  // Get module summary data
  const getModuleSummary = () => {
    const modules = ['Jobs', 'Candidates', 'Submissions', 'Interviews', 'Communications', 'Reports'];
    return modules.map(module => {
      const moduleAgents = Object.keys(aiAgentStates).filter(agentId => {
        const agent = getAgentInfo(agentId);
        return agent.module === module;
      });
      
      const totalTasks = moduleAgents.reduce((sum, agentId) => 
        sum + getAgentInfo(agentId).metrics.tasksProcessed, 0
      );
      
      const avgSuccessRate = moduleAgents.length > 0 
        ? moduleAgents.reduce((sum, agentId) => 
            sum + getAgentInfo(agentId).metrics.successRate, 0
          ) / moduleAgents.length
        : 0;
      
      const activeAgents = moduleAgents.filter(agentId => aiAgentStates[agentId]).length;
      
      const totalSavings = moduleAgents.reduce((sum, agentId) => {
        const savings = getAgentInfo(agentId).metrics.costSavings;
        return sum + parseInt(savings.replace(/[$,]/g, ''));
      }, 0);

      return {
        name: module,
        totalTasks,
        avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
        activeAgents,
        totalAgents: moduleAgents.length,
        totalSavings: `$${totalSavings.toLocaleString()}`
      };
    });
  };

  return (
    <div className="p-6 space-y-8">
      {currentTab === 'users' && <UserManagement />}
      {currentTab === 'permissions' && <Permissions />}
      {currentTab === 'roles' && <Roles />}
      {currentTab === 'application-usage' && <ApplicationUsageReport />}
      {currentTab === 'integrations' && (
        <IntegrationsTab
          integrationStates={integrationStates}
          toggleIntegration={toggleIntegration}
          webhookUrl={webhookUrl}
          setWebhookUrl={setWebhookUrl}
        />
      )}
      {currentTab === 'event-binding' && <EventBinding />}
      {currentTab === 'event-manager' && <EventManager />}
      {currentTab === 'mapping-builder' && <MappingBuilder />}
      {currentTab === 'ai-workbench' && (
        <div className="space-y-8">
          {/* Module Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {getModuleSummary().map((module, index) => {
              const gradients = [
                'bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 shadow-blue-200/50',
                'bg-gradient-to-br from-green-200 via-green-300 to-green-400 shadow-green-200/50', 
                'bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 shadow-purple-200/50',
                'bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 shadow-orange-200/50',
                'bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 shadow-pink-200/50',
                'bg-gradient-to-br from-cyan-200 via-cyan-300 to-cyan-400 shadow-cyan-200/50'
              ];
              const textColors = [
                'text-blue-900',
                'text-green-900',
                'text-purple-900', 
                'text-orange-900',
                'text-pink-900',
                'text-cyan-900'
              ];
              const cardGradient = gradients[index % gradients.length];
              const textColor = textColors[index % textColors.length];
              
              return (
                <Card key={module.name} className={`${cardGradient} ${textColor} border-0 hover:shadow-2xl shadow-lg transition-all duration-500 hover:scale-110 transform`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg flex items-center justify-between ${textColor} font-bold`}>
                      {module.name}
                      <Badge className="bg-white/40 text-gray-800 border-white/50 hover:bg-white/60 font-semibold">{module.activeAgents}/{module.totalAgents} Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`${textColor} opacity-80 font-medium`}>Total Tasks</span>
                        <span className={`font-bold ${textColor}`}>{module.totalTasks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textColor} opacity-80 font-medium`}>Avg Success Rate</span>
                        <span className={`font-bold ${textColor}`}>{module.avgSuccessRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textColor} opacity-80 font-medium`}>Cost Savings</span>
                        <span className={`font-bold ${textColor}`}>{module.totalSavings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Module Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by module:</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="candidates">Candidates</SelectItem>
                  <SelectItem value="submissions">Submissions</SelectItem>
                  <SelectItem value="interviews">Interviews</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Dialog open={addAgentDialogOpen} onOpenChange={setAddAgentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add AI Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New AI Agent</DialogTitle>
                  </DialogHeader>
                  <Form {...aiAgentForm}>
                    <form onSubmit={aiAgentForm.handleSubmit(onSubmitAIAgent)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={aiAgentForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Smart Resume Analyzer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={aiAgentForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select agent type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="data-processor">Data Processor</SelectItem>
                                  <SelectItem value="content-generator">Content Generator</SelectItem>
                                  <SelectItem value="analyzer">Analyzer</SelectItem>
                                  <SelectItem value="scheduler">Scheduler</SelectItem>
                                  <SelectItem value="communicator">Communicator</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={aiAgentForm.control}
                        name="context"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Context/Module</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select context or module" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="jobs">Jobs</SelectItem>
                                <SelectItem value="candidates">Candidates</SelectItem>
                                <SelectItem value="submissions">Submissions</SelectItem>
                                <SelectItem value="interviews">Interviews</SelectItem>
                                <SelectItem value="communications">Communications</SelectItem>
                                <SelectItem value="reports">Reports</SelectItem>
                                <SelectItem value="placements">Placements</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiAgentForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what this AI agent does..." rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiAgentForm.control}
                        name="permission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required Permission</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select required permission" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="jobs.create">Create Jobs</SelectItem>
                                <SelectItem value="jobs.view">View Jobs</SelectItem>
                                <SelectItem value="jobs.edit">Edit Jobs</SelectItem>
                                <SelectItem value="candidates.manage">Manage Candidates</SelectItem>
                                <SelectItem value="candidates.view">View Candidates</SelectItem>
                                <SelectItem value="interviews.schedule">Schedule Interviews</SelectItem>
                                <SelectItem value="reports.access">Access Reports</SelectItem>
                                <SelectItem value="system.admin">System Administration</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiAgentForm.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter the detailed system prompt for this AI agent..." rows={4} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiAgentForm.control}
                        name="parameters"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parameters (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder='{"temperature": 0.7, "max_tokens": 1000}' rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setAddAgentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Agent
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* AI Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(aiAgentStates)
              .filter(([agentId]) => {
                const agentInfo = getAgentInfo(agentId);
                const matchesModule = selectedModule === 'all' || agentInfo.module.toLowerCase() === selectedModule;
                const matchesSearch = searchQuery === '' || 
                  agentInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  agentInfo.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesModule && matchesSearch;
              })
              .map(([agentId, isActive]) => {
              const agentInfo = getAgentInfo(agentId);
              return (
                <Card key={agentId} className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/40 border border-gray-200/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/40 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${agentInfo.color}`}>
                          <agentInfo.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agentInfo.name}</CardTitle>
                          <p className="text-sm text-gray-600">{agentInfo.module}</p>
                        </div>
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => 
                          setAiAgentStates(prev => ({ ...prev, [agentId]: checked }))
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{agentInfo.description}</p>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 border border-blue-300/60 p-4 rounded-xl shadow-md">
                        <p className="text-xs text-blue-800 font-bold uppercase tracking-wide">Tasks Processed</p>
                        <p className="font-black text-blue-900 text-lg">{agentInfo.metrics.tasksProcessed.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 via-green-200 to-green-300 border border-green-300/60 p-4 rounded-xl shadow-md">
                        <p className="text-xs text-green-800 font-bold uppercase tracking-wide">Success Rate</p>
                        <p className="font-black text-green-900 text-lg">{agentInfo.metrics.successRate}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 border border-purple-300/60 p-4 rounded-xl shadow-md">
                        <p className="text-xs text-purple-800 font-bold uppercase tracking-wide">Avg Response</p>
                        <p className="font-black text-purple-900 text-lg">{agentInfo.metrics.avgResponseTime}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 border border-orange-300/60 p-4 rounded-xl shadow-md">
                        <p className="text-xs text-orange-800 font-bold uppercase tracking-wide">Cost Savings</p>
                        <p className="font-black text-orange-900 text-lg">{agentInfo.metrics.costSavings}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agentInfo);
                            setAgentDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agentInfo);
                            setConfigModalOpen(true);
                          }}
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Agent Details Modal */}
          <Dialog open={agentDetailsOpen} onOpenChange={setAgentDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAgent && (
                    <>
                      <div className={`p-2 rounded-lg ${selectedAgent.color}`}>
                        <selectedAgent.icon className="w-5 h-5 text-white" />
                      </div>
                      {selectedAgent.name}
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              {selectedAgent && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-600">{selectedAgent.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Tasks Processed</p>
                          <p className="text-lg font-semibold text-blue-600">{selectedAgent.metrics.tasksProcessed.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="text-lg font-semibold text-green-600">{selectedAgent.metrics.successRate}%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                          <p className="text-lg font-semibold text-purple-600">{selectedAgent.metrics.avgResponseTime}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Error Rate</p>
                          <p className="text-lg font-semibold text-red-600">{selectedAgent.metrics.errorRate}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Usage & Impact</h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Last Used</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedAgent.metrics.lastUsed}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Time Saved</p>
                          <p className="text-lg font-semibold text-indigo-600">{selectedAgent.metrics.totalSaved}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Cost Savings</p>
                          <p className="text-lg font-semibold text-green-600">{selectedAgent.metrics.costSavings}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Module</h4>
                    <p className="text-gray-600">{selectedAgent.module}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Capabilities</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAgent.capabilities?.map((capability: string, index: number) => (
                        <Badge key={index} variant="outline">{capability}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Usage Trends</h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Daily Avg</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {Math.round(selectedAgent.usage.daily.reduce((a: number, b: number) => a + b, 0) / selectedAgent.usage.daily.length)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Weekly Avg</p>
                          <p className="text-lg font-semibold text-green-600">
                            {Math.round(selectedAgent.usage.weekly.reduce((a: number, b: number) => a + b, 0) / selectedAgent.usage.weekly.length)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monthly Trend</p>
                          <p className="text-lg font-semibold text-purple-600">
                            +{Math.round(((selectedAgent.usage.monthly[selectedAgent.usage.monthly.length - 1] - selectedAgent.usage.monthly[selectedAgent.usage.monthly.length - 2]) / selectedAgent.usage.monthly[selectedAgent.usage.monthly.length - 2]) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Configuration Modal */}
          <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Configure AI Agent</DialogTitle>
              </DialogHeader>
              {selectedAgent && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agent-name">Agent Name</Label>
                      <Input id="agent-name" defaultValue={selectedAgent.name} />
                    </div>
                    <div>
                      <Label htmlFor="agent-context">Context</Label>
                      <Select defaultValue={selectedAgent.module.toLowerCase()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job-list-view">Job List View</SelectItem>
                          <SelectItem value="job-detail-view">Job Detail View</SelectItem>
                          <SelectItem value="candidate-list-view">Candidate List View</SelectItem>
                          <SelectItem value="candidate-detail-view">Candidate Detail View</SelectItem>
                          <SelectItem value="submission-list-view">Submission List View</SelectItem>
                          <SelectItem value="submission-detail-view">Submission Detail View</SelectItem>
                          <SelectItem value="interview-list-view">Interview List View</SelectItem>
                          <SelectItem value="interview-detail-view">Interview Detail View</SelectItem>
                          <SelectItem value="placement-list-view">Placement List View</SelectItem>
                          <SelectItem value="placement-detail-view">Placement Detail View</SelectItem>
                          <SelectItem value="ticket-list-view">Ticket List View</SelectItem>
                          <SelectItem value="ticket-detail-view">Ticket Detail View</SelectItem>
                          <SelectItem value="business-partner-list-view">Business Partner List View</SelectItem>
                          <SelectItem value="business-partner-detail-view">Business Partner Detail View</SelectItem>
                          <SelectItem value="user-list-view">User List View</SelectItem>
                          <SelectItem value="user-detail-view">User Detail View</SelectItem>
                          <SelectItem value="communication-center">Communication Center</SelectItem>
                          <SelectItem value="reports-dashboard">Reports Dashboard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="agent-description">Description</Label>
                    <Textarea id="agent-description" defaultValue={selectedAgent.description} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="agent-permission">Permission</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jobs.create">Create Jobs</SelectItem>
                        <SelectItem value="jobs.view">View Jobs</SelectItem>
                        <SelectItem value="jobs.edit">Edit Jobs</SelectItem>
                        <SelectItem value="jobs.delete">Delete Jobs</SelectItem>
                        <SelectItem value="candidates.manage">Manage Candidates</SelectItem>
                        <SelectItem value="candidates.view">View Candidates</SelectItem>
                        <SelectItem value="interviews.schedule">Schedule Interviews</SelectItem>
                        <SelectItem value="reports.access">Access Reports</SelectItem>
                        <SelectItem value="users.manage">User Management</SelectItem>
                        <SelectItem value="system.admin">System Administration</SelectItem>
                        <SelectItem value="clients.communicate">Client Communication</SelectItem>
                        <SelectItem value="data.export">Export Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="agent-prompt">System Prompt</Label>
                    <Textarea id="agent-prompt" placeholder="Enter the system prompt for this AI agent..." rows={5} />
                  </div>
                  <div>
                    <Label htmlFor="agent-parameters">Parameters (JSON)</Label>
                    <Textarea id="agent-parameters" placeholder='{"temperature": 0.7, "max_tokens": 1000}' rows={3} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setConfigModalOpen(false)}>
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default Settings;