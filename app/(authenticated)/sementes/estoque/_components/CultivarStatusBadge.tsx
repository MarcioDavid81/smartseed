"use client";

import { Badge } from "@/components/ui/badge";
import { CultivarStatus } from "@prisma/client";

interface CultivarStatusBadgeProps {
  status: CultivarStatus;
}

export function CultivarStatusBadge({ status }: CultivarStatusBadgeProps) {
  const color = status === CultivarStatus.BENEFICIADO ? "bg-green text-white" : "bg-red text-white";

  return (
    <div className="flex items-center justify-center">
      <Badge className={`${color} rounded-full text-xs font-light hover:bg-opacity-90`}>
        {status}
      </Badge>
    </div>
  );
}
