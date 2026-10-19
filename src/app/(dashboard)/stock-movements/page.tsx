"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetStockMovementsQuery,
  useAdjustStockMutation,
} from "@/lib/redux/services/stockMovementApi";
import { useGetProductsQuery } from "@/lib/redux/services/productApi";
import { toast } from "sonner";

export default function StockMovementsPage() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(15);
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");

  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [adjustProductId, setAdjustProductId] = React.useState("");
  const [adjustQtyChange, setAdjustQtyChange] = React.useState("0");
  const [adjustNote, setAdjustNote] = React.useState("");

  const {
    data: movementsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetStockMovementsQuery({
    page,
    limit,
    productId: selectedProductId || undefined,
    type: typeFilter || undefined,
  });

  const { data: productsResponse } = useGetProductsQuery({ limit: 100 });
  const [adjustStockMutation, { isLoading: isAdjusting }] =
    useAdjustStockMutation();

  const movements = movementsResponse?.data || [];
  const pagination = movementsResponse?.meta;
  const products = productsResponse?.data || [];

  const handleOpenAdjust = () => {
    setAdjustProductId(products[0]?.id || "");
    setAdjustQtyChange("0");
    setAdjustNote("");
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) {
      toast.error("Please select a product");
      return;
    }
    const qty = parseInt(adjustQtyChange, 10);
    if (isNaN(qty) || qty === 0) {
      toast.error("Quantity change must be a non-zero integer");
      return;
    }

    try {
      await adjustStockMutation({
        productId: adjustProductId,
        quantityChange: qty,
        note: adjustNote.trim() || undefined,
      }).unwrap();

      toast.success("Stock adjustment successfully recorded in audit ledger");
      setIsAdjustOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to adjust stock");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Stock Movement Ledger"
        description="Immutable audit trail recording every inventory increment, sales depletion, reversal, and manual reconciliation."
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
              onClick={handleOpenAdjust}
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Manual Stock Adjustment
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by product"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by movement type"
            >
              <option value="">All Movement Types</option>
              <option value="PURCHASE_RECEIVE">Purchase Order Intake</option>
              <option value="SALE">Retail POS Sale</option>
              <option value="SALE_VOID">Sale Void Reversal</option>
              <option value="ADJUSTMENT_IN">Manual Stock Addition</option>
              <option value="ADJUSTMENT_OUT">Manual Stock Deduction</option>
            </select>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedProductId("");
                setTypeFilter("");
                setPage(1);
              }}
              className="h-10 w-full text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading inventory movement ledger..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Ledger"
            message="Could not retrieve stock movement history."
            onRetry={refetch}
          />
        ) : movements.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ArrowLeftRight}
              title="No Movement Records Found"
              description="Inventory movements are automatically recorded when purchases are received, sales completed, or manual adjustments applied."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">Movement Type</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Qty Change</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Resulting Stock</th>
                  <th className="px-5 py-3.5 font-semibold">Reference</th>
                  <th className="px-5 py-3.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => {
                  const isPositive = m.quantityChange > 0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">
                          {m.product?.name || "Product"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          SKU: {m.product?.sku}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={m.type} />
                      </td>
                      <td className="px-5 py-3.5 text-center font-black">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs ${
                            isPositive
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-rose-700 bg-rose-50"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                        {m.balanceAfter}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">
                        {m.reference || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                        {m.note || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-600">
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

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              Manual Stock Adjustment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="adj-prod"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Select Product *
              </label>
              <select
                id="adj-prod"
                required
                value={adjustProductId}
                onChange={(e) => setAdjustProductId(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Current Stock: {p.stockQty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="adj-qty"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Quantity Change (+ for addition, - for deduction) *
              </label>
              <Input
                id="adj-qty"
                type="number"
                required
                value={adjustQtyChange}
                onChange={(e) => setAdjustQtyChange(e.target.value)}
                placeholder="e.g. 5 or -2"
                className="h-10 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label
                htmlFor="adj-note"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Audit Reason / Note *
              </label>
              <Input
                id="adj-note"
                required
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="e.g. Physical inventory audit discrepancy, damaged goods"
                className="h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustOpen(false)}
                disabled={isAdjusting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdjusting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isAdjusting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording Adjustment...
                  </>
                ) : (
                  "Apply Adjustment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
