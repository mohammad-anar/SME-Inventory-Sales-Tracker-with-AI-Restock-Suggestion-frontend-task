import * as React from "react";
import { Badge } from "@/components/ui/badge";

export type EntityStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "COMPLETED"
  | "VOIDED"
  | "DRAFT"
  | "ORDERED"
  | "RECEIVED"
  | "CANCELLED"
  | "CRITICAL"
  | "LOW_STOCK"
  | "HEALTHY";

interface StatusBadgeProps {
  status: EntityStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "ACTIVE":
    case "COMPLETED":
    case "RECEIVED":
    case "HEALTHY":
      return (
        <Badge variant="success" className={className}>
          {normalized}
        </Badge>
      );
    case "ORDERED":
    case "LOW_STOCK":
    case "DRAFT":
      return (
        <Badge variant="warning" className={className}>
          {normalized}
        </Badge>
      );
    case "VOIDED":
    case "CANCELLED":
    case "CRITICAL":
      return (
        <Badge variant="destructive" className={className}>
          {normalized}
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="secondary" className={className}>
          {normalized}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}

export default StatusBadge;
