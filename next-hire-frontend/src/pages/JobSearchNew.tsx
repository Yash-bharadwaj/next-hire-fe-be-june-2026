import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  Eye, 
  Building2, 
  Users, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { jobService, JobSearchFilters, Job } from "@/services/jobService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function JobSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [salaryRange, setSalaryRange] = useState([50000]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  // Use the jobs hook
  const { jobs, loading, error, pagination, searchJobs, loadMore } = useJobs();

  // Handle search
  const handleSearch = () => {
    const filters: JobSearchFilters = {
      page: 1,
      limit: 20,
    };

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    if (location.trim()) {
      filters.location = location.trim();
    }

    if (jobType !== "all") {
      filters.job_type = jobType as any;
    }

    if (experienceLevel !== "all") {
      const expMap: Record<string, { min?: number; max?: number }> = {
        entry: { max: 2 },
        mid: { min: 2, max: 5 },
        senior: { min: 5, max: 10 },
        lead: { min: 10 },
      };
      const exp = expMap[experienceLevel];
      if (exp) {
        if (exp.min) filters.experience_min = exp.min;
        if (exp.max) filters.experience_max = exp.max;
      }
    }

    if (salaryRange[0] > 50000) {
      filters.salary_min = salaryRange[0];
    }

    if (remoteOnly) {
      filters.remote_work_allowed = true;
    }

    searchJobs(filters);
  };

  // Filter jobs based on current tab
  const getFilteredJobs = () => {
    if (currentTab === "all") return jobs;
    if (currentTab === "featured") return jobs.filter(job => job.priority === "high");
    if (currentTab === "recent") return jobs.slice(0, 10);
    if (currentTab === "remote") return jobs.filter(job => job.remote_work_allowed);
    return jobs;
  };

  const filteredJobs = getFilteredJobs();
  const featuredJobs = jobs.filter(job => job.priority === "high").slice(0, 3);

  // Navigate to job details
  const handleJobClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  // Helper functions
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const handleApplyClick = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to apply for jobs");
      navigate("/auth/login");
      return;
    }
    navigate(`/job/${job.id}/apply`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover opportunities that match your skills and aspirations
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Min Salary: ${salaryRange[0].toLocaleString()}</label>
                <Slider
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  max={200000}
                  min={30000}
                  step={5000}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={remoteOnly}
                  onCheckedChange={setRemoteOnly}
                />
                <label htmlFor="remote" className="text-sm font-medium">
                  Remote only
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Jobs Section */}
        {featuredJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-green-100 text-green-800">Featured</Badge>
                      <Badge className={jobService.getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-3">{job.company_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{jobService.formatSalaryRange(job)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {getTimeAgo(job.created_at)}
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => handleApplyClick(e, job)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="remote">Remote</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading jobs...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all available positions.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setLocation("");
                    setJobType("all");
                    setExperienceLevel("all");
                    setSalaryRange([50000]);
                    setRemoteOnly(false);
                    searchJobs({});
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          {job.priority === "high" && (
                            <Badge className="bg-green-100 text-green-800">Featured</Badge>
                          )}
                          {job.remote_work_allowed && (
                            <Badge variant="secondary">Remote</Badge>
                          )}
                          <Badge className={jobService.getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{jobService.formatJobType(job.job_type)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{jobService.formatSalaryRange(job)}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {job.external_description || job.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.required_skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.required_skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.required_skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-6">
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(job.created_at)}
                        </span>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => handleApplyClick(e, job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More Button */}
              {pagination.hasNextPage && (
                <div className="text-center py-8">
                  <Button 
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Load More Jobs
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination Info */}
        {pagination.totalItems > 0 && (
          <div className="text-center text-gray-600 mt-8">
            Showing {filteredJobs.length} of {pagination.totalItems} jobs
          </div>
        )}
      </div>
    </div>
  );
}
