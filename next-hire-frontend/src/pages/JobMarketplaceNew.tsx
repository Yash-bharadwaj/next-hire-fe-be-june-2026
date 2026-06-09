import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Building2,
  TrendingUp,
  Star,
  Users,
  Heart,
  Share2,
  Brain,
  FileUser,
  ChevronDown,
  Sparkles,
  Bot,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Calendar,
  BookmarkPlus,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";

export default function JobMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    jobs,
    loading,
    error,
    pagination,
    filters,
    searchJobs,
    refresh,
    setFilters,
  } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [salaryRange, setSalaryRange] = useState([50000]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [isClassicSearchOpen, setIsClassicSearchOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      location: location || undefined,
      job_type: jobType === "all" ? undefined : jobType,
      experience_min:
        experienceLevel === "entry"
          ? 0
          : experienceLevel === "mid"
          ? 3
          : experienceLevel === "senior"
          ? 7
          : undefined,
      experience_max:
        experienceLevel === "entry"
          ? 2
          : experienceLevel === "mid"
          ? 6
          : experienceLevel === "senior"
          ? undefined
          : undefined,
      salary_min: salaryRange[0],
      remote_work_allowed: remoteOnly || undefined,
      page: 1,
    };
    searchJobs(newFilters);
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement AI search functionality
      toast.info("AI search is coming soon!");
      // For now, just do a regular search with the AI prompt as search term
      const newFilters = {
        ...filters,
        search: aiPrompt,
        page: 1,
      };
      searchJobs(newFilters);
    } catch (error) {
      toast.error("AI search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToJob = (jobId: string) => {
    if (!user || user.role !== "candidate") {
      toast.error("Please login as a candidate to apply for jobs");
      navigate("/auth/login");
      return;
    }
    // Navigate to the job application page
    navigate(`/job/${jobId}/apply`);
  };

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      toast.success("Job removed from saved jobs");
    } else {
      newSavedJobs.add(jobId);
      toast.success("Job saved successfully");
    }
    setSavedJobs(newSavedJobs);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not disclosed";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType("all");
    setExperienceLevel("all");
    setSalaryRange([50000]);
    setRemoteOnly(false);
    searchJobs({});
  };

  // Load initial data
  useEffect(() => {
    searchJobs({ page: 1, limit: 20, status: "active" });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Marketplace</h1>
          <p className="text-gray-600">Discover your next career opportunity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/my-jobs")}>
            <FileUser className="h-4 w-4 mr-2" />
            My Applications
          </Button>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Search Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>All Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Classic Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Search Jobs</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Job Title or Keywords
                  </label>
                  <Input
                    placeholder="e.g. Software Engineer, Marketing Manager"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Location
                  </label>
                  <Input
                    placeholder="e.g. New York, Remote, San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <Collapsible
                open={isClassicSearchOpen}
                onOpenChange={setIsClassicSearchOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <span>Advanced Filters</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isClassicSearchOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Job Type
                      </label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Experience Level
                      </label>
                      <Select
                        value={experienceLevel}
                        onValueChange={setExperienceLevel}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="entry">
                            Entry Level (0-2 years)
                          </SelectItem>
                          <SelectItem value="mid">
                            Mid Level (3-6 years)
                          </SelectItem>
                          <SelectItem value="senior">
                            Senior Level (7+ years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="remote"
                        checked={remoteOnly}
                        onCheckedChange={setRemoteOnly}
                      />
                      <label
                        htmlFor="remote"
                        className="text-sm font-medium text-gray-700"
                      >
                        Remote work only
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Minimum Salary: ${salaryRange[0].toLocaleString()}
                    </label>
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      max={200000}
                      min={30000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button
                onClick={handleSearch}
                className="w-full"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search Jobs"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {/* AI Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Powered Job Search</span>
              </CardTitle>
              <CardDescription>
                Describe your ideal job in natural language and let AI find the
                perfect matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Describe your ideal job
                </label>
                <Input
                  placeholder="e.g. I want a remote software engineering role at a startup with good work-life balance and competitive salary"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAiSearch()}
                />
              </div>
              <Button
                onClick={handleAiSearch}
                className="w-full"
                disabled={isLoading || !aiPrompt.trim()}
              >
                <Bot className="h-4 w-4 mr-2" />
                {isLoading ? "Searching with AI..." : "Search with AI"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job Results ({pagination.totalItems})</span>
            <div className="flex items-center space-x-2">
              <Select defaultValue="relevance">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600">{error}</p>
              <Button onClick={refresh} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No jobs found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => navigate(`/job/${job.id}`)}
                          >
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {job.company_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{job.status}</Badge>
                          {job.priority === "high" && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                          {job.remote_work_allowed && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                          {job.vendor_eligible && (
                            <Badge variant="outline">Vendor Eligible</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            {job.experience_min || 0}-
                            {job.experience_max || "+"} years exp
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Posted {formatDate(job.created_at)}</span>
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {job.required_skills &&
                        job.required_skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Required Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {job.required_skills
                                .slice(0, 6)
                                .map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              {job.required_skills.length > 6 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{job.required_skills.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{job.submission_count || 0} applicants</span>
                          </div>
                          {job.application_deadline && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Deadline:{" "}
                                {new Date(
                                  job.application_deadline
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Button
                        onClick={() => handleSaveJob(job.id)}
                        variant="outline"
                        size="sm"
                        className={
                          savedJobs.has(job.id)
                            ? "text-red-600 border-red-200"
                            : ""
                        }
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            savedJobs.has(job.id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>

                      <Button
                        onClick={() => handleApplyToJob(job.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} jobs
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        searchJobs({
                          ...filters,
                          page: pagination.currentPage - 1,
                        })
                      }
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        searchJobs({
                          ...filters,
                          page: pagination.currentPage + 1,
                        })
                      }
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
