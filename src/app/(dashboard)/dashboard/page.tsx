"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  Sparkles,
  ClipboardList,
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
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import {
  useGetDashboardSummaryQuery,
  useGetSalesTrendQuery,
  useGetTopProductsQuery,
} from "@/lib/redux/services/dashboardApi";

export default function DashboardPage() {
  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useGetDashboardSummaryQuery();

  const {
    data: trendResponse,
    isLoading: isTrendLoading,
    refetch: refetchTrend,
  } = useGetSalesTrendQuery({ interval: "day" });

  const {
    data: topProductsResponse,
    isLoading: isTopProductsLoading,
    refetch: refetchTopProducts,
  } = useGetTopProductsQuery({ limit: 5 });

  const summary = summaryResponse?.data;
  const trendData = trendResponse?.data || [];
  const topProducts = topProductsResponse?.data || [];

  const handleRefresh = () => {
    refetchSummary();
    refetchTrend();
    refetchTopProducts();
  };

  if (isSummaryLoading && isTrendLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Executive Dashboard"
          description="Real-time SME inventory valuation, sales velocity, and business performance metrics."
        />
        <LoadingState message="Loading business metrics and financial summaries..." />
      </PageContainer>
    );
  }

  if (isSummaryError) {
    return (
      <PageContainer>
        <PageHeader
          title="Executive Dashboard"
          description="Real-time SME inventory valuation, sales velocity, and business performance metrics."
        />
        <ErrorState
          title="Failed to Load Dashboard"
          message="Could not retrieve dashboard metrics from the server. Ensure the backend server is reachable."
          onRetry={handleRefresh}
        />
      </PageContainer>
    );
  }

  const grossRev = Number(summary?.sales?.grossRevenue ?? 0);
  const totalOrders = summary?.sales?.totalOrders ?? 0;
  const avgOrderValue = Number(summary?.sales?.averageOrderValue ?? 0);
  const lowStockCount = summary?.inventory?.lowStockProducts ?? 0;
  const totalUnits = summary?.inventory?.totalUnitsOnHand ?? 0;
  const invCost = Number(summary?.inventory?.inventoryCostValue ?? 0);

  return (
    <PageContainer>
      <PageHeader
        title="Executive Dashboard"
        description="Real-time SME inventory valuation, sales velocity, and business performance metrics."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isSummaryFetching}
              className="h-9 font-medium"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isSummaryFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button asChild size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Link href="/sales">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Sale
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              ${grossRev.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              From {totalOrders} completed orders
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Order Value
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              ${avgOrderValue.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Average transaction size
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock In Hand
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {totalUnits} units
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Valuation: ${invCost.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {lowStockCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Products below reorder threshold
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Sales Revenue Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Daily turnover and sales volume history
                </p>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Daily Interval
              </span>
            </div>

            <div className="mt-4 h-64 w-full">
              {isTrendLoading ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Loading revenue chart...
                </div>
              ) : trendData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No sales trend data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => val.slice(5)}
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        `$${Number(val || 0).toFixed(2)}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Top Performing Products
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by cumulative revenue and units sold
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-medium">
                <Link href="/products">
                  Catalog
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              {isTopProductsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading top products...
                </div>
              ) : topProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No sales recorded for any product yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-6 py-3 font-semibold">SKU</th>
                      <th className="px-6 py-3 font-semibold">Current Stock</th>
                      <th className="px-6 py-3 font-semibold text-center">Units Sold</th>
                      <th className="px-6 py-3 font-semibold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.map((p) => (
                      <tr key={p.productId} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {p.name}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">{p.sku}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`font-semibold ${
                              p.currentStock <= 5 ? "text-amber-600" : "text-slate-700"
                            }`}
                          >
                            {p.currentStock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-bold text-slate-900">
                          {p.totalQuantitySold}
                        </td>
                        <td className="px-6 py-3.5 text-right font-black text-blue-600">
                          ${Number(p.totalRevenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Operational Actions
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Quick access to core business workflows
            </p>

            <div className="flex flex-col gap-2.5">
              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Link href="/sales">
                  <ShoppingCart className="mr-2.5 h-4 w-4 text-blue-600" />
                  Point of Sale (POS)
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Link href="/ai-restock">
                  <Sparkles className="mr-2.5 h-4 w-4 text-indigo-600" />
                  AI Restock Suggestions
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Link href="/purchase-orders">
                  <ClipboardList className="mr-2.5 h-4 w-4 text-emerald-600" />
                  Create Purchase Order
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-slate-100"
              >
                <Link href="/reports">
                  <TrendingUp className="mr-2.5 h-4 w-4 text-slate-600" />
                  Financial & Inventory Reports
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Inventory Health
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Stock availability and replenishment overview
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-600">Active Catalog Items</span>
                <span className="font-bold text-slate-900">
                  {summary?.inventory?.activeProducts ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-600">Out of Stock Items</span>
                <span
                  className={`font-bold ${
                    (summary?.inventory?.outOfStockProducts ?? 0) > 0
                      ? "text-red-600"
                      : "text-slate-900"
                  }`}
                >
                  {summary?.inventory?.outOfStockProducts ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-600">Pending Purchase Orders</span>
                <span className="font-bold text-blue-600">
                  {summary?.purchases?.orderedOrdersCount ?? 0} orders
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-600">Committed PO Cost</span>
                <span className="font-bold text-slate-900">
                  ${Number(summary?.purchases?.committedCost ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
