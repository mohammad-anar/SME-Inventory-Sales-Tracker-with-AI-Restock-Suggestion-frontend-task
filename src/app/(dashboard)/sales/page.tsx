"use client";

import * as React from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Receipt,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Ban,
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
  useGetSalesQuery,
  useCreateSaleMutation,
  useVoidSaleMutation,
} from "@/lib/redux/services/salesApi";
import { useGetProductsQuery } from "@/lib/redux/services/productApi";
import { Sale, PaymentMethod } from "@/types/api";
import { toast } from "sonner";

interface CartLine {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
}

export default function SalesPage() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [paymentFilter, setPaymentFilter] = React.useState("");

  const [isPosOpen, setIsPosOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);
  const [saleToVoid, setSaleToVoid] = React.useState<Sale | null>(null);

  const [customerName, setCustomerName] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("CASH");
  const [discountAmount, setDiscountAmount] = React.useState("0");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("");

  const {
    data: salesResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetSalesQuery({
    page,
    limit,
    search: searchTerm.trim() || undefined,
    status: statusFilter || undefined,
    paymentMethod: paymentFilter || undefined,
  });

  const { data: productsResponse } = useGetProductsQuery({ limit: 100 });

  const [createSaleMutation, { isLoading: isCreatingSale }] =
    useCreateSaleMutation();
  const [voidSaleMutation, { isLoading: isVoiding }] = useVoidSaleMutation();

  const sales = salesResponse?.data || [];
  const pagination = salesResponse?.meta;
  const products = productsResponse?.data || [];

  const handleOpenPos = () => {
    setCustomerName("Walk-in Customer");
    setPaymentMethod("CASH");
    setDiscountAmount("0");
    setCart([]);
    setSelectedProductId(products[0]?.id || "");
    setIsPosOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (prod.stockQty <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === prod.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity >= prod.stockQty) {
        toast.error(`Only ${prod.stockQty} units available in stock`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex] = {
        ...existing,
        quantity: existing.quantity + 1,
      };
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          unitPrice: Number(prod.unitPrice),
          availableStock: prod.stockQty,
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.productId !== productId));
      return;
    }
    const item = cart.find((c) => c.productId === productId);
    if (item && qty > item.availableStock) {
      toast.error(`Maximum available stock is ${item.availableStock}`);
      return;
    }
    setCart(
      cart.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((c) => c.productId !== productId));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const discount = Math.min(Number(discountAmount) || 0, subtotal);
  const totalAmount = Math.max(0, subtotal - discount);

  const handleCreateSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Cart is empty. Add at least one item.");
      return;
    }

    try {
      const res = await createSaleMutation({
        customerName: customerName.trim() || undefined,
        paymentMethod,
        discount,
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
        })),
      }).unwrap();

      toast.success(
        `Sale completed! Invoice #${res.data?.invoiceNo || "Generated"}`
      );
      setIsPosOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Transaction failed");
    }
  };

  const handleConfirmVoid = async () => {
    if (!saleToVoid) return;
    try {
      await voidSaleMutation(saleToVoid.id).unwrap();
      toast.success(
        `Sale #${saleToVoid.invoiceNo} voided and stock restored successfully`
      );
      setSaleToVoid(null);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to void transaction");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Point of Sale & Invoices"
        description="Retail checkout processing, automated stock deduction, invoice receipts, and sales ledger."
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
              onClick={handleOpenPos}
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New POS Transaction
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by invoice number, customer name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by payment method"
            >
              <option value="">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
            </select>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPaymentFilter("");
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
          <LoadingState message="Loading sales transactions..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Sales"
            message="Could not retrieve sales transactions from the server."
            onRetry={refetch}
          />
        ) : sales.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ShoppingCart}
              title="No Sales Recorded"
              description={
                searchTerm || statusFilter || paymentFilter
                  ? "No transactions match your search filter."
                  : "Start ringing up customer sales using the Point of Sale system."
              }
              action={
                <Button onClick={handleOpenPos} size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New POS Transaction
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Invoice #</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Subtotal</th>
                  <th className="px-5 py-3.5 font-semibold">Discount</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-blue-600">
                      {sale.invoiceNo}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {sale.customerName || "Walk-in Customer"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      ${Number(sale.subtotal).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      ${Number(sale.discount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ${Number(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {sale.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={sale.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                        {sale.status === "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isVoiding}
                            onClick={() => setSaleToVoid(sale)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Void Sale"
                          >
                            <Ban className="h-4 w-4" />
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

      <Dialog open={isPosOpen} onOpenChange={setIsPosOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Point of Sale (POS) Checkout
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSaleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pos-customer"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Customer Name
                </label>
                <Input
                  id="pos-customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="pos-payment"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Payment Method *
                </label>
                <select
                  id="pos-payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Add Products to Order
              </span>
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Select product to add"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stockQty <= 0}>
                      {p.name} ({p.sku}) — ${Number(p.unitPrice).toFixed(2)} [{p.stockQty} in stock]
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-10 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                Order Items ({cart.length})
              </div>
              {cart.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No items added yet. Choose a product above to add to cart.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ${item.unitPrice.toFixed(2)} each &bull; Max stock: {item.availableStock}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max={item.availableStock}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.productId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-8 w-16 text-center border border-slate-200 rounded text-xs font-bold"
                            aria-label="Quantity"
                          />
                        </div>
                        <span className="w-16 text-right font-black text-slate-900">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.productId)}
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

            <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Discount ($):</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={subtotal}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="h-8 w-24 text-right text-xs"
                />
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due:</span>
                <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPosOpen(false)}
                disabled={isCreatingSale}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingSale || cart.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isCreatingSale ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Sale...
                  </>
                ) : (
                  `Complete Sale ($${totalAmount.toFixed(2)})`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  <span className="text-blue-600">${Number(selectedSale.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={Boolean(saleToVoid)}
        onOpenChange={(open) => !open && setSaleToVoid(null)}
        title={`Void Invoice #${saleToVoid?.invoiceNo || ""}?`}
        description="Are you sure you want to void this sales transaction? All purchased items will be credited back into warehouse inventory."
        confirmLabel="Void Transaction"
        cancelLabel="Keep Active"
        variant="destructive"
        isLoading={isVoiding}
        onConfirm={handleConfirmVoid}
      />
    </PageContainer>
  );
}
