"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import Link from "next/link";

interface Props {
  cultivarId: string;
}

export function CultivarExtractButton({ cultivarId }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/estoque/${cultivarId}`}>
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
