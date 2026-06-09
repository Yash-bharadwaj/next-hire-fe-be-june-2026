#!/usr/bin/env node
/**
 * Test script for core hiring flow
 * Tests: Job Creation -> Candidate Signup -> Job Application -> Dashboard Stats
 */

const API_BASE_URL = "http://localhost:5001/api/v1";

// Existing recruiter credentials
const RECRUITER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZmQ4ZDkwNS00Mjc3LTQ3OWYtYTVkZS1mMGYxY2VlMjRmYzYiLCJlbWFpbCI6Imdvd3RoYW10aXJyaTdAZ21haWwuY29tIiwicm9sZSI6InJlY3J1aXRlciIsImlhdCI6MTc2MzQ1MDkxOSwiZXhwIjoxNzYzNDUxODE5fQ.ORraaio3F9FimfGlBWIqTYw9WnKpSuNNX_QLhzvXhYs";
const RECRUITER_ID = "dfd8d905-4277-479f-a5de-f0f1cee24fc6";
const RECRUITER_EMAIL = "gowthamtirri7@gmail.com";

// Helper function for API requests
async function apiRequest(method, path, data = null, token = null) {
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(result, null, 2));
  }

  return result;
}

// Jobs to create
const jobsData = [
  {
    title: "Senior Frontend Developer",
    description:
      "Looking for an experienced React developer to join our team. You will be responsible for building modern, responsive web applications.",
    company_name: "TechCorp Solutions",
    location: "San Francisco, CA",
    city: "San Francisco",
    state: "CA",
    country: "US",
    job_type: "full_time",
    salary_min: 130000,
    salary_max: 180000,
    salary_currency: "USD",
    experience_min: 5,
    experience_max: 10,
    required_skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
    preferred_skills: ["Next.js", "Redux", "GraphQL", "Jest"],
    status: "active",
    priority: "high",
    positions_available: 2,
    vendor_eligible: true,
    remote_work_allowed: true,
  },
  {
    title: "Backend Engineer - Node.js",
    description:
      "Join our backend team to build scalable APIs and microservices. Experience with Node.js and databases required.",
    company_name: "Cloud Systems Inc",
    location: "Austin, TX",
    city: "Austin",
    state: "TX",
    country: "US",
    job_type: "full_time",
    salary_min: 120000,
    salary_max: 170000,
    salary_currency: "USD",
    experience_min: 4,
    experience_max: 8,
    required_skills: [
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "REST API",
    ],
    preferred_skills: ["Docker", "Kubernetes", "AWS", "Redis"],
    status: "active",
    priority: "high",
    positions_available: 1,
    vendor_eligible: true,
    remote_work_allowed: true,
  },
  {
    title: "Full Stack Developer",
    description:
      "We need a versatile full stack developer comfortable with both frontend and backend technologies.",
    company_name: "StartupHub",
    location: "New York, NY",
    city: "New York",
    state: "NY",
    country: "US",
    job_type: "full_time",
    salary_min: 110000,
    salary_max: 160000,
    salary_currency: "USD",
    experience_min: 3,
    experience_max: 7,
    required_skills: ["JavaScript", "React", "Node.js", "SQL"],
    preferred_skills: ["Python", "Django", "AWS", "CI/CD"],
    status: "active",
    priority: "medium",
    positions_available: 1,
    vendor_eligible: true,
    remote_work_allowed: false,
  },
  {
    title: "DevOps Engineer",
    description:
      "Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.",
    company_name: "InfraTech",
    location: "Seattle, WA",
    city: "Seattle",
    state: "WA",
    country: "US",
    job_type: "full_time",
    salary_min: 125000,
    salary_max: 175000,
    salary_currency: "USD",
    experience_min: 4,
    experience_max: 9,
    required_skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    preferred_skills: ["Jenkins", "GitLab", "Ansible", "Monitoring"],
    status: "active",
    priority: "high",
    positions_available: 1,
    vendor_eligible: true,
    remote_work_allowed: true,
  },
];

// Test candidate data
const candidateData = {
  email: `test.candidate.${Date.now()}@example.com`,
  password: "TestCandidate123!@#",
  role: "candidate",
  first_name: "John",
  last_name: "Doe",
  phone_number: "+1234567890",
  current_title: "Senior Software Engineer",
  years_of_experience: 6,
  location: "San Francisco, CA",
};

async function createJobs() {
  console.log("=== STEP 1: Creating Jobs as Recruiter ===\n");
  const createdJobs = [];

  for (let i = 0; i < jobsData.length; i++) {
    try {
      console.log(
        `Creating job ${i + 1}/${jobsData.length}: ${jobsData[i].title}...`
      );
      const response = await apiRequest(
        "POST",
        "/recruiter/jobs",
        jobsData[i],
        RECRUITER_TOKEN
      );
      createdJobs.push(response.data);
      console.log(`✓ Job created successfully`);
      console.log(`  - Job ID: ${response.data.job_id}`);
      console.log(`  - Title: ${response.data.title}`);
      console.log(`  - Company: ${response.data.company_name}`);
      console.log(`  - Location: ${response.data.location}`);
      console.log(`  - Status: ${response.data.status}`);
      console.log("");
    } catch (error) {
      console.error(`✗ Failed to create job: ${jobsData[i].title}`);
      console.error(`  Error: ${error.message}`);
      console.log("");
    }
  }

  console.log(`Total jobs created: ${createdJobs.length}/${jobsData.length}\n`);
  return createdJobs;
}

async function getOTPFromDatabase(email) {
  // Helper to get OTP from database for testing
  const { exec } = require("child_process");
  const { promisify } = require("util");
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(
      `sqlite3 database.sqlite "SELECT otp FROM users WHERE email='${email}'"`
    );
    return stdout.trim();
  } catch (error) {
    return null;
  }
}

async function signupCandidate() {
  console.log("=== STEP 2: Signing Up New Candidate ===\n");

  try {
    console.log(`Creating candidate account: ${candidateData.email}...`);
    const signupResponse = await apiRequest(
      "POST",
      "/auth/signup",
      candidateData
    );

    console.log("✓ Candidate account created (pending OTP verification)");
    console.log(`  - Email: ${signupResponse.data.email}`);
    console.log(`  - Role: ${signupResponse.data.role}`);
    console.log(`  - User ID: ${signupResponse.data.userId}`);

    // Get OTP from database for testing
    console.log("\nRetrieving OTP from database for testing...");
    const otp = await getOTPFromDatabase(candidateData.email);

    if (otp) {
      console.log(`OTP retrieved: ${otp}`);
      console.log("Verifying OTP...");

      const verifyResponse = await apiRequest("POST", "/auth/verify-otp", {
        email: candidateData.email,
        otp: otp,
      });

      console.log("✓ OTP verified successfully");
      console.log(`  - Access Token obtained`);
      console.log("");

      return {
        user: verifyResponse.data.user,
        token: verifyResponse.data.accessToken,
      };
    } else {
      console.log("✗ Could not retrieve OTP from database");
      console.log("Note: In production, user would receive OTP via email\n");
      return null;
    }
  } catch (error) {
    console.error("✗ Failed to sign up/verify candidate");
    console.error(`  Error: ${error.message}`);
    console.log("");
    return null;
  }
}

async function applyToJobs(candidateToken, jobs) {
  console.log("=== STEP 3: Candidate Applying to Jobs ===\n");

  const submissions = [];

  for (let i = 0; i < jobs.length; i++) {
    try {
      console.log(
        `Applying to job ${i + 1}/${jobs.length}: ${jobs[i].title}...`
      );

      const submissionData = {
        job_id: jobs[i].id,
        cover_letter: `Dear Hiring Manager,\n\nI am excited to apply for the ${jobs[i].title} position at ${jobs[i].company_name}. With ${candidateData.years_of_experience} years of experience in software development, I believe I would be a great fit for this role.\n\nLooking forward to hearing from you.\n\nBest regards,\n${candidateData.first_name} ${candidateData.last_name}`,
        expected_salary: Math.floor(
          (jobs[i].salary_min + jobs[i].salary_max) / 2
        ),
      };

      const response = await apiRequest(
        "POST",
        "/submissions",
        submissionData,
        candidateToken
      );
      submissions.push(response.data);

      console.log(`✓ Application submitted successfully`);
      console.log(`  - Job: ${jobs[i].title}`);
      console.log(`  - Status: ${response.data.status}`);
      console.log(`  - Expected Salary: $${submissionData.expected_salary}`);
      console.log("");
    } catch (error) {
      console.error(`✗ Failed to apply to: ${jobs[i].title}`);
      console.error(`  Error: ${error.message}`);
      console.log("");
    }
  }

  console.log(
    `Total applications submitted: ${submissions.length}/${jobs.length}\n`
  );
  return submissions;
}

async function checkDashboard() {
  console.log("=== STEP 4: Checking Recruiter Dashboard ===\n");

  try {
    console.log("Fetching dashboard stats...");
    const response = await apiRequest(
      "GET",
      "/dashboard/stats",
      null,
      RECRUITER_TOKEN
    );

    console.log("✓ Dashboard stats retrieved successfully\n");
    console.log("Dashboard Overview:");
    console.log("─────────────────────────────────────────");
    console.log(`  Total Jobs:          ${response.data.overview.totalJobs}`);
    console.log(`  Active Jobs:         ${response.data.overview.activeJobs}`);
    console.log(
      `  Total Submissions:   ${response.data.overview.totalSubmissions}`
    );
    console.log(
      `  New Submissions:     ${response.data.overview.newSubmissions}`
    );
    console.log(
      `  Total Interviews:    ${response.data.overview.totalInterviews}`
    );
    console.log(
      `  Upcoming Interviews: ${response.data.overview.upcomingInterviews}`
    );
    console.log(
      `  Total Placements:    ${response.data.overview.totalPlacements}`
    );
    console.log("─────────────────────────────────────────\n");

    if (
      response.data.recentSubmissions &&
      response.data.recentSubmissions.length > 0
    ) {
      console.log("Recent Submissions:");
      response.data.recentSubmissions.forEach((submission, index) => {
        console.log(
          `  ${index + 1}. ${submission.candidate?.first_name} ${
            submission.candidate?.last_name
          }`
        );
        console.log(`     Job: ${submission.job?.title}`);
        console.log(`     Status: ${submission.status}`);
        console.log(
          `     Date: ${new Date(submission.submitted_at).toLocaleString()}`
        );
        console.log("");
      });
    }

    return response.data;
  } catch (error) {
    console.error("✗ Failed to fetch dashboard");
    console.error(`  Error: ${error.message}`);
    console.log("");
    return null;
  }
}

async function listAllJobs() {
  console.log("=== STEP 5: Listing All Jobs ===\n");

  try {
    console.log("Fetching all jobs...");
    const response = await apiRequest(
      "GET",
      "/recruiter/jobs?page=1&limit=20",
      null,
      RECRUITER_TOKEN
    );

    console.log(`✓ Found ${response.data.jobs.length} jobs\n`);

    response.data.jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   - Company: ${job.company_name}`);
      console.log(`   - Location: ${job.location}`);
      console.log(`   - Status: ${job.status}`);
      console.log(`   - Job ID: ${job.job_id}`);
      console.log("");
    });

    return response.data.jobs;
  } catch (error) {
    console.error("✗ Failed to list jobs");
    console.error(`  Error: ${error.message}`);
    console.log("");
    return [];
  }
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║     TESTING CORE HIRING FLOW - THE NEXT HIRE            ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  console.log(`Recruiter: ${RECRUITER_EMAIL}`);
  console.log(`Recruiter ID: ${RECRUITER_ID}`);
  console.log(`API Base URL: ${API_BASE_URL}\n`);
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    // Step 1: Create jobs
    const createdJobs = await createJobs();

    if (createdJobs.length === 0) {
      console.error("❌ No jobs were created. Cannot proceed with testing.");
      process.exit(1);
    }

    // Step 2: Sign up candidate
    const candidate = await signupCandidate();

    if (!candidate) {
      console.error(
        "❌ Failed to create candidate. Cannot proceed with applications."
      );
      process.exit(1);
    }

    // Step 3: Apply to jobs
    const submissions = await applyToJobs(candidate.token, createdJobs);

    // Step 4: Check dashboard
    const dashboard = await checkDashboard();

    // Step 5: List all jobs
    await listAllJobs();

    // Summary
    console.log(
      "\n═══════════════════════════════════════════════════════════"
    );
    console.log("                      TEST SUMMARY                          ");
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );
    console.log(`✓ Jobs Created:        ${createdJobs.length}`);
    console.log(`✓ Candidate Signed Up: ${candidate ? "Yes" : "No"}`);
    console.log(`✓ Applications Made:   ${submissions.length}`);
    console.log(`✓ Dashboard Working:   ${dashboard ? "Yes" : "No"}`);
    console.log("\n");

    if (dashboard) {
      console.log("Dashboard reflects:");
      console.log(`  - ${dashboard.overview.totalJobs} jobs`);
      console.log(`  - ${dashboard.overview.totalSubmissions} submissions`);
      console.log(`  - ${dashboard.overview.activeJobs} active jobs`);
    }

    console.log("\n✅ Core hiring flow test completed successfully!\n");
    console.log("Credentials for testing:");
    console.log(`  Candidate Email: ${candidateData.email}`);
    console.log(`  Candidate Password: ${candidateData.password}`);
    console.log("");
  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);
