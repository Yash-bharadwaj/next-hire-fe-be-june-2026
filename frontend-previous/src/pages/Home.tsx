
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowUpRight
} from "lucide-react";
import { NavLink } from "react-router-dom";
import appData from "@/data/app-data.json";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Home = () => {
  const { stats, recentActivity } = appData;
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("market-insights");

  // Static market insights data based on Staffing Industry News
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
      title: "Youlife Group to buy four firms to boost blue-collar talent services",
      category: "M&A Activity",
      timestamp: "6 hours ago",
      summary: "Strategic acquisitions aimed at expanding blue-collar recruitment capabilities across multiple markets.",
      source: "Industry Weekly",
      type: "market-insights"
    },
    {
      id: 4,
      title: "Beeline restructures executive suite to drive growth",
      category: "Leadership Changes",
      timestamp: "8 hours ago",
      summary: "Major staffing firm announces leadership changes to better position for post-pandemic market dynamics.",
      source: "Staffing Industry Analysts",
      type: "market-insights"
    },
    {
      id: 5,
      title: "People on the move: Randstad India appoints new CMO",
      category: "Executive Moves",
      timestamp: "12 hours ago",
      summary: "Randstad India appointed Cauvery Uthappa as chief marketing officer to strengthen market position.",
      source: "HR Tech Weekly",
      type: "market-insights"
    },
    {
      id: 6,
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
      case "market-insights":
        return marketInsights.slice(0, 4);
      case "top-customers":
        return recentActivity.slice(0, 4).map(activity => ({...activity, type: "customer"}));
      case "company-news":
        return recentActivity.slice(0, 4).map(activity => ({...activity, type: "company"}));
      case "entertainment":
        return recentActivity.slice(0, 4).map(activity => ({...activity, type: "entertainment"}));
      default:
        return marketInsights.slice(0, 4);
    }
  };

  const getMarketInsightIcon = (category: string) => {
    switch (category) {
      case "Global Labor": return Globe;
      case "Financial Results": return TrendingUp;
      case "M&A Activity": return Building2;
      case "Leadership Changes": return Users;
      case "Executive Moves": return Users;
      case "Market Analysis": return TrendingUp;
      default: return TrendingUp;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "submission": return FileText;
      case "interview": return Calendar;
      case "placement": return CheckCircle;
      case "feedback": return Mail;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "submission": return "text-blue-500";
      case "interview": return "text-purple-500";
      case "placement": return "text-green-500";
      case "feedback": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-roboto-slab truncate">Welcome back, John!</h1>
          <p className="text-sm lg:text-base text-gray-600 font-roboto-slab">Let's catchup on the Todos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <NavLink to="/dashboard/jobs" className="block">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-semibold font-roboto-slab text-gray-800">Active Jobs</CardTitle>
              <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                <Briefcase className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent className="relative pt-1">
              <div className="text-2xl font-bold text-gray-800 font-roboto-slab mb-1">{stats.activeJobs}</div>
              <p className="text-xs text-gray-600 font-roboto-slab">
                {stats.totalJobs} total jobs
              </p>
            </CardContent>
          </Card>
        </NavLink>

        <NavLink to="/dashboard/candidates" className="block">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-semibold font-roboto-slab text-gray-800">Active Candidates</CardTitle>
              <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                <Users className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent className="relative pt-1">
              <div className="text-2xl font-bold text-gray-800 font-roboto-slab mb-1">{stats.activeCandidates}</div>
              <p className="text-xs text-gray-600 font-roboto-slab">
                {stats.totalCandidates} total candidates
              </p>
            </CardContent>
          </Card>
        </NavLink>

        <NavLink to="/dashboard/submissions" className="block">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-semibold font-roboto-slab text-gray-800">Pending Submissions</CardTitle>
              <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                <FileText className="h-4 w-4 text-purple-700" />
              </div>
            </CardHeader>
            <CardContent className="relative pt-1">
              <div className="text-2xl font-bold text-gray-800 font-roboto-slab mb-1">{stats.pendingSubmissions}</div>
              <p className="text-xs text-gray-600 font-roboto-slab">
                {stats.totalSubmissions} total submissions
              </p>
            </CardContent>
          </Card>
        </NavLink>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-semibold font-roboto-slab text-gray-800">Interviews Today</CardTitle>
            <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
              <Calendar className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-1">
            <div className="text-2xl font-bold text-gray-800 font-roboto-slab mb-1">{stats.interviewsToday}</div>
            <p className="text-xs text-gray-600 font-roboto-slab">
              {stats.placementsThisMonth} placements this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md h-fit">
            <CardHeader className="border-b border-white/20 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800">News Feed</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-44">
                    <Select value={selectedNewsCategory} onValueChange={setSelectedNewsCategory}>
                      <SelectTrigger className="w-full" aria-label="News feed category">
                        <SelectValue placeholder="Market insights" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="market-insights">Market insights</SelectItem>
                        <SelectItem value="top-customers">My Top customers</SelectItem>
                        <SelectItem value="company-news">Company news</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-white/30 hover:bg-white/20 backdrop-blur-sm text-xs">
                    <NavLink to="/dashboard/submissions">View All</NavLink>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {selectedNewsCategory === "market-insights" ? (
                  getNewsContent().map((insight: any) => {
                    const IconComponent = getMarketInsightIcon(insight.category);
                    return (
                      <div key={insight.id} className="group flex items-start gap-3 p-3 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/30 cursor-pointer">
                        <div className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-sm flex-shrink-0 backdrop-blur-sm border border-white/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                          <IconComponent className="w-4 h-4 text-blue-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm font-roboto-slab text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-800 transition-colors">
                              {insight.title}
                            </h4>
                            <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
                          </div>
                          <p className="text-xs text-gray-600 font-roboto-slab mb-2 line-clamp-2">
                            {insight.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100/50 text-blue-700 rounded-full text-xs font-medium">
                                {insight.category}
                              </span>
                              <span className="text-gray-500 font-roboto-slab">
                                {insight.source}
                              </span>
                            </div>
                            <span className="text-gray-500 font-roboto-slab">
                              {insight.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  getNewsContent().map((activity: any) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-2 p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm">
                        <div className={`p-1.5 rounded-full bg-white/40 shadow-sm ${getActivityColor(activity.type)} flex-shrink-0 backdrop-blur-sm border border-white/20`}>
                          <IconComponent className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs font-roboto-slab truncate text-gray-800">{activity.title}</p>
                          <p className="text-xs text-gray-600 font-roboto-slab">
                            {activity.candidate && `${activity.candidate} • `}
                            {activity.job && `${activity.job} • `}
                            {activity.details}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 font-roboto-slab">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/30 rounded-xl border border-white/20 shadow-md h-fit max-w-full">
            <OutlookCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
