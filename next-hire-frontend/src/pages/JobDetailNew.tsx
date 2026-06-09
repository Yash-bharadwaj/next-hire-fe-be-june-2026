import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Building2,
  Briefcase,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useJob } from "@/hooks/useJobs";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/contexts/AuthContext";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // No longer needed - using dedicated application page

  // Hooks
  const { job, loading, error } = useJob(id || null, true);
  const { submissions: mySubmissions, loading: mySubsLoading } = useSubmissions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading job details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h3>
              <p className="text-gray-600 mb-4">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/jobs")} variant="outline">
                Browse All Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasApplied =
    user?.role === "candidate" &&
    mySubmissions.some((s) => s.job_id === job.id);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply for jobs");
      navigate("/auth/login");
      return;
    }

    if (user.role !== "candidate") {
      toast.error("Only candidates can apply to jobs");
      return;
    }

    if (hasApplied) {
      toast.info("You have already applied to this job.");
      return;
    }

    // Navigate to the dedicated application page
    navigate(`/job/${job.id}/apply`);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/job-marketplace")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">{job.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(job.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={jobService.getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Badge variant="outline">
                        {jobService.formatJobType(job.job_type)}
                      </Badge>
                      {job.remote_work_allowed && (
                        <Badge variant="secondary">Remote</Badge>
                      )}
                      {job.priority === "high" && (
                        <Badge className="bg-green-100 text-green-800">Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Salary</p>
                      <p className="font-medium">{jobService.formatSalaryRange(job)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium">{jobService.formatExperienceRange(job)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Positions</p>
                      <p className="font-medium">{job.positions_available} available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {job.external_description || job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.required_skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.preferred_skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.education_requirements && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Education Requirements</h4>
                    <p className="text-gray-700">{job.education_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.creator?.recruiterProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{job.company_name}</h4>
                      <p className="text-sm text-gray-600">
                        Contact: {job.creator.recruiterProfile.first_name} {job.creator.recruiterProfile.last_name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this job</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={handleApply}
                    className="w-full"
                    size="lg"
                    disabled={hasApplied || mySubsLoading}
                    variant={hasApplied ? "outline" : "default"}
                  >
                    {hasApplied ? "Applied already" : "Apply Now"}
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    {hasApplied
                      ? "You have already applied to this job."
                      : "Complete your application with detailed form"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job ID</span>
                  <span className="font-medium">{job.job_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">{getTimeAgo(job.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{jobService.formatJobType(job.job_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remote Work</span>
                  <span className="font-medium">{job.remote_work_allowed ? "Yes" : "No"}</span>
                </div>
                {job.application_deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium">
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
