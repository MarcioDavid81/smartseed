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
import { useSmartToast } from "@/contexts/ToastContext";
import { useDeleteMachine } from "@/queries/machines/use-delete-machine";
import { Machine } from "@/types";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";


interface Props {
  machine: Machine;
  disabled?: boolean;
}

const DeleteMachineButton = ({ machine, disabled = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useSmartToast();

  const { mutate, isPending } = useDeleteMachine();

  const handleConfirmDelete = () => {
    if(disabled) {
      showToast({
        type: "error",
        title: "Permissão negada",
        message: "Apenas administradores podem excluir máquinas.",
      });
      return;
    }

    mutate(machine.id, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                if (disabled) {
                  showToast({
                    type: "error",
                    title: "Permissão negada",
                    message: "Apenas administradores podem excluir máquinas.",
                  });
                  return;
                }

                setIsOpen(true);
              }}
              className="transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? <FaSpinner className="animate-spin" /> : <Trash2Icon size={20} className={disabled ? "text-red/50" : "text-red"} />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {disabled ? "Ação indisponível" : "Excluir"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Esta ação é irreversível e excluirá o registro de ${machine.name} permanentemente.`}
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
              className="bg-transparent border border-red text-red hover:text-red"
            >
              <span className="relative flex items-center gap-2 z-10">
                {isPending ? <FaSpinner className="animate-spin" /> : "Confirmar"}
              </span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMachineButton;
