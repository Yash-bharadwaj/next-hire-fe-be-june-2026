

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Calendar, Plus, ChevronDown, ChevronUp, MoreHorizontal, Mail, Phone, Edit } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  type: "interview" | "meeting" | "screening" | "call" | "deadline";
  status: "confirmed" | "pending" | "completed";
  taskType: "my-task" | "follow-up";
}

export function OutlookCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterType, setFilterType] = useState<"my-task" | "follow-up" | "all">("all");
  
  // Get today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Sample events for the day view - updated with today's date
  const allEvents: CalendarEvent[] = [
    {
      id: 1,
      title: "Technical Interview - Sarah Johnson",
      startTime: "09:00",
      endTime: "10:00",
      date: todayStr,
      type: "interview",
      status: "confirmed",
      taskType: "my-task"
    },
    {
      id: 2,
      title: "Resume Review - Alex Chen",
      startTime: "10:00",
      endTime: "10:30",
      date: todayStr,
      type: "screening",
      status: "pending",
      taskType: "my-task"
    },
    {
      id: 3,
      title: "Follow up with John Doe",
      startTime: "11:00",
      endTime: "11:30",
      date: todayStr,
      type: "call",
      status: "pending",
      taskType: "follow-up"
    },
    {
      id: 4,
      title: "HR Manager Interview - Lisa Park",
      startTime: "13:00",
      endTime: "14:00",
      date: todayStr,
      type: "interview",
      status: "confirmed",
      taskType: "my-task"
    },
    {
      id: 5,
      title: "Client Meeting - TechCorp",
      startTime: "14:00",
      endTime: "14:30",
      date: todayStr,
      type: "meeting",
      status: "confirmed",
      taskType: "my-task"
    },
    {
      id: 6,
      title: "Call back - Maria Rodriguez",
      startTime: "15:00",
      endTime: "15:15",
      date: todayStr,
      type: "call",
      status: "pending",
      taskType: "follow-up"
    },
    {
      id: 7,
      title: "Candidate Screening",
      startTime: "16:00",
      endTime: "16:45",
      date: todayStr,
      type: "screening",
      status: "pending",
      taskType: "follow-up"
    },
    {
      id: 8,
      title: "Project Deadline - Q4 Report",
      startTime: "17:00",
      endTime: "17:30",
      date: todayStr,
      type: "deadline",
      status: "pending",
      taskType: "my-task"
    },
    {
      id: 9,
      title: "Team Standup Meeting",
      startTime: "08:00",
      endTime: "08:30",
      date: todayStr,
      type: "meeting",
      status: "confirmed",
      taskType: "my-task"
    },
    {
      id: 10,
      title: "Reference Check - David Kim",
      startTime: "12:00",
      endTime: "12:30",
      date: todayStr,
      type: "call",
      status: "pending",
      taskType: "follow-up"
    }
  ];

  // Filter events based on selected filter
  const events = filterType === "all" 
    ? allEvents 
    : allEvents.filter(event => event.taskType === filterType);

  const getEventColor = (type: string) => {
    switch (type) {
      case "interview": return "bg-blue-100/80 border-l-4 border-blue-400 text-blue-800 backdrop-blur-sm";
      case "meeting": return "bg-purple-100/80 border-l-4 border-purple-400 text-purple-800 backdrop-blur-sm";
      case "screening": return "bg-green-100/80 border-l-4 border-green-400 text-green-800 backdrop-blur-sm";
      case "call": return "bg-yellow-100/80 border-l-4 border-yellow-400 text-yellow-800 backdrop-blur-sm";
      case "deadline": return "bg-red-100/80 border-l-4 border-red-400 text-red-800 backdrop-blur-sm";
      default: return "bg-gray-100/80 border-l-4 border-gray-400 text-gray-800 backdrop-blur-sm";
    }
  };

  const handleTaskAction = (action: string, eventId: number) => {
    console.log(`${action} action for event ${eventId}`);
    // Handle the specific action here
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  // Generate time slots from 8 AM to 6 PM
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    const time12 = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;
    timeSlots.push({
      hour24: hour,
      time12,
      timeKey: `${hour.toString().padStart(2, '0')}:00`
    });
  }

  // Get events for current date
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const todaysEvents = events.filter(event => event.date === currentDateStr);

  // Function to check if an event should be displayed at a specific time slot
  const getEventAtTimeSlot = (timeKey: string) => {
    return todaysEvents.find(event => event.startTime === timeKey);
  };

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg font-roboto-slab text-gray-800">
            <Calendar className="w-5 h-5 text-green-600" />
            CALENDAR
          </CardTitle>
          <div className="flex items-center gap-1 flex-wrap">
            <Button 
              variant={isToday() ? "default" : "outline"} 
              size="sm" 
              onClick={goToToday}
              className="text-xs px-3 py-1 bg-white/80 border-gray-300 text-gray-700 hover:bg-white/90 shadow-sm font-roboto-slab"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('prev')} 
              className="p-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white/90 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDay('next')} 
              className="p-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white/90 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="text-xs px-3 py-1 bg-white/80 border-gray-300 text-gray-700 hover:bg-white/90 shadow-sm font-roboto-slab"
            >
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 bg-white/60 hover:bg-white/80 text-gray-700"
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="text-sm lg:text-base font-medium text-gray-700 font-roboto-slab">
          {formatDate(currentDate)}
        </div>
        
        {/* Filter Section */}
        <div className="mt-4 p-3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-sm">
          <RadioGroup value={filterType} onValueChange={(value) => setFilterType(value as "my-task" | "follow-up" | "all")} className="flex flex-row gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-xs font-poppins text-gray-700 cursor-pointer">All Tasks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="my-task" id="my-task" />
              <Label htmlFor="my-task" className="text-xs font-poppins text-gray-700 cursor-pointer">My Tasks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="follow-up" id="follow-up" />
              <Label htmlFor="follow-up" className="text-xs font-poppins text-gray-700 cursor-pointer">Tasks to Follow Up</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="p-3 lg:p-6">
          <div className="space-y-0 border border-white/30 rounded-lg overflow-hidden max-h-96 overflow-y-auto backdrop-blur-sm bg-white/20">
            {timeSlots.map((slot, index) => {
              const event = getEventAtTimeSlot(slot.timeKey);
              return (
                <div 
                  key={slot.timeKey} 
                  className={`flex border-b border-white/20 min-h-[50px] ${
                    index === timeSlots.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <div className="w-16 lg:w-20 p-2 lg:p-3 text-xs lg:text-sm text-gray-600 border-r border-white/20 flex-shrink-0 font-roboto-slab">
                    {slot.time12}
                  </div>
                  <div className="flex-1 p-2 relative">
                    {event && (
                      <div className={`p-2 rounded-md ${getEventColor(event.type)} h-full flex items-center justify-between`}>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs font-poppins truncate">{event.title}</div>
                          <div className="text-xs opacity-75 font-poppins">
                            {event.startTime} - {event.endTime}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleTaskAction('email', event.id)} className="font-poppins text-xs">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTaskAction('call', event.id)} className="font-poppins text-xs">
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTaskAction('update', event.id)} className="font-poppins text-xs">
                              <Edit className="w-4 h-4 mr-2" />
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTaskAction('change-status', event.id)} className="font-poppins text-xs">
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Change Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Optional: Show timezone */}
          <div className="mt-4 text-xs text-gray-500 text-center font-roboto-slab">
            GMT-05:30
          </div>
        </CardContent>
      )}
    </Card>
  );
}

