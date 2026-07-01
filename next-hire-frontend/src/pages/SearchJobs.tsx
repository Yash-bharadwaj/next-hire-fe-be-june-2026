import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { jobService, Job, JobType, JobSearchFilters } from "@/services/jobService";
import { formatCompactRange, formatDate } from "@/lib/format";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Send,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Briefcase,
  Bot,
  Loader2,
  Tag,
  Globe,
  RotateCcw,
  SearchX,
  AlertCircle,
  X,
} from "lucide-react";

const RESULTS_PER_PAGE = 10;

type SearchMode = "filters" | "ai";

interface FilterState {
  search: string;
  location: string;
  skills: string;
  experienceMin: string;
  experienceMax: string;
  salaryMin: string;
  salaryMax: string;
  jobType: JobType | "any";
  remoteOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  location: "",
  skills: "",
  experienceMin: "",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  jobType: "any",
  remoteOnly: false,
};

interface FilterChip {
  key: keyof FilterState | "experience" | "salary";
  label: string;
  icon: typeof Search;
}

const formatMoney = (value: string) => `$${Number(value).toLocaleString()}`;

const buildChips = (f: FilterState): FilterChip[] => {
  const chips: FilterChip[] = [];
  if (f.search.trim()) chips.push({ key: "search", label: `"${f.search.trim()}"`, icon: Search });
  if (f.location.trim()) chips.push({ key: "location", label: f.location.trim(), icon: MapPin });
  if (f.skills.trim()) chips.push({ key: "skills", label: f.skills.trim(), icon: Tag });
  if (f.experienceMin || f.experienceMax) {
    const label =
      f.experienceMin && f.experienceMax
        ? `${f.experienceMin}-${f.experienceMax} yrs exp`
        : f.experienceMin
        ? `${f.experienceMin}+ yrs exp`
        : `Up to ${f.experienceMax} yrs exp`;
    chips.push({ key: "experience", label, icon: Briefcase });
  }
  if (f.salaryMin || f.salaryMax) {
    const label =
      f.salaryMin && f.salaryMax
        ? `${formatMoney(f.salaryMin)} - ${formatMoney(f.salaryMax)}`
        : f.salaryMin
        ? `${formatMoney(f.salaryMin)}+`
        : `Up to ${formatMoney(f.salaryMax)}`;
    chips.push({ key: "salary", label, icon: DollarSign });
  }
  if (f.jobType !== "any") {
    chips.push({ key: "jobType", label: jobService.formatJobType(f.jobType), icon: Briefcase });
  }
  if (f.remoteOnly) {
    chips.push({ key: "remoteOnly", label: "Remote only", icon: Globe });
  }
  return chips;
};

const buildApiFilters = (f: FilterState, page: number): JobSearchFilters => {
  const filters: JobSearchFilters = { page, limit: RESULTS_PER_PAGE };
  if (f.search.trim()) filters.search = f.search.trim();
  if (f.location.trim()) filters.location = f.location.trim();
  if (f.skills.trim()) filters.skills = f.skills.trim();
  if (f.experienceMin) filters.experience_min = Number(f.experienceMin);
  if (f.experienceMax) filters.experience_max = Number(f.experienceMax);
  if (f.salaryMin) filters.salary_min = Number(f.salaryMin);
  if (f.salaryMax) filters.salary_max = Number(f.salaryMax);
  if (f.jobType !== "any") filters.job_type = f.jobType;
  if (f.remoteOnly) filters.remote_work_allowed = true;
  return filters;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "full_time":
      return "text-green-700 bg-green-100";
    case "contract":
      return "text-blue-700 bg-blue-100";
    case "part_time":
      return "text-yellow-700 bg-yellow-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

const JobCardSkeleton = () => (
  <Card className="border-gray-200">
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5 min-w-0">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3.5 w-36" />
          <div className="flex flex-wrap gap-3 pt-1">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <Skeleton className="h-3.5 w-full max-w-md" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SearchJobs = () => {
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState<string[]>(["ai"]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [aiPrompt, setAiPrompt] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [mode, setMode] = useState<SearchMode | null>(null);
  const [appliedChips, setAppliedChips] = useState<FilterChip[]>([]);
  const [resultPagination, setResultPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
  } | null>(null);

  const [aiQueryLabel, setAiQueryLabel] = useState("");
  const [aiExtracted, setAiExtracted] = useState<{ keywords: string[]; ai_unavailable?: boolean } | null>(null);

  const experienceRangeInvalid =
    filters.experienceMin !== "" &&
    filters.experienceMax !== "" &&
    Number(filters.experienceMin) > Number(filters.experienceMax);
  const salaryRangeInvalid =
    filters.salaryMin !== "" && filters.salaryMax !== "" && Number(filters.salaryMin) > Number(filters.salaryMax);

  const liveChips = useMemo(
    () =>
      buildChips(filters).filter(
        (chip) => !((chip.key === "experience" && experienceRangeInvalid) || (chip.key === "salary" && salaryRangeInvalid))
      ),
    [filters, experienceRangeInvalid, salaryRangeInvalid]
  );

  const runFilterSearch = async (f: FilterState, page = 1) => {
    if (experienceRangeInvalid || salaryRangeInvalid) {
      toast.error("Fix the highlighted range before searching");
      return;
    }

    const append = page > 1;
    if (append) setIsLoadingMore(true);
    else setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setMode("filters");

    try {
      const response = await jobService.searchJobs(buildApiFilters(f, page));
      const jobs = response.data.jobs || [];
      setSearchResults((prev) => (append ? [...prev, ...jobs] : jobs));
      setResultPagination(response.data.pagination);
      setAppliedChips(buildChips(f));
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Failed to search jobs";
      setSearchError(message);
      toast.error(message);
      if (!append) {
        setSearchResults([]);
        setResultPagination(null);
      }
    } finally {
      if (append) setIsLoadingMore(false);
      else setIsSearching(false);
    }
  };

  const handleSearchClick = () => runFilterSearch(filters, 1);

  const handleLoadMore = () => {
    if (!resultPagination?.hasNextPage) return;
    runFilterSearch(filters, resultPagination.currentPage + 1);
  };

  const removeChip = (key: FilterChip["key"]) => {
    const updated: FilterState = { ...filters };
    switch (key) {
      case "search":
        updated.search = "";
        break;
      case "location":
        updated.location = "";
        break;
      case "skills":
        updated.skills = "";
        break;
      case "experience":
        updated.experienceMin = "";
        updated.experienceMax = "";
        break;
      case "salary":
        updated.salaryMin = "";
        updated.salaryMax = "";
        break;
      case "jobType":
        updated.jobType = "any";
        break;
      case "remoteOnly":
        updated.remoteOnly = false;
        break;
    }
    setFilters(updated);
    runFilterSearch(updated, 1);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchResults([]);
    setHasSearched(false);
    setMode(null);
    setAppliedChips([]);
    setResultPagination(null);
    setSearchError(null);
  };

  const handleAiSearch = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) return;

    setIsAiSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setMode("ai");

    try {
      const response = await jobService.aiSearchJobs(prompt);
      setSearchResults(response.data.jobs || []);
      setAiQueryLabel(prompt);
      setAiExtracted(response.data.extracted || null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "AI search failed";
      setSearchError(message);
      toast.error(message);
      setSearchResults([]);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleRetry = () => {
    if (mode === "filters") runFilterSearch(filters, 1);
    else if (mode === "ai") handleAiSearch();
  };

  const isLoading = isSearching || isAiSearching;

  const resultsHeading = (): { title: string } | null => {
    if (!hasSearched) return null;
    if (mode === "ai" && aiQueryLabel) {
      return { title: `AI matches for "${aiQueryLabel}"` };
    }
    if (mode === "filters") {
      const total = resultPagination?.totalItems ?? searchResults.length;
      return {
        title: appliedChips.length
          ? `${total} job${total === 1 ? "" : "s"} match your filters`
          : `${total} open job${total === 1 ? "" : "s"} right now`,
      };
    }
    return null;
  };

  const heading = resultsHeading();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Jobs</h1>
        <p className="text-gray-600">Find open roles with smart filters or a plain-English AI search</p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="space-y-3">
            <AccordionItem
              value="ai"
              className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2 font-semibold text-purple-900">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Search
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <Label htmlFor="ai-prompt" className="text-sm font-medium text-gray-700">
                    Describe the job you're looking for in plain English
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Bot className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="ai-prompt"
                        placeholder="Remote React developer role at a fintech startup, 5+ years..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      onClick={handleAiSearch}
                      disabled={isAiSearching || !aiPrompt.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                    >
                      {isAiSearching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    AI extracts the role, location, and requirements from your sentence and searches the same way
                    the filters below do.
                  </p>
                  {aiExtracted && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-gray-600 font-medium">Searched for:</span>
                      {aiExtracted.keywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs">
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="filters" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                  <SlidersHorizontal className="w-4 h-4 text-green-600" />
                  Filters
                  {liveChips.length > 0 && (
                    <Badge variant="secondary" className="ml-1 font-normal">
                      {liveChips.length} active
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                      Keywords
                    </Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        placeholder="Title, company, description..."
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Location
                    </Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="location"
                        placeholder="City, state, remote..."
                        value={filters.location}
                        onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="skills" className="text-sm font-medium text-gray-700">
                      Skills
                    </Label>
                    <div className="relative mt-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="skills"
                        placeholder="React, Node.js..."
                        value={filters.skills}
                        onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Experience (years)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="Min"
                        value={filters.experienceMin}
                        onChange={(e) => setFilters((f) => ({ ...f, experienceMin: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className={cn(experienceRangeInvalid && "border-red-400 focus-visible:ring-red-400")}
                      />
                      <span className="text-gray-400 text-sm shrink-0">to</span>
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="Max"
                        value={filters.experienceMax}
                        onChange={(e) => setFilters((f) => ({ ...f, experienceMax: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className={cn(experienceRangeInvalid && "border-red-400 focus-visible:ring-red-400")}
                      />
                    </div>
                    {experienceRangeInvalid && (
                      <p className="text-xs text-red-600 mt-1">Min can't be greater than max</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Salary ($)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        inputMode="numeric"
                        placeholder="Min"
                        value={filters.salaryMin}
                        onChange={(e) => setFilters((f) => ({ ...f, salaryMin: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className={cn(salaryRangeInvalid && "border-red-400 focus-visible:ring-red-400")}
                      />
                      <span className="text-gray-400 text-sm shrink-0">to</span>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        inputMode="numeric"
                        placeholder="Max"
                        value={filters.salaryMax}
                        onChange={(e) => setFilters((f) => ({ ...f, salaryMax: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        className={cn(salaryRangeInvalid && "border-red-400 focus-visible:ring-red-400")}
                      />
                    </div>
                    {salaryRangeInvalid && <p className="text-xs text-red-600 mt-1">Min can't be greater than max</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Job type</Label>
                    <Select
                      value={filters.jobType}
                      onValueChange={(v) => setFilters((f) => ({ ...f, jobType: v as JobType | "any" }))}
                    >
                      <SelectTrigger className="mt-1">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-1.5 shrink-0" />
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end pb-0.5">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remoteOnly"
                        checked={filters.remoteOnly}
                        onCheckedChange={(v) => setFilters((f) => ({ ...f, remoteOnly: !!v }))}
                      />
                      <Label htmlFor="remoteOnly" className="cursor-pointer text-sm font-medium text-gray-700">
                        Remote only
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {liveChips.map((chip) => (
                      <Badge
                        key={chip.key}
                        variant="outline"
                        className="gap-1.5 pl-2.5 pr-1.5 py-1 bg-green-50 text-green-700 border-green-200 font-normal"
                      >
                        <chip.icon className="w-3 h-3" />
                        {chip.label}
                        <button
                          onClick={() => removeChip(chip.key)}
                          className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${chip.label} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {liveChips.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-gray-600">
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Clear all
                      </Button>
                    )}
                    <Button
                      onClick={handleSearchClick}
                      disabled={isSearching || experienceRangeInvalid || salaryRangeInvalid}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="w-5 h-5 text-gray-500" />
            {isLoading ? (
              isAiSearching ? "AI is analyzing jobs..." : "Searching..."
            ) : heading ? (
              heading.title
            ) : (
              "Job results"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : searchError ? (
            <EmptyState
              icon={AlertCircle}
              iconClassName="h-10 w-10 text-red-400 mx-auto mb-3"
              title="Something went wrong"
              description={searchError}
              action={
                <Button variant="outline" onClick={handleRetry}>
                  Try again
                </Button>
              }
            />
          ) : hasSearched && searchResults.length === 0 ? (
            <EmptyState
              icon={SearchX}
              iconClassName="h-10 w-10 text-gray-400 mx-auto mb-3"
              title="No jobs found"
              description={
                mode === "ai"
                  ? "Try rephrasing your description, or expand Filters below for precise criteria."
                  : appliedChips.length > 0
                  ? "Try widening or removing some of your filters."
                  : "There are no open jobs right now."
              }
              action={
                mode === "ai" ? (
                  <Button
                    variant="outline"
                    onClick={() => setOpenSections((s) => Array.from(new Set([...s, "filters"])))}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                    Open Filters
                  </Button>
                ) : appliedChips.length > 0 ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : hasSearched ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {searchResults.map((job) => (
                  <Card
                    key={job.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow duration-200 group cursor-pointer"
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-gray-700">
                            {job.company_name?.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                              {job.title}
                            </h3>
                            <Badge className={cn(getTypeColor(job.job_type), "font-semibold shrink-0")}>
                              {jobService.formatJobType(job.job_type)}
                            </Badge>
                            {job.remote_work_allowed && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                <Globe className="w-3 h-3 mr-1" />
                                Remote
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 shrink-0" />
                            {job.company_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-3">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.job_type === "contract"
                            ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, {
                                suffix: "/hr",
                                currency: job.salary_currency,
                              })
                            : formatCompactRange(job.salary_min, job.salary_max, { currency: job.salary_currency })}
                        </span>
                        {(job.experience_min || job.experience_max) && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {job.experience_min ?? 0}
                            {job.experience_max ? `-${job.experience_max}` : "+"} yrs
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>

                      {(job.required_skills?.length || 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.required_skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                          {job.required_skills.length > 4 && (
                            <Badge variant="outline" className="text-xs font-normal">
                              +{job.required_skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Posted {formatDate(job.created_at)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/jobs/${job.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {mode === "filters" && resultPagination?.hasNextPage && (
                <div className="text-center pt-2">
                  <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    Load more jobs
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              iconClassName="h-12 w-12 text-gray-300 mx-auto mb-3"
              title="Search for jobs"
              description="Describe the role you want in AI Search, or expand Filters below for precise criteria."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchJobs;
