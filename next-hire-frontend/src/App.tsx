import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import Home from "./pages/Home";
import Dashboards from "./pages/Dashboards";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import AddNewJob from "./pages/AddNewJob";
import Submissions from "./pages/Submissions";
import SubmissionDetail from "./pages/SubmissionDetail";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import UserDetail from "./pages/UserDetail";
import SourcingPipeline from "./pages/SourcingPipeline";
import Placements from "./pages/Placements";
import PlacementDetail from "./pages/PlacementDetail";
import InterviewDetail from "./pages/InterviewDetail";
import Interviews from "./pages/Interviews";
import Onboarding from "./pages/Onboarding";
import BusinessPartners from "./pages/BusinessPartners";
import BusinessPartnerDetail from "./pages/BusinessPartnerDetail";
import TimeSheets from "./pages/TimeSheets";
import Reports from "./pages/Reports";
import Tickets from "./pages/Tickets";
import AdvancedSearch from "./pages/AdvancedSearch";
import SearchJobs from "./pages/SearchJobs";
import Calendar from "./pages/Calendar";
import EmailCenter from "./pages/EmailCenter";
import Settings from "./pages/Settings";
import AccountManagement from "./pages/AccountManagement";
import OrgHierarchy from "./pages/OrgHierarchy";
import CommunicationManager from "./pages/CommunicationManager";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import MyProfile from "./pages/MyProfile";
import MyJobs from "./pages/MyJobs";
import JobSearch from "./pages/JobSearch";
import JobMarketplace from "./pages/JobMarketplace";
import MyRelationships from "./pages/MyRelationships";
import SignupCandidate from "./pages/SignupCandidate";
import SignupVendor from "./pages/SignupVendor";
import JobDetailNew from "./pages/JobDetailNew";
import JobApplication from "./pages/JobApplication";
import VendorJobs from "./pages/VendorJobs";
import VendorCandidates from "./pages/VendorCandidates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="signup-candidate" element={<SignupCandidate />} />
              <Route path="signup-vendor" element={<SignupVendor />} />
              <Route path="verify-otp" element={<VerifyOTP />} />
            </Route>

            {/* Forgot/Reset Password Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Role Selection Route */}
            <Route path="/role-selection" element={<RoleSelection />} />

            {/* Public Job Routes */}
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/job/:id" element={<JobDetailNew />} />
            <Route
              path="/job/:id/apply"
              element={
                <ProtectedRoute>
                  <JobApplication />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            {/* Dashboard Routes - Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <Layout />
                  </SidebarProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="dashboards" element={<Dashboards />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/new" element={<AddNewJob />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="jobs/:id/edit" element={<AddNewJob />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="candidates/:id" element={<CandidateDetail />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="submissions/:id" element={<SubmissionDetail />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="placements" element={<Placements />} />
              <Route path="placements/:id" element={<PlacementDetail />} />
              <Route path="interviews/:id" element={<InterviewDetail />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="business-partners" element={<BusinessPartners />} />
              <Route
                path="business-partners/:id"
                element={<BusinessPartnerDetail />}
              />
              <Route path="time-sheets" element={<TimeSheets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="sourcing-pipeline" element={<SourcingPipeline />} />
              <Route path="search" element={<AdvancedSearch />} />
              <Route path="search-jobs" element={<SearchJobs />} />
              <Route path="advanced-search" element={<AdvancedSearch />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="emails" element={<EmailCenter />} />
              <Route path="settings" element={<Settings />} />
              <Route path="account" element={<AccountManagement />} />
              <Route path="org-hierarchy" element={<OrgHierarchy />} />
              <Route
                path="communication-manager"
                element={<CommunicationManager />}
              />
              {/* Candidate/Vendor Routes */}
              <Route path="profile" element={<MyProfile />} />
              <Route path="my-jobs" element={<MyJobs />} />
              <Route path="job-search" element={<JobSearch />} />
              <Route path="job-marketplace" element={<JobMarketplace />} />
              <Route path="my-submissions" element={<Submissions />} />
              <Route path="my-placements" element={<Placements />} />
              <Route path="my-relationships" element={<MyRelationships />} />
              <Route
                path="vendor/jobs"
                element={
                  <ProtectedRoute allowedRoles={["vendor"]}>
                    <VendorJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vendor/candidates"
                element={
                  <ProtectedRoute allowedRoles={["vendor"]}>
                    <VendorCandidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vendor/submissions"
                element={
                  <ProtectedRoute allowedRoles={["vendor"]}>
                    <Submissions />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
