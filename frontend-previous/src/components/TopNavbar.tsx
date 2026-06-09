import { Bell, User, ChevronDown, Settings, Search, Sliders, Bot, Palette, MoreHorizontal, FileText, Calendar, MessageSquare, Shield, Crown, Home, LogOut, Globe, Moon, ChevronRight, Zap, CreditCard, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function TopNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const isSettingsPage = location.pathname.startsWith('/dashboard/settings') || location.pathname === '/dashboard/org-hierarchy' || location.pathname === '/dashboard/communication-manager';
  
  // Check if we're on a detail page where personalization is implemented
  const isDetailPage = () => {
    const path = location.pathname;
    return (
      (path.includes('/dashboard/jobs/') && path.split('/').length === 4) ||
      (path.includes('/dashboard/candidates/') && path.split('/').length === 4) ||
      (path.includes('/dashboard/submissions/') && path.split('/').length === 4) ||
      (path.includes('/dashboard/interviews/') && path.split('/').length === 4) ||
      (path.includes('/dashboard/placements/') && path.split('/').length === 4) ||
      (path.includes('/dashboard/business-partners/') && path.split('/').length === 4)
    );
  };

  // Static user data - no API calls
  const currentUser = {
    name: "John Doe",
    email: "john.doe@thenexthire.com",
    avatar: "",
    initials: "JD"
  };

  const notifications = [
    { id: 1, message: "New submission received", time: "5 min ago", icon: FileText },
    { id: 2, message: "Interview scheduled", time: "1 hour ago", icon: Calendar },
    { id: 3, message: "Client feedback received", time: "2 hours ago", icon: MessageSquare }
  ];

  // Command palette shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="flex items-center justify-end flex-1 px-4">
      {/* Universal Search */}
      <div className="flex-1 max-w-md mr-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs, candidates, companies... (⌘K)"
            className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white"
            onClick={() => setOpen(true)}
            readOnly
          />
        </div>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search everything..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <span>Create New Job</span>
            </CommandItem>
            <CommandItem>
              <span>Add Candidate</span>
            </CommandItem>
            <CommandItem>
              <span>View Dashboard</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent Jobs">
            <CommandItem>
              <span>Senior React Developer</span>
            </CommandItem>
            <CommandItem>
              <span>Product Manager</span>
            </CommandItem>
            <CommandItem>
              <span>UX Designer</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigate">
            <CommandItem>
              <span>Jobs</span>
            </CommandItem>
            <CommandItem>
              <span>Candidates</span>
            </CommandItem>
            <CommandItem>
              <span>Submissions</span>
            </CommandItem>
            <CommandItem>
              <span>Business Partners</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Home Button - Show only on settings page */}
        {isSettingsPage && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="hover:bg-blue-50 hover:text-blue-700"
          >
            <Home className="w-5 h-5" />
          </Button>
        )}

        {/* Settings */}
        {user?.role !== 'client' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-white">
            <DropdownMenuItem className="p-3">
              <Sliders className="w-4 h-4 mr-3" />
              Module Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3" onClick={() => navigate("/dashboard/settings?tab=ai-workbench")}>
              <Bot className="w-4 h-4 mr-3" />
              AI Agent Settings
            </DropdownMenuItem>
            {isDetailPage() && (
              <DropdownMenuItem 
                className="p-3" 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openPersonalizationSettings'));
                }}
              >
                <Palette className="w-4 h-4 mr-3" />
                Personalization Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="p-3" onClick={() => navigate("/dashboard/settings")}>
              <MoreHorizontal className="w-4 h-4 mr-3" />
              All Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <DropdownMenuItem key={notification.id} className="p-3 flex items-start gap-3">
                  <IconComponent className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                  <div className="flex flex-col flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-green-50">
              <Avatar className="w-8 h-8 border-2 border-green-200">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-green-600">Account Manager</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-white border-green-200 shadow-2xl z-50">
            {/* User Header */}
            <div className="p-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-green-100/50">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-green-400">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-lg">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-green-600">{currentUser.email}</p>
                </div>
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
                  Pro
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {String(user?.role || '').toLowerCase() !== 'recruiter' && (
                <DropdownMenuItem className="p-0 hover:bg-green-50 focus:bg-green-50">
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700"
                    onClick={() => navigate('/dashboard/account')}
                  >
                    <User className="w-5 h-5 text-green-600" />
                    <span>Personal Info</span>
                  </button>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="p-0 hover:bg-green-50 focus:bg-green-50">
                  <div className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-green-700">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-green-600" />
                      <span>My Account</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 bg-white border-green-200 shadow-xl">
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700"
                      onClick={() => navigate('/dashboard/settings')}
                    >
                      <Settings className="w-4 h-4 text-green-600" />
                      <span>Account Settings</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Privacy & Security</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>Billing & Subscription</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700">
                      <Bell className="w-4 h-4 text-green-600" />
                      <span>Notifications</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-green-100" />
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700"
                      onClick={() => navigate(`/dashboard/users/${user?.id || '1'}?tab=preferences`)}
                    >
                      <Settings className="w-4 h-4 text-green-600" />
                      <span>Preferences</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700"
                      onClick={() => navigate(`/dashboard/users/${user?.id || '1'}?tab=defaults`)}
                    >
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span>Defaults</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700"
                      onClick={() => navigate(`/dashboard/users/${user?.id || '1'}?tab=integrations`)}
                    >
                      <Zap className="w-4 h-4 text-green-600" />
                      <span>Integrations</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 hover:bg-green-50">
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-700"
                      onClick={() => navigate(`/dashboard/users/${user?.id || '1'}?tab=credits`)}
                    >
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span>Credits</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              
              <DropdownMenuSeparator className="bg-green-100" />
              
              <DropdownMenuItem className="p-0 hover:bg-green-50 focus:bg-green-50">
                <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-green-700">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-600" />
                    <span>Language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">English</span>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </button>
              </DropdownMenuItem>
              
            </div>

            {/* Logout Button */}
            <div className="p-2 border-t border-green-100">
              <DropdownMenuItem className="p-0 hover:bg-red-50 focus:bg-red-50">
                <button 
                  className="w-full flex items-center justify-center px-4 py-3 text-gray-700 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </button>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
