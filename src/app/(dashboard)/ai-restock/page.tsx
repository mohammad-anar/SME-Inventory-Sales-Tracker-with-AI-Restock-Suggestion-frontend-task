import * as React from "react";
import { Sparkles } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

export default function AiRestockPage() {
  return (
    <PageContainer>
      <PageHeader
        title="AI Restock Forecast"
        description="Machine learning demand forecasting for the next 7 days with smart replenishment recommendations."
      />
      <EmptyState
        icon={Sparkles}
        title="AI Forecast Engine Ready"
        description="Demand predictions, runout day estimations, and suggested restock quantities will connect to the AI Restock module."
      />
    </PageContainer>
  );
}
