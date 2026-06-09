import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { candidateService } from "@/services/candidateService";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (user?.role !== "candidate") {
        setPlacements([]);
        setTasks([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const resp = await candidateService.getOnboarding();
        setPlacements(resp.data.placements || []);
        setTasks(resp.data.tasks || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load onboarding");
        setPlacements([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user?.role !== "candidate") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              This page is only available for candidates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Unable to load onboarding
            </h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
        <p className="text-gray-600">
          View your placements and onboarding tasks after hire.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placements</CardTitle>
        </CardHeader>
        <CardContent>
          {placements.length === 0 ? (
            <p className="text-gray-600">No placements yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Job</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Start Date</th>
                    <th className="py-2 pr-4">Work Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">
                        {p.job?.title || "Job"}
                      </td>
                      <td className="py-2 pr-4">
                        {p.job?.company_name || "Company"}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="secondary">{p.status}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        {p.start_date
                          ? new Date(p.start_date).toLocaleDateString()
                          : "TBD"}
                      </td>
                      <td className="py-2 pr-4">
                        {p.work_arrangement || "unspecified"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-gray-600">No onboarding tasks assigned.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-3 flex items-start justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{t.title}</p>
                    {t.due_date && (
                      <p className="text-sm text-gray-600">
                        Due {new Date(t.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {t.status || "pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

