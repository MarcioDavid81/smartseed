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
import { getToken } from "@/lib/auth-client";
import { Transfer } from "@/types/transfer";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface Props {
  transferencia: Transfer;
  onDeleted: () => void;
}

const DeleteTransferButton = ({ transferencia, onDeleted }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (transferencia: { id: string }) => {
    console.log("🔁 handleDelete chamado");
    console.log("📦 transferência recebida:", transferencia);

    if (!transferencia || !transferencia.id) {
      toast.error("ID da transferência ausente. Não é possível excluir.");
      console.warn("❌ transferência.id ausente ou inválido");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const url = `/api/insumos/transfers/${transferencia.id}`;
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
        console.error("❌ Erro ao deletar transferência:", errorText);
        throw new Error(errorText);
      }

      toast.success("Transferência deletada com sucesso!");
      onDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Exceção no handleDelete:", error);
      toast.error("Erro ao deletar transferência.");
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
            Esta ação é irreversível e excluirá o registro de transferência
            permanentemente.
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
              className="border border-red-500 bg-transparent text-red-500 hover:text-red-500"
            >
              <span className="relative z-10 flex items-center gap-2">
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
