import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OutlookCalendar } from "@/components/OutlookCalendar";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  TrendingUp,
  Building2,
  Globe,
  ArrowUpRight,
  Eye,
  UserCheck,
  Activity,
  RefreshCw,
  AlertCircle,
  Star
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard, useRecentActivity } from "@/hooks/useDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { ApiDebug } from "@/components/ApiDebug";

const Home = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useDashboard();
  const { activities, loading: activityLoading, refresh: refreshActivity } = useRecentActivity(10);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("recent-activity");

  // Static market insights data (keeping for now as fallback content)
  const marketInsights = [
    {
      id: 1,
      title: "Singapore's migrant workers report highest satisfaction since 2011",
      category: "Global Labor",
      timestamp: "2 hours ago",
      summary: "The vast majority of migrant workers indicated they intended to continue working with their current employer or return to Singapore in the future.",
      source: "Staffing Industry Analysts",
      type: "market-insights"
    },
    {
      id: 2,
      title: "Kanzhun Q2 revenue up 9.7% with boost from online recruitment services",
      category: "Financial Results",
      timestamp: "4 hours ago",
      summary: "Chinese recruitment platform shows strong growth driven by digital transformation in hiring processes.",
      source: "Financial Times",
      type: "market-insights"
    },
    {
      id: 3,
      title: "Global staffing market shows resilience amid economic uncertainty",
      category: "Market Analysis",
      timestamp: "1 day ago",
      summary: "Despite global economic headwinds, staffing industry demonstrates strong fundamentals and growth potential.",
      source: "McKinsey Global Institute",
      type: "market-insights"
    }
  ];

  const getNewsContent = () => {
    switch (selectedNewsCategory) {
      case "recent-activity":
        return activities.slice(0, 4);
      case "market-insights":
        return marketInsights.slice(0, 4);
      default:
        return activities.slice(0, 4);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "submission":
        return <FileText className="h-4 w-4" />;
      case "application":
        return <Briefcase className="h-4 w-4" />;
      case "interview":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getMarketInsightIcon = (category: string) => {
    switch (category) {
      case "Global Labor":
        return <Globe className="h-4 w-4" />;
      case "Financial Results":
        return <TrendingUp className="h-4 w-4" />;
      case "Market Analysis":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const renderStatsCards = () => {
    if (statsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (statsError) {
      return (
        <Card className="mb-8">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Failed to load dashboard statistics</p>
              <Button variant="outline" size="sm" onClick={refreshStats} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!stats) return null;

    // Render different stats based on user role
    if (user?.role === "recruiter") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeJobs || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.newSubmissions || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalInterviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.upcomingInterviews || 0} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placements</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalPlacements || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successful hires
              </p>
            </CardContent>
          </Card>
        </div>
      );
    } else if (user?.role === "candidate") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeApplications || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.interviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.upcomingInterviews || 0} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.offers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pending offers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placements</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.placements || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successful hires
              </p>
            </CardContent>
          </Card>
        </div>
      );
    } else if (user?.role === "vendor") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeSubmissions || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.availableJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Open to vendors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placements</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.placements || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successful hires
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.totalSubmissions > 0 
                  ? Math.round(((stats.overview.placements || 0) / stats.overview.totalSubmissions) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Placement rate
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {renderStatsCards()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / News Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Activity Feed</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={selectedNewsCategory} onValueChange={setSelectedNewsCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent-activity">Recent Activity</SelectItem>
                    <SelectItem value="market-insights">Market Insights</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectedNewsCategory === "recent-activity" ? refreshActivity : undefined}
                  disabled={activityLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${activityLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getNewsContent().map((item: any, index) => (
                  <div key={item.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {selectedNewsCategory === "recent-activity" 
                        ? getActivityIcon(item.type)
                        : getMarketInsightIcon(item.category)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.action || item.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {selectedNewsCategory === "recent-activity" 
                            ? dashboardService.formatTimeAgo(item.timestamp)
                            : item.timestamp
                          }
                        </span>
                      </div>
                      {selectedNewsCategory === "recent-activity" ? (
                        <div className="mt-1">
                          {item.job && (
                            <p className="text-xs text-gray-600">Job: {item.job}</p>
                          )}
                          {item.candidate && (
                            <p className="text-xs text-gray-600">Candidate: {item.candidate}</p>
                          )}
                          {item.company && (
                            <p className="text-xs text-gray-600">Company: {item.company}</p>
                          )}
                          {item.status && (
                            <Badge 
                              variant="secondary" 
                              className={`mt-1 ${dashboardService.getStatusColor(item.status)}`}
                            >
                              {dashboardService.getStatusLabel(item.status)}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 line-clamp-2">{item.summary}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-blue-600">{item.category}</span>
                            <span className="text-xs text-gray-500">{item.source}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getNewsContent().length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OutlookCalendar />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === "recruiter" && (
              <>
                <NavLink to="/dashboard/jobs" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="h-6 w-6" />
                    <span className="text-sm">Manage Jobs</span>
                  </Button>
                </NavLink>
                <NavLink to="/dashboard/candidates" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Find Candidates</span>
                  </Button>
                </NavLink>
                <NavLink to="/dashboard/submissions" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Applications</span>
                  </Button>
                </NavLink>
                <NavLink to="/dashboard/interviews" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Interviews</span>
                  </Button>
                </NavLink>
              </>
            )}
            
            {user?.role === "candidate" && (
              <>
                <NavLink to="/dashboard/job-search" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="h-6 w-6" />
                    <span className="text-sm">Search Jobs</span>
                  </Button>
                </NavLink>
                <NavLink to="/dashboard/job-marketplace" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Building2 className="h-6 w-6" />
                    <span className="text-sm">Job Market</span>
                  </Button>
                </NavLink>
                <NavLink to="/dashboard/my-submissions" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">My Applications</span>
                  </Button>
                </NavLink>
                <NavLink to="/my-profile" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm">My Profile</span>
                  </Button>
                </NavLink>
              </>
            )}

            {user?.role === "vendor" && (
              <>
                <NavLink to="/dashboard/jobs" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="h-6 w-6" />
                    <span className="text-sm">Available Jobs</span>
                  </Button>
                </NavLink>
                <NavLink to="/dashboard/submissions" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">My Submissions</span>
                  </Button>
                </NavLink>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel - Remove in production */}
      <div className="mt-8">
        <ApiDebug />
      </div>
    </div>
  );
};

export default Home;
