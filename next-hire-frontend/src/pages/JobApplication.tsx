import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Users, 
  Calendar,
  FileText,
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { jobService, Job } from "@/services/jobService";
import { submissionService } from "@/services/submissionService";
import { toast } from "sonner";

export default function JobApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    cover_letter: "",
    expected_salary: "",
    availability_date: "",
  });

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobById(id!, true);
      setJob(response.data.job);
    } catch (error: any) {
      console.error("Failed to load job details:", error);
      toast.error("Failed to load job details");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== "candidate") {
      toast.error("Only candidates can apply for jobs");
      navigate("/auth/login");
      return;
    }

    if (!id) {
      toast.error("Invalid job ID");
      return;
    }

    try {
      setSubmitting(true);
      
      const applicationData = {
        cover_letter: formData.cover_letter.trim() || undefined,
        expected_salary: formData.expected_salary ? parseFloat(formData.expected_salary) : undefined,
        availability_date: formData.availability_date || undefined,
      };

      console.log("Submitting application:", { jobId: id, applicationData });
      
      const response = await submissionService.applyToJob(id, applicationData);
      console.log("Application response:", response);
      
      setSubmitted(true);
      toast.success("Application submitted successfully!");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard/my-submissions");
      }, 2000);
      
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to submit application";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response?.status === 409) {
        // Duplicate application
        toast.info(errorMessage || "You have already applied to this job.");
        setSubmitted(true);
        setTimeout(() => {
          navigate("/dashboard/my-submissions");
        }, 1500);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/jobs")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50/50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your application for <strong>{job.title}</strong> has been submitted successfully.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate("/dashboard/my-submissions")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View My Applications
              </Button>
              <Button 
                onClick={() => navigate("/jobs")}
                variant="outline"
                className="w-full"
              >
                Browse More Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate(`/job/${id}`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Details
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Position</h1>
          <p className="text-gray-600">Submit your application for this role</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {job.company_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{jobService.formatJobType(job.job_type)}</span>
                </div>

                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{jobService.formatSalaryRange(job)}</span>
                  </div>
                )}

                {(job.experience_min || job.experience_max) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{jobService.formatExperienceRange(job)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
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

                <div className="flex items-center gap-2">
                  <Badge className={jobService.getJobStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                  {job.remote_work_allowed && (
                    <Badge variant="outline">Remote</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Details
                </CardTitle>
                <CardDescription>
                  Fill out the form below to submit your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Letter */}
                  <div className="space-y-2">
                    <Label htmlFor="cover_letter">
                      Cover Letter
                      <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                    </Label>
                    <Textarea
                      id="cover_letter"
                      value={formData.cover_letter}
                      onChange={(e) => handleInputChange("cover_letter", e.target.value)}
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.cover_letter.length}/2000 characters
                    </p>
                  </div>

                  {/* Expected Salary */}
                  <div className="space-y-2">
                    <Label htmlFor="expected_salary">
                      Expected Salary (USD)
                      <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                    </Label>
                    <Input
                      id="expected_salary"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.expected_salary}
                      onChange={(e) => handleInputChange("expected_salary", e.target.value)}
                      placeholder="e.g., 75000"
                    />
                    {job.salary_min && job.salary_max && (
                      <p className="text-xs text-gray-500">
                        Salary range for this position: {jobService.formatSalaryRange(job)}
                      </p>
                    )}
                  </div>

                  {/* Availability Date */}
                  <div className="space-y-2">
                    <Label htmlFor="availability_date">
                      Availability Date
                      <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                    </Label>
                    <Input
                      id="availability_date"
                      type="date"
                      value={formData.availability_date}
                      onChange={(e) => handleInputChange("availability_date", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500">
                      When can you start working if selected?
                    </p>
                  </div>

                  <Separator />

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/job/${id}`)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Before you apply:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Make sure your profile is complete and up-to-date</li>
                      <li>• Upload your latest resume in your profile</li>
                      <li>• Review the job requirements carefully</li>
                      <li>• You can track your application status in "My Applications"</li>
                    </ul>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
