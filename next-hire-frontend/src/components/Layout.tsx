import { Outlet } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CandidateVendorSidebar } from "@/components/CandidateVendorSidebar";
import { ClientSidebar } from "@/components/ClientSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { MayaChatbot } from "@/components/MayaChatbot";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-green-50/50">
      <div className="flex w-full">
        {user?.role === "recruiter" ? (
          <AppSidebar />
        ) : (
          <CandidateVendorSidebar />
        )}
        <main className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b header-gradient">
            <SidebarTrigger className="h-6 w-6" />
            <TopNavbar />
          </div>
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <MayaChatbot />
    </div>
  );
};

export default Layout;
