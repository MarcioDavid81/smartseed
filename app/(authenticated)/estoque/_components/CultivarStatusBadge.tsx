"use client";

import { Badge } from "@/components/ui/badge";

interface CultivarStatusBadgeProps {
  status: "BENEFICIADO" | "BENEFICIANDO";
}

export function CultivarStatusBadge({ status }: CultivarStatusBadgeProps) {
  const color = status === "BENEFICIADO" ? "bg-green text-white" : "bg-red-500 text-white";

  return (
    <div className="flex items-center justify-center">
      <Badge className={`${color} rounded-full px-2 py-1 text-xs font-light hover:bg-opacity-90`}>
        {status}
      </Badge>
    </div>
  );
}
