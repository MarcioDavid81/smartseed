"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMMERCIAL_STATUS_TYPE_LABELS } from "../_constants/commercial";

export type CommercialStatus = keyof typeof COMMERCIAL_STATUS_TYPE_LABELS;

const STATUS_COLORS: Record<CommercialStatus, string> = {
  OPEN: "bg-blue text-white",
  PARTIAL_FULFILLED: "bg-yellow-400 text-white",
  FULFILLED: "bg-green text-white",
  CANCELED: "bg-red text-white",
};

interface CommercialStatusBadgeProps {
  status: CommercialStatus;
  className?: string;
}

export function CommercialStatusBadge({ 
  status, 
  className 
}: CommercialStatusBadgeProps) {
  const label = COMMERCIAL_STATUS_TYPE_LABELS[status];
  const color = STATUS_COLORS[status] || "bg-gray-500 text-white";
  
  return (
    <Badge 
      className={cn(
        "rounded-full text-xs font-light hover:bg-opacity-90 px-2 py-1",
        color,
        className
      )}
    >
      {label}
    </Badge>
  );
}