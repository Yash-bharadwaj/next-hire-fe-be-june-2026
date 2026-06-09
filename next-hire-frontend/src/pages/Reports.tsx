
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Building,
  UserCheck,
  Phone,
  Mail,
  Star,
  Award,
  Briefcase,
  Calculator,
  CreditCard,
  Percent
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  Pie,
  Tooltip,
  Legend
} from "recharts";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Enhanced sample data for charts
  const performanceData = [
    { 
      month: "Jan", 
      placements: 12, 
      revenue: 180000, 
      interviews: 45,
      applications: 230,
      submissionRate: 76,
      placementRate: 26.7,
      avgTimeToFill: 18,
      clientSatisfaction: 8.2
    },
    { 
      month: "Feb", 
      placements: 18, 
      revenue: 270000, 
      interviews: 62,
      applications: 312,
      submissionRate: 82,
      placementRate: 29.0,
      avgTimeToFill: 16,
      clientSatisfaction: 8.5
    },
    { 
      month: "Mar", 
      placements: 15, 
      revenue: 225000, 
      interviews: 51,
      applications: 267,
      submissionRate: 79,
      placementRate: 29.4,
      avgTimeToFill: 19,
      clientSatisfaction: 8.1
    },
    { 
      month: "Apr", 
      placements: 22, 
      revenue: 330000, 
      interviews: 73,
      applications: 389,
      submissionRate: 85,
      placementRate: 30.1,
      avgTimeToFill: 15,
      clientSatisfaction: 8.7
    },
    { 
      month: "May", 
      placements: 19, 
      revenue: 285000, 
      interviews: 58,
      applications: 298,
      submissionRate: 81,
      placementRate: 32.8,
      avgTimeToFill: 17,
      clientSatisfaction: 8.4
    },
    { 
      month: "Jun", 
      placements: 25, 
      revenue: 375000, 
      interviews: 81,
      applications: 421,
      submissionRate: 88,
      placementRate: 30.9,
      avgTimeToFill: 14,
      clientSatisfaction: 8.9
    },
  ];

  const departmentData = [
    { 
      name: "IT", 
      placements: 45, 
      value: 45, 
      fill: "#10b981",
      revenue: 675000,
      avgSalary: 95000,
      satisfaction: 8.6,
      growth: 12.5
    },
    { 
      name: "Healthcare", 
      placements: 32, 
      value: 32, 
      fill: "#3b82f6",
      revenue: 480000,
      avgSalary: 78000,
      satisfaction: 8.3,
      growth: 8.2
    },
    { 
      name: "Finance", 
      placements: 28, 
      value: 28, 
      fill: "#f59e0b",
      revenue: 420000,
      avgSalary: 85000,
      satisfaction: 8.1,
      growth: 15.3
    },
    { 
      name: "Engineering", 
      placements: 38, 
      value: 38, 
      fill: "#ef4444",
      revenue: 570000,
      avgSalary: 105000,
      satisfaction: 8.8,
      growth: 22.1
    },
    { 
      name: "Sales", 
      placements: 22, 
      value: 22, 
      fill: "#8b5cf6",
      revenue: 330000,
      avgSalary: 65000,
      satisfaction: 7.9,
      growth: -3.2
    },
  ];

  const clientData = [
    {
      name: "TechCorp Inc",
      placements: 15,
      revenue: 225000,
      satisfaction: 9.2,
      retention: 98,
      lastProject: "2024-06-15",
      status: "active",
      contractValue: 450000
    },
    {
      name: "HealthSystem LLC",
      placements: 12,
      revenue: 180000,
      satisfaction: 8.8,
      retention: 95,
      lastProject: "2024-06-10",
      status: "active",
      contractValue: 320000
    },
    {
      name: "FinanceFirst",
      placements: 8,
      revenue: 120000,
      satisfaction: 8.5,
      retention: 92,
      lastProject: "2024-05-28",
      status: "active",
      contractValue: 280000
    },
    {
      name: "Engineering Pro",
      placements: 18,
      revenue: 270000,
      satisfaction: 9.0,
      retention: 96,
      lastProject: "2024-06-12",
      status: "active",
      contractValue: 520000
    },
    {
      name: "SalesForce Co",
      placements: 6,
      revenue: 90000,
      satisfaction: 7.8,
      retention: 88,
      lastProject: "2024-04-20",
      status: "at-risk",
      contractValue: 150000
    }
  ];

  const financialMetrics = [
    {
      metric: "Gross Revenue",
      value: "$1.67M",
      target: "$1.5M",
      progress: 111,
      trend: 12.5,
      color: "green"
    },
    {
      metric: "Profit Margin",
      value: "28.5%",
      target: "25%",
      progress: 114,
      trend: 3.2,
      color: "blue"
    },
    {
      metric: "Cost per Hire",
      value: "$4,250",
      target: "$5,000",
      progress: 85,
      trend: -15.0,
      color: "purple"
    },
    {
      metric: "Collection Rate",
      value: "94.8%",
      target: "95%",
      progress: 99.8,
      trend: -0.2,
      color: "orange"
    }
  ];

  const chartConfig = {
    placements: { label: "Placements", color: "#10b981" },
    revenue: { label: "Revenue", color: "#3b82f6" },
    interviews: { label: "Interviews", color: "#f59e0b" },
    satisfaction: { label: "Satisfaction", color: "#10b981" },
    retention: { label: "Retention %", color: "#3b82f6" },
    applications: { label: "Applications", color: "#8b5cf6" },
    submissionRate: { label: "Submission Rate %", color: "#ef4444" },
    placementRate: { label: "Placement Rate %", color: "#10b981" },
  };

  const reportCards = [
    {
      title: "Total Revenue",
      value: "$1.67M",
      change: "+12.5%",
      icon: DollarSign,
      color: "from-green-400/30 via-green-500/20 to-green-600/30",
      iconColor: "text-green-700",
      target: "$1.5M",
      progress: 111
    },
    {
      title: "Total Placements",
      value: "111",
      change: "+8.3%",
      icon: Users,
      color: "from-blue-400/30 via-blue-500/20 to-blue-600/30",
      iconColor: "text-blue-700",
      target: "100",
      progress: 111
    },
    {
      title: "Client Satisfaction",
      value: "8.5/10",
      change: "+0.3",
      icon: TrendingUp,
      color: "from-purple-400/30 via-purple-500/20 to-purple-600/30",
      iconColor: "text-purple-700",
      target: "8.0",
      progress: 106
    },
    {
      title: "Active Clients",
      value: "48",
      change: "+5",
      icon: Activity,
      color: "from-orange-400/30 via-orange-500/20 to-orange-600/30",
      iconColor: "text-orange-700",
      target: "45",
      progress: 107
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-primary/20">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-sm lg:text-base text-muted-foreground">Comprehensive business insights and performance metrics</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="last-year">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Button size="sm" className="button-gradient">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards with Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{card.title}</CardTitle>
                <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                  <IconComponent className={`h-4 w-4 text-primary`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  <p className="text-xs text-green-600 font-medium">
                    {card.change} from last period
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Target: {card.target}</span>
                    <span className="text-muted-foreground">{card.progress}%</span>
                  </div>
                  <Progress value={card.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Reports Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:w-fit bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Placement Rate</p>
                    <p className="text-2xl font-bold text-green-600">29.8%</p>
                    <p className="text-xs text-green-600">+2.1% vs last month</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Time to Fill</p>
                    <p className="text-2xl font-bold text-blue-600">16.5 days</p>
                    <p className="text-xs text-green-600">-1.2 days vs last month</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Submission Rate</p>
                    <p className="text-2xl font-bold text-purple-600">82.1%</p>
                    <p className="text-xs text-green-600">+3.5% vs last month</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-orange-600">8.5/10</p>
                    <p className="text-xs text-green-600">+0.3 vs last month</p>
                  </div>
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Placements vs Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <ComposedChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar yAxisId="left" dataKey="applications" fill="var(--color-applications)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="placements" stroke="var(--color-placements)" strokeWidth={3} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="submissionRate" stroke="var(--color-submissionRate)" strokeWidth={3} />
                    <Line type="monotone" dataKey="placementRate" stroke="var(--color-placementRate)" strokeWidth={3} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialMetrics.map((metric, index) => (
              <Card key={index} className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{metric.metric}</p>
                      <Calculator className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      <p className={`text-xs font-medium ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend >= 0 ? '+' : ''}{metric.trend}% vs target
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Target: {metric.target}</span>
                        <span className="text-muted-foreground">{metric.progress}%</span>
                      </div>
                      <Progress value={metric.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Revenue & Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <AreaChart data={performanceData.map(d => ({
                    ...d,
                    profit: d.revenue * 0.285,
                    costs: d.revenue * 0.715
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Revenue by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={departmentData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold text-green-600">48</p>
                    <p className="text-xs text-green-600">+5 new this month</p>
                  </div>
                  <Building className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Retention</p>
                    <p className="text-2xl font-bold text-blue-600">94.2%</p>
                    <p className="text-xs text-green-600">+1.5% vs last quarter</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Contract Value</p>
                    <p className="text-2xl font-bold text-purple-600">$344K</p>
                    <p className="text-xs text-green-600">+8.2% vs last quarter</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Performance Table */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Top Clients Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientData.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">{client.placements} placements</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-foreground">${(client.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                        <p className="font-semibold text-green-600">{client.satisfaction}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Retention</p>
                        <p className="font-semibold text-blue-600">{client.retention}%</p>
                      </div>
                      <div>
                        <Badge 
                          className={`${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {client.status === 'active' ? 'Active' : 'At Risk'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Department Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <RechartsPieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Department Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentData.map((dept, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: dept.fill }}
                        ></div>
                        <span className="font-semibold text-foreground">{dept.name}</span>
                      </div>
                      <Badge className={`${
                        dept.growth >= 0 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {dept.growth >= 0 ? '+' : ''}{dept.growth}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Placements</p>
                        <p className="font-semibold text-foreground">{dept.placements}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-foreground">${(dept.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Salary</p>
                        <p className="font-semibold text-foreground">${(dept.avgSalary / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Satisfaction</p>
                        <p className="font-semibold text-foreground">{dept.satisfaction}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
