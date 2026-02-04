"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PurchaseOrder, PurchaseOrderDetails } from "@/types";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  compra: PurchaseOrderDetails;
}

export function DetailPurchaseOrderButton({ compra }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/comercial/compras/${compra.id}`}>
            <button className="hover:opacity-80 transition">
              <Search className="text-blue" size={20} />
            </button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Detalhes da Compra</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
