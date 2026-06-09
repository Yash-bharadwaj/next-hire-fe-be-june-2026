import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Video, Phone, MapPin, Link } from "lucide-react";
import { useInterviewDetail } from "@/hooks/useInterviews";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};

const typeIcons: Record<string, JSX.Element> = {
  video: <Video className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  in_person: <MapPin className="h-4 w-4" />,
  technical: <Video className="h-4 w-4" />,
  behavioral: <Video className="h-4 w-4" />,
};

const formatDateTime = (iso?: string) =>
  iso ? format(new Date(iso), "PPP, p") : "Not set";

const InterviewDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { interview, loading, error, refresh } = useInterviewDetail(id);

  const submission = interview?.submission;
  const job = submission?.job;
  const candidate = submission?.candidate;

  const status = interview?.status || "scheduled";
  const type = interview?.interview_type || "video";

  const handleCopyLink = () => {
    if (interview?.meeting_link) {
      navigator.clipboard.writeText(interview.meeting_link);
      toast({ title: "Meeting link copied" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Interview Details</h1>
            <p className="text-gray-600">
              {interview?.id ? `Interview #${interview.id}` : "View interview"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
            {status.replace("_", " ")}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-600 py-8">Loading interview...</div>
      )}
      {error && (
        <div className="text-center text-red-600 py-8">{error}</div>
      )}
      {!loading && !error && !interview && (
        <div className="text-center text-gray-600 py-8">Interview not found.</div>
      )}

      {interview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDateTime(interview.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>{interview.duration_minutes || 60} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 capitalize">
                  {typeIcons[type] || <Video className="h-4 w-4" />}
                  <span>{type.replace("_", " ")}</span>
                </div>
                {interview.meeting_link && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <Link className="h-4 w-4" />
                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Join meeting
                    </a>
                    <Button size="sm" variant="ghost" onClick={handleCopyLink}>
                      Copy
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-500">Interviewer</p>
                <div className="text-gray-800">
                  {interview.interviewer?.recruiterProfile?.first_name
                    ? `${interview.interviewer.recruiterProfile.first_name} ${interview.interviewer.recruiterProfile.last_name || ""}`.trim()
                    : interview.interviewer?.email || "Not set"}
                </div>
                {interview.notes && (
                  <>
                    <Separator />
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-800 whitespace-pre-line">{interview.notes}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="job" className="space-y-4">
            <TabsList>
              <TabsTrigger value="job">Job</TabsTrigger>
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="meta">Meta</TabsTrigger>
            </TabsList>

            <TabsContent value="job">
              <Card>
                <CardHeader>
                  <CardTitle>Job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-800">
                  <div className="font-semibold">{job?.title || "N/A"}</div>
                  <div className="text-sm text-gray-600">
                    {job?.company_name} {job?.location ? `• ${job.location}` : ""}
                  </div>
                  <div className="text-sm text-gray-600">Job ID: {job?.job_id || job?.id}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidate">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-800">
                  <div className="font-semibold">
                    {candidate
                      ? `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim()
                      : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">{candidate?.user?.email}</div>
                  <div className="text-sm text-gray-600">
                    {candidate?.phone ? `Phone: ${candidate.phone}` : ""}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meta">
              <Card>
                <CardHeader>
                  <CardTitle>Submission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-800">
                  <div className="text-sm text-gray-600">Submission ID: {submission?.id}</div>
                  <div className="text-sm text-gray-600">Status: {submission?.status}</div>
                  <div className="text-sm text-gray-600">
                    Created by: {interview.creator?.email || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default InterviewDetail;
