"use client";

import { SquarePenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  safraId: string;
}


const EditCycleButton = ({ safraId }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/agricultura/safras/${safraId}/edit`);
  };

  return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className="hover:opacity-80 transition"
            >
              <SquarePenIcon size={20} className="text-green" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
};

export default EditCycleButton;
