"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SquarePenIcon } from "lucide-react";
import { EditPayableStatusDialog } from "./EditPayableStatusDialog";
import { AccountStatus } from "@prisma/client";
import { useState } from "react";

interface Props {
  accountPayableId: string;
  status: AccountStatus;
}

export function PayableStatusButton({ accountPayableId, status }: Props) {
  const [open, setOpen] = useState(false);
  
  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <SquarePenIcon size={20} className="text-green" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar Status</p>
          </TooltipContent>
        </Tooltip>
        <EditPayableStatusDialog
          accountPayableId={accountPayableId}
          status={status}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </TooltipProvider>
  );
}
