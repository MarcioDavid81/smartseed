"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SaleContractDetails } from "@/types";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  venda: SaleContractDetails;
}

export function DetailSaleContractButton({ venda }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/comercial/vendas/${venda.id}`}>
            <button className="hover:opacity-80 transition">
              <Search className="text-blue" size={20} />
            </button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Detalhes da Venda</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
