import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const TestJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Testing jobs API...");
      console.log("User:", user);
      
      // Test direct API call
      const response = await apiClient.get("/jobs/recruiter/my-jobs?page=1&limit=20");
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        setJobs(response.data.data.jobs || []);
      } else {
        setError("API returned success: false");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "recruiter") {
      testAPI();
    }
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Jobs API</h1>
      
      <div className="mb-4">
        <p><strong>User Role:</strong> {user?.role}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>

      <button 
        onClick={testAPI} 
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? "Loading..." : "Test API"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <strong>Jobs Count:</strong> {jobs.length}
      </div>

      {jobs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Jobs:</h3>
          {jobs.map((job, index) => (
            <div key={job.id || index} className="border p-3 rounded">
              <p><strong>Title:</strong> {job.title}</p>
              <p><strong>Company:</strong> {job.company_name}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Created By:</strong> {job.created_by}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestJobs;
