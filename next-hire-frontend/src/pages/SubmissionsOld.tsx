import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Calendar,
  Building,
  User,
  MapPin,
  DollarSign,
  Users2,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Users,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Settings,
  Share2,
  UserCheck,
  Activity,
  Mail,
  Bot,
  RotateCcw,
  Star,
  TrendingUp,
  PlusCircle,
  Send,
  RefreshCw,
  Trash,
  Zap,
  ListChecks,
  FileSpreadsheet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import submissionsData from "@/data/submissions.json";
import { CompanyFilter } from "@/components/CompanyFilter";

const Submissions = () => {
  const navigate = useNavigate();
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  // Group submissions by job
  const submissionsByJob = submissionsData.submissions.reduce((acc, submission) => {
    const jobKey = `${submission.jobId}-${submission.company}`;
    if (!acc[jobKey]) {
      acc[jobKey] = {
        jobId: submission.jobId,
        jobTitle: submission.jobTitle,
        company: submission.company,
        submissions: [],
      };
    }
    acc[jobKey].submissions.push(submission);
    return acc;
  }, {} as Record<string, any>);

  // Define submission stages
  const stages = [
    { id: "just-submitted", name: "Just Submitted", color: "bg-blue-100 text-blue-800" },
    { id: "client-submission", name: "Client Submission", color: "bg-purple-100 text-purple-800" },
    { id: "interviewing", name: "Interviewing", color: "bg-yellow-100 text-yellow-800" },
    { id: "placement", name: "Placement", color: "bg-green-100 text-green-800" },
  ];

  // Map submission status to stages
  const getStageForStatus = (status: string) => {
    switch (status) {
      case "Under Review": return "just-submitted";
      case "Pending Client Review": return "client-submission";
      case "Interview Scheduled": return "interviewing";
      default: return "just-submitted";
    }
  };

  const toggleJobExpansion = (jobKey: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobKey)) {
      newExpanded.delete(jobKey);
    } else {
      newExpanded.add(jobKey);
    }
    setExpandedJobs(newExpanded);
  };

  const toggleStageExpansion = (stageKey: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageKey)) {
      newExpanded.delete(stageKey);
    } else {
      newExpanded.add(stageKey);
    }
    setExpandedStages(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const totalSubmissions = submissionsData.submissions.length;
  const totalJobs = Object.keys(submissionsByJob).length;
  const activeSubmissions = submissionsData.submissions.filter(s => s.status !== "Rejected").length;
  const interviewScheduled = submissionsData.submissions.filter(s => s.status === "Interview Scheduled").length;

  const navigationCards = [
    {
      title: "Total Submissions",
      value: totalSubmissions.toString(),
      icon: FileText,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
    },
    {
      title: "Active Jobs",
      value: totalJobs.toString(),
      icon: Briefcase,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
    },
    {
      title: "In Progress",
      value: activeSubmissions.toString(),
      icon: Clock,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
    },
    {
      title: "Interviews",
      value: interviewScheduled.toString(),
      icon: Users,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
    },
  ];

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">Submissions</h1>
          </div>
          <CompanyFilter 
            onCompanyChange={(companyId) => console.log("Selected company:", companyId)}
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300">
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create a task
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="w-4 h-4 mr-2" />
                Send Followup
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="w-4 h-4 mr-2" />
                Change status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash className="w-4 h-4 mr-2" />
                Mark for deletion
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Recruiter
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ListChecks className="w-4 h-4 mr-2" />
                Mass changes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex-1 sm:flex-none px-2 sm:px-3 hover:scale-105">
            <Plus className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">New Submission</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
        {navigationCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title} 
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              
              {/* Animated pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <CardContent className="relative p-1.5 sm:p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-1 sm:p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20 group-hover:rotate-6 group-hover:scale-110">
                    <IconComponent className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${card.color} transition-transform duration-300`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab truncate">{card.title}</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 font-roboto-slab group-hover:scale-110 transition-transform duration-300">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submissions List with Interactive Connections */}
      <Card className="border-gray-200 shadow-sm overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardContent className="p-0 relative">
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          <div className="space-y-0 relative">
            {Object.entries(submissionsByJob).map(([jobKey, jobData], jobIndex) => (
              <div key={jobKey} className="relative">
                {/* Animated connection line for expanded jobs */}
                {expandedJobs.has(jobKey) && (
                  <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-green-400 opacity-60">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-purple-400 to-green-400 animate-pulse"></div>
                    <div className="absolute top-0 w-2 h-2 -left-0.75 bg-blue-400 rounded-full animate-ping"></div>
                  </div>
                )}
                
                <Collapsible 
                  open={expandedJobs.has(jobKey)}
                  onOpenChange={() => toggleJobExpansion(jobKey)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div 
                      className="flex items-center justify-between p-4 border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group relative overflow-hidden"
                      onMouseEnter={() => setHoveredJob(jobKey)}
                      onMouseLeave={() => setHoveredJob(null)}
                    >
                      {/* Hover effect background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-purple-100/20 to-blue-100/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="flex items-center gap-3 relative z-10 flex-1">
                        <div className="relative">
                          {expandedJobs.has(jobKey) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:rotate-180" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:rotate-90" />
                          )}
                          {hoveredJob === jobKey && (
                            <div className="absolute -inset-2 bg-blue-200 rounded-full animate-ping opacity-50"></div>
                          )}
                        </div>
                        <div className="relative">
                          <Briefcase className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                          {expandedJobs.has(jobKey) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-gray-900 font-poppins text-sm group-hover:text-blue-700 transition-colors duration-300">{jobData.jobTitle}</p>
                          <p className="text-xs text-gray-600 font-poppins">{jobData.company}</p>
                        </div>
                      </div>
                      
                      {/* Status Summary - Now at same level as job */}
                      <div className="flex items-center gap-2 relative z-10">
                        {stages.map((stage) => {
                          const stageSubmissions = jobData.submissions.filter(
                            (sub: any) => getStageForStatus(sub.status) === stage.id
                          );
                          if (stageSubmissions.length === 0) return null;
                          
                          return (
                            <div key={stage.id} className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${stage.color.includes('blue') ? 'bg-blue-400' : stage.color.includes('purple') ? 'bg-purple-400' : stage.color.includes('yellow') ? 'bg-yellow-400' : 'bg-green-400'} transition-all duration-300 group-hover:scale-125`}></div>
                              <Badge className={`${stage.color} border font-medium font-poppins text-xs transition-all duration-300 group-hover:scale-105`}>
                                {stage.name}: {stageSubmissions.length}
                              </Badge>
                            </div>
                          );
                        })}
                        
                        <Badge className="bg-blue-100 text-blue-800 border font-medium font-poppins text-xs group-hover:bg-blue-200 transition-colors duration-300 ml-2">
                          Total: {jobData.submissions.length}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 group-hover:rotate-180 transition-transform duration-300">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="bg-gradient-to-br from-gray-50/50 to-blue-50/30 border-b relative">
                      {stages.map((stage, stageIndex) => {
                        const stageSubmissions = jobData.submissions.filter(
                          (sub: any) => getStageForStatus(sub.status) === stage.id
                        );
                        const stageKey = `${jobKey}-${stage.id}`;
                        
                        if (stageSubmissions.length === 0) return null;

                        return (
                          <div key={stage.id} className="relative">
                            {/* Stage connection lines */}
                            <div className="absolute left-16 top-0 w-8 h-6 border-l-2 border-b-2 border-dashed border-gray-300 opacity-50"></div>
                            {expandedStages.has(stageKey) && (
                              <div className="absolute left-20 top-12 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 to-green-400 opacity-40">
                                <div className="absolute top-0 w-1.5 h-1.5 -left-0.5 bg-yellow-400 rounded-full animate-bounce"></div>
                              </div>
                            )}
                            
                            <Collapsible 
                              open={expandedStages.has(stageKey)}
                              onOpenChange={() => toggleStageExpansion(stageKey)}
                            >
                              <CollapsibleTrigger className="w-full">
                                <div 
                                  className="flex items-center justify-between p-3 pl-12 border-b border-gray-200 hover:bg-white/70 transition-all duration-300 group relative"
                                  onMouseEnter={() => setHoveredStage(stageKey)}
                                  onMouseLeave={() => setHoveredStage(null)}
                                >
                                  <div className="flex items-center gap-3">
                                    {expandedStages.has(stageKey) ? (
                                      <ChevronDown className="w-3 h-3 text-gray-400 transition-transform duration-300" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-gray-400 transition-transform duration-300" />
                                    )}
                                    <div className={`w-3 h-3 rounded-full ${stage.color.includes('blue') ? 'bg-blue-400' : stage.color.includes('purple') ? 'bg-purple-400' : stage.color.includes('yellow') ? 'bg-yellow-400' : 'bg-green-400'} transition-all duration-300 group-hover:scale-125 ${hoveredStage === stageKey ? 'animate-pulse' : ''}`}></div>
                                    <span className="font-medium text-gray-700 font-poppins text-sm group-hover:text-gray-900 transition-colors duration-300">{stage.name}</span>
                                  </div>
                                  <Badge className={`${stage.color} border font-medium font-poppins text-xs transition-all duration-300 group-hover:scale-105`}>
                                    {stageSubmissions.length}
                                  </Badge>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="bg-white/80 backdrop-blur-sm">
                                  {stageSubmissions.map((submission: any, subIndex) => (
                                    <div 
                                      key={submission.id}
                                      className="flex items-center justify-between p-3 pl-20 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-300 cursor-pointer group relative"
                                      onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                                      style={{ animationDelay: `${subIndex * 50}ms` }}
                                    >
                                      {/* Connection dot */}
                                      <div className="absolute left-16 top-1/2 w-2 h-2 bg-gray-300 rounded-full transform -translate-y-1/2 group-hover:bg-blue-400 transition-colors duration-300"></div>
                                      <div className="absolute left-16 top-1/2 w-6 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
                                      
                                      <div className="flex items-center gap-4 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                                          <span className="text-xs font-medium text-blue-700 font-poppins relative z-10">
                                            {submission.candidateName.split(' ').map((n: string) => n[0]).join('')}
                                          </span>
                                          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/0 via-purple-200/50 to-blue-200/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900 font-poppins text-sm group-hover:text-blue-700 transition-colors duration-300">{submission.candidateName}</p>
                                          <p className="text-xs text-gray-600 font-poppins">{submission.location}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs text-gray-600 font-poppins">{submission.experience}</p>
                                          <p className="text-xs text-gray-500 font-poppins">{submission.expectedSalary}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 ${getScoreColor(submission.aiScore)} group-hover:scale-110 transition-transform duration-300`}>
                                          <Star className="w-3 h-3 fill-current group-hover:animate-spin" />
                                          <span className="text-xs font-medium font-poppins">{submission.aiScore}</span>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:rotate-90">
                                            <MoreHorizontal className="w-3 h-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white border-gray-200">
                                          <DropdownMenuItem>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Send Email
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Users2 className="w-4 h-4 mr-2" />
                                            Schedule Interview
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Reject
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Submissions;
