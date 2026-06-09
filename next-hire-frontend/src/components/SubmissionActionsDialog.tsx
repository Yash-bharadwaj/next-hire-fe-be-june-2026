import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Trophy, 
  MessageSquare, 
  UserCheck, 
  XCircle, 
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useSubmissionManagement } from "@/hooks/useSubmissions";
import { usePlacementManagement } from "@/hooks/usePlacements";
import { ScheduleInterviewDialog } from "./ScheduleInterviewDialog";

interface SubmissionActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    status: string;
    candidate?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    job?: {
      id: string;
      title: string;
      company_name: string;
      location?: string;
      salary_min?: number;
      salary_max?: number;
      salary_currency?: string;
    };
    expected_salary?: number;
    notes?: string;
  };
  onSuccess?: () => void;
}

export const SubmissionActionsDialog: React.FC<SubmissionActionsDialogProps> = ({
  isOpen,
  onClose,
  submission,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("status");
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  
  // Status update state
  const [newStatus, setNewStatus] = useState(submission.status);
  const [statusNotes, setStatusNotes] = useState("");
  
  // Placement creation state
  const [placementData, setPlacementData] = useState({
    start_date: "",
    placement_type: "permanent" as const,
    salary: submission.expected_salary || submission.job?.salary_min || 0,
    salary_currency: submission.job?.salary_currency || "USD",
    location: submission.job?.location || "",
    work_arrangement: "onsite" as const,
    reporting_manager: "",
    department: "",
    notes: "",
  });

  // Notes state
  const [noteText, setNoteText] = useState("");

  const { updateSubmissionStatus, addSubmissionNote, loading: submissionLoading } = useSubmissionManagement();
  const { createPlacement, loading: placementLoading } = usePlacementManagement();

  const handleStatusUpdate = async () => {
    if (newStatus === submission.status && !statusNotes) return;

    const success = await updateSubmissionStatus(submission.id, newStatus as any, statusNotes);
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    const success = await addSubmissionNote(submission.id, noteText);
    if (success) {
      setNoteText("");
      onSuccess?.();
    }
  };

  const handleCreatePlacement = async () => {
    if (!submission.candidate?.id || !submission.job?.id) return;

    const placementRequest = {
      job_id: submission.job.id,
      candidate_id: submission.candidate.id,
      submission_id: submission.id,
      ...placementData,
      salary: Number(placementData.salary),
    };

    const result = await createPlacement(placementRequest);
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-indigo-100 text-indigo-800",
      offered: "bg-orange-100 text-orange-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offered: "Offered",
      hired: "Hired",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const canScheduleInterview = ["under_review", "shortlisted"].includes(submission.status);
  const canCreatePlacement = ["interviewed", "offered"].includes(submission.status);
  const canUpdateStatus = true;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Manage Submission
            </DialogTitle>
            <div className="text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-4">
                <p><strong>Candidate:</strong> {submission.candidate?.first_name} {submission.candidate?.last_name}</p>
                <Badge className={getStatusColor(submission.status)}>
                  {getStatusLabel(submission.status)}
                </Badge>
              </div>
              <p><strong>Position:</strong> {submission.job?.title} at {submission.job?.company_name}</p>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Update Status
              </TabsTrigger>
              <TabsTrigger value="interview" disabled={!canScheduleInterview} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Interview
              </TabsTrigger>
              <TabsTrigger value="placement" disabled={!canCreatePlacement} className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Create Placement
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Add Notes
              </TabsTrigger>
            </TabsList>

            {/* Status Update Tab */}
            <TabsContent value="status" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <Badge className={getStatusColor(submission.status)}>
                    {getStatusLabel(submission.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-status">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-notes">Notes (Optional)</Label>
                  <Textarea
                    id="status-notes"
                    placeholder="Add any notes about this status change..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStatusUpdate} 
                    disabled={submissionLoading || (newStatus === submission.status && !statusNotes)}
                  >
                    {submissionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Status
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Schedule Interview Tab */}
            <TabsContent value="interview" className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Interview</h3>
                <p className="text-gray-600 mb-6">
                  Schedule an interview with {submission.candidate?.first_name} {submission.candidate?.last_name}
                </p>
                <Button onClick={() => setShowScheduleInterview(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </TabsContent>

            {/* Create Placement Tab */}
            <TabsContent value="placement" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={placementData.start_date}
                      onChange={(e) => setPlacementData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placement-type">Placement Type</Label>
                    <Select 
                      value={placementData.placement_type} 
                      onValueChange={(value: any) => setPlacementData(prev => ({ ...prev, placement_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="temp_to_perm">Temp to Perm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={placementData.salary}
                      onChange={(e) => setPlacementData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work-arrangement">Work Arrangement</Label>
                    <Select 
                      value={placementData.work_arrangement} 
                      onValueChange={(value: any) => setPlacementData(prev => ({ ...prev, work_arrangement: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={placementData.location}
                    onChange={(e) => setPlacementData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporting-manager">Reporting Manager</Label>
                    <Input
                      id="reporting-manager"
                      value={placementData.reporting_manager}
                      onChange={(e) => setPlacementData(prev => ({ ...prev, reporting_manager: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={placementData.department}
                      onChange={(e) => setPlacementData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placement-notes">Notes</Label>
                  <Textarea
                    id="placement-notes"
                    placeholder="Any additional notes about this placement..."
                    value={placementData.notes}
                    onChange={(e) => setPlacementData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePlacement} 
                    disabled={placementLoading || !placementData.start_date || !placementData.salary}
                  >
                    {placementLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Placement
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Add Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-text">Add Note</Label>
                  <Textarea
                    id="note-text"
                    placeholder="Add a note about this submission..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddNote} 
                    disabled={submissionLoading || !noteText.trim()}
                  >
                    {submissionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Note
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        isOpen={showScheduleInterview}
        onClose={() => setShowScheduleInterview(false)}
        submission={submission}
        onSuccess={() => {
          setShowScheduleInterview(false);
          onSuccess?.();
        }}
      />
    </>
  );
};
