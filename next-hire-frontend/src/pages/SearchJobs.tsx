import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Search,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Briefcase,
  Bot,
  Loader2,
} from "lucide-react";
import { jobService, Job, JobType } from "@/services/jobService";
import { formatCompactRange, formatDate } from "@/lib/format";
import { toast } from "sonner";

const SearchJobs = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [jobType, setJobType] = useState<JobType | "any">("any");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiExtracted, setAiExtracted] = useState<{ keywords: string[]; ai_unavailable?: boolean } | null>(null);

  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setAiExtracted(null);
    try {
      const response = await jobService.searchJobs({
        search: searchQuery || undefined,
        location: location || undefined,
        experience_min: experienceMin ? Number(experienceMin) : undefined,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        job_type: jobType === "any" ? undefined : jobType,
        remote_work_allowed: remoteOnly || undefined,
        limit: 25,
      });
      setSearchResults(response.data.jobs || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to search jobs");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiSearching(true);
    setHasSearched(true);
    try {
      const response = await jobService.aiSearchJobs(aiPrompt.trim());
      setSearchResults(response.data.jobs || []);
      setAiExtracted(response.data.extracted || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to run AI search");
      setSearchResults([]);
    } finally {
      setIsAiSearching(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full_time":
        return "text-green-600 bg-green-100";
      case "contract":
        return "text-blue-600 bg-blue-100";
      case "part_time":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Jobs</h1>
        <p className="text-gray-600">Find job opportunities with advanced filtering and AI-powered search</p>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${isFiltersOpen ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
        {/* Search Filters */}
        <div className={`transition-all duration-300 ${isFiltersOpen ? "lg:col-span-1" : "lg:col-span-1 lg:max-w-xs"}`}>
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
                {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="relative overflow-hidden">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
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
                    <Label htmlFor="experience">Minimum Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min={0}
                      placeholder="3"
                      value={experienceMin}
                      onChange={(e) => setExperienceMin(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="salary">Minimum Salary (USD)</Label>
                    <Input
                      id="salary"
                      type="number"
                      min={0}
                      placeholder="100000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select value={jobType} onValueChange={(v) => setJobType(v as JobType | "any")}>
                      <SelectTrigger id="jobType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="remoteOnly" checked={remoteOnly} onCheckedChange={(v) => setRemoteOnly(!!v)} />
                    <Label htmlFor="remoteOnly" className="cursor-pointer">Remote only</Label>
                  </div>

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
        <div className={`space-y-6 transition-all duration-300 ${isFiltersOpen ? "lg:col-span-2" : "lg:col-span-1"}`}>
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
                {isAiSearchOpen ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden mt-4">
                <GlowingEffect spread={50} glow={true} disabled={false} proximity={70} inactiveZone={0.01} variant="default" />
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="ai-prompt" className="text-blue-800 font-medium">
                      Describe the job you're searching for in natural language
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="ai-prompt"
                        placeholder="Remote React developer role at a tech startup, 5+ years..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
                        onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                      />
                      <Button onClick={handleAiSearch} className="bg-blue-600 hover:bg-blue-700 px-4" disabled={isAiSearching || !aiPrompt.trim()}>
                        {isAiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-blue-700">
                      AI extracts the role, location, and requirements from your sentence and searches the same way the filters on the left do.
                    </p>
                    {aiExtracted && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-blue-700 font-medium">Searched for:</span>
                        {aiExtracted.keywords.map((kw) => (
                          <Badge key={kw} variant="outline" className="text-xs border-blue-300 text-blue-800">
                            {kw}
                          </Badge>
                        ))}
                        {aiExtracted.ai_unavailable && (
                          <span className="text-xs text-amber-600 ml-1">
                            (AI reasoning temporarily unavailable — used keyword matching only)
                          </span>
                        )}
                      </div>
                    )}
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
                  <Badge className="ml-2 bg-green-100 text-green-800">{searchResults.length} jobs found</Badge>
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
                  <p className="text-gray-500">
                    {isAiSearching ? "Extracting keywords and matching opportunities" : "Finding relevant job postings"}
                  </p>
                </div>
              ) : hasSearched && searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((job) => (
                    <Card
                      key={job.id}
                      className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                      onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-sm font-bold text-gray-700">
                                {job.company_name?.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {job.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {job.company_name}
                                  </p>
                                </div>
                                <Badge className={`${getTypeColor(job.job_type)} border font-medium`}>
                                  {jobService.formatJobType(job.job_type)}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.job_type === "contract"
                                    ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, { suffix: "/hr", currency: job.salary_currency })
                                    : formatCompactRange(job.salary_min, job.salary_max, { currency: job.salary_currency })}
                                </div>
                                {(job.experience_min || job.experience_max) && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {job.experience_min ?? 0}
                                    {job.experience_max ? `-${job.experience_max}` : "+"} years
                                  </div>
                                )}
                                {job.remote_work_allowed && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">Remote</Badge>
                                )}
                              </div>

                              <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {(job.required_skills || []).slice(0, 4).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {(job.required_skills?.length || 0) > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.required_skills.length - 4} more
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Posted {formatDate(job.created_at)}</span>
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/jobs/${job.id}`); }}>
                                  View Details
                                </Button>
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
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or use the AI search to find more opportunities.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setLocation("");
                      setExperienceMin("");
                      setSalaryMin("");
                      setJobType("any");
                      setRemoteOnly(false);
                      setAiPrompt("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Jobs</h3>
                  <p className="text-gray-500">Use the filters on the left or try our AI-powered search to find matching jobs.</p>
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
