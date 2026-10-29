"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
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
import { useDeleteCycle } from "@/queries/cycle/use-delete-cycle";

interface Props {
  safraId: string;
}

const DeleteCycleButton = ({ safraId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useDeleteCycle({ cycleId: safraId });

  const handleConfirmDelete = () => {
    mutate(undefined, {
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
              {isPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <Trash2Icon size={20} className="text-red" />
              )}
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
            Esta ação é irreversível e excluirá a safra permanentemente.
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
              className="border border-red bg-transparent text-red hover:text-red"
            >
              <span className="flex items-center gap-2">
                {isPending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCycleButton;
