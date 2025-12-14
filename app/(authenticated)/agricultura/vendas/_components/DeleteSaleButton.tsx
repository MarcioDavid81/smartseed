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
import { useSmartToast } from "@/contexts/ToastContext";
import { useDeleteIndustrySale } from "@/queries/industry/use-delete-industry-sale";
import { IndustrySale } from "@/types";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";


interface Props {
  venda: IndustrySale;
  disabled?: boolean;
}

const DeleteSaleButton = ({ venda, disabled = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCycle } = useCycle();
  const { showToast } = useSmartToast();

  const { mutate, isPending } = useDeleteIndustrySale({
      cycleId: selectedCycle!.id,
    });
  
    const handleConfirmDelete = () => {
      if (disabled) {
        showToast({
          type: "error",
          title: "Permissão negada",
          message: "Apenas administradores podem excluir vendas.",
        });
        return;
      }
  
      mutate(venda.id, {
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
                    message: "Apenas administradores podem excluir vendas.",
                  });
                  return;
                }
                setIsOpen(true);
              }}
                className="transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2Icon size={20} className={disabled ? "text-red/50" : "text-red"} />
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
            Esta ação é irreversível e excluirá o registro de venda permanentemente.
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
              <span className="flex items-center gap-2">
                {isPending ? <FaSpinner className="animate-spin" /> : "Confirmar"}
              </span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSaleButton;
