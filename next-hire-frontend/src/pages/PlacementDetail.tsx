import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  Layers,
  UserCheck,
} from "lucide-react";
import { usePlacementDetail } from "@/hooks/usePlacements";
import { placementService } from "@/services/placementService";
import { useToast } from "@/hooks/use-toast";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const formatCurrency = (amount?: number, currency = "USD") =>
  amount != null
    ? new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount)
    : "—";

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

const PlacementDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { placement, loading, error, refresh } = usePlacementDetail(id);

  const statusColor = placement?.status
    ? placementService.getStatusColor(placement.status)
    : "bg-gray-100 text-gray-800";

  const candidateName = placement?.candidate
    ? `${placement.candidate.first_name || ""} ${placement.candidate.last_name || ""}`.trim()
    : "—";

  const recruiterName = placement?.recruiter
    ? placement.recruiter.recruiterProfile
      ? `${placement.recruiter.recruiterProfile.first_name || ""} ${placement.recruiter.recruiterProfile.last_name || ""}`.trim()
      : placement.recruiter.email
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {placement?.placement_id || "Placement Details"}
            </h1>
            {placement && (
              <p className="text-sm text-gray-500">
                {placement.job?.title || "Job"} · {placement.job?.company_name || ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {placement && (
            <Badge className={`${statusColor} capitalize`}>
              {placementService.getStatusLabel(placement.status)}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && <div className="text-gray-500 py-8 text-center">Loading placement…</div>}
      {error && (
        <div className="flex items-center gap-2 text-red-600 py-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {!loading && !error && !placement && (
        <div className="text-gray-500 py-8 text-center">Placement not found.</div>
      )}

      {placement && (
        <>
          {/* 2-column summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Candidate card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" /> Candidate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(placement.candidate?.first_name?.[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{candidateName}</p>
                    {placement.candidate?.candidate_id && (
                      <p className="text-xs text-gray-400 font-mono">{placement.candidate.candidate_id}</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  {placement.candidate?.email && (
                    <InfoRow icon={Mail} label="Email" value={placement.candidate.email} />
                  )}
                  {placement.candidate?.phone && (
                    <InfoRow icon={Phone} label="Phone" value={placement.candidate.phone} />
                  )}
                  {placement.candidate?.location && (
                    <InfoRow icon={MapPin} label="Location" value={placement.candidate.location} />
                  )}
                  {placement.candidate?.experience_years != null && (
                    <InfoRow icon={TrendingUp} label="Experience" value={`${placement.candidate.experience_years} years`} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-500" /> Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">{placement.job?.title || "—"}</p>
                  <p className="text-sm text-gray-500">{placement.job?.company_name || ""}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <InfoRow icon={FileText} label="Job ID" value={placement.job?.job_id || placement.job?.id} />
                  {placement.job?.location && (
                    <InfoRow icon={MapPin} label="Location" value={placement.job.location} />
                  )}
                  {placement.job?.job_type && (
                    <InfoRow icon={Layers} label="Job Type" value={placement.job.job_type.replace(/_/g, " ")} />
                  )}
                  {placement.submission && (
                    <InfoRow
                      icon={CheckCircle}
                      label="Submission Status"
                      value={
                        <Badge variant="outline" className="text-xs capitalize">
                          {placement.submission.status?.replace(/_/g, " ")}
                        </Badge>
                      }
                    />
                  )}
                  {placement.submission?.submission_id && (
                    <InfoRow icon={FileText} label="Submission ID" value={placement.submission.submission_id} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Placement terms card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" /> Placement Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={DollarSign} label="Salary / Rate" value={formatCurrency(placement.salary, placement.salary_currency)} />
                {placement.billing_rate != null && (
                  <InfoRow icon={DollarSign} label="Billing Rate" value={formatCurrency(placement.billing_rate, placement.salary_currency) + "/hr"} />
                )}
                {placement.commission_amount != null && (
                  <InfoRow icon={TrendingUp} label="Commission" value={formatCurrency(placement.commission_amount)} />
                )}
                {placement.commission_percentage != null && (
                  <InfoRow icon={TrendingUp} label="Commission %" value={`${placement.commission_percentage}%`} />
                )}
                <InfoRow icon={Calendar} label="Start Date" value={formatDate(placement.start_date as any)} />
                {placement.end_date && (
                  <InfoRow icon={Calendar} label="End Date" value={formatDate(placement.end_date as any)} />
                )}
                <InfoRow icon={MapPin} label="Location" value={placement.location} />
                <InfoRow icon={Layers} label="Work Arrangement" value={placement.work_arrangement?.replace(/_/g, " ")} />
                <InfoRow icon={Layers} label="Placement Type" value={placement.placement_type?.replace(/_/g, " ")} />
              </CardContent>
            </Card>

            {/* Meta / Recruiter card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-orange-500" /> Details & Recruiter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={FileText} label="Placement ID" value={placement.placement_id} />
                <InfoRow
                  icon={CheckCircle}
                  label="Status"
                  value={
                    <Badge className={`${statusColor} capitalize text-xs`}>
                      {placementService.getStatusLabel(placement.status)}
                    </Badge>
                  }
                />
                <InfoRow
                  icon={CheckCircle}
                  label="Onboarding"
                  value={placement.onboarding_status?.replace(/_/g, " ")}
                />
                {placement.department && (
                  <InfoRow icon={Building} label="Department" value={placement.department} />
                )}
                {placement.reporting_manager && (
                  <InfoRow icon={User} label="Reporting Manager" value={placement.reporting_manager} />
                )}
                <InfoRow icon={UserCheck} label="Recruiter" value={recruiterName} />
                {placement.recruiter?.email && recruiterName !== placement.recruiter.email && (
                  <InfoRow icon={Mail} label="Recruiter Email" value={placement.recruiter.email} />
                )}
                {placement.performance_rating != null && (
                  <InfoRow icon={Star} label="Performance Rating" value={`${placement.performance_rating} / 5`} />
                )}
                <InfoRow icon={Clock} label="Created" value={formatDate(placement.created_at)} />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {(placement.notes || placement.performance_notes || placement.termination_reason) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {placement.notes && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">General Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{placement.notes}</p>
                  </div>
                )}
                {placement.performance_notes && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Performance Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{placement.performance_notes}</p>
                  </div>
                )}
                {placement.termination_reason && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Termination Reason</p>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{placement.termination_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlacementDetail;
