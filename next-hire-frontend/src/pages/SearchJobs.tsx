import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { 
  Search, 
  Settings, 
  Lock, 
  Sparkles,
  Box,
  ChevronDown,
  ChevronUp,
  Send,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  Star,
  Briefcase,
  GraduationCap,
  Clock,
  Bot,
  Loader2,
  Users,
  TrendingUp
} from "lucide-react";

const SearchJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Additional criteria state
  const [jobType, setJobType] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [remote, setRemote] = useState("");
  const [benefits, setBenefits] = useState("");
  const [companySize, setCompanySize] = useState("");

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp Inc",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "5+ years",
      salary: "$120,000 - $160,000",
      remote: true,
      posted: "2 days ago",
      description: "We're looking for a Senior React Developer to join our dynamic team and help build the next generation of web applications.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      benefits: ["Health Insurance", "401k", "Remote Work", "Unlimited PTO"],
      companyLogo: "TC"
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "$100,000 - $140,000",
      remote: true,
      posted: "1 week ago",
      description: "Join our fast-growing startup as a Full Stack Engineer and help us build scalable solutions.",
      skills: ["Node.js", "React", "MongoDB", "AWS"],
      benefits: ["Equity", "Health Insurance", "Flexible Hours"],
      companyLogo: "SX"
    },
    {
      id: 3,
      title: "Frontend Developer",
      company: "Digital Solutions",
      location: "New York, NY",
      type: "Contract",
      experience: "2+ years",
      salary: "$80/hour",
      remote: false,
      posted: "3 days ago",
      description: "Contract position for an experienced Frontend developer to work on enterprise applications.",
      skills: ["React", "Vue.js", "CSS", "JavaScript"],
      benefits: ["Flexible Schedule", "Professional Development"],
      companyLogo: "DS"
    },
    {
      id: 4,
      title: "Backend Developer",
      company: "Enterprise Corp",
      location: "Austin, TX",
      type: "Full-time",
      experience: "4+ years",
      salary: "$110,000 - $140,000",
      remote: true,
      posted: "5 days ago",
      description: "Looking for a backend developer to join our growing engineering team.",
      skills: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
      benefits: ["Health Insurance", "401k", "Remote Work"],
      companyLogo: "EC"
    }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate search delay
    setTimeout(() => {
      setSearchResults(mockJobs);
      setIsSearching(false);
    }, 1500);
  };

  const handleAiSearch = async () => {
    setIsAiSearching(true);
    setHasSearched(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Filter jobs based on AI prompt (simplified simulation)
      const filteredResults = mockJobs.filter(job => 
        aiPrompt.toLowerCase().includes('remote') ? 
          job.remote :
          true
      );
      setSearchResults(filteredResults);
      setIsAiSearching(false);
    }, 2500);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return "text-green-600 bg-green-100";
      case 'Contract': return "text-blue-600 bg-blue-100";
      case 'Part-time': return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Jobs</h1>
        <p className="text-gray-600">Find the perfect job opportunities with advanced filtering and AI-powered search</p>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${isFiltersOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Search Filters */}
        <div className={`transition-all duration-300 ${isFiltersOpen ? 'lg:col-span-1' : 'lg:col-span-1 lg:max-w-xs'}`}>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between p-4 h-auto mb-4 border-2 hover:border-green-300 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold">Job Filters</span>
                </div>
                {isFiltersOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="relative overflow-hidden">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label htmlFor="search">Job Title/Keywords</Label>
                    <Input
                      id="search"
                      placeholder="React, Developer, Engineer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, Remote..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">Experience Required</Label>
                    <Input
                      id="experience"
                      placeholder="3+ years, Senior..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input
                      id="salary"
                      placeholder="$100k - $150k"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>

                  {/* Advanced Criteria */}
                  <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Additional Criteria
                        {isAdvancedOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="jobType">Job Type</Label>
                        <Input
                          id="jobType"
                          placeholder="Full-time, Contract, Part-time..."
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Google, Microsoft, Startup..."
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          placeholder="Tech, Finance, Healthcare..."
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="remote">Work Type</Label>
                        <Input
                          id="remote"
                          placeholder="Remote, Hybrid, On-site..."
                          value={remote}
                          onChange={(e) => setRemote(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="benefits">Benefits</Label>
                        <Input
                          id="benefits"
                          placeholder="Health Insurance, 401k, PTO..."
                          value={benefits}
                          onChange={(e) => setBenefits(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="companySize">Company Size</Label>
                        <Input
                          id="companySize"
                          placeholder="Startup, Mid-size, Enterprise..."
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Jobs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Search Results */}
        <div className={`space-y-6 transition-all duration-300 ${isFiltersOpen ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          {/* AI Search Section */}
          <Collapsible open={isAiSearchOpen} onOpenChange={setIsAiSearchOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between p-4 h-auto border-2 border-blue-200 hover:border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">AI Job Search</span>
                </div>
                {isAiSearchOpen ? (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden mt-4">
                <GlowingEffect
                  spread={50}
                  glow={true}
                  disabled={false}
                  proximity={70}
                  inactiveZone={0.01}
                  variant="default"
                />
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="ai-prompt" className="text-blue-800 font-medium">
                      Describe your ideal job in natural language
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="ai-prompt"
                        placeholder="Find me a remote React developer position at a tech startup with good benefits..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
                        onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
                      />
                      <Button 
                        onClick={handleAiSearch}
                        className="bg-blue-600 hover:bg-blue-700 px-4"
                        disabled={isAiSearching}
                      >
                        {isAiSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-blue-700">
                      Use natural language to describe your ideal position. AI will find matching job opportunities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Job Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Results
                {searchResults.length > 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {searchResults.length} jobs found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching || isAiSearching ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <Bot className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-bounce" />
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isAiSearching ? "AI is analyzing your request..." : "Searching jobs..."}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {isAiSearching ? "Processing your preferences and matching opportunities" : "Finding relevant job postings"}
                  </p>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              ) : hasSearched && searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((job) => (
                    <Card key={job.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-sm font-bold text-gray-700">{job.companyLogo}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {job.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {job.company}
                                  </p>
                                </div>
                                <Badge className={`${getTypeColor(job.type)} border font-medium`}>
                                  {job.type}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salary}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {job.experience}
                                </div>
                                {job.remote && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Remote
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {job.skills.slice(0, 4).map((skill: string) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.skills.length - 4} more
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {job.benefits.slice(0, 3).map((benefit: string) => (
                                  <Badge key={benefit} className="bg-green-100 text-green-800 text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Posted {job.posted}</span>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    View Details
                                  </Button>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Apply Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or use the AI search to find more opportunities.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setLocation("");
                    setExperience("");
                    setSalary("");
                    setAiPrompt("");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Jobs</h3>
                  <p className="text-gray-500">
                    Use the filters on the left or try our AI-powered search to find your perfect job.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchJobs;