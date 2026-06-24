import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { recruiterService, JobProfitability } from "@/services/recruiterService";

export interface ProfitabilityTotals {
  totalRevenue: number;
  totalDirectCost: number;
  totalOverheads: number;
  totalOneTimeCosts: number;
  grossMargin: number;
  netMarginAfterOverheads: number;
  netMargin: number;
}

const ZERO_TOTALS: ProfitabilityTotals = {
  totalRevenue: 0,
  totalDirectCost: 0,
  totalOverheads: 0,
  totalOneTimeCosts: 0,
  grossMargin: 0,
  netMarginAfterOverheads: 0,
  netMargin: 0,
};

// Single source of truth for every profitability total, shared by the Job
// Detail header (Gross/Net Margin %) and the Profitability tab's cards -
// duplicating this math in two places is exactly how they'd drift apart.
export function computeProfitabilityTotals(profitability: JobProfitability | null): ProfitabilityTotals {
  if (!profitability) return ZERO_TOTALS;

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
  const totalOverheads =
    overheads.recruiterCommission + overheads.employeeBenefits + overheads.perDiems + (overheads.employerTaxes ?? 0);
  const totalOneTimeCosts = one_time_costs.reduce((sum, c) => sum + (c.amount || 0), 0);
  const grossMargin = totalRevenue - totalDirectCost;
  const netMarginAfterOverheads = grossMargin - totalOverheads;
  const netMargin = netMarginAfterOverheads - totalOneTimeCosts;

  return { totalRevenue, totalDirectCost, totalOverheads, totalOneTimeCosts, grossMargin, netMarginAfterOverheads, netMargin };
}

// % of total revenue, edge-case-safe for zero/missing revenue (no NaN/Infinity).
export function formatPct(amount: number, totalRevenue: number): string {
  return totalRevenue > 0 ? `${((amount / totalRevenue) * 100).toFixed(1)}%` : "—";
}

export function useJobProfitability(jobId: string | undefined) {
  const { toast } = useToast();
  const [profitability, setProfitability] = useState<JobProfitability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Snapshot of the last fetched/saved state, to detect unsaved edits.
  const savedSnapshotRef = useRef<string | null>(null);

  const fetchProfitability = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await recruiterService.getJobProfitability(jobId);
      setProfitability(res.data.profitability);
      savedSnapshotRef.current = JSON.stringify(res.data.profitability);
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

  const handleSave = async (): Promise<boolean> => {
    if (!jobId || !profitability) return false;
    setSaving(true);
    try {
      const res = await recruiterService.updateJobProfitability(jobId, {
        revenue: profitability.revenue,
        direct_cost: profitability.direct_cost,
        overheads: profitability.overheads,
        one_time_costs: profitability.one_time_costs,
      });
      setProfitability(res.data.profitability);
      savedSnapshotRef.current = JSON.stringify(res.data.profitability);
      toast({ title: "Profitability saved" });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save profitability",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const isDirty = profitability !== null && JSON.stringify(profitability) !== savedSnapshotRef.current;

  return {
    profitability,
    loading,
    saving,
    isDirty,
    totals: computeProfitabilityTotals(profitability),
    updateDraft,
    handleSave,
    refetch: fetchProfitability,
  };
}
