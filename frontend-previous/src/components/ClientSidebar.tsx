import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, FileText, Users, UserCheck, ChevronRight, Search, Calendar, Mail, Clock, BarChart3, Ticket } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const clientMenuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home
  },
  {
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: Briefcase
  },
  {
    title: "My Profile",
    url: "/dashboard/profile",
    icon: UserCheck
  },
  {
    title: "Candidates",
    url: "/dashboard/candidates",
    icon: Users
  },
  {
    title: "Submissions",
    url: "/dashboard/submissions",
    icon: FileText
  },
  {
    title: "Placements",
    url: "/dashboard/placements",
    icon: UserCheck
  }
];

export function ClientSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  
  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('vendor-theme', 'candidate-theme', 'client-theme');
    document.body.classList.add('client-theme');
    
    return () => {
      document.body.classList.remove('client-theme');
    };
  }, []);
  
  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-client-50 via-white to-client-50/80 shadow-xl" collapsible="icon">
      <SidebarHeader className="border-b border-client-100/50 p-4 client-header-gradient">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-client-600 to-client-500 rounded-xl flex items-center justify-center shadow-lg shadow-client-500/20">
              <span className="text-white font-bold text-sm">TNH</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-gray-900 bg-gradient-to-r from-client-700 to-client-600 bg-clip-text text-transparent">thenexthire</h2>
                <p className="text-xs text-client-600/70 font-medium">Client Portal</p>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {clientMenuItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-client-500 to-client-600 text-white shadow-lg shadow-client-500/30 scale-105"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-client-50 hover:to-client-100/60 hover:text-client-700 hover:shadow-md hover:shadow-client-100/50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-client-400/20 to-client-600/20 rounded-xl blur-sm" />
                        )}
                        <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-client-600'}`} />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium relative z-10">{item.title}</span>
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-white/80" />}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}