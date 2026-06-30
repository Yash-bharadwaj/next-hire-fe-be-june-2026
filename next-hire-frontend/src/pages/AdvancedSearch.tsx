import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import {
  candidateSearchService,
  CandidateProfile,
  CandidateSearchFilters,
} from "@/services/candidateSearchService";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Send,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  Star,
  Briefcase,
  GraduationCap,
  Clock,
  Bot,
  Info,
  Loader2,
  Users,
  X,
  Tag,
  UserCheck,
  CheckCircle2,
  ArrowUpDown,
  RotateCcw,
  SearchX,
  AlertCircle,
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
  aiReasoning?: string;
  skills: string[];
  education: string;
  availability: string;
  avatar: string;
}

const MAX_VISIBLE_SKILLS = 6;
const RESULTS_PER_PAGE = 10;

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
        : "Title not specified"),
    company: latestExperience?.company_name || "Not specified",
    location: candidate.location || "Not specified",
    experience: candidateSearchService.formatExperience(candidate.experience_years),
    salary: candidateSearchService.formatSalary(candidate.expected_salary),
    email: candidate.user?.email || candidate.email || "Not specified",
    phone: candidate.phone || "Not specified",
    aiScore: candidate.matchScore,
    aiReasoning: candidate.matchReasoning,
    skills,
    education: latestEducation
      ? [latestEducation.degree, latestEducation.field_of_study].filter(Boolean).join(" in ")
      : "Not specified",
    availability: candidateSearchService.getAvailabilityLabel(candidate.availability_status),
    avatar: initials || "?",
  };
};

type AvailabilityFilter = "any" | "available" | "not_available" | "interviewing";
type PlacementFilter = "any" | "active" | "placed";
type SortOption = "" | "experience_desc" | "salary_desc" | "name_asc" | "newest";
type SearchMode = "filters" | "ai" | "job-match";

interface FilterState {
  search: string;
  location: string;
  skills: string;
  experienceMin: string;
  experienceMax: string;
  salaryMin: string;
  salaryMax: string;
  availability: AvailabilityFilter;
  placementStatus: PlacementFilter;
  sortBy: SortOption;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  location: "",
  skills: "",
  experienceMin: "",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  availability: "any",
  placementStatus: "any",
  sortBy: "",
};

const SORT_PARAMS: Record<SortOption, Pick<CandidateSearchFilters, "sort_by" | "sort_order">> = {
  "": {},
  experience_desc: { sort_by: "experience", sort_order: "DESC" },
  salary_desc: { sort_by: "salary", sort_order: "DESC" },
  name_asc: { sort_by: "name", sort_order: "ASC" },
  newest: { sort_by: "created_at", sort_order: "DESC" },
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
  if (f.availability !== "any") {
    chips.push({
      key: "availability",
      label: candidateSearchService.getAvailabilityLabel(f.availability),
      icon: UserCheck,
    });
  }
  if (f.placementStatus !== "any") {
    chips.push({
      key: "placementStatus",
      label: f.placementStatus === "placed" ? "Placed candidates" : "Active pool only",
      icon: CheckCircle2,
    });
  }
  return chips;
};

const buildApiFilters = (f: FilterState, page: number): CandidateSearchFilters => {
  const filters: CandidateSearchFilters = { page, limit: RESULTS_PER_PAGE };
  if (f.search.trim()) filters.search = f.search.trim();
  if (f.location.trim()) filters.location = f.location.trim();
  if (f.skills.trim()) filters.skills = f.skills.trim();
  if (f.experienceMin) filters.experience_min = Number(f.experienceMin);
  if (f.experienceMax) filters.experience_max = Number(f.experienceMax);
  if (f.salaryMin) filters.salary_min = Number(f.salaryMin);
  if (f.salaryMax) filters.salary_max = Number(f.salaryMax);
  if (f.availability !== "any") filters.availability_status = f.availability;
  if (f.placementStatus !== "any") filters.placement_status = f.placementStatus;
  Object.assign(filters, SORT_PARAMS[f.sortBy]);
  return filters;
};

// Match scores are calibrated so that unrelated profiles score near 0%
// and only genuinely close profiles reach the upper end - thresholds are
// tuned to that scale (see SEMANTIC_SIMILARITY_FLOOR/CEIL on the backend).
const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-700 bg-green-100";
  if (score >= 45) return "text-blue-700 bg-blue-100";
  if (score >= 20) return "text-yellow-700 bg-yellow-100";
  return "text-red-700 bg-red-100";
};

const CandidateCardSkeleton = () => (
  <Card className="border-gray-200">
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5 min-w-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-56" />
          <div className="flex flex-wrap gap-3 pt-1">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
          </div>
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

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [activeTab, setActiveTab] = useState<"filters" | "ai">("ai");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [aiPrompt, setAiPrompt] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<SearchResultCandidate[]>([]);
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
  const [matchedJob, setMatchedJob] = useState<{ id: string; job_id: string; title: string } | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [profileCandidate, setProfileCandidate] = useState<SearchResultCandidate | null>(null);

  const hasScores = searchResults.some((c) => typeof c.aiScore === "number");
  const visibleResults = hasScores ? searchResults.filter((c) => (c.aiScore ?? 0) >= minScore) : searchResults;

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

  const handleContactCandidate = (candidate: SearchResultCandidate) => {
    window.location.href = `mailto:${candidate.email}`;
  };

  // Arrived from "Find Matching Candidates" on a job - load AI-ranked candidates for it
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    const loadJobMatches = async () => {
      setActiveTab("ai");
      setIsAiSearching(true);
      setSearchError(null);
      setHasSearched(true);
      setMode("job-match");
      setMinScore(0);
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
          const message = err.response?.data?.message || err.message || "Failed to load matching candidates";
          setSearchError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setIsAiSearching(false);
      }
    };

    loadJobMatches();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const clearJobMatch = () => {
    setMatchedJob(null);
    setSearchResults([]);
    setHasSearched(false);
    setMode(null);
    setSearchError(null);
    setSearchParams((params) => {
      params.delete("jobId");
      return params;
    });
  };

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
    setMatchedJob(null);

    try {
      const response = await candidateSearchService.searchCandidates(buildApiFilters(f, page));
      const mapped = response.data.candidates.map(mapCandidateToResult);
      setSearchResults((prev) => (append ? [...prev, ...mapped] : mapped));
      setResultPagination(response.data.pagination);
      setAppliedChips(buildChips(f));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to search candidates";
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
      case "availability":
        updated.availability = "any";
        break;
      case "placementStatus":
        updated.placementStatus = "any";
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
    setMatchedJob(null);
    setMinScore(0);

    try {
      const response = await candidateSearchService.matchCandidatesByText(prompt);
      setSearchResults(response.data.candidates.map(mapCandidateToResult));
      setAiQueryLabel(prompt);
      if (response.data.skipped_count > 0) {
        toast.info(
          `${response.data.skipped_count} candidate(s) skipped (no profile data yet to match against)`
        );
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "AI search failed";
      setSearchError(message);
      toast.error(message);
      setSearchResults([]);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleRetry = async () => {
    if (mode === "filters") {
      runFilterSearch(filters, 1);
      return;
    }
    if (mode === "ai") {
      handleAiSearch();
      return;
    }
    if (mode === "job-match" && jobId) {
      setIsAiSearching(true);
      setSearchError(null);
      try {
        const response = await candidateSearchService.matchCandidatesForJob(jobId);
        setMatchedJob(response.data.job || null);
        setSearchResults(response.data.candidates.map(mapCandidateToResult));
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to load matching candidates";
        setSearchError(message);
        toast.error(message);
      } finally {
        setIsAiSearching(false);
      }
    }
  };

  const isLoading = isSearching || isAiSearching;

  const resultsHeading = (): { title: string; subtitle?: string } | null => {
    if (!hasSearched) return null;
    if (mode === "job-match" && matchedJob) {
      return { title: `AI-ranked matches for "${matchedJob.title}"`, subtitle: matchedJob.job_id };
    }
    if (mode === "ai" && aiQueryLabel) {
      return { title: `AI matches for "${aiQueryLabel}"` };
    }
    if (mode === "filters") {
      const total = resultPagination?.totalItems ?? searchResults.length;
      return {
        title: appliedChips.length
          ? `${total} candidate${total === 1 ? "" : "s"} match your filters`
          : `${total} candidate${total === 1 ? "" : "s"} in your talent pool`,
      };
    }
    return null;
  };

  const heading = resultsHeading();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Search</h1>
        <p className="text-gray-600">Find the right talent with smart filters or a plain-English AI search</p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "filters" | "ai")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Search
              </TabsTrigger>
              <TabsTrigger value="filters" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="pt-5">
              {matchedJob ? (
                <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="font-medium">
                      Showing AI-ranked candidates for <span className="font-semibold">{matchedJob.title}</span>{" "}
                      <span className="text-purple-700">({matchedJob.job_id})</span>
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearJobMatch}>
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="ai-prompt" className="text-sm font-medium text-gray-700">
                    Describe the ideal candidate in plain English
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Bot className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="ai-prompt"
                        placeholder="Senior React developer, 5+ years, fintech background, open to remote..."
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
                    Searches your entire candidate database for the best semantic match, and explains why each
                    result fits.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="filters" className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Keywords
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Name or bio keywords..."
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
                  <Label htmlFor="skills" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Skills
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Comma-separated, matched against exact skill names (e.g. "React, Node.js")
                      </TooltipContent>
                    </Tooltip>
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
                  <Label className="text-sm font-medium text-gray-700">Expected salary ($)</Label>
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
                  <Label className="text-sm font-medium text-gray-700">Availability</Label>
                  <Select
                    value={filters.availability}
                    onValueChange={(v) => setFilters((f) => ({ ...f, availability: v as AvailabilityFilter }))}
                  >
                    <SelectTrigger className="mt-1">
                      <UserCheck className="h-4 w-4 text-gray-400 mr-1.5 shrink-0" />
                      <SelectValue placeholder="Any availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="not_available">Not available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Placement status</Label>
                  <Select
                    value={filters.placementStatus}
                    onValueChange={(v) => setFilters((f) => ({ ...f, placementStatus: v as PlacementFilter }))}
                  >
                    <SelectTrigger className="mt-1">
                      <CheckCircle2 className="h-4 w-4 text-gray-400 mr-1.5 shrink-0" />
                      <SelectValue placeholder="All candidates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">All candidates</SelectItem>
                      <SelectItem value="active">Active pool only</SelectItem>
                      <SelectItem value="placed">Placed candidates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Sort by</Label>
                  <Select
                    value={filters.sortBy || "default"}
                    onValueChange={(v) => setFilters((f) => ({ ...f, sortBy: (v === "default" ? "" : v) as SortOption }))}
                  >
                    <SelectTrigger className="mt-1">
                      <ArrowUpDown className="h-4 w-4 text-gray-400 mr-1.5 shrink-0" />
                      <SelectValue placeholder="Most relevant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Most relevant</SelectItem>
                      <SelectItem value="newest">Newest profiles</SelectItem>
                      <SelectItem value="experience_desc">Most experienced</SelectItem>
                      <SelectItem value="salary_desc">Highest expected salary</SelectItem>
                      <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-gray-500" />
              {isLoading ? (
                isAiSearching ? "AI is analyzing candidates..." : "Searching..."
              ) : heading ? (
                <span>
                  {heading.title}
                  {heading.subtitle && <span className="text-gray-400 font-normal ml-1.5">{heading.subtitle}</span>}
                </span>
              ) : (
                "Search results"
              )}
            </CardTitle>
            {!isLoading && hasScores && (
              <div className="flex items-center gap-3">
                <Label className="text-sm text-gray-600 whitespace-nowrap">
                  Min. match: <span className="font-semibold">{minScore}%</span>
                </Label>
                <Slider
                  value={[minScore]}
                  onValueChange={([v]) => setMinScore(v)}
                  max={100}
                  step={5}
                  className="w-32"
                />
                {minScore > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setMinScore(0)}>
                    Reset
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CandidateCardSkeleton key={i} />
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
          ) : hasSearched && searchResults.length > 0 && visibleResults.length === 0 ? (
            <EmptyState
              icon={SearchX}
              iconClassName="h-10 w-10 text-gray-400 mx-auto mb-3"
              title={`No candidates above ${minScore}% match`}
              description={`${searchResults.length} candidate${searchResults.length === 1 ? " was" : "s were"} found, but none meet the minimum match score.`}
              action={
                <Button variant="outline" onClick={() => setMinScore(0)}>
                  Clear score filter
                </Button>
              }
            />
          ) : hasSearched && searchResults.length === 0 ? (
            <EmptyState
              icon={SearchX}
              iconClassName="h-10 w-10 text-gray-400 mx-auto mb-3"
              title="No candidates found"
              description={
                mode === "ai"
                  ? "Try rephrasing your description, or switch to the Filters tab for precise criteria."
                  : appliedChips.length > 0
                  ? "Try widening or removing some of your filters."
                  : "Your talent pool is empty right now."
              }
              action={
                appliedChips.length > 0 ? (
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
                {visibleResults.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-blue-700">{candidate.avatar}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                              {candidate.name}
                            </h3>
                            {typeof candidate.aiScore === "number" && (
                              <Badge className={`${getScoreColor(candidate.aiScore)} font-semibold shrink-0`}>
                                <Star className="w-3 h-3 mr-1" />
                                {candidate.aiScore}%
                              </Badge>
                            )}
                            {candidate.aiReasoning && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex cursor-pointer text-blue-500 hover:text-blue-700 shrink-0">
                                    <Info className="w-4 h-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="flex items-start gap-2">
                                    <Bot className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                                    <span>{candidate.aiReasoning}</span>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {candidate.title} · {candidate.company}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-3">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {candidate.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {candidate.experience}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {candidate.salary}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {candidate.availability}
                        </span>
                      </div>

                      {candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {candidate.skills.slice(0, MAX_VISIBLE_SKILLS).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > MAX_VISIBLE_SKILLS && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex cursor-pointer">
                                  <Badge variant="outline" className="text-xs font-normal">
                                    +{candidate.skills.length - MAX_VISIBLE_SKILLS}
                                  </Badge>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {candidate.skills.slice(MAX_VISIBLE_SKILLS).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                        <div className="min-w-0 text-xs text-gray-500 flex items-center gap-1 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => setProfileCandidate(candidate)}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleContactCandidate(candidate)}
                          >
                            Contact
                          </Button>
                        </div>
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
                    Load more candidates
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              iconClassName="h-12 w-12 text-gray-300 mx-auto mb-3"
              title="Ready to find great talent?"
              description="Describe who you need in plain English under AI Search, or switch to Filters for precise criteria."
            />
          )}
        </CardContent>
      </Card>

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
                <DialogDescription>
                  {profileCandidate.title} at {profileCandidate.company}
                </DialogDescription>
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
                  {profileCandidate.skills.map((skill) => (
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
