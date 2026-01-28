"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  productId: string;
  farmId: string;
}

export function InputExtractButton({ productId, farmId }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/insumos/estoque/extrato?productId=${productId}&farmId=${farmId}`}>
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
