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
  purchaseOrderId: string;
}


const EditPurchaseOrderButton = ({ purchaseOrderId }: Props) => {

  return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/comercial/compras/${purchaseOrderId}/edit`}>
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

export default EditPurchaseOrderButton;
