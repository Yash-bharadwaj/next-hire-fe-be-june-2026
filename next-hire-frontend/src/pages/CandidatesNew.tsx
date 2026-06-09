import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  Mail,
  Phone,
  GraduationCap,
  Star,
  FileText,
  MessageSquare,
  Briefcase,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  UserCheck,
  UserX,
  Send,
  Bot,
  FileSpreadsheet,
  Pencil,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  DollarSign,
  Award,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCandidateSearch, useCandidateStats } from "@/hooks/useCandidateSearch";
import { useAuth } from "@/contexts/AuthContext";
import { candidateSearchService } from "@/services/candidateSearchService";

const Candidates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    candidates, 
    loading, 
    error, 
    pagination, 
    filters, 
    searchCandidates, 
    refresh,
    setFilters 
  } = useCandidateSearch();
  const { stats } = useCandidateStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [experienceRange, setExperienceRange] = useState([0, 20]);
  const [salaryRange, setSalaryRange] = useState([50000, 200000]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      location: locationFilter || undefined,
      skills: skillsFilter || undefined,
      availability_status: availabilityFilter === "all" ? undefined : availabilityFilter,
      experience_min: experienceRange[0],
      experience_max: experienceRange[1],
      salary_min: salaryRange[0],
      salary_max: salaryRange[1],
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
    };
    searchCandidates(newFilters);
  };

  const handleViewCandidate = (candidateId: string) => {
    navigate(`/dashboard/candidates/${candidateId}`);
  };

  const handleContactCandidate = (candidate: any) => {
    // Open email client or messaging system
    window.location.href = `mailto:${candidate.user?.email}`;
  };

  const handleAddToShortlist = (candidateId: string) => {
    // TODO: Implement shortlist functionality
    console.log("Add to shortlist:", candidateId);
  };

  const formatExperience = (years?: number) => {
    if (!years) return "No experience specified";
    if (years === 1) return "1 year";
    return `${years} years`;
  };

  const formatSalary = (amount?: number) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailabilityColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      not_available: "bg-red-100 text-red-800",
      interviewing: "bg-yellow-100 text-yellow-800",
      employed: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getAvailabilityLabel = (status: string) => {
    const labels = {
      available: "Available",
      not_available: "Not Available",
      interviewing: "Interviewing",
      employed: "Employed",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setSkillsFilter("");
    setAvailabilityFilter("all");
    setExperienceRange([0, 20]);
    setSalaryRange([50000, 200000]);
    setSortBy("created_at");
    setSortOrder("DESC");
    searchCandidates({});
  };

  // Load initial data
  useEffect(() => {
    if (user?.role === "recruiter") {
      searchCandidates({ page: 1, limit: 20 });
    }
  }, [user?.role]);

  if (user?.role !== "recruiter") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">Access denied. Only recruiters can search candidates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Search</h1>
          <p className="text-gray-600">Find and connect with qualified candidates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            AI Search
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalCandidates}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.availabilityStats?.find(s => s.availability_status === 'available')?.count || 0}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.recentCandidates}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Search Results</p>
                  <p className="text-2xl font-bold text-orange-700">{pagination.totalItems}</p>
                </div>
                <Search className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search & Filters</span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Name, skills, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
              <Input
                placeholder="City, state, or country..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Skills</label>
              <Input
                placeholder="React, Python, Marketing..."
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Availability</label>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="employed">Employed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Recently Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="salary">Expected Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Order</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESC">Descending</SelectItem>
                  <SelectItem value="ASC">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Experience: {experienceRange[0]} - {experienceRange[1]} years
              </label>
              <Slider
                value={experienceRange}
                onValueChange={setExperienceRange}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Expected Salary: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
              </label>
              <Slider
                value={salaryRange}
                onValueChange={setSalaryRange}
                max={300000}
                min={30000}
                step={5000}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Candidates ({pagination.totalItems})</span>
            <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No candidates found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidateSearchService.formatCandidateName(candidate)}
                          </h3>
                          <p className="text-sm text-gray-600">{candidate.user?.email}</p>
                        </div>
                        <Badge className={getAvailabilityColor(candidate.availability_status)}>
                          {getAvailabilityLabel(candidate.availability_status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{candidate.location || "Location not specified"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{formatExperience(candidate.experience_years)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalary(candidate.expected_salary)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{candidate.phone || "Phone not provided"}</span>
                        </div>
                      </div>

                      {candidate.bio && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{candidate.bio}</p>
                      )}

                      {/* Skills */}
                      {candidate.candidateSkills && candidate.candidateSkills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {candidate.candidateSkills.slice(0, 8).map((skill, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className={`text-xs ${candidateSearchService.getProficiencyColor(skill.proficiency_level)}`}
                              >
                                {skill.skill_name} ({skill.proficiency_level})
                              </Badge>
                            ))}
                            {candidate.candidateSkills.length > 8 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.candidateSkills.length - 8} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recent Experience */}
                      {candidate.experiences && candidate.experiences.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Recent Experience:</p>
                          <div className="space-y-1">
                            {candidate.experiences.slice(0, 2).map((exp, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                <span className="font-medium">{exp.job_title}</span> at {exp.company_name}
                                {exp.is_current && <Badge variant="outline" className="ml-2 text-xs">Current</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCandidate(candidate.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleContactCandidate(candidate)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddToShortlist(candidate.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Add to Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View LinkedIn
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Download Resume
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                    {pagination.totalItems} candidates
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => searchCandidates({ ...filters, page: pagination.currentPage - 1 })}
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
                      onClick={() => searchCandidates({ ...filters, page: pagination.currentPage + 1 })}
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
};

export default Candidates;
