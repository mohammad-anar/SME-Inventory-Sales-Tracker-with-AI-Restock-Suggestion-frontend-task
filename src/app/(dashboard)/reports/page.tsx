"use client";

import * as React from "react";
import {
  BarChart3,
  DollarSign,
  Package,
  TrendingUp,
  RefreshCw,
  Download,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useGetInventoryValuationQuery } from "@/lib/redux/services/reportsApi";
import { useGetCategoriesQuery } from "@/lib/redux/services/categoryApi";
import { toast } from "sonner";

export default function ReportsPage() {
  const [categoryId, setCategoryId] = React.useState("");

  const {
    data: reportResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetInventoryValuationQuery({
    categoryId: categoryId || undefined,
  });

  const { data: categoriesResponse } = useGetCategoriesQuery();

  const report = reportResponse?.data;
  const categories = categoriesResponse?.data || [];
  const items = report?.items || [];

  const handleExportCsv = () => {
    if (!items.length) {
      toast.error("No valuation data to export");
      return;
    }

    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Stock Units",
      "Cost Price",
      "Retail Price",
      "Total Cost Value",
      "Total Retail Value",
      "Potential Margin",
    ];

    const rows = items.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.stockQty,
      Number(i.costPrice).toFixed(2),
      Number(i.unitPrice).toFixed(2),
      Number(i.totalCostValue).toFixed(2),
      Number(i.totalRetailValue).toFixed(2),
      Number(i.potentialMargin).toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `stockpilot_inventory_valuation_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Valuation report exported as CSV");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Valuation & Accounting"
        description="Comprehensive asset balance reporting, cost basis evaluation, and potential gross profit margin analysis."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 font-medium"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={handleExportCsv}
              size="sm"
              variant="outline"
              className="h-9 font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Units On Hand
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? "--" : report?.totalUnitsOnHand ?? 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">Physical units in stock</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inventory Cost Basis
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoading
                ? "--"
                : `$${Number(report?.inventoryCostValue ?? 0).toFixed(2)}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Total capital invested</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Retail Realization
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              {isLoading
                ? "--"
                : `$${Number(report?.inventoryRetailValue ?? 0).toFixed(2)}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Projected sales volume</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unrealized Gross Margin
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-indigo-600">
              {isLoading
                ? "--"
                : `$${Number(report?.unrealizedMargin ?? 0).toFixed(2)}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Projected inventory profit</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">
            Filter by Category:
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Filter report by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingState message="Aggregating inventory asset balances..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Valuation Report"
            message="Could not retrieve valuation calculations."
            onRetry={refetch}
          />
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BarChart3}
              title="No Inventory Valuation Data"
              description="Add products and record stock to generate detailed valuation reports."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">SKU</th>
                  <th className="px-5 py-3.5 font-semibold">Product Name</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Units on Hand</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Cost Price</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Retail Price</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Total Cost</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Total Retail</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Potential Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {i.sku}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {i.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{i.category}</td>
                    <td className="px-5 py-3.5 text-center font-black text-slate-900">
                      {i.stockQty}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">
                      ${Number(i.costPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                      ${Number(i.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      ${Number(i.totalCostValue).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-blue-600">
                      ${Number(i.totalRetailValue).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-emerald-600">
                      ${Number(i.potentialMargin).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
