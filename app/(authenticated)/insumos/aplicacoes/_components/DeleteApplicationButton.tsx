"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCycle } from "@/contexts/CycleContext";
import { useDeleteInputApplication } from "@/queries/input/use-input-application";
import { Application } from "@/types/application";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

interface Props {
  aplicacao: Application;
}

const DeleteApplicationButton = ({ aplicacao }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCycle } = useCycle();

  const { mutate, isPending } = useDeleteInputApplication({
    cycleId: selectedCycle!.id,
  });

  const handleConfirmDelete = () => {
    mutate(aplicacao.id, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="transition hover:opacity-80"
            >
              <Trash2Icon size={20} className="text-red-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Excluir</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é irreversível e excluirá o registro de aplicação
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-green text-white hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirmDelete}
              disabled={isPending}
              variant="ghost"
              className="border border-red-500 bg-transparent text-red-500 hover:text-red-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isPending ? <FaSpinner className="animate-spin" /> : "Confirmar"}
              </span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteApplicationButton;
