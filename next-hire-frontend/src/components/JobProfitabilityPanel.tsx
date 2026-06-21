import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, DollarSign, Briefcase, Clock, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterService, JobProfitability } from "@/services/recruiterService";

interface JobProfitabilityPanelProps {
  jobId: string;
}

export const JobProfitabilityPanel = ({ jobId }: JobProfitabilityPanelProps) => {
  const { toast } = useToast();
  const [profitability, setProfitability] = useState<JobProfitability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfitability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruiterService.getJobProfitability(jobId);
      setProfitability(res.data.profitability);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to load profitability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    fetchProfitability();
  }, [fetchProfitability]);

  const updateDraft = (updater: (current: JobProfitability) => JobProfitability) => {
    setProfitability((prev) => (prev ? updater(prev) : prev));
  };

  const handleSave = async () => {
    if (!profitability) return;
    setSaving(true);
    try {
      const res = await recruiterService.updateJobProfitability(jobId, {
        revenue: profitability.revenue,
        direct_cost: profitability.direct_cost,
        overheads: profitability.overheads,
        one_time_costs: profitability.one_time_costs,
      });
      setProfitability(res.data.profitability);
      toast({ title: "Profitability saved" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save profitability",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totals = (() => {
    if (!profitability) {
      return { totalRevenue: 0, totalDirectCost: 0, totalOverheads: 0, totalOneTimeCosts: 0, netMargin: 0 };
    }
    const { revenue, direct_cost, overheads, one_time_costs } = profitability;
    const totalRevenue =
      revenue.billRate.rate * revenue.billRate.hours +
      revenue.overTime.rate * revenue.overTime.hours +
      revenue.incentives.amount;
    const totalDirectCost =
      direct_cost.payRate.rate * direct_cost.payRate.hours +
      direct_cost.otPayRate.rate * direct_cost.otPayRate.hours +
      direct_cost.discount.amount +
      direct_cost.vendorCommission.amount;
    const totalOverheads = overheads.recruiterCommission + overheads.employeeBenefits + overheads.perDiems;
    const totalOneTimeCosts = one_time_costs.reduce((sum, c) => sum + (c.amount || 0), 0);
    const netMargin = totalRevenue - totalDirectCost - totalOverheads - totalOneTimeCosts;
    return { totalRevenue, totalDirectCost, totalOverheads, totalOneTimeCosts, netMargin };
  })();

  if (loading || !profitability) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading profitability...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
          Profitability Analysis
        </h3>
        <Button className="button-gradient shadow-md" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-gradient border-green-200/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${totals.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="card-gradient border-red-200/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">${totals.totalDirectCost.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Direct Cost</div>
          </CardContent>
        </Card>
        <Card className="card-gradient border-orange-200/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">${totals.totalOverheads.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Overheads</div>
          </CardContent>
        </Card>
        <Card className="card-gradient border-blue-200/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">${totals.totalOneTimeCosts.toLocaleString()}</div>
            <div className="text-sm text-gray-600">One Time Costs</div>
          </CardContent>
        </Card>
        <Card className="card-gradient border-purple-200/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${totals.netMargin.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Net Margin</div>
            <div className="text-xs text-purple-600 mt-1">
              {totals.totalRevenue > 0 ? `${((totals.netMargin / totals.totalRevenue) * 100).toFixed(1)}% margin` : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-gradient border-green-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200/50">
          <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-200/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Rate</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Hours</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-green-100">
                  <td className="p-3 font-medium">Bill Rate</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.revenue.billRate.rate}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          revenue: { ...p.revenue, billRate: { ...p.revenue.billRate, rate: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.revenue.billRate.hours}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          revenue: { ...p.revenue, billRate: { ...p.revenue.billRate, hours: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3 font-bold text-green-600">
                    ${(profitability.revenue.billRate.rate * profitability.revenue.billRate.hours).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-green-100">
                  <td className="p-3 font-medium">Overtime</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.revenue.overTime.rate}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          revenue: { ...p.revenue, overTime: { ...p.revenue.overTime, rate: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.revenue.overTime.hours}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          revenue: { ...p.revenue, overTime: { ...p.revenue.overTime, hours: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3 font-bold text-green-600">
                    ${(profitability.revenue.overTime.rate * profitability.revenue.overTime.hours).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Incentives</td>
                  <td className="p-3 text-gray-400">—</td>
                  <td className="p-3 text-gray-400">—</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.revenue.incentives.amount}
                      onChange={(e) =>
                        updateDraft((p) => ({ ...p, revenue: { ...p.revenue, incentives: { amount: Number(e.target.value) } } }))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-red-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200/50">
          <CardTitle className="text-lg bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            Direct Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b border-red-200/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Rate</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Hours</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-red-100">
                  <td className="p-3 font-medium">Pay Rate</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.direct_cost.payRate.rate}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          direct_cost: { ...p.direct_cost, payRate: { ...p.direct_cost.payRate, rate: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.direct_cost.payRate.hours}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          direct_cost: { ...p.direct_cost, payRate: { ...p.direct_cost.payRate, hours: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3 font-bold text-red-600">
                    ${(profitability.direct_cost.payRate.rate * profitability.direct_cost.payRate.hours).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-red-100">
                  <td className="p-3 font-medium">OT Pay Rate</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.direct_cost.otPayRate.rate}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          direct_cost: { ...p.direct_cost, otPayRate: { ...p.direct_cost.otPayRate, rate: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.direct_cost.otPayRate.hours}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          direct_cost: { ...p.direct_cost, otPayRate: { ...p.direct_cost.otPayRate, hours: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                  <td className="p-3 font-bold text-red-600">
                    ${(profitability.direct_cost.otPayRate.rate * profitability.direct_cost.otPayRate.hours).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-red-100">
                  <td className="p-3 font-medium">Discount</td>
                  <td className="p-3 text-gray-400">—</td>
                  <td className="p-3 text-gray-400">—</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.direct_cost.discount.amount}
                      onChange={(e) =>
                        updateDraft((p) => ({ ...p, direct_cost: { ...p.direct_cost, discount: { amount: Number(e.target.value) } } }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Vendor Commission</td>
                  <td className="p-3 text-gray-400">—</td>
                  <td className="p-3 text-gray-400">—</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.direct_cost.vendorCommission.amount}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          direct_cost: { ...p.direct_cost, vendorCommission: { amount: Number(e.target.value) } },
                        }))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-orange-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200/50">
          <CardTitle className="text-lg bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            Overheads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50 border-b border-orange-200/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-orange-100">
                  <td className="p-3 font-medium">Recruiter Commission</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.overheads.recruiterCommission}
                      onChange={(e) =>
                        updateDraft((p) => ({ ...p, overheads: { ...p.overheads, recruiterCommission: Number(e.target.value) } }))
                      }
                    />
                  </td>
                </tr>
                <tr className="border-b border-orange-100">
                  <td className="p-3 font-medium">Employee Benefits</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.overheads.employeeBenefits}
                      onChange={(e) =>
                        updateDraft((p) => ({ ...p, overheads: { ...p.overheads, employeeBenefits: Number(e.target.value) } }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Per Diems</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      className="w-24"
                      value={profitability.overheads.perDiems}
                      onChange={(e) => updateDraft((p) => ({ ...p, overheads: { ...p.overheads, perDiems: Number(e.target.value) } }))}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-blue-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              One-Time Costs
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateDraft((p) => ({ ...p, one_time_costs: [...p.one_time_costs, { label: "New cost", amount: 0 }] }))}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {profitability.one_time_costs.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No one-time costs added.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {profitability.one_time_costs.map((cost, idx) => (
                    <tr key={idx} className="border-b border-blue-100">
                      <td className="p-3">
                        <Input
                          value={cost.label}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              one_time_costs: p.one_time_costs.map((c, i) => (i === idx ? { ...c, label: e.target.value } : c)),
                            }))
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          className="w-32"
                          value={cost.amount}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              one_time_costs: p.one_time_costs.map((c, i) => (i === idx ? { ...c, amount: Number(e.target.value) } : c)),
                            }))
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => updateDraft((p) => ({ ...p, one_time_costs: p.one_time_costs.filter((_, i) => i !== idx) }))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
