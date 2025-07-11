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
import { EditCultivarStatusDialog } from "./EditCultivarStatusDialog";

interface Props {
  cultivarId: string;
  currentStatus: "BENEFICIANDO" | "BENEFICIADO";
}

export function CultivarStatusButton({ cultivarId, currentStatus }: Props) {
  return (
    <TooltipProvider>
      <Dialog>
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
        <EditCultivarStatusDialog
          cultivarId={cultivarId}
          currentStatus={currentStatus}
        />
      </Dialog>
    </TooltipProvider>
  );
}
