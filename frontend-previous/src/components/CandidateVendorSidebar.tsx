
import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, FileText, Trophy, Users, UserCheck, ChevronRight, Plus, Search, Calendar, Mail, Clock, BarChart3, Ticket, Settings, Heart, MapPin } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const candidateMenuItems = [
  {
    title: "My Profile",
    url: "/dashboard/profile",
    icon: UserCheck
  },
  {
    title: "Job Marketplace",
    url: "/dashboard/job-marketplace",
    icon: MapPin
  },
  {
    title: "Job Search",
    url: "/dashboard/job-search",
    icon: Search
  },
  {
    title: "My Submissions",
    url: "/dashboard/my-submissions",
    icon: FileText
  },
  {
    title: "My Placements",
    url: "/dashboard/my-placements",
    icon: Trophy
  },
  {
    title: "Time Sheets",
    url: "/dashboard/time-sheets",
    icon: Clock
  },
  {
    title: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket
  }
];

const vendorMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home
  },
  {
    title: "My Profile",
    url: "/dashboard/profile",
    icon: UserCheck
  },
  {
    title: "Job Marketplace",
    url: "/dashboard/job-marketplace",
    icon: MapPin
  },
  {
    title: "Job Search",
    url: "/dashboard/job-search",
    icon: Search
  },
  {
    title: "My Submissions",
    url: "/dashboard/my-submissions",
    icon: FileText
  },
  {
    title: "My Placements",
    url: "/dashboard/my-placements",
    icon: Trophy
  },
  {
    title: "Time Sheets",
    url: "/dashboard/time-sheets",
    icon: Clock
  },
  {
    title: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket
  }
];

const quickLinks = [];

export function CandidateVendorSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  
  const menuItems = user?.role === 'candidate' ? candidateMenuItems : vendorMenuItems;
  const roleLabel = user?.role === 'candidate' ? 'Candidate Portal' : 'Vendor Portal';
  const isVendor = user?.role === 'vendor';
  const isCandidate = user?.role === 'candidate';

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('vendor-theme', 'candidate-theme');
    if (isVendor) {
      document.body.classList.add('vendor-theme');
    } else if (isCandidate) {
      document.body.classList.add('candidate-theme');
    }
    
    return () => {
      document.body.classList.remove('vendor-theme', 'candidate-theme');
    };
  }, [isVendor, isCandidate]);

  const getSidebarClasses = () => {
    if (isVendor) {
      return "border-r-0 bg-gradient-to-b from-vendor-50 via-white to-vendor-50/80 shadow-xl";
    } else if (isCandidate) {
      return "border-r-0 bg-gradient-to-b from-candidate-50 via-white to-candidate-50/80 shadow-xl";
    }
    return "border-r-0 bg-gradient-to-b from-green-50 via-white to-green-50/80 shadow-xl";
  };

  const getHeaderClasses = () => {
    if (isVendor) {
      return "border-b border-vendor-100/50 p-4 bg-gradient-to-r from-vendor-50 to-vendor-100/30";
    } else if (isCandidate) {
      return "border-b border-candidate-100/50 p-4 bg-gradient-to-r from-candidate-50 to-candidate-100/30";
    }
    return "border-b border-green-100/50 p-4 bg-gradient-to-r from-green-50 to-green-100/30";
  };

  const getLogoClasses = () => {
    if (isVendor) {
      return "w-8 h-8 bg-gradient-to-br from-vendor-600 to-vendor-500 rounded-xl flex items-center justify-center shadow-lg shadow-vendor-500/20";
    } else if (isCandidate) {
      return "w-8 h-8 bg-gradient-to-br from-candidate-600 to-candidate-500 rounded-xl flex items-center justify-center shadow-lg shadow-candidate-500/20";
    }
    return "w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20";
  };

  const getTitleClasses = () => {
    if (isVendor) {
      return "font-semibold text-gray-900 bg-gradient-to-r from-vendor-700 to-vendor-600 bg-clip-text text-transparent";
    } else if (isCandidate) {
      return "font-semibold text-gray-900 bg-gradient-to-r from-candidate-700 to-candidate-600 bg-clip-text text-transparent";
    }
    return "font-semibold text-gray-900 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent";
  };

  const getSubtitleClasses = () => {
    if (isVendor) {
      return "text-xs text-vendor-600/70 font-medium";
    } else if (isCandidate) {
      return "text-xs text-candidate-600/70 font-medium";
    }
    return "text-xs text-green-600/70 font-medium";
  };

  const getActiveItemClasses = () => {
    if (isVendor) {
      return "bg-gradient-to-r from-vendor-500 to-vendor-600 text-white shadow-lg shadow-vendor-500/30 scale-105";
    } else if (isCandidate) {
      return "bg-gradient-to-r from-candidate-500 to-candidate-600 text-white shadow-lg shadow-candidate-500/30 scale-105";
    }
    return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105";
  };

  const getHoverItemClasses = () => {
    if (isVendor) {
      return "text-gray-700 hover:bg-gradient-to-r hover:from-vendor-50 hover:to-vendor-100/60 hover:text-vendor-700 hover:shadow-md hover:shadow-vendor-100/50";
    } else if (isCandidate) {
      return "text-gray-700 hover:bg-gradient-to-r hover:from-candidate-50 hover:to-candidate-100/60 hover:text-candidate-700 hover:shadow-md hover:shadow-candidate-100/50";
    }
    return "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/60 hover:text-green-700 hover:shadow-md hover:shadow-green-100/50";
  };

  const getActiveIconColor = () => {
    return 'text-white';
  };

  const getInactiveIconColor = () => {
    if (isVendor) {
      return 'text-vendor-600';
    } else if (isCandidate) {
      return 'text-candidate-600';
    }
    return 'text-green-600';
  };

  const getActiveOverlayClasses = () => {
    if (isVendor) {
      return "absolute inset-0 bg-gradient-to-r from-vendor-400/20 to-vendor-600/20 rounded-xl blur-sm";
    } else if (isCandidate) {
      return "absolute inset-0 bg-gradient-to-r from-candidate-400/20 to-candidate-600/20 rounded-xl blur-sm";
    }
    return "absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-xl blur-sm";
  };

  const getGroupLabelClasses = () => {
    if (isVendor) {
      return "text-vendor-700/80 font-semibold text-xs uppercase tracking-wider mb-3";
    } else if (isCandidate) {
      return "text-candidate-700/80 font-semibold text-xs uppercase tracking-wider mb-3";
    }
    return "text-green-700/80 font-semibold text-xs uppercase tracking-wider mb-3";
  };
  
  return (
    <Sidebar className={getSidebarClasses()} collapsible="icon">
      <SidebarHeader className={getHeaderClasses()}>
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={getLogoClasses()}>
              <span className="text-white font-bold text-sm">TNH</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className={getTitleClasses()}>thenexthire</h2>
                <p className={getSubtitleClasses()}>{roleLabel}</p>
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
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                          isActive
                            ? getActiveItemClasses()
                            : getHoverItemClasses()
                        }`}
                      >
                        {isActive && (
                          <div className={getActiveOverlayClasses()} />
                        )}
                        <item.icon className={`w-5 h-5 relative z-10 ${isActive ? getActiveIconColor() : getInactiveIconColor()}`} />
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

        {quickLinks.length > 0 && (
          <>
            <div className="flex-1" />
            <SidebarGroup>
              <SidebarGroupLabel className={getGroupLabelClasses()}>Quick Actions</SidebarGroupLabel>
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
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
