import * as React from "react";
import { ArrowLeftRight } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function StockMovementsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Stock Movements"
        description="Audit ledger tracking every inventory addition, sale deduction, reversal, and manual adjustment."
      />
      <EmptyState
        icon={ArrowLeftRight}
        title="No Stock Movements Logged"
        description="Stock movement audit history will connect to the backend StockMovement ledger."
      />
    </PageContainer>
  );
}
