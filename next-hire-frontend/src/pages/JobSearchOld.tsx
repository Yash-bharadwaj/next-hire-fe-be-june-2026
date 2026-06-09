import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, Heart, Share2, Eye, Building2, Brain, FileUser, Users, ChevronDown, Sparkles, Bot, Loader2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { jobService, JobSearchFilters } from "@/services/jobService";
import { toast } from "sonner";

export default function JobSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [salaryRange, setSalaryRange] = useState([50000]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [isClassicSearchOpen, setIsClassicSearchOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
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

  // Handle AI search
  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a search prompt");
      return;
    }

    // For now, convert AI prompt to basic search
    // In the future, this could be enhanced with actual AI processing
    const filters: JobSearchFilters = {
      page: 1,
      limit: 20,
      search: aiPrompt.trim(),
    };

    searchJobs(filters);
    setAiPrompt("");
    setIsAiSearchOpen(false);
  };

  // Navigate to job details
  const handleJobClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
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

  // Remove the old mock data
  const oldMockJobs = [
    {
      id: 1,
      title: "Senior AI Engineer",
      company: "FutureTech Labs",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "Senior",
      salary: "$180K - $220K",
      remote: true,
      posted: "1 day ago",
      description: "Join our cutting-edge AI team to develop next-generation machine learning solutions...",
      skills: ["Python", "TensorFlow", "PyTorch", "AWS"],
      benefits: ["Equity", "Health Insurance", "401k", "Remote Work"],
      saved: false,
      featured: true,
      urgent: true,
      rating: 4.8
    },
    {
      id: 2,
      title: "Lead Product Designer",
      company: "Design Innovations",
      location: "New York, NY",
      type: "Full-time",
      experience: "Senior",
      salary: "$140K - $180K",
      remote: false,
      posted: "2 days ago",
      description: "Lead our design team in creating beautiful, user-centered digital experiences...",
      skills: ["Figma", "Sketch", "Prototyping", "User Research"],
      benefits: ["Health Insurance", "Creative Budget", "Flexible Hours"],
      saved: true,
      featured: true,
      urgent: false,
      rating: 4.7
    }
  ];

  const jobs = [
    {
      id: 3,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "Senior",
      salary: "$120K - $160K",
      remote: false,
      posted: "2 days ago",
      description: "We're looking for a Senior Frontend Developer to join our dynamic team and help build the next generation of web applications...",
      skills: ["React", "TypeScript", "GraphQL", "Node.js"],
      benefits: ["Health Insurance", "401k", "Remote Work", "Unlimited PTO"],
      saved: false,
      featured: false,
      urgent: false,
      rating: 4.5
    },
    {
      id: 4,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      experience: "Mid-level",
      salary: "$100K - $140K",
      remote: true,
      posted: "1 week ago",
      description: "Join our fast-growing startup as a Full Stack Engineer and help us build scalable solutions...",
      skills: ["Node.js", "React", "MongoDB", "AWS"],
      benefits: ["Equity", "Health Insurance", "Flexible Hours"],
      saved: true,
      featured: false,
      urgent: false,
      rating: 4.3
    },
    {
      id: 5,
      title: "React Developer",
      company: "Digital Solutions",
      location: "New York, NY",
      type: "Contract",
      experience: "Mid-level",
      salary: "$80/hour",
      remote: false,
      posted: "3 days ago",
      description: "Contract position for an experienced React developer to work on enterprise applications...",
      skills: ["React", "Redux", "Jest", "CSS"],
      benefits: ["Flexible Schedule", "Professional Development"],
      saved: false,
      featured: false,
      urgent: true,
      rating: 4.2
    },
    {
      id: 6,
      title: "Backend Developer",
      company: "Enterprise Corp",
      location: "Austin, TX",
      type: "Full-time",
      experience: "Junior",
      salary: "$80K - $100K",
      remote: true,
      posted: "5 days ago",
      description: "Looking for a backend developer to join our growing engineering team...",
      skills: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
      benefits: ["Health Insurance", "401k", "Remote Work"],
      saved: false,
      featured: false,
      urgent: false,
      rating: 4.1
    },
    {
      id: 7,
      title: "DevOps Engineer",
      company: "Cloud Systems Inc",
      location: "Seattle, WA",
      type: "Full-time",
      experience: "Senior",
      salary: "$130K - $170K",
      remote: false,
      posted: "1 day ago",
      description: "DevOps engineer needed for cloud infrastructure and automation projects...",
      skills: ["Docker", "Kubernetes", "AWS", "Terraform"],
      benefits: ["Stock Options", "Health Insurance", "Professional Development"],
      saved: true,
      featured: false,
      urgent: false,
      rating: 4.6
    }
  ];

  const allJobs = [...featuredJobs, ...jobs];

  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = jobType === "all" || job.type.toLowerCase() === jobType.toLowerCase();
    const matchesExperience = experienceLevel === "all" || job.experience.toLowerCase() === experienceLevel.toLowerCase();
    const matchesRemote = !remoteOnly || job.remote;
    
    // Filter by tab
    const matchesTab = currentTab === "all" || 
                      (currentTab === "featured" && job.featured) ||
                      (currentTab === "hot" && job.urgent);
    
    return matchesSearch && matchesLocation && matchesType && matchesExperience && matchesRemote && matchesTab;
  });

  const toggleSave = (jobId: number) => {
    // Handle save/unsave logic
    console.log(`Toggle save for job ${jobId}`);
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsLoading(true);
    // Simulate AI search
    setTimeout(() => {
      setIsLoading(false);
      setCurrentTab("all");
    }, 2000);
  };

  const getUrgencyBadge = (urgent: boolean) => {
    if (!urgent) return null;
    return (
      <Badge variant="destructive" className="animate-pulse">
        Urgent
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < Math.floor(rating) ? 'bg-yellow-400' : 'bg-gray-200'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-candidate">Job Search</h1>
          <p className="text-candidate-foreground">Find your next opportunity</p>
        </div>
      </div>

      {/* Featured Jobs Banner */}
      {featuredJobs.length > 0 && (
        <Card className="bg-gradient-to-r from-candidate/10 to-primary/10 border-candidate/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-candidate">
              <Sparkles className="w-5 h-5" />
              Featured Opportunities
            </CardTitle>
            <CardDescription>
              Hand-picked positions from top companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredJobs.slice(0, 2).map((job) => (
                <Card key={job.id} className="border-candidate/20 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-candidate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      {getUrgencyBadge(job.urgent)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{job.location}</span>
                      <DollarSign className="w-3 h-3 ml-2" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {renderStars(job.rating)}
                      <Button size="sm" className="bg-candidate hover:bg-candidate/90 text-candidate-foreground">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Options */}
      <div className="space-y-4">
        {/* Classic Search - Collapsible */}
        <Collapsible open={isClassicSearchOpen} onOpenChange={setIsClassicSearchOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Classic Search
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isClassicSearchOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <Card className="border-candidate/20 bg-gradient-to-b from-candidate/5 to-transparent">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Job title, skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="City, state..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Type</label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience Level</label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid-level">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-sm font-medium">Minimum Salary</label>
                    <div className="space-y-2">
                      <Slider
                        value={salaryRange}
                        onValueChange={setSalaryRange}
                        max={200000}
                        min={30000}
                        step={5000}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600">
                        ${salaryRange[0].toLocaleString()}+ per year
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remote Only */}
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="remote"
                    checked={remoteOnly}
                    onCheckedChange={(checked) => setRemoteOnly(checked === true)}
                  />
                  <label htmlFor="remote" className="text-sm font-medium">
                    Remote only
                  </label>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* AI Search - Collapsible */}
        <Collapsible open={isAiSearchOpen} onOpenChange={setIsAiSearchOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Powered Search
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isAiSearchOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Describe your ideal job in natural language
                    </label>
                    <div className="relative">
                      <Bot className="absolute left-3 top-3 text-primary w-4 h-4" />
                      <textarea
                        placeholder="e.g., I'm looking for a remote senior frontend role with React, good work-life balance, and competitive salary..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAiSearch}
                    disabled={isLoading || !aiPrompt.trim()}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Find Jobs with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Jobs Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="hot">Hot Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </p>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="salary">Highest Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredJobs.filter(job => job.featured).length} featured job{filteredJobs.filter(job => job.featured).length !== 1 ? 's' : ''} found
            </p>
          </div>
        </TabsContent>

        <TabsContent value="hot" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredJobs.filter(job => job.urgent).length} hot job{filteredJobs.filter(job => job.urgent).length !== 1 ? 's' : ''} found
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    {job.featured && <Badge className="bg-candidate text-candidate-foreground">Featured</Badge>}
                    {getUrgencyBadge(job.urgent)}
                    {job.remote && <Badge variant="secondary">Remote</Badge>}
                    <Heart 
                      className={`w-5 h-5 cursor-pointer transition-colors ${
                        job.saved ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'
                      }`}
                      onClick={() => toggleSave(job.id)}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
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
                      <span>{job.salary}</span>
                    </div>
                    {job.rating && renderStars(job.rating)}
                  </div>
                  <p className="text-gray-700 mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Posted {job.posted}</span>
                    <Badge variant="outline">{job.experience}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button className="bg-candidate hover:bg-candidate/90 text-candidate-foreground">
                    Apply Now
                  </Button>
                  <Button size="sm" variant="outline" className="border-candidate/30 text-candidate hover:bg-candidate/10">
                    <Brain className="w-4 h-4 mr-2" />
                    Am I Good fit?
                  </Button>
                  <Button size="sm" variant="outline" className="border-candidate/30 text-candidate hover:bg-candidate/10">
                    <FileUser className="w-4 h-4 mr-2" />
                    Tailor Resume
                  </Button>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Users className="w-4 h-4 mr-2" />
                    Refer a Candidate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find more opportunities.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setJobType("all");
                  setExperienceLevel("all");
                  setRemoteOnly(false);
                  setCurrentTab("all");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}