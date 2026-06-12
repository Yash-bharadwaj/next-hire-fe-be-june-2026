import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CountrySelect, StateSelect, CitySelect, CurrencySelect } from "@/components/location-fields";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users2,
  FileText,
  Settings,
  Target,
  User,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { recruiterService, Job as RecruiterJob } from "@/services/recruiterService";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";

const AddNewJob = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams<{ id: string }>();
  const isEditMode = Boolean(jobId);
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobLoadError, setJobLoadError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [secondarySkills, setSecondarySkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newSecondarySkill, setNewSecondarySkill] = useState("");

  const form = useForm({
    shouldUnregister: false,
    defaultValues: {
      jobTitle: "",
      customer: "",
      jobDescription: "",
      externalJobDescription: "",
      jobType: "",
      location: "",
      city: "",
      state: "",
      country: "United States",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "USD",
      experienceMin: "",
      experienceMax: "",
      educationRequirements: "",
      priority: "",
      jobStatus: "Active",
      positionsAvailable: "1",
      maxSubmissionsAllowed: "",
      vendorEligible: true,
      remoteWorkAllowed: false,
      startDate: "",
      endDate: "",
      applicationDeadline: "",
      clientContact: "",
      clientJobId: "",
      jobStartDate: "",
      jobEndDate: "",
      numberOfPositions: "1",
      taxTerms: "",
      paymentTerms: "",
      expensePaid: false,
      spokenLanguages: "",
      documentsRequired: "",
    },
  });

  const watchedCountry = useWatch({ control: form.control, name: "country" });
  const watchedState = useWatch({ control: form.control, name: "state" });

  const formValuesRef = useRef<Record<string, any>>(form.getValues());

  useEffect(() => {
    const subscription = form.watch((value) => {
      formValuesRef.current = value;
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    form.reset(formValuesRef.current);
  }, [currentStep, form]);

  // Map API values to form-friendly labels
  const mapJobTypeFromAPI = (jobType?: string) => {
    switch (jobType) {
      case "full_time":
        return "Full-time";
      case "part_time":
        return "Part-time";
      case "contract":
        return "Contract";
      case "temporary":
        return "Temporary";
      default:
        return "";
    }
  };

  const mapPriorityFromAPI = (priority?: string) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "";
    }
  };

  const mapStatusFromAPI = (status?: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "draft":
        return "Draft";
      case "paused":
        return "Paused";
      case "closed":
        return "Closed";
      default:
        return "Active";
    }
  };

  // The backend has no dedicated columns for Terms/Client step fields, so on
  // create they get appended as labeled lines to external_description. When
  // editing, parse those lines back out so the form fields are prefilled and
  // the External Job Description shown to the user is free of this metadata
  // (otherwise saving would re-append a fresh, possibly conflicting block).
  const TERMS_FIELD_LABELS: Array<{ key: string; label: string }> = [
    { key: "taxTerms", label: "Tax Terms" },
    { key: "paymentTerms", label: "Payment Terms" },
    { key: "expensePaid", label: "Expenses Paid" },
    { key: "spokenLanguages", label: "Spoken Languages" },
    { key: "documentsRequired", label: "Required Documents" },
    { key: "clientContact", label: "Client Contact" },
    { key: "clientJobId", label: "Client Job ID" },
  ];

  const parseExternalDescription = (description: string) => {
    const parsed: Record<string, string> = {};
    let cleaned = description || "";

    TERMS_FIELD_LABELS.forEach(({ key, label }) => {
      const regex = new RegExp(`^[ \\t]*${label}:[ \\t]*(.*)$\\n?`, "mi");
      const match = cleaned.match(regex);
      if (match) {
        parsed[key] = match[1].trim();
        cleaned = cleaned.replace(regex, "");
      }
    });

    return {
      cleanDescription: cleaned.replace(/\n{3,}/g, "\n\n").trim(),
      taxTerms: parsed.taxTerms || "",
      paymentTerms: parsed.paymentTerms || "",
      expensePaid: parsed.expensePaid === "Yes",
      spokenLanguages: parsed.spokenLanguages || "",
      documentsRequired: parsed.documentsRequired || "",
      clientContact: parsed.clientContact || "",
      clientJobId: parsed.clientJobId || "",
    };
  };

  // Prefill form when editing an existing job
  useEffect(() => {
    const loadJob = async () => {
      if (!isEditMode || !jobId) return;
      try {
        setIsLoadingJob(true);
        setJobLoadError(null);
        const res = await recruiterService.getJobDetails(jobId);
        const job: RecruiterJob = res.data.job;

        // Terms/Client step fields are stored as labeled lines appended to
        // external_description (the backend has no dedicated columns for them)
        const parsedTerms = parseExternalDescription(job.external_description || "");

        // Prefill form fields
        form.reset({
          jobTitle: job.title || "",
          customer: job.company_name || "",
          jobDescription: job.description || "",
          externalJobDescription: parsedTerms.cleanDescription,
          jobType: mapJobTypeFromAPI(job.job_type),
          location: job.location || "",
          city: (job as any).city || "",
          state: (job as any).state || "",
          country: (job as any).country || "United States",
          salaryMin:
            job.salary_min !== undefined && job.salary_min !== null
              ? String(job.salary_min)
              : "",
          salaryMax:
            job.salary_max !== undefined && job.salary_max !== null
              ? String(job.salary_max)
              : "",
          salaryCurrency: job.salary_currency || "USD",
          experienceMin:
            job.experience_min !== undefined && job.experience_min !== null
              ? String(job.experience_min)
              : "",
          experienceMax:
            job.experience_max !== undefined && job.experience_max !== null
              ? String(job.experience_max)
              : "",
          educationRequirements: job.education_requirements || "",
          priority: mapPriorityFromAPI(job.priority),
          jobStatus: mapStatusFromAPI(job.status),
          positionsAvailable:
            job.positions_available !== undefined && job.positions_available !== null
              ? String(job.positions_available)
              : "1",
          maxSubmissionsAllowed:
            job.max_submissions_allowed !== undefined &&
            job.max_submissions_allowed !== null
              ? String(job.max_submissions_allowed)
              : "",
          vendorEligible: job.vendor_eligible,
          remoteWorkAllowed: job.remote_work_allowed,
          startDate: job.start_date ? job.start_date.slice(0, 10) : "",
          endDate: job.end_date ? job.end_date.slice(0, 10) : "",
          applicationDeadline: job.application_deadline
            ? job.application_deadline.slice(0, 10)
            : "",
          clientContact: parsedTerms.clientContact,
          clientJobId: parsedTerms.clientJobId,
          jobStartDate: "",
          jobEndDate: "",
          numberOfPositions:
            job.positions_available !== undefined && job.positions_available !== null
              ? String(job.positions_available)
              : "1",
          taxTerms: parsedTerms.taxTerms,
          paymentTerms: parsedTerms.paymentTerms,
          expensePaid: parsedTerms.expensePaid,
          spokenLanguages: parsedTerms.spokenLanguages,
          documentsRequired: parsedTerms.documentsRequired,
        });

        setSkills(job.required_skills || []);
        setSecondarySkills(job.preferred_skills || []);
      } catch (err: any) {
        console.error("Failed to load job for editing", err);
        setJobLoadError(err?.message || "Failed to load job details");
      } finally {
        setIsLoadingJob(false);
      }
    };

    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, jobId]);

  const steps = [
    { id: 1, title: "Basic Info", icon: Briefcase },
    { id: 2, title: "Details", icon: FileText },
    { id: 3, title: "Requirements", icon: Target },
    { id: 4, title: "Terms", icon: Settings },
  ];

  const addSkill = (type: "primary" | "secondary") => {
    const skill = type === "primary" ? newSkill : newSecondarySkill;
    const setSkillsArray = type === "primary" ? setSkills : setSecondarySkills;
    const currentSkills = type === "primary" ? skills : secondarySkills;
    const setNewSkillState =
      type === "primary" ? setNewSkill : setNewSecondarySkill;

    if (skill.trim() && !currentSkills.includes(skill.trim())) {
      setSkillsArray([...currentSkills, skill.trim()]);
      setNewSkillState("");
    }
  };

  const removeSkill = (
    skillToRemove: string,
    type: "primary" | "secondary"
  ) => {
    const setSkillsArray = type === "primary" ? setSkills : setSecondarySkills;
    const currentSkills = type === "primary" ? skills : secondarySkills;
    setSkillsArray(currentSkills.filter((skill) => skill !== skillToRemove));
  };

  // Helper functions to map form values to API format
  const mapJobTypeToAPI = (jobType: string) => {
    const mapping: Record<string, string> = {
      "Full-time": "full_time",
      "Part-time": "part_time",
      Contract: "contract",
      Temporary: "temporary",
      "Full Time": "full_time",
      "Part Time": "part_time",
    };
    return mapping[jobType] || jobType?.toLowerCase().replace(/[\s-]/g, "_");
  };

  const mapPriorityToAPI = (priority: string) => {
    const mapping: Record<string, string> = {
      High: "high",
      Medium: "medium",
      Low: "low",
    };
    return mapping[priority] || priority?.toLowerCase();
  };

  const mapStatusToAPI = (status: string) => {
    const mapping: Record<string, string> = {
      Draft: "draft",
      Active: "active",
      Paused: "paused",
      Closed: "closed",
    };
    return mapping[status] || status?.toLowerCase();
  };

  const showIncompleteStepsToast = () => {
    toast({
      title: "Please Complete All Steps",
      description: "Please complete all steps before submitting.",
      variant: "destructive",
    });
  };

  // Cross-field validation for the Start Date / End Date / Application
  // Deadline trio. There's no zod resolver on this form, so date-ordering
  // rules are enforced manually and surfaced via setError + a toast.
  const validateJobDates = (data: Record<string, any>) => {
    form.clearErrors(["jobStartDate", "jobEndDate", "applicationDeadline"]);

    const startDate = data.jobStartDate ? new Date(data.jobStartDate) : null;
    const endDate = data.jobEndDate ? new Date(data.jobEndDate) : null;
    const deadline = data.applicationDeadline
      ? new Date(data.applicationDeadline)
      : null;

    let valid = true;

    if (startDate && endDate && endDate < startDate) {
      form.setError("jobEndDate", {
        type: "manual",
        message: "End date must be on or after the start date.",
      });
      valid = false;
    }

    if (deadline) {
      const compareDate = startDate || endDate;
      if (compareDate && deadline > compareDate) {
        form.setError("applicationDeadline", {
          type: "manual",
          message: startDate
            ? "Application deadline must be on or before the start date."
            : "Application deadline must be on or before the end date.",
        });
        valid = false;
      }
    }

    if (!valid) {
      toast({
        title: "Invalid Dates",
        description: "Please fix the highlighted date fields before continuing.",
        variant: "destructive",
      });
    }

    return valid;
  };

  const parseNumberInput = (value: unknown) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number") {
      return Number.isNaN(value) ? undefined : value;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const parsed = Number(trimmed);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const getTrimmedString = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

  const handleSubmit = async (submittedData: any) => {
    const data = {
      ...formValuesRef.current,
      ...submittedData,
    };
    // Ensure we're on the final step before submitting
    if (currentStep !== 4) {
      showIncompleteStepsToast();
      return;
    }

    if (!validateJobDates(data)) {
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!data.jobTitle?.trim()) {
        toast({
          title: "Validation Error",
          description: "Job title is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.jobDescription?.trim()) {
        toast({
          title: "Validation Error",
          description: "Job description is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.customer?.trim()) {
        toast({
          title: "Validation Error",
          description: "Company name is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate location (backend requires it)
      if (!data.location?.trim()) {
        toast({
          title: "Validation Error",
          description: "Location is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate job type (backend requires it)
      const mappedJobType = mapJobTypeToAPI(data.jobType);
      if (
        !mappedJobType ||
        !["full_time", "part_time", "contract", "temporary"].includes(
          mappedJobType
        )
      ) {
        toast({
          title: "Validation Error",
          description: "Please select a valid job type",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Map form data to API format - start with required fields
      const jobData: any = {
        title: data.jobTitle.trim(),
        description: (data.jobDescription || "").trim(), // Ensure it's a string
        company_name: data.customer.trim(),
        location: data.location.trim(), // Required field
        job_type: mappedJobType, // Required field, already validated
        country: data.country?.trim() || "United States", // Always send country
        salary_currency: data.salaryCurrency || "USD", // Always send currency
        city: getTrimmedString(data.city),
        state: getTrimmedString(data.state),
      };

      // Ensure description is not empty (backend requires it)
      if (!jobData.description) {
        toast({
          title: "Validation Error",
          description: "Job description is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Status - map from form to API format (default to active)
      const mappedStatus = mapStatusToAPI(data.jobStatus);
      if (
        mappedStatus &&
        ["draft", "active", "paused", "closed"].includes(mappedStatus)
      ) {
        jobData.status = mappedStatus;
      } else {
        // Default to active if not specified or invalid
        jobData.status = "active";
      }

      // Optional fields - only add if they have values
      let externalDescription = getTrimmedString(data.externalJobDescription);
      if (externalDescription) {
        jobData.external_description = externalDescription;
      }

      // Salary fields
      // Note: salary_currency is already set in initial jobData object above

      const salaryMin = parseNumberInput(data.salaryMin);
      jobData.salary_min =
        salaryMin !== undefined && salaryMin >= 0 ? salaryMin : null;

      const salaryMax = parseNumberInput(data.salaryMax);
      jobData.salary_max =
        salaryMax !== undefined && salaryMax >= 0 ? salaryMax : null;

      // Experience fields
      const experienceMin = parseNumberInput(data.experienceMin);
      jobData.experience_min =
        experienceMin !== undefined && experienceMin >= 0
          ? Math.floor(experienceMin)
          : null;

      const experienceMax = parseNumberInput(data.experienceMax);
      jobData.experience_max =
        experienceMax !== undefined && experienceMax >= 0
          ? Math.floor(experienceMax)
          : null;

      // Skills
      jobData.required_skills = [...skills];
      jobData.preferred_skills = [...secondarySkills];

      // Other optional fields
      if (data.educationRequirements?.trim()) {
        jobData.education_requirements = data.educationRequirements.trim();
      }

      // Priority (optional, defaults to medium in backend)
      const mappedPriority = mapPriorityToAPI(data.priority);
      if (
        mappedPriority &&
        ["low", "medium", "high"].includes(mappedPriority)
      ) {
        jobData.priority = mappedPriority;
      }

      // Positions available - check both numberOfPositions and positionsAvailable
      const positionsValue = parseNumberInput(
        data.numberOfPositions ?? data.positionsAvailable
      );
      jobData.positions_available =
        positionsValue !== undefined && positionsValue >= 1
          ? Math.floor(positionsValue)
          : 1;

      const maxSubmissions = parseNumberInput(data.maxSubmissionsAllowed);
      jobData.max_submissions_allowed =
        maxSubmissions !== undefined && maxSubmissions >= 1
          ? Math.floor(maxSubmissions)
          : null;

      // Terms fields - store in payload and external description for readability
      const trimmedTaxTerms = data.taxTerms?.trim();
      if (trimmedTaxTerms) {
        jobData.tax_terms = trimmedTaxTerms;
      }

      const trimmedPaymentTerms = data.paymentTerms?.trim();
      if (trimmedPaymentTerms) {
        jobData.payment_terms = trimmedPaymentTerms;
      }

      jobData.expense_paid = Boolean(data.expensePaid);

      const trimmedSpokenLanguages = data.spokenLanguages?.trim();
      if (trimmedSpokenLanguages) {
        jobData.spoken_languages = trimmedSpokenLanguages;
      }

      const trimmedDocumentsRequired = data.documentsRequired?.trim();
      if (trimmedDocumentsRequired) {
        jobData.documents_required = trimmedDocumentsRequired;
      }

      let termsInfo = "";
      if (trimmedTaxTerms) {
        termsInfo += `Tax Terms: ${trimmedTaxTerms}\n`;
      }
      if (trimmedPaymentTerms) {
        termsInfo += `Payment Terms: ${trimmedPaymentTerms}\n`;
      }
      if (data.expensePaid !== undefined) {
        termsInfo += `Expenses Paid: ${data.expensePaid ? "Yes" : "No"}\n`;
      }
      if (trimmedSpokenLanguages) {
        termsInfo += `Spoken Languages: ${trimmedSpokenLanguages}\n`;
      }
      if (trimmedDocumentsRequired) {
        termsInfo += `Required Documents: ${trimmedDocumentsRequired}\n`;
      }

      if (termsInfo) {
        externalDescription = externalDescription
          ? `${externalDescription}\n\n${termsInfo}`.trim()
          : termsInfo.trim();
      }

      // Boolean fields
      jobData.vendor_eligible = Boolean(data.vendorEligible);
      jobData.remote_work_allowed = Boolean(data.remoteWorkAllowed);

      // Date fields - check both field names (jobStartDate/jobEndDate from form, startDate/endDate for compatibility)
      const startDateValue = data.jobStartDate || data.startDate;
      const endDateValue = data.jobEndDate || data.endDate;

      if (startDateValue) {
        try {
          jobData.start_date = new Date(startDateValue).toISOString();
        } catch (e) {
          console.warn("Invalid start date:", startDateValue);
        }
      }

      if (endDateValue) {
        try {
          jobData.end_date = new Date(endDateValue).toISOString();
        } catch (e) {
          console.warn("Invalid end date:", endDateValue);
        }
      }

      if (data.applicationDeadline) {
        try {
          jobData.application_deadline = new Date(
            data.applicationDeadline
          ).toISOString();
        } catch (e) {
          console.warn(
            "Invalid application deadline:",
            data.applicationDeadline
          );
        }
      }

      // Client fields - append to external_description to preserve the data
      // These can be extracted later if backend adds dedicated fields
      const trimmedClientContact = data.clientContact?.trim();
      if (trimmedClientContact) {
        jobData.client_contact = trimmedClientContact;
      }

      const trimmedClientJobId = data.clientJobId?.trim();
      if (trimmedClientJobId) {
        jobData.client_job_id = trimmedClientJobId;
      }

      let clientInfo = "";
      if (trimmedClientContact) {
        clientInfo += `Client Contact: ${trimmedClientContact}\n`;
      }
      if (trimmedClientJobId) {
        clientInfo += `Client Job ID: ${trimmedClientJobId}\n`;
      }

      if (clientInfo) {
        externalDescription = externalDescription
          ? `${externalDescription}\n\n${clientInfo}`.trim()
          : clientInfo.trim();
      }

      if (externalDescription !== undefined) {
        jobData.external_description = externalDescription;
      }

      // Log all form data for debugging
      console.log("=== FORM DATA DEBUG ===");
      console.log("Raw form data:", data);
      console.log("Skills:", { required: skills, preferred: secondarySkills });
      console.log("Processed job data:", JSON.stringify(jobData, null, 2));
      console.log("=== END DEBUG ===");

      // Create or update job based on mode
      let response;
      if (isEditMode && jobId) {
        response = await recruiterService.updateJob(jobId, jobData);
        console.log("Job update response:", response);
      } else {
        response = await recruiterService.createJob(jobData);
        console.log("Job creation response:", response);
      }

      // Handle response structure - backend returns { success: true, data: job, message: "..." }
      if (response.success || response.data) {
        toast({
          title: isEditMode ? "Job Updated Successfully!" : "Job Created Successfully!",
          description: isEditMode
            ? `Job "${jobData.title}" has been updated.`
            : `Job "${jobData.title}" has been created and saved.`,
        });

        // Small delay to show success message
        setTimeout(() => {
          navigate("/dashboard/jobs");
        }, 1000);
      } else {
        throw new Error(response.message || "Failed to save job");
      }
    } catch (error: any) {
      console.error("Error creating job:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Better error handling for validation errors
      let errorMessage = "An unexpected error occurred";

      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle validation errors array
        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          const firstError = errorData.errors[0];
          errorMessage =
            firstError.message || firstError.msg || "Validation error";
        }
        // Handle single error message (validation middleware joins all errors with ", ")
        else if (errorData.message) {
          errorMessage = errorData.message;
          // If multiple errors are joined, show first one for cleaner UI
          if (errorMessage.includes(", ")) {
            errorMessage = errorMessage.split(", ")[0];
          }
        }
        // Handle error string
        else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error Creating Job",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateJobClick = () => {
    if (currentStep !== 4) {
      showIncompleteStepsToast();
      return;
    }
    form.handleSubmit(handleSubmit)();
  };

  const nextStep = () => {
    if (currentStep === 2 && !validateJobDates(form.getValues())) {
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getStepMarkup = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Job Title *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior React Developer"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Company *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. TechCorp Inc"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Job Type *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Priority *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Job Status *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Location *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. San Francisco, CA or Remote"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Country
                    </FormLabel>
                    <FormControl>
                      <CountrySelect
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          form.setValue("state", "");
                          form.setValue("city", "");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      State
                    </FormLabel>
                    <FormControl>
                      <StateSelect
                        country={watchedCountry}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          form.setValue("city", "");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      City
                    </FormLabel>
                    <FormControl>
                      <CitySelect
                        country={watchedCountry}
                        state={watchedState}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Min Salary
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 120000"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Max Salary
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 150000"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Currency
                    </FormLabel>
                    <FormControl>
                      <CurrencySelect value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Internal Job Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description for internal use..."
                      className="min-h-[120px] border-gray-200 focus:border-green-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalJobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    External Job Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description for job boards and candidates..."
                      className="min-h-[120px] border-gray-200 focus:border-green-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="jobStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Application Deadline
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Client Contact
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. John Smith"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientJobId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Client Job ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. TC-001"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="experienceMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Min Experience (years)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 2"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Max Experience (years)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 8"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="educationRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Education Requirements
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Bachelor's in Computer Science"
                      className="border-gray-200 focus:border-green-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Skills */}
            <div>
              <Label className="text-gray-700 font-medium mb-3 block">
                Primary Skills
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill, "primary")}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="border-gray-200 focus:border-green-400"
                  autoComplete="off"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addSkill("primary"))
                  }
                />
                <Button
                  type="button"
                  onClick={() => addSkill("primary")}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Secondary Skills */}
            <div>
              <Label className="text-gray-700 font-medium mb-3 block">
                Secondary Skills
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {secondarySkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill, "secondary")}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSecondarySkill}
                  onChange={(e) => setNewSecondarySkill(e.target.value)}
                  placeholder="Add a secondary skill"
                  className="border-gray-200 focus:border-green-400"
                  autoComplete="off"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addSkill("secondary"))
                  }
                />
                <Button
                  type="button"
                  onClick={() => addSkill("secondary")}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="spokenLanguages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Spoken Languages
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. English, Spanish"
                      className="border-gray-200 focus:border-green-400"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentsRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Required Documents
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Resume, Portfolio, References"
                      className="border-gray-200 focus:border-green-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="numberOfPositions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Number of Positions
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSubmissionsAllowed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Max Submissions
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        className="border-gray-200 focus:border-green-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="taxTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Tax Terms
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select tax terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="W2">W2</SelectItem>
                        <SelectItem value="1099">1099</SelectItem>
                        <SelectItem value="Corp to Corp">
                          Corp to Corp
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Payment Terms
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expensePaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-700 font-medium">
                      Expenses Paid
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Will the company cover job-related expenses?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vendorEligible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Vendor Eligible
                      </FormLabel>
                      <div className="text-sm text-gray-600">
                        Allow vendor partners to submit candidates?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remoteWorkAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Remote Work Allowed
                      </FormLabel>
                      <div className="text-sm text-gray-600">
                        Indicate if candidates can work remotely.
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () =>
    [1, 2, 3, 4].map((step) => (
      <div key={step} className={currentStep === step ? "block" : "hidden"}>
        {getStepMarkup(step)}
      </div>
    ));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-white/20">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-roboto-slab">
                {isEditMode ? "Edit Job" : "Add New Job"}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 font-roboto-slab">
                {isEditMode ? "Update this job posting" : "Create a new job posting"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/jobs")}
            className="border-gray-200 hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                          : isCompleted
                          ? "bg-green-100 text-green-600 border-2 border-green-200"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        isActive
                          ? "text-green-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                        currentStep > step.id ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={(event) => event.preventDefault()}>
          <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
            <CardHeader className="border-b border-white/20 pb-4">
              <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800">
                {steps.find((s) => s.id === currentStep)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateJobClick}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting
                    ? isEditMode
                      ? "Updating Job..."
                      : "Creating Job..."
                    : isEditMode
                    ? "Update Job"
                    : "Create Job"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddNewJob;
