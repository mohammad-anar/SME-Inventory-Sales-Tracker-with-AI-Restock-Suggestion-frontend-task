"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Search,
  User,
  Receipt,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  useGetStaffSalesSummaryQuery,
  useGetStaffSalesQuery,
  useGetStaffActivitiesQuery,
} from "@/lib/redux/services/staffApi";
import { useGetLowStockProductsQuery } from "@/lib/redux/services/productApi";

export default function StaffDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
  } = useGetStaffSalesSummaryQuery();

  const {
    data: salesResponse,
    isLoading: isSalesLoading,
  } = useGetStaffSalesQuery({ limit: 5 });

  const {
    data: activitiesResponse,
    isLoading: isActivitiesLoading,
  } = useGetStaffActivitiesQuery({ limit: 5 });

  const {
    data: lowStockResponse,
    isLoading: isLowStockLoading,
  } = useGetLowStockProductsQuery();

  const summary = summaryResponse?.data;
  const recentSales = salesResponse?.data || [];
  const recentActivities = activitiesResponse?.data || [];
  const lowStockList = lowStockResponse?.data || [];

  return (
    <PageContainer>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 mb-2">
              Staff Portal &bull; Live Operations
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name || "Staff Member"}!
            </h1>
            <p className="mt-1 max-w-xl text-xs text-slate-500">
              Manage live retail sales transactions, review your sales history, and monitor real-time stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold h-9 px-4 text-xs"
            >
              <Link href="/sales">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                New Sale
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-9 px-4 text-xs"
            >
              <Link href="/staff/sales">
                <Receipt className="mr-1.5 h-4 w-4" />
                My Sales
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s Sales
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isSummaryLoading ? "--" : summary?.todaySalesCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">Orders completed today</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isSummaryLoading
                ? "--"
                : `$${Number(summary?.todaySalesTotal ?? 0).toFixed(2)}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Gross volume generated</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Completed
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isSummaryLoading ? "--" : summary?.completedSalesCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">All-time lifetime orders</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low-Stock Items
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {isLowStockLoading ? "--" : lowStockList.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">Items requiring restock</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  My Recent Sales
                </h3>
                <p className="text-xs text-slate-500">
                  Transactions completed under your staff login
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-medium">
                <Link href="/staff/sales">
                  View All
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              {isSalesLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading your sales data...
                </div>
              ) : recentSales.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No sales recorded under your account yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Invoice #</th>
                      <th className="px-6 py-3 font-semibold">Customer</th>
                      <th className="px-6 py-3 font-semibold">Total</th>
                      <th className="px-6 py-3 font-semibold">Payment</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-semibold text-blue-600">
                          {sale.invoiceNo}
                        </td>
                        <td className="px-6 py-3.5 text-slate-700">
                          {sale.customerName || "Walk-in Customer"}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-900">
                          ${Number(sale.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {sale.paymentMethod}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={sale.status} />
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Recent Activities
                </h3>
                <p className="text-xs text-slate-500">
                  Audit events recorded from your operations
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-medium">
                <Link href="/staff/activities">
                  View Timeline
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="p-6">
              {isActivitiesLoading ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Loading activity log...
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No recorded activities yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            {act.type.replace("_", " ")}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            &bull; {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          {act.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Quick Shortcuts
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Frequent actions for staff members
            </p>

            <div className="flex flex-col gap-2.5">
              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Link href="/sales">
                  <PlusCircle className="mr-2.5 h-4 w-4 text-blue-600" />
                  New POS Sale Transaction
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Link href="/staff/sales">
                  <Receipt className="mr-2.5 h-4 w-4 text-indigo-600" />
                  My Sales Invoices & Receipts
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Link href="/staff/activities">
                  <Activity className="mr-2.5 h-4 w-4 text-emerald-600" />
                  View Activity Audit Trail
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-amber-50 hover:text-amber-700"
              >
                <Link href="/products">
                  <Search className="mr-2.5 h-4 w-4 text-amber-600" />
                  Lookup Product Inventory
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-slate-100"
              >
                <Link href="/profile">
                  <User className="mr-2.5 h-4 w-4 text-slate-600" />
                  Manage Profile & Password
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Low-Stock Attention
                </h3>
                <p className="text-xs text-slate-500">
                  Inventory items below reorder level
                </p>
              </div>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>

            {isLowStockLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Checking inventory levels...
              </div>
            ) : lowStockList.length === 0 ? (
              <div className="py-6 text-center text-xs text-emerald-600 font-medium">
                All inventory items are well-stocked.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockList.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="truncate font-semibold text-slate-800">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-red-600">
                        {product.stockQty} in stock
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Reorder at {product.reorderLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
