"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DeleteCycleButton = () => {
  const router = useRouter();

  const handleClick = () => {
    alert("Excluir Safra");
  };

  return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className="hover:opacity-80 transition"
            >
              <Trash2Icon size={20} className="text-red" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Excluir</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
};

export default DeleteCycleButton;
