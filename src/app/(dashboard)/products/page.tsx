"use client";

import * as React from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Power,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/Skeletons";
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
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
} from "@/lib/redux/services/productApi";
import { useGetCategoriesQuery } from "@/lib/redux/services/categoryApi";
import { useGetSuppliersQuery } from "@/lib/redux/services/supplierApi";
import { Product } from "@/types/api";
import { toast } from "sonner";

export default function ProductsPage() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [stockStatusFilter, setStockStatusFilter] = React.useState("");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);

  const [formSku, setFormSku] = React.useState("");
  const [formName, setFormName] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formBarcode, setFormBarcode] = React.useState("");
  const [formCategoryId, setFormCategoryId] = React.useState("");
  const [formSupplierId, setFormSupplierId] = React.useState("");
  const [formUnitPrice, setFormUnitPrice] = React.useState("");
  const [formCostPrice, setFormCostPrice] = React.useState("");
  const [formReorderLevel, setFormReorderLevel] = React.useState("10");
  const [formStockQty, setFormStockQty] = React.useState("0");

  const {
    data: productsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetProductsQuery({
    page,
    limit,
    search: searchTerm.trim() || undefined,
    categoryId: categoryFilter || undefined,
    stockStatus: stockStatusFilter || undefined,
  });

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const { data: suppliersResponse } = useGetSuppliersQuery();

  const [createProductMutation, { isLoading: isCreating }] =
    useCreateProductMutation();
  const [updateProductMutation, { isLoading: isUpdating }] =
    useUpdateProductMutation();
  const [updateStatusMutation] = useUpdateProductStatusMutation();

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.meta;
  const categories = categoriesResponse?.data || [];
  const suppliers = suppliersResponse?.data || [];

  const handleOpenCreate = () => {
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormName("");
    setFormDescription("");
    setFormBarcode("");
    setFormCategoryId(categories[0]?.id || "");
    setFormSupplierId(suppliers[0]?.id || "");
    setFormUnitPrice("");
    setFormCostPrice("");
    setFormReorderLevel("10");
    setFormStockQty("0");
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formName.trim() || !formCategoryId || !formSupplierId) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      await createProductMutation({
        sku: formSku.trim(),
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        barcode: formBarcode.trim() || undefined,
        categoryId: formCategoryId,
        supplierId: formSupplierId,
        unitPrice: Number(formUnitPrice) || 0,
        costPrice: Number(formCostPrice) || 0,
        reorderLevel: Number(formReorderLevel) || 10,
        stockQty: Number(formStockQty) || 0,
      }).unwrap();
      toast.success("Product created successfully");
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to create product");
    }
  };

  const handleOpenEdit = (prod: Product) => {
    setEditProduct(prod);
    setFormSku(prod.sku);
    setFormName(prod.name);
    setFormDescription(prod.description || "");
    setFormBarcode(prod.barcode || "");
    setFormCategoryId(prod.categoryId);
    setFormSupplierId(prod.supplierId);
    setFormUnitPrice(String(prod.unitPrice));
    setFormCostPrice(String(prod.costPrice));
    setFormReorderLevel(String(prod.reorderLevel));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;

    try {
      await updateProductMutation({
        id: editProduct.id,
        body: {
          sku: formSku.trim(),
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          barcode: formBarcode.trim() || undefined,
          categoryId: formCategoryId,
          supplierId: formSupplierId,
          unitPrice: Number(formUnitPrice) || 0,
          costPrice: Number(formCostPrice) || 0,
          reorderLevel: Number(formReorderLevel) || 10,
        },
      }).unwrap();
      toast.success("Product updated successfully");
      setEditProduct(null);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to update product");
    }
  };

  const handleToggleStatus = async (prod: Product) => {
    try {
      await updateStatusMutation({
        id: prod.id,
        isActive: !prod.isActive,
      }).unwrap();
      toast.success(
        `Product ${!prod.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to update product status");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Product Inventory"
        description="Comprehensive SKU catalog, retail pricing, cost valuations, and reorder threshold management."
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
              Add Product
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by product name, SKU, barcode..."
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
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Filter by stock status"
            >
              <option value="">All Stock Levels</option>
              <option value="low-stock">Low Stock Alerts</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
                setStockStatusFilter("");
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
          <TableSkeleton columns={8} rows={7} />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Products"
            message="Could not retrieve products from the database."
            onRetry={refetch}
          />
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Package}
              title="No Products Found"
              description={
                searchTerm || categoryFilter || stockStatusFilter
                  ? "No products match your selected filter criteria."
                  : "Begin populating your store catalog by creating your first product."
              }
              action={
                <Button onClick={handleOpenCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 font-semibold">Reorder Lvl</th>
                  <th className="px-5 py-3.5 font-semibold">Cost Price</th>
                  <th className="px-5 py-3.5 font-semibold">Retail Price</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const isOutOfStock = prod.stockQty <= 0;
                  const isLowStock = !isOutOfStock && prod.stockQty <= prod.reorderLevel;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[11px] text-slate-400">
                          SKU: {prod.sku} {prod.barcode ? `• Barcode: ${prod.barcode}` : ""}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {prod.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-slate-900"
                            }`}
                          >
                            {prod.stockQty}
                          </span>
                          {isLowStock && (
                            <span title="Low Stock Alert">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {prod.reorderLevel}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        ${Number(prod.costPrice).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-600">
                        ${Number(prod.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={prod.isActive ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(prod)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(prod)}
                            className={`h-8 w-8 p-0 ${
                              prod.isActive
                                ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                            title={prod.isActive ? "Deactivate" : "Activate"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Package className="h-5 w-5 text-blue-600" />
              Add Product to Catalog
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="prod-sku"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  SKU Code *
                </label>
                <Input
                  id="prod-sku"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-barcode"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Barcode (Optional)
                </label>
                <Input
                  id="prod-barcode"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  placeholder="e.g. 789123456789"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prod-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Product Name *
              </label>
              <Input
                id="prod-name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Ultra HD Monitor 27-inch"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="prod-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Description (Optional)
              </label>
              <Input
                id="prod-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Product description and specifications"
                className="h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="prod-cat"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="prod-cat"
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="prod-sup"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Supplier *
                </label>
                <select
                  id="prod-sup"
                  required
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="prod-cost"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cost Price *
                </label>
                <Input
                  id="prod-cost"
                  type="number"
                  step="0.01"
                  required
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-unit"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Retail Price *
                </label>
                <Input
                  id="prod-unit"
                  type="number"
                  step="0.01"
                  required
                  value={formUnitPrice}
                  onChange={(e) => setFormUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-reorder"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Reorder Level
                </label>
                <Input
                  id="prod-reorder"
                  type="number"
                  value={formReorderLevel}
                  onChange={(e) => setFormReorderLevel(e.target.value)}
                  placeholder="10"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-opening-stock"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Opening Stock
                </label>
                <Input
                  id="prod-opening-stock"
                  type="number"
                  value={formStockQty}
                  onChange={(e) => setFormStockQty(e.target.value)}
                  placeholder="0"
                  className="h-10 text-xs"
                />
              </div>
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
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editProduct)} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Edit2 className="h-5 w-5 text-slate-700" />
              Edit Product Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-prod-sku"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  SKU Code *
                </label>
                <Input
                  id="edit-prod-sku"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-prod-barcode"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Barcode (Optional)
                </label>
                <Input
                  id="edit-prod-barcode"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-prod-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Product Name *
              </label>
              <Input
                id="edit-prod-name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-prod-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Description (Optional)
              </label>
              <Input
                id="edit-prod-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-prod-cat"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="edit-prod-cat"
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-prod-sup"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Supplier *
                </label>
                <select
                  id="edit-prod-sup"
                  required
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="edit-prod-cost"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cost Price *
                </label>
                <Input
                  id="edit-prod-cost"
                  type="number"
                  step="0.01"
                  required
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-prod-unit"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Retail Price *
                </label>
                <Input
                  id="edit-prod-unit"
                  type="number"
                  step="0.01"
                  required
                  value={formUnitPrice}
                  onChange={(e) => setFormUnitPrice(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-prod-reorder"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Reorder Level
                </label>
                <Input
                  id="edit-prod-reorder"
                  type="number"
                  value={formReorderLevel}
                  onChange={(e) => setFormReorderLevel(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditProduct(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
