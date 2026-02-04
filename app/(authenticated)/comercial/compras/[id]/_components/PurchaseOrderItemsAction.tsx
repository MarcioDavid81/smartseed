"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PurchaseOrderItemDeliveries } from "./PurchaseOrderDeliveries";
import { PurchaseOrderItemDetail } from "@/types/purchaseOrderItemDetail";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  item: PurchaseOrderItemDetail;
};

export function PurchaseOrderItemActions({ item }: Props) {
  const [openDeliveries, setOpenDeliveries] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remessas</p>
        </TooltipContent>
        <DropdownMenuContent onClick={() => setOpenDeliveries(true)} align="end"  className="cursor-pointer font-light bg-green text-white rounded-lg border border-green">
          <DropdownMenuItem className="cursor-pointer">
            Remessas
          </DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>

      <PurchaseOrderItemDeliveries
        open={openDeliveries}
        onOpenChange={setOpenDeliveries}
        item={item}
      />
      </Tooltip>
    </TooltipProvider>
  );
}
