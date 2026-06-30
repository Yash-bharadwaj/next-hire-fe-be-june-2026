import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Calendar, Plus, ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import {
  calendarEventService,
  CalendarEvent as CalendarEventRecord,
  CalendarEventType,
  CalendarEventTaskType,
} from "@/services/calendarEventService";

const TASK_FILTER_OPTIONS: { value: CalendarEventTaskType | "all"; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "my-task", label: "My Tasks" },
  { value: "follow-up", label: "Follow Ups" },
];

export function OutlookCalendar() {
  const { toast } = useToast();
  const confirm = useConfirm();
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

  // Relative-day hint shown next to the date, so it's unmistakable that
  // navigating actually changed which day's schedule is on screen.
  const relativeDayLabel = (date: Date) => {
    const diffDays = Math.round(
      (new Date(date.toDateString()).getTime() - new Date(new Date().toDateString()).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    return null;
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
    if (!(await confirm({
      title: "Delete this event?",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    }))) return;
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
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-green-600" />
            Calendar
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center divide-x divide-gray-200 rounded-md border border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDay("prev")}
                className="h-8 w-8 rounded-r-none p-0 text-gray-500 hover:text-gray-700"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                disabled={isToday()}
                className={`h-8 rounded-none px-3 text-xs font-medium transition-colors disabled:opacity-100 ${
                  isToday() ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDay("next")}
                className="h-8 w-8 rounded-l-none p-0 text-gray-500 hover:text-gray-700"
                aria-label="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button size="sm" onClick={() => openNewEvent()} className="h-8 px-3 text-xs">
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              aria-label={isCollapsed ? "Expand calendar" : "Collapse calendar"}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
            {formatDate(currentDate)}
            {relativeDayLabel(currentDate) && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {relativeDayLabel(currentDate)}
              </span>
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            {TASK_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterType(opt.value)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filterType === opt.value
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="flex flex-1 flex-col pt-0">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading calendar...
            </div>
          ) : (
            <div className="grid max-h-[30rem] flex-1 auto-rows-min divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
              {timeSlots.map((slot) => {
                const event = getEventAtTimeSlot(slot.timeKey);
                return (
                  <div key={slot.timeKey} className="grid grid-cols-[4rem_1fr] min-h-[52px]">
                    <div className="flex justify-end border-r border-gray-100 px-3 py-3 text-xs text-gray-500">
                      {slot.time12}
                    </div>
                    <div className="p-1.5">
                      {event ? (
                        <div className={`flex h-full items-center justify-between gap-2 rounded-md p-2 ${getEventColor(event.event_type)}`}>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold">{event.title}</div>
                            <div className="text-xs opacity-75">
                              {event.start_time} - {event.end_time}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 shrink-0 p-0 opacity-70 hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openEditEvent(event)} className="text-xs">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => cycleStatus(event)} className="text-xs">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as {event.status === "pending" ? "Confirmed" : event.status === "confirmed" ? "Completed" : "Pending"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-xs text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <button
                          onClick={() => openNewEvent(slot.timeKey)}
                          className="group flex h-full min-h-[44px] w-full items-center justify-center rounded-md transition-colors hover:bg-gray-50"
                          aria-label={`Add event at ${slot.time12}`}
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 text-center text-xs text-gray-400">
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
