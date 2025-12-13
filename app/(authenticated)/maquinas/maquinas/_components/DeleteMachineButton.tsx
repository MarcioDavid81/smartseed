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
import { useHarvest } from "@/contexts/HarvestContext";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { Machine } from "@/types";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";


interface Props {
  machine: Machine;
  onDeleted: () => void;
  disabled?: boolean;
}

const DeleteMachineButton = ({ machine, onDeleted, disabled = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useSmartToast();

  const handleDelete = async (machine: { id: string }) => {
    console.log("🔁 handleDelete chamado");
    console.log("📦 máquina recebida:", machine);

    if (disabled) {
      showToast({
        type: "error",
        title: "Permissão negada",
        message: "Você não tem autorização para excluir esta máquina.",
      });
      return;
    }

    if (!machine || !machine.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "ID da máquina ausente. Não é possível excluir.",
      });
      console.warn("❌ machine.id ausente ou inválido");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const url = `/api/machines/machine/${machine.id}`;
      console.log("🌐 Enviando DELETE para:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📥 Resposta da API:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erro ao deletar produto:", errorText);
        throw new Error(errorText);
      }

      showToast({
        type: "success",
        title: "Sucesso",
        message: "Máquina deletada com sucesso!",
      });
      onDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Exceção no handleDelete:", error);
      showToast({
        type: "error",
        title: "Erro",
        message: "Erro ao deletar máquina.",
      });
    } finally {
      setLoading(false);
    }
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
            {`Esta ação é irreversível e excluirá o registro de ${machine.name} permanentemente.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-green text-white hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => handleDelete(machine)}
              disabled={loading}
              variant="ghost"
              className="bg-transparent border border-red-500 text-red-500 hover:text-red-500"
            >
              <span className="relative flex items-center gap-2 z-10">
                {loading ? <FaSpinner className="animate-spin" /> : "Confirmar"}
              </span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMachineButton;
