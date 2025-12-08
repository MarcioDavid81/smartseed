"use client";

import { slugify } from "@/app/_helpers/slug";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  cultivar: {
    id: string;
    name: string;
  };
}

export function CultivarExtractButton({ cultivar }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/sementes/estoque/${slugify(cultivar.name, cultivar.id)}`}>
            <button className="hover:opacity-80 transition">
              <Search className="text-blue" size={20} />
            </button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Extrato da Cultivar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
