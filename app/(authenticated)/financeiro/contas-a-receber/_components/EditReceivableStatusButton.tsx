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
import { useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { AccountStatus } from "@prisma/client";
import { EditReceivableStatusDialog } from "./EditReceivableStatusDialog";

interface Props {
  accountReceivableId: string;
  status: AccountStatus;
}

export function ReceivableStatusButton({ accountReceivableId, status }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" >
                <SquarePenIcon className="text-green" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar Status</p>
          </TooltipContent>
        </Tooltip>
        <EditReceivableStatusDialog
          accountReceivableId={accountReceivableId}
          status={status}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </TooltipProvider>
  );
}
