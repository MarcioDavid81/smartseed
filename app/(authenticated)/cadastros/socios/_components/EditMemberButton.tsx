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
  memberId: string;
}


const EditMemberButton = ({ memberId }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/cadastros/socios/${memberId}/edit`);
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

export default EditMemberButton;
