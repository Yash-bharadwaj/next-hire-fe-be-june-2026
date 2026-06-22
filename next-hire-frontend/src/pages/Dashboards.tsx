
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Target,
  Activity,
  PieChart,
  LineChart,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { recruiterService, RecruiterGoals } from "@/services/recruiterService";
import { downloadCsv } from "@/utils/csv";

const Dashboards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboard();

  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [goalsForm, setGoalsForm] = useState<RecruiterGoals>({});
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);

  const openGoalsDialog = async () => {
    setShowGoalsDialog(true);
    setLoadingGoals(true);
    try {
      const res = await recruiterService.getGoals();
      setGoalsForm(res.data.goals || {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load goals");
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    try {
      await recruiterService.updateGoals(goalsForm);
      toast.success("Goals updated");
      setShowGoalsDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save goals");
    } finally {
      setSavingGoals(false);
    }
  };

  const handleExportData = () => {
    if (!stats) {
      toast.error("No dashboard data to export yet");
      return;
    }
    downloadCsv(
      `dashboard-metrics-${new Date().toISOString().slice(0, 10)}.csv`,
      getDashboardMetrics(),
      [
        { header: "Metric", accessor: (m) => m.title },
        { header: "Value", accessor: (m) => m.value },
        { header: "Change", accessor: (m) => m.subtext || "" },
      ]
    );
    toast.success("Dashboard metrics exported");
  };

  // Create dynamic metrics based on real data
  const getDashboardMetrics = () => {
    if (!stats) return [];

    const successRate = stats.overview.totalSubmissions > 0
      ? ((stats.overview.totalPlacements || 0) / stats.overview.totalSubmissions * 100).toFixed(1)
      : "0";

    const formatChange = (percent?: number | null) =>
      percent === null || percent === undefined ? null : `${percent > 0 ? "+" : ""}${percent}% from last month`;

    const revenueChange = formatChange(stats.overview.revenueChangePercent);
    const responseTimeChange = formatChange(stats.overview.responseTimeChangePercent);

    return [
      {
        title: "Total Revenue",
        value: `$${(stats.overview.totalRevenue || 0).toLocaleString()}`,
        subtext: revenueChange,
        increaseIsGood: true,
        icon: DollarSign,
        color: "from-green-400/30 via-green-500/20 to-green-600/30",
        iconColor: "text-green-700"
      },
      {
        title: "Active Placements",
        value: stats.overview.totalPlacements?.toString() || "0",
        icon: Target,
        color: "from-blue-400/30 via-blue-500/20 to-blue-600/30",
        iconColor: "text-blue-700"
      },
      {
        title: "Success Rate",
        value: `${successRate}%`,
        icon: TrendingUp,
        color: "from-purple-400/30 via-purple-500/20 to-purple-600/30",
        iconColor: "text-purple-700"
      },
      {
        title: "Response Time",
        value: stats.overview.avgResponseHours != null ? `${stats.overview.avgResponseHours.toFixed(1)}h` : "—",
        subtext: responseTimeChange,
        increaseIsGood: false,
        icon: Clock,
        color: "from-orange-400/30 via-orange-500/20 to-orange-600/30",
        iconColor: "text-orange-700"
      }
    ];
  };

  const dashboardMetrics = getDashboardMetrics();

  // Each card links to the real, existing page/report tab that actually
  // covers that area - there's no separate page for each of these 6 concepts,
  // so several intentionally point at different tabs of the same Reports page.
  const dashboardCards = [
    {
      title: "Executive Dashboard",
      description: "High-level overview of recruitment metrics and KPIs",
      features: ["Revenue Analytics", "Performance Metrics", "Strategic Insights"],
      icon: BarChart3,
      color: "from-emerald-400/20 to-teal-600/20",
      route: "/dashboard/reports?tab=financial"
    },
    {
      title: "Recruiter Dashboard",
      description: "Day-to-day recruitment activities and performance",
      features: ["Activity Tracking", "Pipeline Management", "Task Overview"],
      icon: Users,
      color: "from-blue-400/20 to-indigo-600/20",
      route: "/dashboard/home"
    },
    {
      title: "Sales Dashboard",
      description: "Business development and client relationship metrics",
      features: ["Client Metrics", "Deal Pipeline", "Revenue Tracking"],
      icon: Briefcase,
      color: "from-purple-400/20 to-violet-600/20",
      route: "/dashboard/reports?tab=clients"
    },
    {
      title: "Analytics Dashboard",
      description: "Deep insights and data visualization tools",
      features: ["Custom Reports", "Trend Analysis", "Predictive Insights"],
      icon: PieChart,
      color: "from-pink-400/20 to-rose-600/20",
      route: "/dashboard/reports?tab=performance"
    },
    {
      title: "Performance Dashboard",
      description: "Track team and individual performance metrics",
      features: ["Team Metrics", "Individual KPIs", "Goal Tracking"],
      icon: Activity,
      color: "from-amber-400/20 to-orange-600/20",
      route: "/dashboard/reports?tab=departments"
    },
    {
      title: "Forecasting Dashboard",
      description: "Predictive analytics and future projections",
      features: ["Revenue Forecast", "Demand Planning", "Market Trends"],
      icon: LineChart,
      color: "from-cyan-400/20 to-blue-600/20",
      route: "/dashboard/reports?tab=financial"
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-white/20">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-roboto-slab">Analytics Dashboards</h1>
              <p className="text-sm lg:text-base text-gray-600 font-roboto-slab">Comprehensive insights and performance metrics</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh} 
            disabled={loading}
            className="border-green-200 hover:bg-green-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-md backdrop-blur-xl bg-white/20">
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="p-2 rounded-full bg-gray-200 animate-pulse">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-1">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 mb-2">Failed to load dashboard metrics</p>
                  <Button onClick={refresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          dashboardMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color}`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold font-roboto-slab text-gray-800">{metric.title}</CardTitle>
                  <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                    <IconComponent className={`h-4 w-4 ${metric.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative pt-1">
                  <div className="text-2xl font-bold text-gray-800 font-roboto-slab mb-1">{metric.value}</div>
                  {metric.subtext && (
                    <p className={`text-xs font-roboto-slab ${
                      metric.subtext.startsWith("+") === !!metric.increaseIsGood ? "text-green-600" : "text-red-600"
                    }`}>
                      {metric.subtext}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((dashboard, index) => {
          const IconComponent = dashboard.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/30">
              <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.color}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-transparent"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 rounded-xl bg-white/40 backdrop-blur-sm shadow-sm group-hover:bg-white/50 transition-all border border-white/30">
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate(dashboard.route)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800 mb-2">{dashboard.title}</CardTitle>
                <p className="text-sm text-gray-600 font-roboto-slab leading-relaxed">{dashboard.description}</p>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 font-roboto-slab mb-2 uppercase tracking-wide">Features</p>
                  {dashboard.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600 font-roboto-slab">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md"
                  size="sm"
                  onClick={() => navigate(dashboard.route)}
                >
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
        <CardHeader className="border-b border-white/20 pb-4">
          <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/dashboard/reports")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button
              variant="outline"
              className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/dashboard/reports?tab=financial")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Trends
            </Button>
            <Button
              variant="outline"
              className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm"
              onClick={openGoalsDialog}
            >
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
            <Button
              variant="outline"
              className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Monthly Goals</DialogTitle>
          </DialogHeader>
          {loadingGoals ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Placements Target</Label>
                <Input
                  type="number"
                  min={0}
                  value={goalsForm.placements ?? ""}
                  onChange={(e) => setGoalsForm({ ...goalsForm, placements: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <Label>Revenue Target (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  value={goalsForm.revenue ?? ""}
                  onChange={(e) => setGoalsForm({ ...goalsForm, revenue: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 50000"
                />
              </div>
              <div>
                <Label>Submissions Target</Label>
                <Input
                  type="number"
                  min={0}
                  value={goalsForm.submissions ?? ""}
                  onChange={(e) => setGoalsForm({ ...goalsForm, submissions: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 40"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoals} disabled={savingGoals || loadingGoals}>
              {savingGoals ? "Saving..." : "Save Goals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboards;
