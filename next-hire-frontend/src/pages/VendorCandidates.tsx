import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Briefcase,
  DollarSign,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { useVendorCandidates } from "@/hooks/useVendor";
import { toast } from "sonner";

const VendorCandidates = () => {
  const { user } = useAuth();

  const {
    candidates,
    loading,
    error,
    pagination,
    filters,
    searchCandidates,
    refresh,
    createCandidate,
  } = useVendorCandidates({ page: 1, limit: 12 });

  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    experience_years: "",
    current_salary: "",
    expected_salary: "",
    skills: "",
    bio: "",
  });

  if (!user || user.role !== "vendor") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">
            Access denied. This workspace is only available for vendors.
          </p>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      search: searchTerm || undefined,
      skills: skillsFilter || undefined,
      availability_status:
        availabilityFilter === "all" ? undefined : availabilityFilter,
      page: 1,
    };
    searchCandidates(updatedFilters);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSkillsFilter("");
    setAvailabilityFilter("all");
    searchCandidates({ page: 1, limit: pagination.itemsPerPage });
  };

  const handleCreateCandidate = async () => {
    if (!newCandidate.first_name || !newCandidate.last_name || !newCandidate.email) {
      toast.error("First name, last name, and email are required");
      return;
    }

    setCreating(true);
    try {
      await createCandidate({
        first_name: newCandidate.first_name.trim(),
        last_name: newCandidate.last_name.trim(),
        email: newCandidate.email.toLowerCase(),
        phone: newCandidate.phone || undefined,
        location: newCandidate.location || undefined,
        experience_years: newCandidate.experience_years
          ? Number(newCandidate.experience_years)
          : undefined,
        current_salary: newCandidate.current_salary
          ? Number(newCandidate.current_salary)
          : undefined,
        expected_salary: newCandidate.expected_salary
          ? Number(newCandidate.expected_salary)
          : undefined,
        skills: newCandidate.skills
          ? newCandidate.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
        bio: newCandidate.bio || undefined,
      });

      toast.success("Candidate added to your pool");
      setCreateDialogOpen(false);
      setNewCandidate({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        location: "",
        experience_years: "",
        current_salary: "",
        expected_salary: "",
        skills: "",
        bio: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to create candidate");
    } finally {
      setCreating(false);
    }
  };

  const getAvailabilityBadge = (status: string) => {
    const map: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      interviewing: "bg-yellow-100 text-yellow-700",
      not_available: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Pool</h1>
          <p className="text-gray-600">
            Maintain profiles for the talent you represent.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Find candidates quickly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Skills
              </label>
              <Input
                placeholder="React, Sales, Healthcare..."
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Availability
              </label>
              <Select
                value={availabilityFilter}
                onValueChange={setAvailabilityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All candidates</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidates ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-36 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-gray-600">{error}</p>
              <Button className="mt-4" variant="outline" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-10">
              <User className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">You haven't added any candidates yet.</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create Candidate
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {candidate.first_name} {candidate.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {candidate.email || candidate.user?.email || "Email not available"}
                      </p>
                    </div>
                    <Badge className={getAvailabilityBadge(candidate.availability_status)}>
                      {candidate.availability_status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{candidate.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>
                        {candidate.experience_years
                          ? `${candidate.experience_years} yrs experience`
                          : "Experience TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {candidate.expected_salary
                          ? `$${Number(candidate.expected_salary).toLocaleString()}`
                          : "Expectation TBD"}
                      </span>
                    </div>
                  </div>
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {candidate.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() =>
                    searchCandidates({ ...filters, page: pagination.currentPage - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    searchCandidates({ ...filters, page: pagination.currentPage + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>
              Capture the candidate information you want to manage.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                First Name *
              </label>
              <Input
                value={newCandidate.first_name}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, first_name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Last Name *
              </label>
              <Input
                value={newCandidate.last_name}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, last_name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email *
              </label>
              <Input
                type="email"
                value={newCandidate.email}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone
              </label>
              <Input
                value={newCandidate.phone}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Location
              </label>
              <Input
                value={newCandidate.location}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Experience (years)
              </label>
              <Input
                type="number"
                value={newCandidate.experience_years}
                onChange={(e) =>
                  setNewCandidate((prev) => ({
                    ...prev,
                    experience_years: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Current Salary
              </label>
              <Input
                type="number"
                value={newCandidate.current_salary}
                onChange={(e) =>
                  setNewCandidate((prev) => ({
                    ...prev,
                    current_salary: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Expected Salary
              </label>
              <Input
                type="number"
                value={newCandidate.expected_salary}
                onChange={(e) =>
                  setNewCandidate((prev) => ({
                    ...prev,
                    expected_salary: e.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Skills (comma separated)
              </label>
              <Input
                value={newCandidate.skills}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, skills: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Summary / Notes
              </label>
              <Textarea
                rows={3}
                value={newCandidate.bio}
                onChange={(e) =>
                  setNewCandidate((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Share highlights about this candidate"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCandidate} disabled={creating}>
              {creating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Save Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCandidates;

