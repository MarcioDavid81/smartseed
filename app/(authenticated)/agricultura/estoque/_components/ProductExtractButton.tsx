"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductType } from "@prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  product: ProductType;
  deposit: {
    id: string;
    name: string;
  }
}

export function ProductExtractButton({ product, deposit }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/agricultura/estoque/extrato?product=${product}&depositId=${deposit.id}`}>
            <button className="hover:opacity-80 transition">
              <Search className="text-blue" size={20} />
            </button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Extrato do Produto</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
