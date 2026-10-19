"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Eye,
  Edit2,
  Power,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetUsersQuery,
  useCreateStaffMutation,
  useGenerateSetupTokenMutation,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
  useGetAdminStaffSalesQuery,
  useGetAdminStaffActivitiesQuery,
} from "@/lib/redux/services/usersApi";
import { StaffUser } from "@/types/api";
import { toast } from "sonner";

export default function AdminStaffManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const queryParams = React.useMemo(() => {
    const params: { search?: string; isActive?: boolean } = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (statusFilter === "ACTIVE") {
      params.isActive = true;
    } else if (statusFilter === "INACTIVE") {
      params.isActive = false;
    }
    return params;
  }, [searchTerm, statusFilter]);

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery(queryParams);

  const [createStaffMutation, { isLoading: isCreating }] = useCreateStaffMutation();
  const [generateSetupTokenMutation, { isLoading: isGeneratingToken }] = useGenerateSetupTokenMutation();
  const [updateUserStatusMutation, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [updateUserMutation, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createEmail, setCreateEmail] = React.useState("");
  const [createPhone, setCreatePhone] = React.useState("");
  const [createError, setCreateError] = React.useState<string | null>(null);

  const [shareLinkData, setShareLinkData] = React.useState<{
    staffName: string;
    staffEmail: string;
    setupUrl: string;
    expiresAt?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const [editUser, setEditUser] = React.useState<StaffUser | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");

  const [statusConfirmUser, setStatusConfirmUser] = React.useState<StaffUser | null>(null);

  const [detailsUser, setDetailsUser] = React.useState<StaffUser | null>(null);
  const [detailsTab, setDetailsTab] = React.useState<"OVERVIEW" | "SALES" | "ACTIVITIES">("OVERVIEW");

  const users = usersResponse?.data || [];

  const stats = React.useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    const totalSales = users.reduce((acc, u) => acc + (u._count?.sales || 0), 0);
    return { total, active, inactive, totalSales };
  }, [users]);

  const handleOpenCreate = () => {
    setCreateName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createName.trim()) {
      setCreateError("Staff full name is required.");
      return;
    }
    if (!createEmail.trim()) {
      setCreateError("Staff email address is required.");
      return;
    }

    try {
      const response = await createStaffMutation({
        name: createName.trim(),
        email: createEmail.trim().toLowerCase(),
        phone: createPhone.trim() ? createPhone.trim() : null,
      }).unwrap();

      if (response.success && response.data) {
        setIsCreateOpen(false);
        setShareLinkData({
          staffName: response.data.user.name,
          staffEmail: response.data.user.email,
          setupUrl: response.data.setupUrl,
          expiresAt: response.data.expiresAt,
        });
        toast.success(`Staff account for ${response.data.user.name} created successfully!`);
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      const msg =
        apiErr?.data?.message ||
        apiErr?.message ||
        "Failed to create staff account. Please check the email and try again.";
      setCreateError(msg);
      toast.error(msg);
    }
  };

  const handleCopyLink = () => {
    if (shareLinkData?.setupUrl) {
      navigator.clipboard.writeText(shareLinkData.setupUrl);
      setCopiedLink(true);
      toast.success("Account setup link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleGenerateFreshLink = async (user: StaffUser) => {
    try {
      const res = await generateSetupTokenMutation(user.id).unwrap();
      if (res.success && res.data) {
        setShareLinkData({
          staffName: user.name,
          staffEmail: user.email,
          setupUrl: res.data.setupUrl,
          expiresAt: res.data.expiresAt,
        });
        toast.success(`Generated fresh setup link for ${user.name}`);
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      toast.error(apiErr?.data?.message || "Failed to generate setup link.");
    }
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const res = await updateUserMutation({
        id: editUser.id,
        body: {
          name: editName.trim(),
          phone: editPhone.trim() ? editPhone.trim() : null,
        },
      }).unwrap();

      if (res.success) {
        toast.success("Staff profile updated successfully");
        setEditUser(null);
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      toast.error(apiErr?.data?.message || "Failed to update staff member");
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirmUser) return;
    const newStatus = !statusConfirmUser.isActive;

    try {
      const res = await updateUserStatusMutation({
        id: statusConfirmUser.id,
        payload: { isActive: newStatus },
      }).unwrap();

      if (res.success) {
        toast.success(
          `Staff account ${newStatus ? "activated" : "deactivated"} successfully`
        );
        setStatusConfirmUser(null);
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      toast.error(apiErr?.data?.message || "Failed to update account status");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Staff Management"
        description="Admin console for creating staff accounts, generating secure onboarding credentials, and managing role-based access."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 font-medium"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="h-9 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create Staff Account
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Staff
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {stats.total}
            </span>
            <span className="ml-2 text-xs font-medium text-slate-500">team accounts</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Accounts
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              {stats.active}
            </span>
            <span className="ml-2 text-xs font-medium text-slate-500">operational</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deactivated / Inactive
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-700">
              {stats.inactive}
            </span>
            <span className="ml-2 text-xs font-medium text-slate-500">blocked access</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sales Processed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {stats.totalSales}
            </span>
            <span className="ml-2 text-xs font-medium text-slate-500">lifetime receipts</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by staff name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-emerald-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("INACTIVE")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === "INACTIVE"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No Staff Accounts Found"
              description={
                searchTerm || statusFilter !== "ALL"
                  ? "No staff members matched your filter criteria."
                  : "No staff accounts have been created yet. Create a staff account to invite team members."
              }
              action={
                <Button onClick={handleOpenCreate} size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Staff Account
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3">Staff Member</th>
                  <th scope="col" className="px-3 py-3.5">Role</th>
                  <th scope="col" className="px-3 py-3.5">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-center">Sales Processed</th>
                  <th scope="col" className="px-3 py-3.5">Joined Date</th>
                  <th scope="col" className="px-3 py-3.5">Last Active</th>
                  <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((staff) => {
                  const initials = staff.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 bg-slate-100">
                            <AvatarFallback className="text-xs font-bold text-slate-700">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {staff.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="truncate">{staff.email}</span>
                              {staff.phone && (
                                <>
                                  <span>&bull;</span>
                                  <span>{staff.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${
                            staff.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {staff.role}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge
                          status={staff.isActive ? "ACTIVE" : "INACTIVE"}
                        />
                      </td>

                      <td className="px-3 py-4 text-center">
                        <span className="font-semibold text-slate-800">
                          {staff._count?.sales ?? 0}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(staff.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-3 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {staff.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>
                              {new Date(staff.lastLoginAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              {new Date(staff.lastLoginAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400">Never logged in</span>
                        )}
                      </td>

                      <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDetailsUser(staff);
                              setDetailsTab("OVERVIEW");
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="View Staff Details"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Details</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(staff)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          {staff.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerateFreshLink(staff)}
                              disabled={isGeneratingToken}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Generate New Setup Link"
                            >
                              <KeyRound className="h-4 w-4" />
                              <span className="sr-only">Setup Link</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusConfirmUser(staff)}
                            className={`h-8 w-8 p-0 ${
                              staff.isActive
                                ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                            title={staff.isActive ? "Deactivate Account" : "Activate Account"}
                          >
                            <Power className="h-4 w-4" />
                            <span className="sr-only">
                              {staff.isActive ? "Deactivate" : "Activate"}
                            </span>
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
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Create Staff Account
            </DialogTitle>
            <DialogDescription>
              Provision a new staff account. Role is strictly assigned as STAFF. You will receive a secure one-time onboarding link for the user.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {createError && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 leading-relaxed"
                role="alert"
              >
                {createError}
              </div>
            )}

            <div>
              <label
                htmlFor="createName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Full Name *
              </label>
              <Input
                id="createName"
                placeholder="e.g. Sarah Connor"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                className="h-10 text-sm"
                disabled={isCreating}
              />
            </div>

            <div>
              <label
                htmlFor="createEmail"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Email Address *
              </label>
              <Input
                id="createEmail"
                type="email"
                placeholder="sarah@yourstore.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                className="h-10 text-sm"
                disabled={isCreating}
              />
            </div>

            <div>
              <label
                htmlFor="createPhone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Phone Number (Optional)
              </label>
              <Input
                id="createPhone"
                placeholder="+1-555-0199"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                className="h-10 text-sm"
                disabled={isCreating}
              />
            </div>

            <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Security Enforcement:</span>
              </div>
              <p className="text-blue-700 leading-relaxed">
                Role is enforced as STAFF. A 48-hour single-use setup link will be generated. The staff member will create their own secure password.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Create & Generate Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(shareLinkData)}
        onOpenChange={(open) => {
          if (!open) setShareLinkData(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Account Setup Link Ready
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Provide this secure one-time onboarding link to{" "}
              <span className="font-semibold text-slate-900">
                {shareLinkData?.staffName}
              </span>{" "}
              ({shareLinkData?.staffEmail}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                One-Time Password Setup Link:
              </span>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareLinkData?.setupUrl || ""}
                  className="font-mono text-xs bg-white h-9"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 h-9 font-semibold"
                >
                  {copiedLink ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-emerald-300" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Security Guidelines:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700 pl-1 leading-relaxed">
                <li>Share this link exclusively through a trusted company channel.</li>
                <li>The link is single-use and expires in 48 hours.</li>
                <li>Once the password is set, this link automatically becomes invalid.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              className="w-full"
              onClick={() => setShareLinkData(null)}
            >
              Done & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-slate-700" />
              Edit Staff Member
            </DialogTitle>
            <DialogDescription>
              Update profile details for {editUser?.email}. Role modifications are restricted.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="editName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Full Name
              </label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-10 text-sm"
                disabled={isUpdatingUser}
              />
            </div>

            <div>
              <label
                htmlFor="editPhone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <Input
                id="editPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+1-555-0199"
                className="h-10 text-sm"
                disabled={isUpdatingUser}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUser(null)}
                disabled={isUpdatingUser}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingUser}
                className="font-semibold"
              >
                {isUpdatingUser ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(statusConfirmUser)}
        onOpenChange={(open) => {
          if (!open) setStatusConfirmUser(null);
        }}
        title={
          statusConfirmUser?.isActive
            ? "Deactivate Staff Account?"
            : "Reactivate Staff Account?"
        }
        description={
          statusConfirmUser?.isActive
            ? `Are you sure you want to deactivate ${statusConfirmUser.name}'s account? They will immediately lose access to the Staff Portal, and active API tokens will be rejected.`
            : `Are you sure you want to reactivate ${statusConfirmUser?.name}'s account? They will regain access to their assigned staff workspace.`
        }
        confirmLabel={statusConfirmUser?.isActive ? "Deactivate Account" : "Activate Account"}
        variant={statusConfirmUser?.isActive ? "destructive" : "default"}
        isLoading={isUpdatingStatus}
        onConfirm={handleToggleStatus}
      />

      {detailsUser && (
        <StaffDetailsModal
          user={detailsUser}
          tab={detailsTab}
          onTabChange={setDetailsTab}
          onClose={() => setDetailsUser(null)}
          onGenerateSetupLink={() => {
            handleGenerateFreshLink(detailsUser);
          }}
        />
      )}
    </PageContainer>
  );
}

interface StaffDetailsModalProps {
  user: StaffUser;
  tab: "OVERVIEW" | "SALES" | "ACTIVITIES";
  onTabChange: (tab: "OVERVIEW" | "SALES" | "ACTIVITIES") => void;
  onClose: () => void;
  onGenerateSetupLink: () => void;
}

function StaffDetailsModal({
  user,
  tab,
  onTabChange,
  onClose,
  onGenerateSetupLink,
}: StaffDetailsModalProps) {
  const { data: salesRes, isLoading: isSalesLoading } = useGetAdminStaffSalesQuery(
    { id: user.id, params: { limit: 10 } },
    { skip: tab !== "SALES" }
  );

  const { data: actRes, isLoading: isActLoading } = useGetAdminStaffActivitiesQuery(
    { id: user.id, params: { limit: 15 } },
    { skip: tab !== "ACTIVITIES" }
  );

  const sales = salesRes?.data || [];
  const activities = actRes?.data || [];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-slate-200">
              <AvatarFallback className="text-sm font-bold text-slate-800">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {user.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {user.email} &bull; Member since {new Date(user.createdAt).toLocaleDateString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex border-b border-slate-200 mt-2">
          <button
            type="button"
            onClick={() => onTabChange("OVERVIEW")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "OVERVIEW"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onTabChange("SALES")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "SALES"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Sales History ({user._count?.sales ?? 0})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("ACTIVITIES")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "ACTIVITIES"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Activity Audit
          </button>
        </div>

        <div className="py-3">
          {tab === "OVERVIEW" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-slate-400 block mb-1">Account ID</span>
                  <span className="font-mono text-slate-700 font-medium">{user.id}</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-slate-400 block mb-1">Role / Authority</span>
                  <span className="font-semibold text-blue-700">{user.role}</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-slate-400 block mb-1">Account Status</span>
                  <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-slate-400 block mb-1">Phone Number</span>
                  <span className="text-slate-700 font-medium">{user.phone || "Not specified"}</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-slate-400 block mb-1">Last Login</span>
                  <span className="text-slate-700 font-medium">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "Never logged in"}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-slate-400 block mb-1">Sales Processed</span>
                  <span className="text-slate-900 font-bold">{user._count?.sales ?? 0}</span>
                </div>
              </div>

              {user.isActive && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">
                        Password Setup & Invitation
                      </h4>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Generate a new single-use token if the staff member forgot their setup link.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        onGenerateSetupLink();
                      }}
                      className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
                    >
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                      Create New Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "SALES" && (
            <div>
              {isSalesLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : sales.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No sales recorded by this staff member yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Invoice</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sales.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {s.invoiceNo}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {s.customerName || "Walk-in Customer"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize">{s.paymentMethod.toLowerCase()}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            ${Number(s.totalAmount).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "ACTIVITIES" && (
            <div>
              {isActLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No recorded activities found for this staff member.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs flex items-start justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {a.description}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {a.entityType} &bull; Status: {a.status}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(a.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
