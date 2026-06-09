import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, FileText, Trophy, Users, UserCheck, Building2, ChevronRight, Plus, Search, Calendar, Mail, Clock, BarChart3, Ticket, Shield, Crown, Settings, Network, Bot, MessageSquare, GitBranch, ChevronDown, Cog } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const menuItems = [{
  title: "Home",
  url: "/dashboard",
  icon: Home
}, {
  title: "Dashboards",
  url: "/dashboard/dashboards",
  icon: BarChart3
}, {
  title: "Jobs",
  url: "/dashboard/jobs",
  icon: Briefcase
}, {
  title: "Candidates",
  url: "/dashboard/candidates",
  icon: Users
}, {
  title: "Submissions",
  url: "/dashboard/submissions",
  icon: FileText
}, {
  title: "Interviews",
  url: "/dashboard/interviews",
  icon: Users
}, {
  title: "Placements",
  url: "/dashboard/placements",
  icon: Trophy
}, {
  title: "Business Partners",
  url: "/dashboard/business-partners",
  icon: Building2
}, {
  title: "Time Sheets",
  url: "/dashboard/time-sheets",
  icon: Clock
}, {
  title: "Reports",
  url: "/dashboard/reports",
  icon: BarChart3
}];

const quickLinks = [{
  title: "Add New Job",
  url: "/dashboard/jobs/new",
  icon: Plus
}, {
  title: "Search Candidates",
  url: "/dashboard/search",
  icon: Search
}, {
  title: "Search Jobs",
  url: "/dashboard/search-jobs",
  icon: Briefcase
}, {
  title: "Task Planner",
  url: "/dashboard/calendar",
  icon: Calendar
}, {
  title: "Email Center",
  url: "/dashboard/emails",
  icon: Mail
}, {
  title: "Tickets",
  url: "/dashboard/tickets",
  icon: Ticket
}];

const settingsMenuItems = [{
  title: "Org Hierarchy",
  url: "/dashboard/org-hierarchy",
  icon: Network
}, {
  title: "Permissions",
  url: "/dashboard/settings?tab=permissions",
  icon: Shield
}, {
  title: "Roles",
  url: "/dashboard/settings?tab=roles",
  icon: Crown
}, {
  title: "Users",
  url: "/dashboard/settings",
  icon: Users
}, {
  title: "Integrations",
  url: "/dashboard/settings?tab=integrations",
  icon: Settings
}, {
  title: "AI Workbench",
  url: "/dashboard/settings?tab=ai-workbench",
  icon: Bot
}, {
  title: "Communication Manager",
  url: "/dashboard/communication-manager",
  icon: MessageSquare
}];

const extensibilityMenuItems = [{
  title: "Event Binding",
  url: "/dashboard/settings?tab=event-binding",
  icon: Network
}, {
  title: "Event Manager",
  url: "/dashboard/settings?tab=event-manager",
  icon: Settings
}, {
  title: "Mapping Builder",
  url: "/dashboard/settings?tab=mapping-builder",
  icon: Cog
}];

export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  const [extensibilityOpen, setExtensibilityOpen] = useState(false);
  const isSettingsPage = location.pathname === '/dashboard/settings' || location.pathname.startsWith('/dashboard/settings?') || location.pathname === '/dashboard/org-hierarchy' || location.pathname === '/dashboard/communication-manager' || location.pathname === '/dashboard/visual-mapping' || location.pathname.startsWith('/dashboard/users/');
  
  return <Sidebar className="border-r-0 bg-gradient-to-b from-green-50 via-white to-green-50/80 shadow-xl" collapsible="icon">
      <SidebarHeader className="border-b border-green-100/50 p-4 bg-gradient-to-r from-green-50 to-green-100/30">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard" className="hover:scale-110 transition-transform duration-200">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-shadow">
                <span className="text-white font-bold text-sm">TNH</span>
              </div>
            </NavLink>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-gray-900 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">thenexthire</h2>
                <p className="text-xs text-green-600/70 font-medium">{isSettingsPage ? 'Settings' : 'Recruitment Platform'}</p>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col px-2 py-4">
        {isSettingsPage ? (
          <>
            {/* Settings Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-green-700/80 font-semibold text-xs uppercase tracking-wider mb-3">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {settingsMenuItems.map((item) => {
                    const searchParams = new URLSearchParams(location.search);
                    const currentTab = searchParams.get('tab') || 'users';
                    let isActive = false;
                    
                    if (item.url === "/dashboard/settings") {
                      // Users tab - only active when on settings page with users tab or no tab specified
                      isActive = location.pathname === "/dashboard/settings" && (!searchParams.get('tab') || currentTab === 'users') && !location.pathname.startsWith('/dashboard/users/');
                    } else if (item.url.includes('tab=permissions')) {
                      isActive = location.pathname === "/dashboard/settings" && currentTab === 'permissions';
                    } else if (item.url.includes('tab=roles')) {
                      isActive = location.pathname === "/dashboard/settings" && currentTab === 'roles';
                    } else if (item.url.includes('tab=integrations')) {
                      isActive = location.pathname === "/dashboard/settings" && currentTab === 'integrations';
                    } else if (item.url.includes('tab=ai-workbench')) {
                      isActive = location.pathname === "/dashboard/settings" && currentTab === 'ai-workbench';
                    } else if (item.url === "/dashboard/org-hierarchy") {
                      isActive = location.pathname === "/dashboard/org-hierarchy";
                    } else if (item.url === "/dashboard/communication-manager") {
                      isActive = location.pathname === "/dashboard/communication-manager";
                    }
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                              isActive
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/60 hover:text-green-700 hover:shadow-md hover:shadow-green-100/50"
                            }`}
                          >
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-xl blur-sm" />
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-green-600'}`} />
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

            {/* Extensibility Section */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  <SidebarMenuItem>
                    <Collapsible open={extensibilityOpen} onOpenChange={setExtensibilityOpen}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/60 hover:text-green-700 hover:shadow-md hover:shadow-green-100/50`}
                        >
                          <Network className="w-5 h-5 text-green-600" />
                          {!isCollapsed && (
                            <>
                              <span className="font-medium">Extensibility</span>
                              {extensibilityOpen ? (
                                <ChevronDown className="w-4 h-4 ml-auto text-green-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 ml-auto text-green-600" />
                              )}
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenu className="ml-6 space-y-1 mt-2">
                          {extensibilityMenuItems.map((item) => {
                            const searchParams = new URLSearchParams(location.search);
                            const currentTab = searchParams.get('tab') || 'users';
                            let isActive = false;
                            
                            if (item.url.includes('tab=event-binding')) {
                              isActive = location.pathname === "/dashboard/settings" && currentTab === 'event-binding';
                            } else if (item.url.includes('tab=event-manager')) {
                              isActive = location.pathname === "/dashboard/settings" && currentTab === 'event-manager';
                            } else if (item.url.includes('tab=mapping-builder')) {
                              isActive = location.pathname === "/dashboard/settings" && currentTab === 'mapping-builder';
                            }
                            
                            return (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                  <NavLink
                                    to={item.url}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                                      isActive
                                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                                        : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/60 hover:text-green-700 hover:shadow-md hover:shadow-green-100/50"
                                    }`}
                                  >
                                    {isActive && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg blur-sm" />
                                    )}
                                    <item.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : 'text-green-600'}`} />
                                    {!isCollapsed && (
                                      <>
                                        <span className="text-sm font-medium relative z-10">{item.title}</span>
                                        {isActive && <ChevronRight className="w-3 h-3 ml-auto relative z-10 text-white/80" />}
                                      </>
                                    )}
                                  </NavLink>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

          </>
        ) : (
          <>
            {/* Regular Navigation */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {menuItems.filter(item => {
                    // Debug logging
                    if (user?.role === 'client') {
                      console.log('User role is client, filtering item:', item.title);
                    }
                    // Hide specific modules for Client role
                    if (user?.role === 'client') {
                      const hiddenModules = ['Dashboards', 'Business Partners', 'Placements', 'Time Sheets', 'Reports'];
                      const shouldHide = hiddenModules.includes(item.title);
                      console.log(`Item "${item.title}" should be hidden:`, shouldHide);
                      return !shouldHide;
                    }
                    return true;
                  }).map((item) => {
                    const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                              isActive
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/60 hover:text-green-700 hover:shadow-md hover:shadow-green-100/50"
                            }`}
                          >
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-xl blur-sm" />
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-green-600'}`} />
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

            <div className="flex-1" />

            {user?.role !== 'client' && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-green-700/80 font-semibold text-xs uppercase tracking-wider mb-3">Quick Actions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {quickLinks.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group relative ${
                                isActive
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
                                  : "text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700 hover:shadow-sm"
                              }`}
                            >
                              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                              {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>;
}
