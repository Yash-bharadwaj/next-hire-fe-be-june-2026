import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { jobService } from "@/services/jobService";
import { useAuth } from "@/contexts/AuthContext";

export const ApiDebug = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/health");
      const data = await response.json();
      setResults(prev => ({ ...prev, health: { success: true, data } }));
    } catch (error) {
      setResults(prev => ({ ...prev, health: { success: false, error: error.message } }));
    }
    setLoading(false);
  };

  const testPublicJobs = async () => {
    setLoading(true);
    try {
      const response = await jobService.searchJobs({ page: 1, limit: 5 });
      setResults(prev => ({ ...prev, publicJobs: { success: true, data: response } }));
    } catch (error) {
      setResults(prev => ({ ...prev, publicJobs: { success: false, error: error.message } }));
    }
    setLoading(false);
  };

  const testCandidateProfile = async () => {
    if (!user || user.role !== "candidate") {
      setResults(prev => ({ ...prev, candidateProfile: { success: false, error: "Not a candidate or not logged in" } }));
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.get("/candidate/profile");
      setResults(prev => ({ ...prev, candidateProfile: { success: true, data: response.data } }));
    } catch (error) {
      setResults(prev => ({ ...prev, candidateProfile: { success: false, error: error.message } }));
    }
    setLoading(false);
  };

  const testJobApplication = async () => {
    if (!user || user.role !== "candidate") {
      setResults(prev => ({ ...prev, jobApplication: { success: false, error: "Not a candidate or not logged in" } }));
      return;
    }
    
    setLoading(true);
    try {
      // First get a job to apply to
      const jobsResponse = await jobService.searchJobs({ page: 1, limit: 1 });
      if (jobsResponse.data.jobs && jobsResponse.data.jobs.length > 0) {
        const jobId = jobsResponse.data.jobs[0].id;
        
        // Try to apply (this might fail if already applied, which is fine for testing)
        try {
          const response = await apiClient.post(`/candidate/jobs/${jobId}/apply`, {
            cover_letter: "Test application",
            expected_salary: 75000
          });
          setResults(prev => ({ ...prev, jobApplication: { success: true, data: response.data } }));
        } catch (applyError) {
          setResults(prev => ({ ...prev, jobApplication: { success: false, error: applyError.message, jobId } }));
        }
      } else {
        setResults(prev => ({ ...prev, jobApplication: { success: false, error: "No jobs available to test application" } }));
      }
    } catch (error) {
      setResults(prev => ({ ...prev, jobApplication: { success: false, error: error.message } }));
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Debug Panel</CardTitle>
        <p className="text-sm text-gray-600">User: {user?.email} ({user?.role})</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testHealthCheck} disabled={loading}>
            Test Health Check
          </Button>
          <Button onClick={testPublicJobs} disabled={loading}>
            Test Public Jobs
          </Button>
          <Button onClick={testCandidateProfile} disabled={loading}>
            Test Candidate Profile
          </Button>
          <Button onClick={testJobApplication} disabled={loading}>
            Test Job Application
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(results).map(([key, result]: [string, any]) => (
            <div key={key} className="border rounded p-4">
              <h3 className="font-semibold mb-2">{key}</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
