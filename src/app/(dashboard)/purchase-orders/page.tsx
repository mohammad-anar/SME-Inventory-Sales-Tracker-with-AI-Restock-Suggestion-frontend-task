"use client";

import * as React from "react";
import {
  ClipboardList,
  Plus,
  Eye,
  CheckCircle,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Trash2,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
} from "@/lib/redux/services/purchaseOrderApi";
import { useGetSuppliersQuery } from "@/lib/redux/services/supplierApi";
import { useGetProductsQuery } from "@/lib/redux/services/productApi";
import { PurchaseOrder } from "@/types/api";
import { toast } from "sonner";

interface PoLineItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export default function PurchaseOrdersPage() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [statusFilter, setStatusFilter] = React.useState("");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedPo, setSelectedPo] = React.useState<PurchaseOrder | null>(null);
  const [poToReceive, setPoToReceive] = React.useState<PurchaseOrder | null>(null);

  const [supplierId, setSupplierId] = React.useState("");
  const [poNote, setPoNote] = React.useState("");
  const [items, setItems] = React.useState<PoLineItem[]>([]);
  const [addProdId, setAddProdId] = React.useState("");

  const {
    data: poResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetPurchaseOrdersQuery({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const { data: suppliersResponse } = useGetSuppliersQuery();
  const { data: productsResponse } = useGetProductsQuery({ limit: 100 });

  const [createPoMutation, { isLoading: isCreating }] =
    useCreatePurchaseOrderMutation();
  const [receivePoMutation, { isLoading: isReceiving }] =
    useReceivePurchaseOrderMutation();

  const purchaseOrders = poResponse?.data || [];
  const pagination = poResponse?.meta;
  const suppliers = suppliersResponse?.data || [];
  const products = productsResponse?.data || [];

  const handleOpenCreate = () => {
    setSupplierId(suppliers[0]?.id || "");
    setPoNote("");
    setItems([]);
    setAddProdId(products[0]?.id || "");
    setIsCreateOpen(true);
  };

  const handleAddItem = () => {
    if (!addProdId) return;
    const p = products.find((prod) => prod.id === addProdId);
    if (!p) return;

    if (items.some((i) => i.productId === p.id)) {
      toast.error("Item already added to purchase order");
      return;
    }

    setItems([
      ...items,
      {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        quantity: 10,
        unitCost: Number(p.costPrice) || 0,
      },
    ]);
  };

  const handleUpdateItemQty = (prodId: string, qty: number) => {
    setItems(
      items.map((i) => (i.productId === prodId ? { ...i, quantity: qty } : i))
    );
  };

  const handleUpdateItemCost = (prodId: string, cost: number) => {
    setItems(
      items.map((i) => (i.productId === prodId ? { ...i, unitCost: cost } : i))
    );
  };

  const handleRemoveItem = (prodId: string) => {
    setItems(items.filter((i) => i.productId !== prodId));
  };

  const totalPoCost = items.reduce(
    (sum, i) => sum + i.quantity * i.unitCost,
    0
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    try {
      const res = await createPoMutation({
        supplierId,
        note: poNote.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        })),
      }).unwrap();

      toast.success(
        `Purchase Order #${res.data?.poNumber || "Created"} issued successfully`
      );
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to create purchase order");
    }
  };

  const handleConfirmReceive = async () => {
    if (!poToReceive) return;
    try {
      await receivePoMutation(poToReceive.id).unwrap();
      toast.success(
        `Purchase order #${poToReceive.poNumber} received and inventory updated!`
      );
      setPoToReceive(null);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to receive purchase order");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Orders & Replenishment"
        description="Vendor procurement workflow, shipping delivery tracking, and receiving into live stock."
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
              onClick={handleOpenCreate}
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by order status"
            >
              <option value="">All PO Statuses</option>
              <option value="ORDERED">Ordered / In Transit</option>
              <option value="RECEIVED">Received & Stocked</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className="h-10 text-xs"
          >
            Reset Filter
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading purchase orders..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Purchase Orders"
            message="Could not retrieve purchase order history from the server."
            onRetry={refetch}
          />
        ) : purchaseOrders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ClipboardList}
              title="No Purchase Orders Found"
              description="Issue a purchase order to restock low items from your registered suppliers."
              action={
                <Button onClick={handleOpenCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">PO Number</th>
                  <th className="px-5 py-3.5 font-semibold">Supplier</th>
                  <th className="px-5 py-3.5 font-semibold">Total Cost</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Issued Date</th>
                  <th className="px-5 py-3.5 font-semibold">Received Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-blue-600">
                      {po.poNumber}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {po.supplier?.name || "Supplier"}
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900">
                      ${Number(po.totalCost).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {po.receivedAt
                        ? new Date(po.receivedAt).toLocaleDateString()
                        : "Pending"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPo(po)}
                          className="h-8 px-2 text-blue-600 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {po.status === "ORDERED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isReceiving}
                            onClick={() => setPoToReceive(po)}
                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Receive Stock"
                          >
                            <PackageCheck className="h-4 w-4 mr-1" />
                            Receive
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Issue New Purchase Order
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="po-supplier"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Supplier *
              </label>
              <select
                id="po-supplier"
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="po-notes"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Order Note / Instructions (Optional)
              </label>
              <Input
                id="po-notes"
                value={poNote}
                onChange={(e) => setPoNote(e.target.value)}
                placeholder="e.g. Expedited freight delivery"
                className="h-10 text-xs"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Add Line Items
              </span>
              <div className="flex gap-2">
                <select
                  value={addProdId}
                  onChange={(e) => setAddProdId(e.target.value)}
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Select product for purchase order"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Cost: ${Number(p.costPrice).toFixed(2)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="h-10 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                Purchase Order Lines ({items.length})
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No line items added yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          SKU: {item.sku}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItemQty(
                                item.productId,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8 w-16 text-center border border-slate-200 rounded text-xs font-bold"
                            aria-label="Item quantity"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Cost:</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) =>
                              handleUpdateItemCost(
                                item.productId,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 w-20 text-center border border-slate-200 rounded text-xs font-bold"
                            aria-label="Item unit cost"
                          />
                        </div>

                        <span className="w-16 text-right font-black text-slate-900">
                          ${(item.quantity * item.unitCost).toFixed(2)}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Total Purchase Commitment:</span>
              <span className="text-blue-600">${totalPoCost.toFixed(2)}</span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || items.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Issuing Order...
                  </>
                ) : (
                  `Issue Order ($${totalPoCost.toFixed(2)})`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedPo && (
        <Dialog open={!!selectedPo} onOpenChange={() => setSelectedPo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Purchase Order: {selectedPo.poNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-slate-400">Supplier:</span>
                  <p className="font-semibold text-slate-900">
                    {selectedPo.supplier?.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedPo.status} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Issued On:</span>
                  <p className="text-slate-800">
                    {new Date(selectedPo.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Received On:</span>
                  <p className="text-slate-800">
                    {selectedPo.receivedAt
                      ? new Date(selectedPo.receivedAt).toLocaleDateString()
                      : "Pending Delivery"}
                  </p>
                </div>
              </div>

              {selectedPo.note && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700">
                  <span className="font-semibold text-slate-500">Note: </span>
                  {selectedPo.note}
                </div>
              )}

              {selectedPo.items && selectedPo.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                    Ordered Items
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-md">
                    {selectedPo.items.map((i) => (
                      <div
                        key={i.id}
                        className="flex justify-between p-2.5 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {i.product?.name || "Product"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {i.quantity} &times; ${Number(i.unitCost).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 self-center">
                          ${(i.quantity * Number(i.unitCost)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Cost:</span>
                <span className="text-blue-600">${Number(selectedPo.totalCost).toFixed(2)}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={Boolean(poToReceive)}
        onOpenChange={(open) => !open && setPoToReceive(null)}
        title={`Receive PO #${poToReceive?.poNumber || ""}?`}
        description="Are you sure you want to receive this purchase order? All line items will be immediately credited into active warehouse stock and recorded in the audit ledger."
        confirmLabel="Receive Stock"
        cancelLabel="Cancel"
        variant="default"
        isLoading={isReceiving}
        onConfirm={handleConfirmReceive}
      />
    </PageContainer>
  );
}
