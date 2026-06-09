import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import { useInterviewManagement } from "@/hooks/useInterviews";
import { InterviewType } from "@/services/interviewService";
import { toast } from "sonner";

interface ScheduleInterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    candidate?: {
      first_name: string;
      last_name: string;
      email: string;
    };
    job?: {
      title: string;
      company_name: string;
    };
  };
  onSuccess?: () => void;
}

export const ScheduleInterviewDialog: React.FC<
  ScheduleInterviewDialogProps
> = ({ isOpen, onClose, submission, onSuccess }) => {
  const [dateStr, setDateStr] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [interviewType, setInterviewType] = useState<InterviewType>("video");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");

  const { createInterview, loading } = useInterviewManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateStr || !time) {
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(":");
    const scheduledDateTime = new Date(dateStr);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    const trimmedMeetingLink = meetingLink.trim();

    const interviewData = {
      submission_id: submission.id,
      interview_type: interviewType,
      scheduled_at: scheduledDateTime.toISOString(),
      duration_minutes: parseInt(duration),
      location: interviewType === "in_person" ? location : undefined,
      meeting_link:
        interviewType === "video" && trimmedMeetingLink
          ? trimmedMeetingLink
          : undefined,
      notes,
    };

    const result = await createInterview(interviewData);

    if (result) {
      if (result.meeting_link) {
        toast.success(`Meeting link created: ${result.meeting_link}`);
      }
      onSuccess?.();
      onClose();
      // Reset form
      setDateStr("");
      setTime("");
      setDuration("60");
      setInterviewType("video");
      setLocation("");
      setMeetingLink("");
      setNotes("");
      setInterviewerEmail("");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setDateStr("");
    setTime("");
    setDuration("60");
    setInterviewType("video");
    setLocation("");
    setMeetingLink("");
    setNotes("");
    setInterviewerEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Schedule Interview
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <p>
              <strong>Candidate:</strong> {submission.candidate?.first_name}{" "}
              {submission.candidate?.last_name}
            </p>
            <p>
              <strong>Position:</strong> {submission.job?.title} at{" "}
              {submission.job?.company_name}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label htmlFor="interview-type">Interview Type</Label>
            <Select
              value={interviewType}
              onValueChange={(value) =>
                setInterviewType(value as InterviewType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video Call
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Call
                  </div>
                </SelectItem>
                <SelectItem value="in_person">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    In Person
                  </div>
                </SelectItem>
                <SelectItem value="technical">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Technical Interview
                  </div>
                </SelectItem>
                <SelectItem value="behavioral">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Behavioral Interview
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateStr}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location or Meeting Link */}
          {interviewType === "video" && (
            <div className="space-y-2">
              <Label htmlFor="meeting-link">Meeting Link</Label>
              <Input
                id="meeting-link"
                type="url"
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to auto-generate and email the link.
              </p>
            </div>
          )}

          {interviewType === "in_person" && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Office address or meeting room"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          )}

          {/* Interviewer Email */}
          <div className="space-y-2">
            <Label htmlFor="interviewer-email">
              Interviewer Email (Optional)
            </Label>
            <Input
              id="interviewer-email"
              type="email"
              placeholder="interviewer@company.com"
              value={interviewerEmail}
              onChange={(e) => setInterviewerEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              If specified, this person will be assigned as the interviewer
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or instructions for the interview..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !dateStr || !time}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Interview
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
