
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Calendar,
  Timer,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const TimeSheets = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [currentTask, setCurrentTask] = useState("");

  const timeEntries = [
    {
      id: 1,
      date: "2024-01-15",
      project: "React Dashboard",
      task: "UI Development",
      hours: 8.5,
      status: "approved",
      description: "Developed dashboard components and integrated APIs"
    },
    {
      id: 2,
      date: "2024-01-14",
      project: "Mobile App",
      task: "Bug Fixes",
      hours: 6.0,
      status: "pending",
      description: "Fixed authentication issues and performance optimizations"
    },
    {
      id: 3,
      date: "2024-01-13",
      project: "E-commerce Site",
      task: "Frontend Development",
      hours: 7.5,
      status: "approved",
      description: "Implemented shopping cart and checkout flow"
    }
  ];

  const weeklyStats = [
    {
      title: "This Week",
      value: "42.5h",
      change: "+8.5%",
      icon: Clock,
      color: "from-blue-400/30 via-blue-500/20 to-blue-600/30",
      iconColor: "text-blue-700"
    },
    {
      title: "Billable Hours",
      value: "38.0h",
      change: "+12%",
      icon: TrendingUp,
      color: "from-green-400/30 via-green-500/20 to-green-600/30",
      iconColor: "text-green-700"
    },
    {
      title: "Projects Active",
      value: "5",
      change: "+1",
      icon: CheckCircle,
      color: "from-purple-400/30 via-purple-500/20 to-purple-600/30",
      iconColor: "text-purple-700"
    },
    {
      title: "Pending Approval",
      value: "12.5h",
      change: "-5%",
      icon: AlertCircle,
      color: "from-orange-400/30 via-orange-500/20 to-orange-600/30",
      iconColor: "text-orange-700"
    }
  ];

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setCurrentTime("00:00:00");
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-white/20">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-roboto-slab">Time Sheets</h1>
              <p className="text-sm lg:text-base text-gray-600 font-roboto-slab">Track and manage your work hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {weeklyStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold font-roboto-slab text-gray-800">{stat.title}</CardTitle>
                <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                  <IconComponent className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative pt-1">
                <div className="text-2xl font-bold text-gray-800 font-roboto-slab mb-1">{stat.value}</div>
                <p className="text-xs text-green-600 font-roboto-slab font-medium">
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Time Entries Table */}
      <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
        <CardHeader className="border-b border-white/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Recent Entries
            </CardTitle>
            <Button variant="outline" size="sm" className="border-white/30 hover:bg-white/20 backdrop-blur-sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-white/10">
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                <TableHead className="font-semibold text-gray-700">Project</TableHead>
                <TableHead className="font-semibold text-gray-700">Task</TableHead>
                <TableHead className="font-semibold text-gray-700">Hours</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id} className="border-white/20 hover:bg-white/10">
                  <TableCell className="font-medium">{entry.date}</TableCell>
                  <TableCell>{entry.project}</TableCell>
                  <TableCell>{entry.task}</TableCell>
                  <TableCell>{entry.hours}h</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Collapsible Timer and Manual Entry Section */}
      <Accordion type="multiple" className="space-y-4">
        <AccordionItem value="timer" className="border-0">
          <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800 flex items-center gap-2">
                <Timer className="w-5 h-5 text-green-600" />
                Time Tracker
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0 space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 font-mono mb-2">{currentTime}</div>
                  <Input
                    placeholder="What are you working on?"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    className="mb-4 bg-white/50 border-white/30"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={handleTimerToggle}
                    className={`${
                      isTimerRunning 
                        ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600" 
                        : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    } text-white shadow-md`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isTimerRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={handleStopTimer}
                    variant="outline"
                    className="border-white/30 hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="manual-entry" className="border-0">
          <Card className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-md">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <CardTitle className="text-lg font-bold font-roboto-slab text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Manual Entry
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" id="date" className="bg-white/50 border-white/30" />
                  </div>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input type="number" id="hours" placeholder="8.0" className="bg-white/50 border-white/30" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select>
                    <SelectTrigger className="bg-white/50 border-white/30">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react-dashboard">React Dashboard</SelectItem>
                      <SelectItem value="mobile-app">Mobile App</SelectItem>
                      <SelectItem value="ecommerce">E-commerce Site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what you worked on..."
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md">
                  Add Entry
                </Button>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TimeSheets;
