"use client";

import { slugify } from "@/app/_helpers/slug";
import { Button } from "@/components/ui/button";
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
            <Button variant="ghost">
              <Search className="text-green" size={20} />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Extrato da Cultivar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
