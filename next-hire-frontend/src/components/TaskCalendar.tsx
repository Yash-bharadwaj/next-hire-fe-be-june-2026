
import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  type: "interview" | "meeting" | "screening" | "call";
  status: "confirmed" | "pending" | "completed";
}

export function TaskCalendar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Static events data - no API calls
  const todayEvents: CalendarEvent[] = [
    {
      id: 1,
      title: "Technical Interview - Sarah Johnson",
      time: "10:00 AM",
      type: "interview",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Client Call - TechCorp",
      time: "2:00 PM",
      type: "call",
      status: "confirmed"
    },
    {
      id: 3,
      title: "Candidate Screening",
      time: "4:00 PM",
      type: "screening",
      status: "pending"
    }
  ];

  const getEventColor = (type: string, status: string) => {
    if (status === "completed") return "bg-gray-100 text-gray-600";
    
    switch (type) {
      case "interview": return "bg-blue-100 text-blue-800";
      case "meeting": return "bg-purple-100 text-purple-800";
      case "screening": return "bg-green-100 text-green-800";
      case "call": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent>
          <div className="space-y-3">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getEventColor(event.type, event.status)}>
                      {event.type}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No events scheduled for today</p>
              </div>
            )}
          </div>
          
          {todayEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View Full Calendar
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
