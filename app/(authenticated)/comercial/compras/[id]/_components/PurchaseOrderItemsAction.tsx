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
import { AttendPurchaseOrderItemModal } from "./AttendPurchaseOrderItemModal";
import { PurchaseOrderItemDetail } from "@/types/purchaseOrderItemDetail";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

type Props = {
  item: PurchaseOrderItemDetail;
  customerId: string;
  customerName: string;
};

export function PurchaseOrderItemActions({
  item,
  customerId,
  customerName,
}: Props) {
  const [openDeliveries, setOpenDeliveries] = useState(false);
  const [openAttend, setOpenAttend] = useState(false);

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
            <p>Ações</p>
          </TooltipContent>

          <DropdownMenuContent
            align="end"
            className="cursor-pointer font-light rounded-lg border border-green "
          >
            <DropdownMenuItem
              disabled={item.remainingQuantity <= 0}
              onClick={() => setOpenAttend(true)}
              className="cursor-pointer py-2 hover:bg-green hover:text-white rounded-lg"
            >
              Atender
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem
              onClick={() => setOpenDeliveries(true)}
              className="cursor-pointer py-2 hover:bg-green hover:text-white rounded-lg"
            >
              Remessas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AttendPurchaseOrderItemModal
          open={openAttend}
          onOpenChange={setOpenAttend}
          item={item}
          customerId={customerId}
          customerName={customerName}
        />

        <PurchaseOrderItemDeliveries
          open={openDeliveries}
          onOpenChange={setOpenDeliveries}
          item={item}
        />
      </Tooltip>
    </TooltipProvider>
  );
}
