import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  recruiterService, 
  Job, 
  CreateJobRequest, 
  UpdateJobRequest,
  Submission,
  UpdateSubmissionStatusRequest,
  ScheduleInterviewRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
  JobStatus,
  JobPriority,
  JobType,
  SubmissionStatus,
  TaskStatus,
  TaskPriority
} from "@/services/recruiterService";
import { useAuth } from "@/contexts/AuthContext";

// Hook for managing recruiter jobs
export const useRecruiterJobs = (initialFilters: {
  page?: number;
  limit?: number;
  status?: JobStatus;
  priority?: JobPriority;
  job_type?: JobType;
} = {}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState(initialFilters);

  const { user } = useAuth();

  const fetchJobs = useCallback(async (searchFilters = {}) => {
    if (user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await recruiterService.getJobs(finalFilters);

      setJobs(response.data.jobs || []);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  const createJob = useCallback(async (data: CreateJobRequest): Promise<Job | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can create jobs");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.createJob(data);
      toast.success("Job created successfully!");
      
      // Refresh the jobs list
      fetchJobs();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create job";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role, fetchJobs]);

  const updateJob = useCallback(async (jobId: string, data: UpdateJobRequest): Promise<Job | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update jobs");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.updateJob(jobId, data);
      toast.success("Job updated successfully!");
      
      // Update the job in the list
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? response.data : job
        )
      );
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update job";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const searchJobs = useCallback((searchFilters: any) => {
    fetchJobs(searchFilters);
  }, [fetchJobs]);

  const loadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchJobs({ ...filters, page: pagination.currentPage + 1 });
    }
  }, [fetchJobs, filters, pagination]);

  const refresh = useCallback(() => {
    fetchJobs(filters);
  }, [fetchJobs, filters]);

  // Load initial data
  useEffect(() => {
    if (user?.role === "recruiter") {
      fetchJobs();
    }
  }, [user?.role]);

  return {
    jobs,
    loading,
    error,
    pagination,
    filters,
    createJob,
    updateJob,
    searchJobs,
    loadMore,
    refresh,
    setFilters,
  };
};

// Hook for managing job submissions (for recruiters)
export const useJobSubmissions = (jobId: string | null) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<{
    page?: number;
    limit?: number;
    status?: SubmissionStatus;
    sort_by?: "submitted_at" | "ai_score" | "status";
    sort_order?: "ASC" | "DESC";
  }>({});

  const { user } = useAuth();

  const fetchSubmissions = useCallback(async (searchFilters = {}) => {
    if (!jobId || user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await recruiterService.getJobSubmissions(jobId, finalFilters);

      setSubmissions(response.data.submissions || []);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch submissions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId, filters, user?.role]);

  const updateSubmissionStatus = useCallback(async (
    submissionId: string, 
    data: UpdateSubmissionStatusRequest
  ): Promise<Submission | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update submission status");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.updateSubmissionStatus(submissionId, data);
      toast.success(`Application status updated to ${recruiterService.formatSubmissionStatus(data.status)}`);
      
      // Update the submission in the list
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(submission => 
          submission.id === submissionId ? response.data : submission
        )
      );
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update submission status";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const scheduleInterview = useCallback(async (
    submissionId: string,
    data: ScheduleInterviewRequest
  ) => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can schedule interviews");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.scheduleInterview(submissionId, data);
      toast.success("Interview scheduled successfully!");
      
      // Refresh submissions to get updated data
      fetchSubmissions();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to schedule interview";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role, fetchSubmissions]);

  const searchSubmissions = useCallback((searchFilters: any) => {
    fetchSubmissions(searchFilters);
  }, [fetchSubmissions]);

  const refresh = useCallback(() => {
    fetchSubmissions(filters);
  }, [fetchSubmissions, filters]);

  // Load initial data
  useEffect(() => {
    if (jobId && user?.role === "recruiter") {
      fetchSubmissions();
    }
  }, [jobId, user?.role]);

  return {
    submissions,
    loading,
    error,
    pagination,
    filters,
    updateSubmissionStatus,
    scheduleInterview,
    searchSubmissions,
    refresh,
    setFilters,
  };
};

// Hook for managing recruiter tasks
export const useRecruiterTasks = (initialFilters: {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
} = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState(initialFilters);

  const { user } = useAuth();

  const fetchTasks = useCallback(async (searchFilters = {}) => {
    if (user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const finalFilters = { ...filters, ...searchFilters };
      const response = await recruiterService.getTasks(finalFilters);

      setTasks(response.data.tasks || []);
      setPagination(response.data.pagination);
      setFilters(finalFilters);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch tasks";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, user?.role]);

  const createTask = useCallback(async (data: CreateTaskRequest): Promise<Task | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can create tasks");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.createTask(data);
      toast.success("Task created successfully!");
      
      // Refresh the tasks list
      fetchTasks();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create task";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role, fetchTasks]);

  const updateTaskStatus = useCallback(async (
    taskId: string, 
    data: UpdateTaskStatusRequest
  ): Promise<Task | null> => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can update task status");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.updateTaskStatus(taskId, data);
      toast.success(`Task status updated to ${data.status}`);
      
      // Update the task in the list
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? response.data : task
        )
      );
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update task status";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const searchTasks = useCallback((searchFilters: any) => {
    fetchTasks(searchFilters);
  }, [fetchTasks]);

  const refresh = useCallback(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  // Load initial data
  useEffect(() => {
    if (user?.role === "recruiter") {
      fetchTasks();
    }
  }, [user?.role]);

  return {
    tasks,
    loading,
    error,
    pagination,
    filters,
    createTask,
    updateTaskStatus,
    searchTasks,
    refresh,
    setFilters,
  };
};

// Hook for single job management
export const useRecruiterJob = (jobId: string | null) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchJob = useCallback(async () => {
    if (!jobId || user?.role !== "recruiter") return;

    try {
      setLoading(true);
      setError(null);

      const response = await recruiterService.getJobDetails(jobId);
      setJob(response.data.job);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch job details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId, user?.role]);

  const updateJob = useCallback(async (data: UpdateJobRequest): Promise<Job | null> => {
    if (!jobId || user?.role !== "recruiter") {
      toast.error("Only recruiters can update jobs");
      return null;
    }

    try {
      setLoading(true);
      const response = await recruiterService.updateJob(jobId, data);
      toast.success("Job updated successfully!");
      setJob(response.data.job);
      return response.data.job;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update job";
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [jobId, user?.role]);

  const refresh = useCallback(() => {
    fetchJob();
  }, [fetchJob]);

  // Load initial data
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    updateJob,
    refresh,
  };
};
