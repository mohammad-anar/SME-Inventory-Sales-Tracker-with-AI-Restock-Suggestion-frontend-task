import * as React from "react";
import { BarChart3 } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Business analytics, sales trends, inventory valuation, and accounting exports."
      />
      <EmptyState
        icon={BarChart3}
        title="No Reports Generated Yet"
        description="Comprehensive reports including sales summaries, gross profit margins, and inventory valuation will be available here."
      />
    </PageContainer>
  );
}
