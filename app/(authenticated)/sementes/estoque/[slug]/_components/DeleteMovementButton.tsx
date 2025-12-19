"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth-client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { getApiRouteFromTipo } from "@/app/_helpers/typeForRoute";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSmartToast } from "@/contexts/ToastContext";


interface DeleteMovementButtonProps {
  id: string;
  tipo: string;
  quantidade: number;
  onDeleted: () => void;
}

export default function DeleteMovementButton({
  id,
  tipo,
  quantidade,
  onDeleted,
}: DeleteMovementButtonProps) {
  const rota = getApiRouteFromTipo(tipo);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useSmartToast();

  const handleDelete = async () => {

    console.log("🔁 handleDelete chamado");
    console.log("📦 operação recebida:", tipo);

    if (!id || !rota) {
      showToast({
        type: "error",
        title: "Erro",
        message: `Erro ao excluir ${tipo}. Tipo ou ID inválido.`,
      });
      console.warn(`❌ ${tipo}.id ausente ou inválido`);
      return;
    }
    setLoading(true);
    try {
      const token = getToken();

      const url = `/api/${rota}/${id}`;
      console.log("🌐 Enviando DELETE para:", url);

      const res = await fetch(`/api/${rota}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erro ao deletar operação:", errorText);
        showToast({
          type: "error",
          title: "Erro",
          message: errorText || `Erro ao excluir ${tipo}`,
        });
        throw new Error(errorText);
      }

      showToast({
        type: "success",
        title: "Sucesso",
        message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} excluído com sucesso`,
      });
      onDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Exceção no handleDelete:", error);
      showToast({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : `Erro ao excluir ${tipo}`,
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
            <AlertDialogTrigger asChild>
              <button aria-label="Excluir movimentação">
                <Trash2 size={18} className="text-red" />
              </button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Excluir movimentação</p>
          </TooltipContent>  
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é irreversível. A movimentação de <strong>{tipo}</strong>{" "}
            será permanentemente removida do sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-green text-white hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="ghost"
            className="bg-transparent border border-red-500 text-red-500 hover:text-red-500"
          >
            <span className="relative flex items-center gap-2 z-10">
              {loading ? <FaSpinner className="animate-spin" /> : "Confirmar"}
            </span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
