import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Clock, DollarSign, Filter, Search, Eye, Heart, Share2, BookmarkPlus } from "lucide-react";

export default function MyJobs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const candidateJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120K - $160K",
      status: "applied",
      appliedDate: "2024-01-15",
      description: "We're looking for a Senior Frontend Developer to join our dynamic team...",
      skills: ["React", "TypeScript", "GraphQL"],
      saved: true
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      salary: "$100K - $140K",
      status: "interview",
      appliedDate: "2024-01-10",
      description: "Join our fast-growing startup as a Full Stack Engineer...",
      skills: ["Node.js", "React", "MongoDB"],
      saved: false
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Solutions",
      location: "New York, NY",
      type: "Contract",
      salary: "$80/hour",
      status: "offer",
      appliedDate: "2024-01-05",
      description: "Contract position for an experienced React developer...",
      skills: ["React", "Redux", "Jest"],
      saved: true
    }
  ];

  const vendorJobs = [
    {
      id: 1,
      title: "Senior Backend Developer",
      company: "Enterprise Corp",
      location: "Austin, TX",
      type: "Full-time",
      budget: "$15K - $25K",
      status: "submitted",
      submittedDate: "2024-01-20",
      description: "Looking for backend developers for our enterprise client...",
      requirements: ["Java", "Spring Boot", "AWS"],
      candidates: 3
    },
    {
      id: 2,
      title: "DevOps Engineer",
      company: "Cloud Systems Inc",
      location: "Seattle, WA",
      type: "Contract",
      budget: "$20K - $30K",
      status: "in_progress",
      submittedDate: "2024-01-18",
      description: "DevOps engineer needed for cloud infrastructure project...",
      requirements: ["Docker", "Kubernetes", "AWS"],
      candidates: 5
    }
  ];

  const jobs = user?.role === 'candidate' ? candidateJobs : vendorJobs;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { label: "Applied", variant: "secondary" },
      interview: { label: "Interview", variant: "default" },
      offer: { label: "Offer", variant: "default" },
      submitted: { label: "Submitted", variant: "secondary" },
      in_progress: { label: "In Progress", variant: "default" },
      completed: { label: "Completed", variant: "default" }
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'candidate' ? 'My Job Applications' : 'My Job Submissions'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'candidate' 
              ? 'Track your job applications and their status'
              : 'Manage your job submissions and candidate placements'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={user?.role === 'candidate' ? "Search jobs..." : "Search submissions..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {user?.role === 'candidate' ? (
                  <>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    {getStatusBadge(job.status)}
                    {user?.role === 'candidate' && (job as any).saved && (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {user?.role === 'candidate' ? (job as any).salary : (job as any).budget}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {user?.role === 'candidate' 
                      ? (job as any).skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))
                      : (job as any).requirements.map((req: string, index: number) => (
                          <Badge key={index} variant="outline">{req}</Badge>
                        ))
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {user?.role === 'candidate' 
                        ? `Applied on ${new Date((job as any).appliedDate).toLocaleDateString()}`
                        : `Submitted on ${new Date((job as any).submittedDate).toLocaleDateString()}`
                      }
                    </span>
                    {user?.role === 'vendor' && (
                      <span className="text-sm text-green-600 font-medium">
                        {(job as any).candidates} candidates submitted
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {user?.role === 'candidate' && (
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {user?.role === 'candidate' ? 'No applications found' : 'No submissions found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'candidate' 
                ? "You haven't applied to any jobs yet."
                : "You haven't submitted any candidates yet."
              }
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              {user?.role === 'candidate' ? 'Browse Jobs' : 'Find Jobs to Submit'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}