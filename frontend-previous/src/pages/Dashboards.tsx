
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowRight
} from "lucide-react";

const Dashboards = () => {
  const dashboardMetrics = [
    {
      title: "Total Revenue",
      value: "$124,500",
      change: "+12.5%",
      icon: DollarSign,
      color: "from-green-400/30 via-green-500/20 to-green-600/30",
      iconColor: "text-green-700"
    },
    {
      title: "Active Placements",
      value: "87",
      change: "+8.2%",
      icon: Target,
      color: "from-blue-400/30 via-blue-500/20 to-blue-600/30",
      iconColor: "text-blue-700"
    },
    {
      title: "Success Rate",
      value: "94.3%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "from-purple-400/30 via-purple-500/20 to-purple-600/30",
      iconColor: "text-purple-700"
    },
    {
      title: "Response Time",
      value: "2.4h",
      change: "-15%",
      icon: Clock,
      color: "from-orange-400/30 via-orange-500/20 to-orange-600/30",
      iconColor: "text-orange-700"
    }
  ];

  const dashboardCards = [
    {
      title: "Executive Dashboard",
      description: "High-level overview of recruitment metrics and KPIs",
      features: ["Revenue Analytics", "Performance Metrics", "Strategic Insights"],
      icon: BarChart3,
      color: "from-emerald-400/20 to-teal-600/20",
      route: "/dashboard/executive"
    },
    {
      title: "Recruiter Dashboard",
      description: "Day-to-day recruitment activities and performance",
      features: ["Activity Tracking", "Pipeline Management", "Task Overview"],
      icon: Users,
      color: "from-blue-400/20 to-indigo-600/20",
      route: "/dashboard/recruiter"
    },
    {
      title: "Sales Dashboard",
      description: "Business development and client relationship metrics",
      features: ["Client Metrics", "Deal Pipeline", "Revenue Tracking"],
      icon: Briefcase,
      color: "from-purple-400/20 to-violet-600/20",
      route: "/dashboard/sales"
    },
    {
      title: "Analytics Dashboard",
      description: "Deep insights and data visualization tools",
      features: ["Custom Reports", "Trend Analysis", "Predictive Insights"],
      icon: PieChart,
      color: "from-pink-400/20 to-rose-600/20",
      route: "/dashboard/analytics"
    },
    {
      title: "Performance Dashboard",
      description: "Track team and individual performance metrics",
      features: ["Team Metrics", "Individual KPIs", "Goal Tracking"],
      icon: Activity,
      color: "from-amber-400/20 to-orange-600/20",
      route: "/dashboard/performance"
    },
    {
      title: "Forecasting Dashboard",
      description: "Predictive analytics and future projections",
      features: ["Revenue Forecast", "Demand Planning", "Market Trends"],
      icon: LineChart,
      color: "from-cyan-400/20 to-blue-600/20",
      route: "/dashboard/forecasting"
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboardMetrics.map((metric, index) => {
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
                <p className="text-xs text-green-600 font-roboto-slab font-medium">
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
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
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md" size="sm">
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
            <Button variant="outline" className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Trends
            </Button>
            <Button variant="outline" className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm">
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
            <Button variant="outline" className="justify-start border-white/30 hover:bg-white/20 backdrop-blur-sm">
              <Activity className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboards;
