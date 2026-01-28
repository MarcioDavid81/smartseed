"use client";

import { Badge } from "@/components/ui/badge";
import { InputMovementType } from "@/types";

interface InputMovementBadgeProps {
  type: InputMovementType;
}

export function InputMovementBadge({ type }: InputMovementBadgeProps) {
  const color = type === "ENTRY" ? "bg-green text-white" : "bg-red text-white";
  const status = type === "ENTRY" ? "Entrada" : "Saída";

  return (
    <div className="flex items-center justify-center">
      <Badge className={`${color} rounded-full text-xs font-light hover:bg-opacity-90`}>
        {status}
      </Badge>
    </div>
  );
}
