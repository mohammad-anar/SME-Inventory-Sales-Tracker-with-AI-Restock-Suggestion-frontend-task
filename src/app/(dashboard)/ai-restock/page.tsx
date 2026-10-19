"use client";

import * as React from "react";
import {
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Search,
  DollarSign,
  Package,
  Clock,
  Eye,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetRestockRecommendationsQuery,
  useRefreshRestockRecommendationsMutation,
  useGetProductForecastQuery,
} from "@/lib/redux/services/forecastApi";
import { RestockPriority } from "@/types/api";
import { toast } from "sonner";

function PriorityBadge({ priority }: { priority: RestockPriority }) {
  if (priority === "HIGH") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
        HIGH
      </span>
    );
  }
  if (priority === "MEDIUM") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
        MEDIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
      LOW
    </span>
  );
}

function ProductForecastDialog({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const { data: detailResponse, isLoading, isError, refetch } =
    useGetProductForecastQuery(productId);

  const detail = detailResponse?.data;

  return (
    <Dialog open={Boolean(productId)} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            AI Demand Forecast & Restock Deep-Dive
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="Analyzing product demand velocity and Gemini recommendations..." />
        ) : isError || !detail ? (
          <ErrorState
            title="Forecast Unavailable"
            message="Could not load the forecast analysis for this product."
            onRetry={refetch}
          />
        ) : (
          <div className="space-y-5 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {detail.product.name}
                  </h3>
                  <p className="text-slate-500">
                    SKU: <span className="font-semibold text-slate-700">{detail.product.sku}</span> &bull; Category: {detail.product.category}
                  </p>
                </div>
                <PriorityBadge priority={detail.recommendation.priority} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500">Current Stock</span>
                  <p className="text-sm font-bold text-slate-900">{detail.product.currentStock}</p>
                </div>
                <div>
                  <span className="text-slate-500">Reorder Threshold</span>
                  <p className="text-sm font-bold text-slate-900">{detail.product.reorderLevel}</p>
                </div>
                <div>
                  <span className="text-slate-500">Pending Incoming</span>
                  <p className="text-sm font-bold text-blue-600">{detail.metrics.incomingStock} units</p>
                </div>
                <div>
                  <span className="text-slate-500">Daily Velocity</span>
                  <p className="text-sm font-bold text-indigo-600">{detail.metrics.averageDailyDemand} / day</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Gemini Restock Synthesis
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Confidence: <span className="font-bold text-indigo-700">{detail.recommendation.confidence}</span>
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                {detail.recommendation.reason}
              </p>
              {detail.recommendation.warnings.length > 0 && (
                <div className="space-y-1 pt-1">
                  {detail.recommendation.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-amber-700 text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                <span className="text-slate-500">Suggested Restock Quantity</span>
                <div className="text-2xl font-black text-blue-600">
                  {detail.metrics.suggestedRestockQuantity} units
                </div>
                <p className="text-[11px] text-slate-400">
                  Target buffer: {detail.metrics.targetStock} units for {detail.metrics.planningHorizonDays}-day horizon
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                <span className="text-slate-500">Estimated Replenishment Cost</span>
                <div className="text-2xl font-black text-emerald-600">
                  ${detail.metrics.estimatedCost.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Based on unit cost price of ${detail.product.costPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {detail.salesHistory.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Historical Daily Sales Velocity ({detail.metrics.analysisPeriodDays} Days)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Total Sold: <span className="font-bold text-slate-800">{detail.metrics.unitsSoldInPeriod} units</span>
                  </span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detail.salesHistory}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => val.slice(5)}
                        tick={{ fontSize: 10 }}
                        stroke="#94a3b8"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                        stroke="#94a3b8"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} variant="outline" className="h-9 px-4 text-xs font-semibold">
                Close Analysis
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AiRestockPage() {
  const [horizonDays, setHorizonDays] = React.useState<number>(7);
  const [periodDays, setPeriodDays] = React.useState<number>(30);
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"PRIORITY" | "DAYS_LEFT" | "QUANTITY" | "STOCK">("PRIORITY");
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetRestockRecommendationsQuery({
    planningHorizonDays: horizonDays,
    analysisPeriodDays: periodDays,
    priority: priorityFilter === "ALL" ? undefined : (priorityFilter as RestockPriority),
    search: searchQuery.trim() || undefined,
  });

  const [refreshMutation, { isLoading: isRefreshing }] =
    useRefreshRestockRecommendationsMutation();

  const handleRefresh = async () => {
    try {
      await refreshMutation().unwrap();
      toast.success("AI restock recommendations updated");
      refetch();
    } catch {
      toast.error("Failed to refresh recommendations");
    }
  };

  const summary = response?.data?.summary;

  const recommendations = React.useMemo(() => {
    const list = response?.data?.recommendations
      ? [...response.data.recommendations]
      : [];
    const priorityWeights: Record<RestockPriority, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    list.sort((a, b) => {
      if (sortBy === "PRIORITY") {
        if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        return a.estimatedDaysRemaining - b.estimatedDaysRemaining;
      }
      if (sortBy === "DAYS_LEFT") {
        return a.estimatedDaysRemaining - b.estimatedDaysRemaining;
      }
      if (sortBy === "QUANTITY") {
        return b.suggestedRestockQuantity - a.suggestedRestockQuantity;
      }
      if (sortBy === "STOCK") {
        return a.currentStock - b.currentStock;
      }
      return 0;
    });

    return list;
  }, [response, sortBy]);

  return (
    <PageContainer>
      <PageHeader
        title="AI Restock Forecast"
        description="Machine learning inventory demand forecasting and intelligent replenishment recommendations powered by Gemini."
      />

      {summary && (
        <div
          className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            summary.aiStatus === "ONLINE"
              ? "bg-indigo-50/70 border-indigo-200 text-indigo-900"
              : summary.aiStatus === "CONFIG_REQUIRED"
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-blue-50/70 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {summary.aiStatus === "ONLINE" ? (
              <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold leading-tight">
                {summary.aiStatus === "ONLINE"
                  ? `Gemini AI Engine Online (${summary.aiModel})`
                  : summary.aiStatus === "CONFIG_REQUIRED"
                  ? "Gemini API Key Setup Required for AI Synthesis"
                  : "Deterministic Inventory Math Fallback Active"}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {summary.aiStatus === "ONLINE"
                  ? "Active recommendations are augmented with generative AI runout risk analysis and explanations."
                  : summary.aiStatus === "CONFIG_REQUIRED"
                  ? "Displaying accurate sales velocity formulas. Set GEMINI_API_KEY in the backend to activate Gemini reasoning."
                  : "Displaying strict deterministic velocity metrics based on confirmed database transactions."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Analysis Velocity Period"
            >
              <option value={14}>14-Day Velocity</option>
              <option value={30}>30-Day Velocity</option>
              <option value={60}>60-Day Velocity</option>
              <option value={90}>90-Day Velocity</option>
            </select>

            <select
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Planning Horizon"
            >
              <option value={7}>7-Day Horizon</option>
              <option value={14}>14-Day Horizon</option>
              <option value={30}>30-Day Horizon</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className="h-8 px-3 text-xs font-semibold bg-white"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${
                  isRefreshing || isFetching ? "animate-spin" : ""
                }`}
              />
              Recalculate
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              High Priority Restock
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? "--" : summary?.highPriorityCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">Immediate action required</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Below Reorder Level
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? "--" : summary?.belowReorderCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">Stock &le; safety threshold</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Critical Runout (&le; 3 Days)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? "--" : summary?.criticalRunoutCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">Estimated stockout soon</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Est. Restock Outlay
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading
                ? "--"
                : `$${Number(summary?.totalEstimatedRestockCost ?? 0).toFixed(2)}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Total replenishment cost</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU, category..."
              className="h-10 pl-9 text-xs"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "PRIORITY" | "DAYS_LEFT" | "QUANTITY" | "STOCK",
                )
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Sort recommendations"
            >
              <option value="PRIORITY">Sort: Priority</option>
              <option value="DAYS_LEFT">Sort: Runout Days</option>
              <option value="QUANTITY">Sort: Restock Qty</option>
              <option value="STOCK">Sort: Lowest Stock</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("ALL");
                setSortBy("PRIORITY");
              }}
              className="h-10 w-full text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Analyzing inventory velocity and computing restock forecast..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Forecast"
            message="Could not retrieve AI restock recommendations from the server."
            onRetry={refetch}
          />
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Restock Actions Required"
            description="All active catalog products have healthy inventory buffers or match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Reorder Lvl</th>
                  <th className="px-4 py-3 font-semibold">Daily Demand</th>
                  <th className="px-4 py-3 font-semibold">Runout</th>
                  <th className="px-4 py-3 font-semibold">Suggested Qty</th>
                  <th className="px-4 py-3 font-semibold">Est. Cost</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">AI Rationale</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations.map((rec) => (
                  <tr key={rec.productId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{rec.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {rec.sku} &bull; {rec.categoryName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-bold ${
                          rec.currentStock === 0
                            ? "text-rose-600"
                            : rec.currentStock <= rec.reorderLevel
                            ? "text-amber-600"
                            : "text-slate-800"
                        }`}
                      >
                        {rec.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {rec.reorderLevel}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {rec.averageDailyDemand} / day
                    </td>
                    <td className="px-4 py-3.5">
                      {rec.estimatedDaysRemaining <= 3 ? (
                        <span className="font-bold text-rose-600">
                          {rec.estimatedDaysRemaining} days
                        </span>
                      ) : rec.estimatedDaysRemaining <= 7 ? (
                        <span className="font-semibold text-amber-600">
                          {rec.estimatedDaysRemaining} days
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium">
                          {rec.estimatedDaysRemaining > 100
                            ? "100+ days"
                            : `${rec.estimatedDaysRemaining} days`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-black text-blue-600">
                      {rec.suggestedRestockQuantity} units
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      ${rec.estimatedRestockCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={rec.priority} />
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-slate-600 truncate" title={rec.reason}>
                      {rec.reason}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProductId(rec.productId)}
                        className="h-8 px-2 text-indigo-600 hover:text-indigo-700"
                        title="View Detailed Forecast"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Forecast
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProductId && (
        <ProductForecastDialog
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </PageContainer>
  );
}
