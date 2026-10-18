"use client";

import * as React from "react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingCart,
  ArrowUpDown,
  Package,
  AlertTriangle,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetStaffActivitiesQuery } from "@/lib/redux/services/staffApi";
import { StaffActivity } from "@/types/api";

function getActivityBadge(type: StaffActivity["type"]) {
  switch (type) {
    case "SALE_CREATED":
      return {
        icon: ShoppingCart,
        label: "Sale Created",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "SALE_VOIDED":
      return {
        icon: AlertTriangle,
        label: "Sale Voided",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "STOCK_MOVEMENT":
      return {
        icon: ArrowUpDown,
        label: "Stock Movement",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "PURCHASE_ORDER":
      return {
        icon: Package,
        label: "Purchase Order",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      };
    default:
      return {
        icon: Activity,
        label: "Activity",
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}

export default function StaffActivitiesPage() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(15);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [appliedStartDate, setAppliedStartDate] = React.useState("");
  const [appliedEndDate, setAppliedEndDate] = React.useState("");

  const {
    data: activitiesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetStaffActivitiesQuery({
    page,
    limit,
    startDate: appliedStartDate || undefined,
    endDate: appliedEndDate || undefined,
  });

  const activities = activitiesResponse?.data || [];
  const pagination = activitiesResponse?.meta;

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(1);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Activity Audit Log"
        description="Chronological record of actions, operations, and transactions executed under your staff account."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <div className="relative">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 pl-9 text-xs"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              End Date
            </label>
            <div className="relative">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 pl-9 text-xs"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 md:col-span-2 lg:col-span-1">
            <Button type="submit" className="h-10 flex-1 text-xs font-semibold">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filter
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
          <LoadingState message="Loading your activity timeline..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Activities"
            message="Could not retrieve your recorded activity history. Please try again."
            onRetry={refetch}
          />
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Activity Records Found"
            description="There are no recorded transactions or operations matching your selected period."
          />
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {activities.map((act) => {
              const badge = getActivityBadge(act.type);
              const BadgeIcon = badge.icon;
              return (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-4 ring-white border-2 border-slate-300 group-hover:border-blue-600 transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-blue-600" />
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-shadow space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}
                        >
                          <BadgeIcon className="h-3 w-3" />
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {act.entityType}: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{act.entityId}</code>
                        </span>
                      </div>
                      <time className="text-[11px] text-slate-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </time>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                      <span>Status:</span>
                      <span className="font-semibold text-slate-600">
                        {act.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
    </PageContainer>
  );
}
