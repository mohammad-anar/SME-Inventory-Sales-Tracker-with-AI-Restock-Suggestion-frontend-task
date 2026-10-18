import * as React from "react";
import { Building2 } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function SuppliersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Suppliers"
        description="Maintain your vendor contacts, lead times, and purchase order relationships."
      />
      <EmptyState
        icon={Building2}
        title="No Suppliers Available"
        description="Supplier directory and contact records will connect to the backend Supplier module."
      />
    </PageContainer>
  );
}
