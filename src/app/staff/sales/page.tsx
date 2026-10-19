"use client";

import * as React from "react";
import {
  Search,
  ShoppingCart,
  Receipt,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeletons";
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
import { useGetStaffSalesQuery } from "@/lib/redux/services/staffApi";
import { Sale } from "@/types/api";

export default function StaffSalesPage() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);

  const { data: salesResponse, isLoading, isError, refetch } = useGetStaffSalesQuery({
    page,
    limit,
    search: search.trim() ? search.trim() : undefined,
    status: status ? status : undefined,
    paymentMethod: paymentMethod ? paymentMethod : undefined,
  });

  const sales = salesResponse?.data || [];
  const pagination = salesResponse?.meta;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPaymentMethod("");
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Sales Records"
        description="View and verify transactions and receipts created from your staff account."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        >
          <div className="relative sm:col-span-2">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by invoice number..."
              className="h-10 pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by sale status"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>

          <div>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by payment method"
            >
              <option value="">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Credit/Debit Card</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="h-10 flex-1 text-xs font-semibold">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              className="h-10 text-xs"
            >
              Reset
            </Button>
          </div>
        </form>

        {isLoading ? (
          <TableSkeleton columns={6} rows={6} />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Sales"
            message="Could not retrieve your sales transactions. Please try again."
            onRetry={refetch}
          />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No Sales Transactions Found"
            description="You have not recorded any sales matching the selected filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Subtotal</th>
                  <th className="px-4 py-3 font-semibold">Discount</th>
                  <th className="px-4 py-3 font-semibold">Total Paid</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-bold text-blue-600">
                      {sale.invoiceNo}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {sale.customerName || "Walk-in Customer"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      ${Number(sale.subtotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      ${Number(sale.discount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ${Number(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {sale.paymentMethod}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={sale.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSale(sale)}
                        className="h-8 px-2 text-blue-600 hover:text-blue-700"
                        title="View Receipt"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-600">
            <div>
              Showing page <span className="font-semibold">{pagination.page}</span> of{" "}
              <span className="font-semibold">{pagination.totalPage}</span> ({pagination.total} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="h-8 px-3"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPage}
                onClick={() => setPage((prev) => prev + 1)}
                className="h-8 px-3"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Receipt className="h-5 w-5 text-blue-600" />
                Invoice Receipt: {selectedSale.invoiceNo}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-slate-400">Date:</span>
                  <p className="font-medium text-slate-800">
                    {new Date(selectedSale.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Customer:</span>
                  <p className="font-medium text-slate-800">
                    {selectedSale.customerName || "Walk-in Customer"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Payment:</span>
                  <p className="font-medium text-slate-800">
                    {selectedSale.paymentMethod}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedSale.status} />
                  </div>
                </div>
              </div>

              {selectedSale.items && selectedSale.items.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                    Purchased Items
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-md">
                    {selectedSale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between p-2.5 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.product?.name || "Product Item"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} &times; ${Number(item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 self-center">
                          ${Number(item.lineTotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${Number(selectedSale.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Discount:</span>
                  <span>-${Number(selectedSale.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span>${Number(selectedSale.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
}
