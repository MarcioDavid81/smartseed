"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";

type Props = {
  id: string;
};

export function InputPurchaseDetailButton({ id }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/insumos/compras/${id}`}>
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
