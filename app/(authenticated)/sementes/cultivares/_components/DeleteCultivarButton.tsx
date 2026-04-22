import {
  AlertDialog,
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
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useSmartToast } from "@/contexts/ToastContext";



interface Cultivar {
  id: string;
  name: string;
}

interface Props {
  cultivar: Cultivar;
  onDeleted: () => void;
}

const DeleteCultivarButton = ({ cultivar, onDeleted }: Props) => {
  const { showToast } = useSmartToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    console.log("🔁 handleDelete chamado");
    console.log("📦 cultivar recebida:", cultivar);
    if (!cultivar || !cultivar.id){
      showToast({
        type: "error",
        title: "Erro",
        message: "ID do cultivar ausente. Não é possível excluir.",
      });
      console.warn("❌ cultivar.id ausente ou inválido");
      return;
    }
    setLoading(true);

    try {
      const token = getToken();
      const url = `/api/cultivars/${cultivar.id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📥 Resposta da API:", res.status);

      showToast({
        type: "success",
        title: "Sucesso",
        message: "Cultivar deletada com sucesso!",
      });
      onDeleted();
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Exceção no handleDelete:", error);
      showToast({
        type: "error",
        title: "Erro",
        message: "Erro ao deletar cultivar.",
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
            Esta ação é irreversível e excluirá o cultivar permanentemente.
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
};

export default DeleteCultivarButton;
