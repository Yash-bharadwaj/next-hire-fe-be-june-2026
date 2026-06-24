import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, DollarSign, Briefcase, Clock, Plus, Trash2, Save, Loader2, ChevronDown, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobProfitability } from "@/services/recruiterService";
import { ProfitabilityTotals, formatPct } from "@/hooks/useJobProfitability";

interface JobProfitabilityPanelProps {
  profitability: JobProfitability | null;
  loading: boolean;
  saving: boolean;
  totals: ProfitabilityTotals;
  updateDraft: (updater: (current: JobProfitability) => JobProfitability) => void;
  onSave: () => Promise<boolean>;
}

export const JobProfitabilityPanel = ({
  profitability,
  loading,
  saving,
  totals,
  updateDraft,
  onSave,
}: JobProfitabilityPanelProps) => {
  const [openSections, setOpenSections] = useState({
    revenue: true,
    directCost: true,
    overheads: true,
    oneTimeCosts: true,
  });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const pct = (amount: number) => formatPct(amount, totals.totalRevenue);

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
        <Button className="button-gradient shadow-md" onClick={onSave} disabled={saving}>
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
        <Collapsible open={openSections.revenue} onOpenChange={() => toggleSection("revenue")}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue
                </CardTitle>
                <ChevronDown
                  className={cn("w-5 h-5 text-green-600 transition-transform", openSections.revenue && "rotate-180")}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-200/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Rate</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Hours</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                      <th className="text-left p-3 font-semibold text-gray-700">%</th>
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
                      <td className="p-3 text-gray-500 text-sm">
                        {pct(profitability.revenue.billRate.rate * profitability.revenue.billRate.hours)}
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
                      <td className="p-3 text-gray-500 text-sm">
                        {pct(profitability.revenue.overTime.rate * profitability.revenue.overTime.hours)}
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
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.revenue.incentives.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="card-gradient border-red-200/50 shadow-lg">
        <Collapsible open={openSections.directCost} onOpenChange={() => toggleSection("directCost")}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Direct Cost
                </CardTitle>
                <ChevronDown
                  className={cn("w-5 h-5 text-red-600 transition-transform", openSections.directCost && "rotate-180")}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Rate</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Hours</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                      <th className="text-left p-3 font-semibold text-gray-700">%</th>
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
                      <td className="p-3 text-gray-500 text-sm">
                        {pct(profitability.direct_cost.payRate.rate * profitability.direct_cost.payRate.hours)}
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
                              direct_cost: {
                                ...p.direct_cost,
                                otPayRate: { ...p.direct_cost.otPayRate, hours: Number(e.target.value) },
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="p-3 font-bold text-red-600">
                        ${(profitability.direct_cost.otPayRate.rate * profitability.direct_cost.otPayRate.hours).toLocaleString()}
                      </td>
                      <td className="p-3 text-gray-500 text-sm">
                        {pct(profitability.direct_cost.otPayRate.rate * profitability.direct_cost.otPayRate.hours)}
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
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.direct_cost.discount.amount)}</td>
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
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.direct_cost.vendorCommission.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="card-gradient border-orange-200/50 shadow-lg">
        <Collapsible open={openSections.overheads} onOpenChange={() => toggleSection("overheads")}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  Overheads
                </CardTitle>
                <ChevronDown
                  className={cn("w-5 h-5 text-orange-600 transition-transform", openSections.overheads && "rotate-180")}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-50 border-b border-orange-200/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                      <th className="text-left p-3 font-semibold text-gray-700">%</th>
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
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.overheads.recruiterCommission)}</td>
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
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.overheads.employeeBenefits)}</td>
                    </tr>
                    <tr className="border-b border-orange-100">
                      <td className="p-3 font-medium">Per Diems</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          className="w-24"
                          value={profitability.overheads.perDiems}
                          onChange={(e) => updateDraft((p) => ({ ...p, overheads: { ...p.overheads, perDiems: Number(e.target.value) } }))}
                        />
                      </td>
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.overheads.perDiems)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Employer Taxes</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          className="w-24"
                          value={profitability.overheads.employerTaxes ?? 0}
                          onChange={(e) =>
                            updateDraft((p) => ({ ...p, overheads: { ...p.overheads, employerTaxes: Number(e.target.value) } }))
                          }
                        />
                      </td>
                      <td className="p-3 text-gray-500 text-sm">{pct(profitability.overheads.employerTaxes ?? 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="card-gradient border-blue-200/50 shadow-lg">
        <Collapsible open={openSections.oneTimeCosts} onOpenChange={() => toggleSection("oneTimeCosts")}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200/50">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer flex-1">
                  <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    One-Time Costs
                  </CardTitle>
                  <ChevronDown
                    className={cn("w-5 h-5 text-blue-600 transition-transform", openSections.oneTimeCosts && "rotate-180")}
                  />
                </div>
              </CollapsibleTrigger>
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
          <CollapsibleContent>
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
                                  one_time_costs: p.one_time_costs.map((c, i) =>
                                    i === idx ? { ...c, amount: Number(e.target.value) } : c
                                  ),
                                }))
                              }
                            />
                          </td>
                          <td className="p-3 text-gray-500 text-sm">{pct(cost.amount)}</td>
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
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-gradient border-yellow-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200/50">
            <CardTitle className="text-lg bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-600" />
              Net Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Gross Margin</span>
                <span className="font-semibold text-gray-800">${totals.grossMargin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Overheads</span>
                <span className="font-semibold text-red-600">-${totals.totalOverheads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-yellow-50 px-4 rounded-lg border border-yellow-200">
                <span className="font-bold text-yellow-800">Net Margin</span>
                <span className="font-bold text-yellow-800 text-xl">${totals.netMarginAfterOverheads.toLocaleString()}</span>
              </div>
              <div className="text-center text-sm text-gray-600">{pct(totals.netMarginAfterOverheads)} of total revenue</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-indigo-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200/50">
            <CardTitle className="text-lg bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-600" />
              Overall Profitability
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Net Margin</span>
                <span className="font-semibold text-gray-800">${totals.netMarginAfterOverheads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">One-Time Costs</span>
                <span className="font-semibold text-red-600">-${totals.totalOneTimeCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-indigo-50 px-4 rounded-lg border border-indigo-200">
                <span className="font-bold text-indigo-800">Overall Profitability</span>
                <span className="font-bold text-indigo-800 text-xl">${totals.netMargin.toLocaleString()}</span>
              </div>
              <div className="text-center text-sm text-gray-600">{pct(totals.netMargin)} of total revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
