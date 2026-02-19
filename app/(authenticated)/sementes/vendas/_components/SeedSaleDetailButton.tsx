"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";

type Props = {
  id: string;
};

export function SeedSaleDetailButton({ id }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/sementes/vendas/${id}`}>
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
