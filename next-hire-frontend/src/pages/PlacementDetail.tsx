import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Briefcase, Building, DollarSign, Calendar, FileText, Users, MapPin, AlertCircle } from "lucide-react";
import { usePlacementDetail } from "@/hooks/usePlacements";
import { placementService } from "@/services/placementService";
import { useToast } from "@/hooks/use-toast";

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "Not set");

const PlacementDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { placement, loading, error, refresh } = usePlacementDetail(id);

  const statusColor = placement?.status
    ? placementService.getStatusColor(placement.status)
    : "bg-gray-100 text-gray-800";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Placement Details</h1>
            <p className="text-gray-600">
              {placement?.placement_id || placement?.id || ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {placement && (
            <Badge className={statusColor}>{placementService.getStatusLabel(placement.status)}</Badge>
          )}
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && <div className="text-gray-600">Loading placement...</div>}
      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {!loading && !error && !placement && (
        <div className="text-gray-600">Placement not found.</div>
      )}

      {placement && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-gray-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{placement.job?.title || "Job"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{placement.job?.company_name || "Company"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {placement.candidate
                      ? `${placement.candidate.first_name || ""} ${placement.candidate.last_name || ""}`.trim()
                      : "Candidate"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Submission: {placement.submission_id}</span>
                </div>
              </div>

              <div className="space-y-3 text-gray-800">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {formatDate(placement.start_date as any)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {placement.salary_currency || "USD"} {placement.salary || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{placement.location || "Location"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Type: {placement.placement_type}</span>
                </div>
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
                  <div className="font-semibold">{placement.job?.title}</div>
                  <div className="text-sm text-gray-600">{placement.job?.company_name}</div>
                  <div className="text-sm text-gray-600">Job ID: {placement.job?.job_id || placement.job?.id}</div>
                  <div className="text-sm text-gray-600">Submission ID: {placement.submission_id}</div>
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
                    {placement.candidate
                      ? `${placement.candidate.first_name || ""} ${placement.candidate.last_name || ""}`.trim()
                      : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Candidate ID: {placement.candidate?.id}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meta">
              <Card>
                <CardHeader>
                  <CardTitle>Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-800">
                  <div className="text-sm text-gray-600">Placement ID: {placement.placement_id || placement.id}</div>
                  <div className="text-sm text-gray-600">Status: {placement.status}</div>
                  <div className="text-sm text-gray-600">Created by: {placement.created_by}</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlacementDetail;
