import * as React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function AuthenticatedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <React.Suspense fallback={null}>
        {children}
      </React.Suspense>
    </DashboardLayout>
  );
}
