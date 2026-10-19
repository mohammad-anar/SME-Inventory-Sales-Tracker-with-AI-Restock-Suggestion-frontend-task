import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}

export function TableSkeleton({
  columns = 6,
  rows = 5,
  showHeader = true,
}: {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left">
        {showHeader && (
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-5 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-5 py-4">
                  <Skeleton
                    className={`h-4 ${
                      c === 0
                        ? "w-32"
                        : c === 1
                        ? "w-24"
                        : c === columns - 1
                        ? "w-16 ml-auto"
                        : "w-20"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton({ height = "h-[320px]" }: { height?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>
      <div
        className={`w-full ${height} flex items-end gap-3 pt-4 px-2`}
        aria-hidden="true"
      >
        <div className="h-[45%] flex-1 rounded-t-md bg-slate-100 animate-pulse" />
        <div className="h-[70%] flex-1 rounded-t-md bg-slate-200/80 animate-pulse" />
        <div className="h-[55%] flex-1 rounded-t-md bg-slate-100 animate-pulse" />
        <div className="h-[85%] flex-1 rounded-t-md bg-slate-200/80 animate-pulse" />
        <div className="h-[60%] flex-1 rounded-t-md bg-slate-100 animate-pulse" />
        <div className="h-[95%] flex-1 rounded-t-md bg-slate-200/80 animate-pulse" />
        <div className="h-[75%] flex-1 rounded-t-md bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-start justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <PageContainer>
      <PageHeader
        title="Executive Dashboard"
        description="Real-time SME inventory valuation, sales velocity, and business performance metrics."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="space-y-1.5 border-b border-slate-100 pb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70"
              >
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
          >
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export function StaffDashboardSkeleton() {
  return (
    <PageContainer>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
            <TableSkeleton columns={6} rows={5} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
            <TimelineSkeleton items={4} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export function ProfileSkeleton() {
  return (
    <PageContainer>
      <PageHeader
        title="My Profile"
        description="Manage your personal account settings and contact details."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="pt-2 flex justify-end">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export function DetailModalSkeleton() {
  return (
    <div className="space-y-5 p-1">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <TableSkeleton columns={4} rows={3} showHeader={true} />
      </div>
    </div>
  );
}
