"use client";

import * as React from "react";
import { User, Mail, Shield, Phone, Calendar, Clock, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/lib/redux/services/profileApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUser } from "@/lib/redux/slices/authSlice";
import { UserProfile } from "@/types/api";
import { toast } from "sonner";

function ProfileEditForm({ user }: { user: UserProfile }) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [name, setName] = React.useState(user.name || "");
  const [phone, setPhone] = React.useState(user.phone || "");
  const [avatar, setAvatar] = React.useState(user.avatar || "");
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Full name cannot be empty.");
      return;
    }

    try {
      const response = await updateProfile({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
        avatar: avatar.trim() ? avatar.trim() : null,
      }).unwrap();

      if (response.success && response.data) {
        dispatch(setUser(response.data));
        toast.success("Profile updated successfully");
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      const msg = apiErr?.data?.message || apiErr?.message || "Failed to update profile.";
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Edit Profile Details
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Update your public display name, phone number, and avatar image. Role and email can only be changed by an administrator.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            role="alert"
          >
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="profile-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Full Name
          </label>
          <div className="relative mt-1.5">
            <Input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-10 pl-9"
              disabled={isUpdating}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Email Address (Read-only)
            </label>
            <div className="relative mt-1.5">
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="h-10 pl-9 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-role" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Assigned Role (Read-only)
            </label>
            <div className="relative mt-1.5">
              <Input
                id="profile-role"
                type="text"
                value={user.role}
                disabled
                className="h-10 pl-9 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
              />
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="profile-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Phone Number
          </label>
          <div className="relative mt-1.5">
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="h-10 pl-9"
              disabled={isUpdating}
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div>
          <label htmlFor="profile-avatar" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Avatar Image URL
          </label>
          <div className="relative mt-1.5">
            <Input
              id="profile-avatar"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="h-10 pl-9"
              disabled={isUpdating}
            />
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={isUpdating} className="h-10 px-5 text-sm font-semibold">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profileResponse, isLoading, isError, refetch } = useGetProfileQuery();
  const user = profileResponse?.data;

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="My Profile" description="Manage your personal account settings and contact details." />
        <LoadingState message="Loading user profile..." />
      </PageContainer>
    );
  }

  if (isError || !user) {
    return (
      <PageContainer>
        <PageHeader title="My Profile" description="Manage your personal account settings and contact details." />
        <ErrorState
          title="Failed to Load Profile"
          message="Could not retrieve your user profile from the server."
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <PageContainer>
      <PageHeader
        title="My Profile"
        description="View and update your personal credentials and role information."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-2 border-slate-200">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="bg-blue-100 text-xl font-bold text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>

            <h3 className="mt-4 text-lg font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>

            <div className="mt-3 flex gap-2">
              <StatusBadge status={user.role} />
              <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Shield className="h-4 w-4 text-slate-400" />
                Role Permissions
              </span>
              <span className="font-semibold text-slate-800">
                {user.role === "ADMIN" ? "Full Administrator" : "Staff Member"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400" />
                Member Since
              </span>
              <span className="text-slate-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4 text-slate-400" />
                Last Login
              </span>
              <span className="text-slate-800">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "First Session"}
              </span>
            </div>
          </div>
        </div>

        <ProfileEditForm key={user.updatedAt || user.id} user={user} />
      </div>
    </PageContainer>
  );
}
