import { useState, useEffect } from "react";
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
  Star,
  Film,
  Newspaper
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard, useRecentActivity } from "@/hooks/useDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { businessPartnerService, BusinessPartner } from "@/services/businessPartnerService";

// Curated/illustrative editorial content - not operational CRM data, so
// (unlike everything else on this page) it isn't backend-driven. Kept small
// and clearly framed as a news-ticker, matching how "Market Insights" below
// already worked before this filter row existed.
const companyNews = [
  {
    id: 1,
    title: "Quarterly all-hands: celebrating this quarter's placements",
    category: "Company Update",
    timestamp: "Recently",
    summary: "A recap of the team's wins and what's coming up next quarter.",
  },
  {
    id: 2,
    title: "New onboarding guide published for recruiters",
    category: "Internal",
    timestamp: "This week",
    summary: "Check the knowledge base for the updated client-onboarding checklist.",
  },
];

// Static fallbacks — shown while live data loads or if the API fails
const entertainmentFallback = [
  {
    id: 1,
    title: "\"Hire slow, fire fast\" — and other recruiting wisdom",
    category: "Quote of the Day",
    timestamp: "Today",
    summary: "A reminder that a thorough process now saves a lot of pain later.",
    source: "",
  },
  {
    id: 2,
    title: "Recruiter trivia: the longest average time-to-hire by industry",
    category: "Fun Fact",
    timestamp: "Today",
    summary: "Healthcare and executive search roles tend to take the longest to fill — by a wide margin.",
    source: "",
  },
];

const marketInsightsFallback = [
  {
    id: 1,
    title: "Global staffing market shows resilience amid economic uncertainty",
    category: "Market Analysis",
    timestamp: "Recently",
    summary: "Despite global economic headwinds, the staffing industry demonstrates strong fundamentals and growth potential.",
    source: "Industry Report",
    type: "market-insights",
  },
];

const stripHtml = (html: string) =>
  html?.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, " ").trim() ?? "";

const formatPubDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
};

const RSS_FEEDS = [
  { url: "https://www.hrdive.com/feeds/news/", label: "HR Dive" },
  { url: "https://www.ere.net/feed/", label: "ERE Media" },
];

// Guardian API key — register a free one at https://open-platform.theguardian.com/access/
// and set VITE_GUARDIAN_API_KEY in your .env. Falls back to the "test" key which works
// for demos but may be rate-limited under heavy use.
const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY || "test";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useDashboard();
  const { activities, loading: activityLoading, refresh: refreshActivity } = useRecentActivity(10);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("recent-activity");
  const [topCustomers, setTopCustomers] = useState<BusinessPartner[]>([]);
  const [topCustomersLoading, setTopCustomersLoading] = useState(false);

  const [marketInsightsData, setMarketInsightsData] = useState<any[]>([]);
  const [marketInsightsLoading, setMarketInsightsLoading] = useState(false);
  const [entertainmentData, setEntertainmentData] = useState<any[]>([]);
  const [entertainmentLoading, setEntertainmentLoading] = useState(false);

  const refreshTopCustomers = () => {
    setTopCustomersLoading(true);
    businessPartnerService
      .getBusinessPartners({ sort_by: "annual_revenue", sort_order: "DESC", limit: 4 })
      .then((res) => setTopCustomers(res.data.businessPartners || []))
      .catch(() => setTopCustomers([]))
      .finally(() => setTopCustomersLoading(false));
  };

  const fetchMarketInsights = async () => {
    setMarketInsightsLoading(true);
    try {
      // The Guardian open API — free, no CORS restrictions, fresh news
      const query = encodeURIComponent("hiring OR workforce OR employment OR staffing OR recruitment");
      const url = `https://content.guardianapis.com/search?q=${query}&section=business&show-fields=trailText&page-size=5&order-by=newest&api-key=${GUARDIAN_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const results = data?.response?.results;
      if (results?.length) {
        setMarketInsightsData(
          results.map((item: any, i: number) => ({
            id: i + 1,
            title: stripHtml(item.webTitle),
            category: item.sectionName || "Business",
            timestamp: formatPubDate(item.webPublicationDate),
            summary: stripHtml(item.fields?.trailText || "").slice(0, 180) + (stripHtml(item.fields?.trailText || "").length > 180 ? "…" : ""),
            source: "The Guardian",
            link: item.webUrl,
            type: "market-insights",
          }))
        );
        setMarketInsightsLoading(false);
        return;
      }
    } catch {
      // fall through to fallback
    }
    setMarketInsightsData(marketInsightsFallback);
    setMarketInsightsLoading(false);
  };

  const fetchEntertainment = () => {
    setEntertainmentLoading(true);
    // Curated recruiting & leadership quotes — shuffled randomly each visit
    // so it feels fresh without any external API dependency.
    const pool = [
      { q: "Hire slow, fire fast. Take your time in the hiring process — it saves enormous pain later.", a: "Recruiting Wisdom" },
      { q: "The secret to successful hiring is this: look for people who want to change the world.", a: "Marc Benioff" },
      { q: "You need to have a collaborative hiring process.", a: "Steve Jobs" },
      { q: "Clients do not come first. Employees come first. If you take care of your employees, they will take care of the clients.", a: "Richard Branson" },
      { q: "Great vision without great people is irrelevant.", a: "Jim Collins" },
      { q: "A-players hire A-players; B-players hire C-players. One bad hire brings the whole team down.", a: "Silicon Valley Maxim" },
      { q: "The best executive is the one who has sense enough to pick good people to do what needs to be done.", a: "Theodore Roosevelt" },
      { q: "It's not the tools you have faith in — tools are just tools. They work or they don't work. It's the people you have faith in or not.", a: "Steve Jobs" },
      { q: "Acquiring the right talent is the most important key to growth. Hiring was — and still is — the most important thing we do.", a: "Marc Andreessen" },
      { q: "If you think hiring professionals is expensive, try hiring amateurs.", a: "Red Adair" },
      { q: "Always treat your employees exactly as you want them to treat your best customers.", a: "Stephen R. Covey" },
      { q: "Train people well enough so they can leave; treat them well enough so they don't want to.", a: "Richard Branson" },
      { q: "The competition to hire the best will increase in the years ahead. Companies that give extra flexibility to employees will have the edge.", a: "Bill Gates" },
      { q: "The key to keeping your team inspired is giving them autonomy, mastery, and purpose.", a: "Daniel H. Pink" },
      { q: "Culture eats strategy for breakfast.", a: "Peter Drucker" },
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    setEntertainmentData(
      shuffled.map((q, i) => ({
        id: i + 1,
        title: q.q.length > 90 ? q.q.slice(0, 90) + "…" : q.q,
        category: "Quote of the Day",
        timestamp: "Today",
        summary: `"${q.q}"`,
        source: `— ${q.a}`,
      }))
    );
    setEntertainmentLoading(false);
  };

  useEffect(() => {
    if (selectedNewsCategory === "my-top-customers" && user?.role === "recruiter") {
      refreshTopCustomers();
    }
    if (selectedNewsCategory === "market-insights" && marketInsightsData.length === 0) {
      fetchMarketInsights();
    }
    if (selectedNewsCategory === "entertainment" && entertainmentData.length === 0) {
      fetchEntertainment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNewsCategory, user?.role]);

  const getNewsContent = () => {
    switch (selectedNewsCategory) {
      case "recent-activity":
        return activities.slice(0, 4);
      case "market-insights":
        return marketInsightsData.length ? marketInsightsData : marketInsightsFallback;
      case "my-top-customers":
        return topCustomers;
      case "company-news":
        return companyNews;
      case "entertainment":
        return entertainmentData.length ? entertainmentData : entertainmentFallback;
      default:
        return activities.slice(0, 4);
    }
  };

  const isFeedLoading =
    (selectedNewsCategory === "market-insights" && marketInsightsLoading) ||
    (selectedNewsCategory === "entertainment" && entertainmentLoading);

  // Only categories backed by a real, browsable destination get a "View
  // All" button - the curated/illustrative categories already show
  // everything there is.
  const viewAllTarget: Record<string, string> = {
    "recent-activity": "/dashboard/submissions",
    "my-top-customers": "/dashboard/business-partners",
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
      case "Company Update":
      case "Internal":
        return <Newspaper className="h-4 w-4" />;
      case "Fun Fact":
      case "Quote of the Day":
        return <Film className="h-4 w-4" />;
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
          <NavLink to="/dashboard/jobs" className="block">
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-semibold text-gray-800">Active Jobs</CardTitle>
                <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                  <Briefcase className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent className="relative pt-1">
                <div className="text-2xl font-bold text-gray-800 mb-1">{stats.overview.activeJobs || 0}</div>
                <p className="text-xs text-gray-600">
                  {stats.overview.totalJobs || 0} total
                </p>
              </CardContent>
            </Card>
          </NavLink>

          <NavLink to="/dashboard/candidates" className="block">
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-semibold text-gray-800">Active Candidates</CardTitle>
                <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                  <Users className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent className="relative pt-1">
                <div className="text-2xl font-bold text-gray-800 mb-1">{stats.overview.activeCandidates || 0}</div>
                <p className="text-xs text-gray-600">
                  Available in the pool
                </p>
              </CardContent>
            </Card>
          </NavLink>

          <NavLink to="/dashboard/interviews" className="block">
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-semibold text-gray-800">Interviews Today</CardTitle>
                <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                  <Calendar className="h-4 w-4 text-orange-700" />
                </div>
              </CardHeader>
              <CardContent className="relative pt-1">
                <div className="text-2xl font-bold text-gray-800 mb-1">{stats.overview.interviewsToday || 0}</div>
                <p className="text-xs text-gray-600">
                  {stats.overview.upcomingInterviews || 0} upcoming
                </p>
              </CardContent>
            </Card>
          </NavLink>

          <NavLink to="/dashboard/submissions" className="block">
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-semibold text-gray-800">Pending Submissions</CardTitle>
                <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                  <FileText className="h-4 w-4 text-purple-700" />
                </div>
              </CardHeader>
              <CardContent className="relative pt-1">
                <div className="text-2xl font-bold text-gray-800 mb-1">{stats.overview.pendingSubmissions || 0}</div>
                <p className="text-xs text-gray-600">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
          </NavLink>
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

  const firstName = user?.first_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-roboto-slab truncate">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm lg:text-base text-gray-600 font-roboto-slab">Let's catch up on the To-Dos</p>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity / News Feed */}
        <div className="lg:col-span-3">
          <Card className="flex h-full flex-col">
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
                    {user?.role === "recruiter" && (
                      <SelectItem value="my-top-customers">My Top Customers</SelectItem>
                    )}
                    <SelectItem value="company-news">Company News</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                    selectedNewsCategory === "recent-activity"
                      ? refreshActivity
                      : selectedNewsCategory === "my-top-customers"
                      ? refreshTopCustomers
                      : selectedNewsCategory === "market-insights"
                      ? () => { setMarketInsightsData([]); fetchMarketInsights(); }
                      : selectedNewsCategory === "entertainment"
                      ? () => { setEntertainmentData([]); fetchEntertainment(); }
                      : undefined
                  }
                  disabled={activityLoading || topCustomersLoading || isFeedLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${(activityLoading || topCustomersLoading || isFeedLoading) ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {(topCustomersLoading || isFeedLoading) ? (
                  <div className="space-y-3 py-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start space-x-3 p-3">
                        <div className="h-4 w-4 rounded bg-gray-200 animate-pulse shrink-0 mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedNewsCategory === "my-top-customers" ? (
                  topCustomers.map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => navigate(`/dashboard/business-partners/${partner.id}`)}
                      className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Building2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{partner.name}</p>
                        <p className="text-xs text-gray-600">
                          {partner.annual_revenue ? `$${partner.annual_revenue.toLocaleString()} annual revenue` : "Revenue not on file"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  getNewsContent().map((item: any, index) => (
                    <div key={item.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {selectedNewsCategory === "recent-activity"
                          ? getActivityIcon(item.type)
                          : getMarketInsightIcon(item.category)
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 hover:text-blue-700 hover:underline line-clamp-2 flex-1"
                            >
                              {item.action || item.title}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                              {item.action || item.title}
                            </p>
                          )}
                          <span className="text-xs text-gray-500 shrink-0">
                            {selectedNewsCategory === "recent-activity"
                              ? dashboardService.formatTimeAgo(item.timestamp)
                              : item.timestamp
                            }
                          </span>
                        </div>
                        {selectedNewsCategory === "recent-activity" ? (
                          <div className="mt-1">
                            {item.job && <p className="text-xs text-gray-600">Job: {item.job}</p>}
                            {item.candidate && <p className="text-xs text-gray-600">Candidate: {item.candidate}</p>}
                            {item.company && <p className="text-xs text-gray-600">Company: {item.company}</p>}
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
                              <span className="text-xs text-gray-500 italic">{item.source}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {getNewsContent().length === 0 && !topCustomersLoading && !isFeedLoading && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nothing here yet</p>
                  </div>
                )}

                {viewAllTarget[selectedNewsCategory] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700"
                    onClick={() => navigate(viewAllTarget[selectedNewsCategory])}
                  >
                    View All
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <OutlookCalendar />
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
    </div>
  );
};

export default Home;
