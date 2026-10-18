import * as React from "react";
import { LayoutDashboard } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Comprehensive business overview, daily sales performance, and operational inventory metrics."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard Metrics Pending Connection"
        description="Business KPI summary cards, sales revenue charts, and quick-status inventory widgets will be integrated in subsequent tasks."
      />
    </PageContainer>
  );
}
