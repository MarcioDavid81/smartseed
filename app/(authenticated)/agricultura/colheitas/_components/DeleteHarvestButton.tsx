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
import { IndustryHarvest } from "@/types";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";


interface Props {
  colheita: IndustryHarvest;
  onDeleted: () => void;
}

const DeleteHarvestButton = ({ colheita, onDeleted }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchHarvests } = useHarvest();
  const { showToast } = useSmartToast();

  const handleDelete = async (colheita: { id: string }) => {
    console.log("🔁 handleDelete chamado");
    console.log("📦 colheita recebida:", colheita);

    if (!colheita || !colheita.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "ID da colheita ausente. Não é possível excluir.",
      });
      console.warn("❌ colheita.id ausente ou inválido");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const url = `/api/industry/harvest/${colheita.id}`;
      console.log("🌐 Enviando DELETE para:", url);

      const res = await fetch(url, {
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
        message: "Colheita deletada com sucesso!",
      });
      onDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Exceção no handleDelete:", error);
      showToast({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao deletar colheita.",
      });
    } finally {
      setLoading(false);
    }

    await fetchHarvests();
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
            Esta ação é irreversível e excluirá o registro de colheita permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-green text-white hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => handleDelete(colheita)}
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

export default DeleteHarvestButton;
