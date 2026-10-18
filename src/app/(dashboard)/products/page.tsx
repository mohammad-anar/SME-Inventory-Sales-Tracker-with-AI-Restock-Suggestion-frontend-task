import * as React from "react";
import { Package } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function ProductsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Browse, filter, and manage your product catalog, prices, and stock levels."
      />
      <EmptyState
        icon={Package}
        title="No Products Displayed Yet"
        description="Product inventory catalog, SKU tracking, pricing, and reorder levels will connect to the backend Product module."
      />
    </PageContainer>
  );
}
