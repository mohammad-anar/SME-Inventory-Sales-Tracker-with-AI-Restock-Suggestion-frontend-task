import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function SalesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Sales"
        description="Record POS transactions, manage customer invoices, and review sales history."
      />
      <EmptyState
        icon={ShoppingCart}
        title="No Sales Transactions"
        description="Point of Sale workflow, invoice generation, and transactional history will connect to the backend Sales module."
      />
    </PageContainer>
  );
}
