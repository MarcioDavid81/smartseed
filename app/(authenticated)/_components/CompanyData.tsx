"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/contexts/CompanyContext";
import { Plan } from "@prisma/client";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompanyPlanBadgeProps {
  plan?: Plan;
}

const CompanyData = ({plan}: CompanyPlanBadgeProps) => {
  const { name } = useCompany();
  const color = plan === Plan.BASIC ? "bg-red" : "bg-green";
  const content = plan ===Plan.BASIC ? "Assinar PREMIUM" : "Você é PREMIUM"
  return ( 
    <div>
      <p className="text-green text-sm">Plano</p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={"/#planos"}>
              <Badge
              className={`${color} text-white hover:bg-opacity/90 rounded-full font-light`}
              >
                {name?.plan || ""}
              </Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
   );
}
 
export default CompanyData;