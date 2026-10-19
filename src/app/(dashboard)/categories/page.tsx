"use client";

import * as React from "react";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Power,
  RefreshCw,
  Loader2,
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
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
} from "@/lib/redux/services/categoryApi";
import { Category } from "@/types/api";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const {
    data: categoriesResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetCategoriesQuery({ search: searchTerm.trim() || undefined });

  const [createCategoryMutation, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategoryMutation, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [updateStatusMutation] = useUpdateCategoryStatusMutation();

  const categories = categoriesResponse?.data || [];

  const handleOpenCreate = () => {
    setName("");
    setDescription("");
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await createCategoryMutation({
        name: name.trim(),
        description: description.trim() || undefined,
      }).unwrap();
      toast.success("Category created successfully");
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to create category");
    }
  };

  const handleOpenEdit = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await updateCategoryMutation({
        id: editCategory.id,
        body: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      }).unwrap();
      toast.success("Category updated successfully");
      setEditCategory(null);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to update category");
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    try {
      await updateStatusMutation({
        id: cat.id,
        isActive: !cat.isActive,
      }).unwrap();
      toast.success(
        `Category ${!cat.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to update category status");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Product Categories"
        description="Organize and structure your product inventory into searchable commercial taxonomies."
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
              Add Category
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={4} rows={6} />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Categories"
            message="Could not retrieve categories from the server."
            onRetry={refetch}
          />
        ) : categories.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderTree}
              title="No Categories Configured"
              description={
                searchTerm
                  ? "No categories matched your search term."
                  : "Start creating categories to organize and catalog your products."
              }
              action={
                <Button onClick={handleOpenCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Category Name</th>
                  <th className="px-6 py-3.5 font-semibold">Description</th>
                  <th className="px-6 py-3.5 font-semibold">Products Linked</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-sm truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {cat._count?.products ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={cat.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(cat)}
                          className={`h-8 w-8 p-0 ${
                            cat.isActive
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                              : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          }`}
                          title={cat.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FolderTree className="h-5 w-5 text-blue-600" />
              Add New Category
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="cat-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Category Name *
              </label>
              <Input
                id="cat-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Beverages, Electronics"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="cat-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Description (Optional)
              </label>
              <Input
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief category summary"
                className="h-10 text-xs"
              />
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
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editCategory)} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Edit2 className="h-5 w-5 text-slate-700" />
              Edit Category
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="edit-cat-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Category Name *
              </label>
              <Input
                id="edit-cat-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-cat-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Description (Optional)
              </label>
              <Input
                id="edit-cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditCategory(null)}
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
