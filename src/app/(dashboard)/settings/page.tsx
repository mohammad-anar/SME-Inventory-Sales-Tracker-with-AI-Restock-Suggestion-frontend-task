"use client";

import * as React from "react";
import Link from "next/link";
import {
  Settings,
  Store,
  Users,
  User,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/redux/hooks";
import { toast } from "sonner";

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [storeName, setStoreName] = React.useState("StockPilot Retail Store");
  const [currency, setCurrency] = React.useState("USD ($)");
  const [defaultReorder, setDefaultReorder] = React.useState("10");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Store configuration preferences saved");
  };

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        description="Configure store metadata, regional settings, default reorder thresholds, and role permissions."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-600" />
              General Store Preferences
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Primary configuration for your retail storefront and inventory reporting.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label
                  htmlFor="set-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Store / Business Name
                </label>
                <Input
                  id="set-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="set-currency"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Currency Symbol
                  </label>
                  <Input
                    id="set-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="set-reorder"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Default Safety Stock Threshold
                  </label>
                  <Input
                    id="set-reorder"
                    type="number"
                    value={defaultReorder}
                    onChange={(e) => setDefaultReorder(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" className="h-9 px-4 font-semibold bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              Access & Security
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Account role and administrative controls
            </p>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active User:</span>
                  <span className="font-semibold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-500">Role:</span>
                  <span className="font-bold text-blue-600">{user?.role}</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full justify-start h-10 text-xs font-semibold border-slate-200 hover:bg-slate-50"
              >
                <Link href="/profile">
                  <User className="mr-2.5 h-4 w-4 text-slate-600" />
                  My Personal Profile
                </Link>
              </Button>

              {user?.role === "ADMIN" && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-10 text-xs font-semibold border-slate-200 hover:bg-slate-50"
                >
                  <Link href="/staff">
                    <Users className="mr-2.5 h-4 w-4 text-blue-600" />
                    Manage Staff Accounts
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
