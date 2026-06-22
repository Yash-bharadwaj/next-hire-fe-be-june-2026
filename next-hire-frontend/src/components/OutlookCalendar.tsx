import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Calendar, Plus, ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  calendarEventService,
  CalendarEvent as CalendarEventRecord,
  CalendarEventType,
  CalendarEventTaskType,
} from "@/services/calendarEventService";

export function OutlookCalendar() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterType, setFilterType] = useState<CalendarEventTaskType | "all">("all");

  const [events, setEvents] = useState<CalendarEventRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventRecord | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    start_time: "09:00",
    end_time: "10:00",
    event_type: "meeting" as CalendarEventType,
    task_type: "my-task" as CalendarEventTaskType,
  });
  const [savingEvent, setSavingEvent] = useState(false);

  const currentDateStr = currentDate.toISOString().split("T")[0];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await calendarEventService.getEvents({ from: currentDateStr, to: currentDateStr });
      setEvents(res.data.events || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentDateStr, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const todaysEvents = filterType === "all" ? events : events.filter((e) => e.task_type === filterType);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());
  const isToday = () => currentDate.toDateString() === new Date().toDateString();

  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    const time12 = hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`;
    timeSlots.push({ hour24: hour, time12, timeKey: `${hour.toString().padStart(2, "0")}:00` });
  }

  const getEventAtTimeSlot = (timeKey: string) => todaysEvents.find((event) => event.start_time === timeKey);

  const openNewEvent = (timeKey?: string) => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      start_time: timeKey || "09:00",
      end_time: timeKey ? `${(parseInt(timeKey) + 1).toString().padStart(2, "0")}:00` : "10:00",
      event_type: "meeting",
      task_type: "my-task",
    });
    setShowEventDialog(true);
  };

  const openEditEvent = (event: CalendarEventRecord) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      start_time: event.start_time,
      end_time: event.end_time,
      event_type: event.event_type,
      task_type: event.task_type,
    });
    setShowEventDialog(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) return;
    setSavingEvent(true);
    try {
      if (editingEvent) {
        await calendarEventService.updateEvent(editingEvent.id, eventForm);
        toast({ title: "Event updated" });
      } else {
        await calendarEventService.createEvent({ ...eventForm, date: currentDateStr });
        toast({ title: "Event created" });
      }
      setShowEventDialog(false);
      fetchEvents();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save event",
        variant: "destructive",
      });
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await calendarEventService.deleteEvent(eventId);
      toast({ title: "Event deleted" });
      fetchEvents();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const cycleStatus = async (event: CalendarEventRecord) => {
    const next = event.status === "pending" ? "confirmed" : event.status === "confirmed" ? "completed" : "pending";
    try {
      await calendarEventService.updateEvent(event.id, { status: next });
      fetchEvents();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
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
              onClick={() => navigateDay("prev")}
              className="p-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white/90 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDay("next")}
              className="p-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white/90 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => openNewEvent()}
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
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="text-sm lg:text-base font-medium text-gray-700 font-roboto-slab">
          {formatDate(currentDate)}
        </div>

        {/* Filter Section */}
        <div className="mt-4 p-3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-sm">
          <RadioGroup value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)} className="flex flex-row gap-6">
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
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading calendar...
            </div>
          ) : (
            <div className="space-y-0 border border-white/30 rounded-lg overflow-hidden max-h-96 overflow-y-auto backdrop-blur-sm bg-white/20">
              {timeSlots.map((slot, index) => {
                const event = getEventAtTimeSlot(slot.timeKey);
                return (
                  <div
                    key={slot.timeKey}
                    className={`flex border-b border-white/20 min-h-[50px] ${index === timeSlots.length - 1 ? "border-b-0" : ""}`}
                  >
                    <div className="w-16 lg:w-20 p-2 lg:p-3 text-xs lg:text-sm text-gray-600 border-r border-white/20 flex-shrink-0 font-roboto-slab">
                      {slot.time12}
                    </div>
                    <div className="flex-1 p-2 relative">
                      {event ? (
                        <div className={`p-2 rounded-md ${getEventColor(event.event_type)} h-full flex items-center justify-between`}>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs font-poppins truncate">{event.title}</div>
                            <div className="text-xs opacity-75 font-poppins">
                              {event.start_time} - {event.end_time}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openEditEvent(event)} className="font-poppins text-xs">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => cycleStatus(event)} className="font-poppins text-xs">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as {event.status === "pending" ? "Confirmed" : event.status === "confirmed" ? "Completed" : "Pending"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="font-poppins text-xs text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <button
                          onClick={() => openNewEvent(slot.timeKey)}
                          className="w-full h-full min-h-[34px] rounded-md hover:bg-white/30 transition-colors"
                          aria-label={`Add event at ${slot.time12}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center font-roboto-slab">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </CardContent>
      )}

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500">Title</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Technical Interview - Jane Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Start Time</Label>
                <Input
                  type="time"
                  value={eventForm.start_time}
                  onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">End Time</Label>
                <Input
                  type="time"
                  value={eventForm.end_time}
                  onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Type</Label>
                <Select value={eventForm.event_type} onValueChange={(v) => setEventForm({ ...eventForm, event_type: v as CalendarEventType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Task Type</Label>
                <Select value={eventForm.task_type} onValueChange={(v) => setEventForm({ ...eventForm, task_type: v as CalendarEventTaskType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="my-task">My Task</SelectItem>
                    <SelectItem value="follow-up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Notes (optional)</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={!eventForm.title.trim() || savingEvent}>
              {savingEvent ? "Saving..." : editingEvent ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
