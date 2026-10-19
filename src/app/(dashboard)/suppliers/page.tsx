"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Power,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  MapPin,
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
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useUpdateSupplierStatusMutation,
} from "@/lib/redux/services/supplierApi";
import { Supplier } from "@/types/api";
import { toast } from "sonner";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editSupplier, setEditSupplier] = React.useState<Supplier | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");

  const {
    data: suppliersResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetSuppliersQuery({ search: searchTerm.trim() || undefined });

  const [createSupplierMutation, { isLoading: isCreating }] =
    useCreateSupplierMutation();
  const [updateSupplierMutation, { isLoading: isUpdating }] =
    useUpdateSupplierMutation();
  const [updateStatusMutation] = useUpdateSupplierStatusMutation();

  const suppliers = suppliersResponse?.data || [];

  const handleOpenCreate = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      await createSupplierMutation({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      }).unwrap();
      toast.success("Supplier registered successfully");
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to create supplier");
    }
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditSupplier(sup);
    setName(sup.name);
    setEmail(sup.email || "");
    setPhone(sup.phone || "");
    setAddress(sup.address || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSupplier) return;
    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      await updateSupplierMutation({
        id: editSupplier.id,
        body: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
      }).unwrap();
      toast.success("Supplier updated successfully");
      setEditSupplier(null);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to update supplier");
    }
  };

  const handleToggleStatus = async (sup: Supplier) => {
    try {
      await updateStatusMutation({
        id: sup.id,
        isActive: !sup.isActive,
      }).unwrap();
      toast.success(
        `Supplier ${!sup.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message || "Failed to update supplier status");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Suppliers & Vendors"
        description="Maintain vendor directories, contact details, and sourcing contracts for inventory purchasing."
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
              Add Supplier
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Suppliers"
            message="Could not retrieve supplier records from the server."
            onRetry={refetch}
          />
        ) : suppliers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No Suppliers Found"
              description={
                searchTerm
                  ? "No suppliers matched your search criteria."
                  : "Register vendor profiles to link products and place purchase orders."
              }
              action={
                <Button onClick={handleOpenCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Supplier Name</th>
                  <th className="px-6 py-3.5 font-semibold">Contact Info</th>
                  <th className="px-6 py-3.5 font-semibold">Address</th>
                  <th className="px-6 py-3.5 font-semibold">Catalog Items</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {sup.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="space-y-1">
                        {sup.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{sup.email}</span>
                          </div>
                        )}
                        {sup.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{sup.phone}</span>
                          </div>
                        )}
                        {!sup.email && !sup.phone && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {sup.address ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{sup.address}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {sup._count?.products ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sup.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(sup)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          title="Edit Supplier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(sup)}
                          className={`h-8 w-8 p-0 ${
                            sup.isActive
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                              : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          }`}
                          title={sup.isActive ? "Deactivate" : "Activate"}
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
              <Building2 className="h-5 w-5 text-blue-600" />
              Register New Supplier
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="sup-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Supplier Name *
              </label>
              <Input
                id="sup-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Wholesalers Ltd."
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="sup-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Email Address
              </label>
              <Input
                id="sup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@supplier.com"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="sup-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <Input
                id="sup-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-800-555-0199"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="sup-address"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Physical Address
              </label>
              <Input
                id="sup-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Industrial Zone, Block B, Suite 10"
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
                    Registering...
                  </>
                ) : (
                  "Register Supplier"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editSupplier)} onOpenChange={(open) => !open && setEditSupplier(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Edit2 className="h-5 w-5 text-slate-700" />
              Edit Supplier Profile
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="edit-sup-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Supplier Name *
              </label>
              <Input
                id="edit-sup-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-sup-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Email Address
              </label>
              <Input
                id="edit-sup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-sup-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <Input
                id="edit-sup-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-sup-address"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Physical Address
              </label>
              <Input
                id="edit-sup-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditSupplier(null)}
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
