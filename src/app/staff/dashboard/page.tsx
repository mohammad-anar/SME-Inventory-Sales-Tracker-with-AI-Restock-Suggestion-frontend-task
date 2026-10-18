"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/redux/hooks";
import { useGetSalesQuery } from "@/lib/redux/services/salesApi";
import {
  useGetProductsQuery,
  useGetLowStockProductsQuery,
} from "@/lib/redux/services/productApi";

export default function StaffDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  const {
    data: salesResponse,
    isLoading: isSalesLoading,
  } = useGetSalesQuery({ limit: 10 });

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
  } = useGetProductsQuery({ limit: 5 });

  const {
    data: lowStockResponse,
    isLoading: isLowStockLoading,
  } = useGetLowStockProductsQuery();

  const salesList = salesResponse?.data || [];
  const lowStockList = lowStockResponse?.data || [];
  const totalProducts =
    productsResponse?.meta?.total ?? productsResponse?.data?.length ?? 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySales = salesList.filter(
    (s) => s.status === "COMPLETED" && s.createdAt.startsWith(todayStr)
  );

  const todayCount = todaySales.length;
  const todayTotal = todaySales.reduce(
    (acc, s) => acc + Number(s.totalAmount || 0),
    0
  );

  return (
    <PageContainer>
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-blue-500/30 px-3 py-1 text-xs font-medium backdrop-blur-sm border border-white/10 mb-3">
              Staff Sales Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Staff Member"}!
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-blue-100">
              Manage live retail sales, lookup product inventory, and monitor
              daily transactions securely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-sm font-semibold h-10 px-4"
            >
              <Link href="/sales">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Sale
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-medium h-10 px-4"
            >
              <Link href="/products">
                <Search className="mr-2 h-4 w-4" />
                Find Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s Sales Count
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isSalesLoading ? "--" : todayCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Completed invoices today</p>
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
              {isSalesLoading ? "--" : `$${todayTotal.toFixed(2)}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Total gross volume today</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catalog Products
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {isProductsLoading ? "--" : totalProducts}
            </div>
            <p className="mt-1 text-xs text-slate-500">Available SKU catalog</p>
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
            <p className="mt-1 text-xs text-slate-500">At or below reorder level</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Recent Sales Orders
              </h3>
              <p className="text-xs text-slate-500">
                Transactions processed through the system
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs font-medium">
              <Link href="/sales">
                View All
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            {isSalesLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading sales data...
              </div>
            ) : salesList.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No recent sales recorded yet.
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
                  {salesList.slice(0, 6).map((sale) => (
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

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Quick Shortcuts
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Frequent tasks for staff workflows
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
                <Link href="/products">
                  <Search className="mr-2.5 h-4 w-4 text-indigo-600" />
                  Search & Lookup Product SKU
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="justify-start h-11 text-xs font-semibold border-slate-200 hover:bg-slate-100"
              >
                <Link href="/profile">
                  <User className="mr-2.5 h-4 w-4 text-slate-600" />
                  Manage My Profile & Password
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
                  Read-only inventory alerts
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
