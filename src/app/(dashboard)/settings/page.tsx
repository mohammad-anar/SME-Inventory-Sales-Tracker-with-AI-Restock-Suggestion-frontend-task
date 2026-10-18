import * as React from "react";
import { Settings } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage company details, user accounts, and system preferences."
      />
      <EmptyState
        icon={Settings}
        title="Settings Configuration"
        description="User profile management, role assignment, and system preferences will be available in future settings updates."
      />
    </PageContainer>
  );
}
