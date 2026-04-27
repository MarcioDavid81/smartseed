"use client";

import { MoreVertical, FileText, ShoppingCart, Sprout } from "lucide-react";
import { TbTransferIn } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ProductType } from "@prisma/client";

type Props = {
  product: ProductType;
  depositId: string;
};

export function StockActionsDropdown({ product, depositId }: Props) {
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

          <DropdownMenuContent align="end" className="font-light">
            <DropdownMenuItem className="cursor-pointer py-2 hover:bg-green hover:text-white rounded-lg">
              <Link href={`/agricultura/estoque/extrato?product=${product}&depositId=${depositId}`} className="w-full flex items-center gap-2 font-light">
                <FileText size={20} strokeWidth={1.0} />
                Extrato
              </Link>
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}