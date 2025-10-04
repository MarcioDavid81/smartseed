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
import { getToken } from "@/lib/auth-client";
import { IndustryTransporter } from "@/types";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";


interface Props {
  industryTransporter: IndustryTransporter;
  onDeleted: () => void;
}

const DeleteIndustryTransporterButton = ({ industryTransporter, onDeleted }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchHarvests } = useHarvest();

  const handleDelete = async (industryTransporter: IndustryTransporter) => {
    console.log("🔁 handleDelete chamado");
    console.log("📦 transportador recebido:", industryTransporter);

    if (!industryTransporter || !industryTransporter.id) {
      toast.error("ID do transportador ausente. Não é possível excluir.");
      console.warn("❌ industryTransporter.id ausente ou inválido");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const url = `/api/industry/transporter/${industryTransporter.id}`;
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

      toast.success("Produto deletado com sucesso!");
      onDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Exceção no handleDelete:", error);
      toast.error("Erro ao deletar produto.");
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
            {`Esta ação é irreversível e excluirá o registro de ${industryTransporter.name} permanentemente.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-green text-white hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => handleDelete(industryTransporter)}
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

export default DeleteIndustryTransporterButton;
