
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  candidateSearchService,
  CandidateProfile,
  CandidateSearchFilters,
} from "@/services/candidateSearchService";
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
  TrendingUp,
  X
} from "lucide-react";

interface SearchResultCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  email: string;
  phone: string;
  aiScore?: number;
  skills: string[];
  education: string;
  availability: string;
  avatar: string;
}

const mapCandidateToResult = (candidate: CandidateProfile): SearchResultCandidate => {
  const latestExperience = candidate.experiences?.[0];
  const latestEducation = candidate.education?.[0];
  const skills = candidate.candidateSkills?.length
    ? candidate.candidateSkills.map((skill) => skill.skill_name)
    : candidate.skills || [];
  const initials = `${candidate.first_name?.[0] || ""}${candidate.last_name?.[0] || ""}`.toUpperCase();

  return {
    id: candidate.id,
    name: candidateSearchService.formatCandidateName(candidate),
    title:
      latestExperience?.job_title ||
      (candidate.bio
        ? candidateSearchService.truncateText(candidate.bio)
        : "Not specified"),
    company: latestExperience?.company_name || "Not specified",
    location: candidate.location || "Not specified",
    experience: candidateSearchService.formatExperience(candidate.experience_years),
    salary: candidateSearchService.formatSalary(candidate.expected_salary),
    email: candidate.user?.email || candidate.email || "Not specified",
    phone: candidate.phone || "Not specified",
    aiScore: candidate.matchScore,
    skills,
    education: latestEducation
      ? [latestEducation.degree, latestEducation.field_of_study].filter(Boolean).join(" in ")
      : "Not specified",
    availability: candidateSearchService.getAvailabilityLabel(candidate.availability_status),
    avatar: initials || "?",
  };
};

// Parse free-text "3-5 years" / "5+ years" style inputs into numeric bounds
const parseExperienceRange = (value: string): { experience_min?: number; experience_max?: number } => {
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  if (numbers.length >= 2) return { experience_min: numbers[0], experience_max: numbers[1] };
  if (numbers.length === 1) return { experience_min: numbers[0] };
  return {};
};

// Parse free-text "$100k - $150k" style inputs into numeric bounds
const parseSalaryRange = (value: string): { salary_min?: number; salary_max?: number } => {
  const matches = value.match(/\d+(?:\.\d+)?\s*[kK]?/g) || [];
  const numbers = matches.map((match) => {
    const amount = parseFloat(match);
    return /[kK]/.test(match) ? amount * 1000 : amount;
  });
  if (numbers.length >= 2) return { salary_min: numbers[0], salary_max: numbers[1] };
  if (numbers.length === 1) return { salary_min: numbers[0] };
  return {};
};

const AVAILABILITY_VALUES = ["available", "not_available", "interviewing", "employed"] as const;

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

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
  const [searchResults, setSearchResults] = useState<SearchResultCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState<SearchResultCandidate | null>(null);
  const [matchedJob, setMatchedJob] = useState<{ id: string; job_id: string; title: string } | null>(null);

  const handleContactCandidate = (candidate: SearchResultCandidate) => {
    window.location.href = `mailto:${candidate.email}`;
  };

  // Additional criteria state
  const [education, setEducation] = useState("");
  const [company, setCompany] = useState("");
  const [jobType, setJobType] = useState("");
  const [availability, setAvailability] = useState("");
  const [industry, setIndustry] = useState("");
  const [certifications, setCertifications] = useState("");

  // Arrived from "Find Matching Candidates" on a job - load AI-ranked candidates for it
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    const loadJobMatches = async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const response = await candidateSearchService.matchCandidatesForJob(jobId);
        if (cancelled) return;
        setMatchedJob(response.data.job || null);
        setSearchResults(response.data.candidates.map(mapCandidateToResult));
        if (response.data.skipped_count > 0) {
          toast.info(
            `${response.data.skipped_count} candidate(s) skipped (no profile data yet to match against)`
          );
        }
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err.response?.data?.message || err.message || "Failed to load matching candidates");
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };

    loadJobMatches();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const clearJobMatch = () => {
    setMatchedJob(null);
    setSearchResults([]);
    setHasSearched(false);
    setSearchParams((params) => {
      params.delete("jobId");
      return params;
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setMatchedJob(null);

    try {
      const filters: CandidateSearchFilters = {};
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (location.trim()) filters.location = location.trim();

      const expRange = parseExperienceRange(experience);
      if (expRange.experience_min !== undefined) filters.experience_min = expRange.experience_min;
      if (expRange.experience_max !== undefined) filters.experience_max = expRange.experience_max;

      const salaryRange = parseSalaryRange(salary);
      if (salaryRange.salary_min !== undefined) filters.salary_min = salaryRange.salary_min;
      if (salaryRange.salary_max !== undefined) filters.salary_max = salaryRange.salary_max;

      const normalizedAvailability = availability.trim().toLowerCase().replace(/\s+/g, "_");
      if ((AVAILABILITY_VALUES as readonly string[]).includes(normalizedAvailability)) {
        filters.availability_status = normalizedAvailability as CandidateSearchFilters["availability_status"];
      }

      const response = await candidateSearchService.searchCandidates(filters);
      setSearchResults(response.data.candidates.map(mapCandidateToResult));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to search candidates");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Describe the candidate you're looking for first");
      return;
    }

    setIsAiSearching(true);
    setHasSearched(true);
    setMatchedJob(null);

    try {
      const response = await candidateSearchService.matchCandidatesByText(aiPrompt.trim());
      setSearchResults(response.data.candidates.map(mapCandidateToResult));
      if (response.data.skipped_count > 0) {
        toast.info(
          `${response.data.skipped_count} candidate(s) skipped (no profile data yet to match against)`
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "AI search failed");
      setSearchResults([]);
    } finally {
      setIsAiSearching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Search</h1>
        <p className="text-gray-600">Find the perfect candidates with advanced filtering and AI-powered search</p>
      </div>

      {matchedJob && (
        <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
          <div className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-medium">
              Showing AI-ranked candidates for{" "}
              <span className="font-semibold">{matchedJob.title}</span>{" "}
              <span className="text-purple-700">({matchedJob.job_id})</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearJobMatch}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      )}

      <div className={`grid gap-6 transition-all duration-300 ${isFiltersOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Search Filters - Now Collapsible */}
        <div className={`transition-all duration-300 ${isFiltersOpen ? 'lg:col-span-1' : 'lg:col-span-1 lg:max-w-xs'}`}>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between p-4 h-auto mb-4 border-2 hover:border-green-300 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold">Search Filters</span>
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
                    <Label htmlFor="search">Keywords</Label>
                    <Input
                      id="search"
                      placeholder="React, JavaScript, Senior..."
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
                    <Label htmlFor="experience">Experience Level</Label>
                    <Input
                      id="experience"
                      placeholder="3-5 years, Senior..."
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

                  {/* Collapsible Additional Criteria */}
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
                        <Label htmlFor="education">Education</Label>
                        <Input
                          id="education"
                          placeholder="Bachelor's, Master's, PhD..."
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Previous Company</Label>
                        <Input
                          id="company"
                          placeholder="Google, Microsoft, Startup..."
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                      
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
                        <Label htmlFor="availability">Availability</Label>
                        <Input
                          id="availability"
                          placeholder="Immediate, 2 weeks, 1 month..."
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
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
                        <Label htmlFor="certifications">Certifications</Label>
                        <Input
                          id="certifications"
                          placeholder="AWS, PMP, Scrum Master..."
                          value={certifications}
                          onChange={(e) => setCertifications(e.target.value)}
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
                        Search Candidates
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
          {/* AI Prompt Section - Now Collapsible */}
          <Collapsible open={isAiSearchOpen} onOpenChange={setIsAiSearchOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between p-4 h-auto border-2 border-blue-200 hover:border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">AI-Powered Search</span>
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
                      Describe the ideal candidate in natural language
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="ai-prompt"
                        placeholder="Find me a senior React developer with 5+ years experience in fintech, preferably remote..."
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
                      Use natural language to describe your requirements. AI will translate this into precise search filters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Search Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Search Results
                {searchResults.length > 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {searchResults.length} candidates found
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
                    {isAiSearching ? "AI is analyzing your request..." : "Searching candidates..."}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {isAiSearching ? "Processing natural language and matching criteria" : "Filtering through our database"}
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
                  {searchResults.map((candidate, index) => (
                    <Card key={candidate.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-sm font-semibold text-blue-700">
                                {candidate.avatar}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {candidate.name}
                                </h3>
                                {typeof candidate.aiScore === "number" && (
                                  <Badge className={`${getScoreColor(candidate.aiScore)} font-semibold`}>
                                    <Star className="w-3 h-3 mr-1" />
                                    {candidate.aiScore}% Match
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-700 font-medium mb-1">{candidate.title}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {candidate.company}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {candidate.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {candidate.experience}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {candidate.salary}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Available: {candidate.availability}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {candidate.skills.map((skill: string) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {candidate.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {candidate.phone}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleContactCandidate(candidate)}
                            >
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setProfileCandidate(candidate)}>
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria or using different keywords
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <TrendingUp className="w-6 h-6 text-green-400 absolute -top-1 -right-1" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to find great talent?</h3>
                  <p className="text-gray-500">
                    Use the filters on the left or the AI prompt above to search for candidates
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!profileCandidate} onOpenChange={(open) => !open && setProfileCandidate(null)}>
        <DialogContent className="max-w-lg">
          {profileCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">{profileCandidate.avatar}</span>
                  </div>
                  {profileCandidate.name}
                </DialogTitle>
                <DialogDescription>{profileCandidate.title} at {profileCandidate.company}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" /> {profileCandidate.location}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" /> {profileCandidate.experience} experience
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" /> {profileCandidate.salary}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="w-4 h-4" /> {profileCandidate.education}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" /> Available: {profileCandidate.availability}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" /> {profileCandidate.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" /> {profileCandidate.phone}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {profileCandidate.skills.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setProfileCandidate(null)}>
                  Close
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleContactCandidate(profileCandidate)}
                >
                  Contact
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedSearch;
