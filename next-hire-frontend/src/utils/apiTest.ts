import { apiClient } from "@/lib/api";

export const testBackendConnection = async () => {
  try {
    console.log("Testing backend connection...");
    
    // Test health endpoint
    const healthResponse = await fetch("http://localhost:5001/health");
    const healthData = await healthResponse.json();
    console.log("Health check:", healthData);
    
    // Test public jobs endpoint
    const jobsResponse = await apiClient.get("/jobs");
    console.log("Jobs response:", jobsResponse.data);
    
    return true;
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
};

export const testCandidateFlow = async () => {
  try {
    console.log("Testing candidate flow...");
    
    // This would require authentication
    const profileResponse = await apiClient.get("/candidate/profile");
    console.log("Candidate profile:", profileResponse.data);
    
    return true;
  } catch (error) {
    console.error("Candidate flow test failed:", error);
    return false;
  }
};
