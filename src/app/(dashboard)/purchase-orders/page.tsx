import * as React from "react";
import { ClipboardList } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function PurchaseOrdersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Purchase Orders"
        description="Issue vendor purchase orders, monitor deliveries, and receive inventory into stock."
      />
      <EmptyState
        icon={ClipboardList}
        title="No Purchase Orders"
        description="Purchase order creation, status workflows, and stock receiving will connect to the backend Purchase Order module."
      />
    </PageContainer>
  );
}
