"use client";

import { SquarePenIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from 'next/link';

interface Props {
  saleContractId: string;
}


const EditSaleContractButton = ({ saleContractId }: Props) => {

  return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/comercial/vendas/${saleContractId}/edit`}>
              <SquarePenIcon size={20} className="text-green" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
};

export default EditSaleContractButton;
