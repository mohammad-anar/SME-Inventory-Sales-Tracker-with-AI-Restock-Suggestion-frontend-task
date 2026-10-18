import * as React from "react";
import { FolderTree } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function CategoriesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Organize your inventory with custom product categories and sub-groupings."
      />
      <EmptyState
        icon={FolderTree}
        title="No Categories Configured"
        description="Category management will connect to the backend Category module to enable product taxonomy and filtering."
      />
    </PageContainer>
  );
}
