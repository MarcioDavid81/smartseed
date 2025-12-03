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
import { useIndustryTransfer } from "@/contexts/IndustryTransferContext";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { IndustryTransfer } from "@/types";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";


interface Props {
  transferencia: IndustryTransfer;
  onDeleted: () => void;
}

const DeleteTransferButton = ({ transferencia, onDeleted }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchTransfers } = useIndustryTransfer();
  const { showToast } = useSmartToast();

  const handleDelete = async (venda: { id: string }) => {
    if (!venda?.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "ID da venda ausente. Não é possível excluir.",
      });
      return;
    }

  setLoading(true);

  try {
    const token = getToken();
    const res = await fetch(`/api/industry/sale/${venda.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // ❌ SE A API RETORNOU ERRO
    if (!res.ok) {
      const data = await res.json().catch(() => null);

      console.error("Erro da API:", data);

      // Tratamento para erros estruturados
      if (data?.error) {
        showToast({
          type: "error",
          title: data.error.title,
          message: data.error.message,
        });
      } else {
        // fallback
        showToast({
          type: "error",
          title: "Erro",
          message: "Erro ao deletar venda.",
        });
      }

      return; // evita continuar
    }

    // ✔ Sucesso
    showToast({
      type: "success",
      title: "Sucesso",
      message: "Transferência deletada com sucesso!",
    });
    onDeleted();
    setIsOpen(false);

  } catch (error) {
    console.error("Exceção no handleDelete:", error);
    showToast({
      type: "error",
      title: "Erro",
      message: "Erro inesperado ao deletar transferência.",
    });
  } finally {
    setLoading(false);
  }

  await fetchTransfers();
};


  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="hover:opacity-80 transition"
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
            Esta ação é irreversível e excluirá o registro de transferência permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-green text-white hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => handleDelete(transferencia)}
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

export default DeleteTransferButton;
