"use client"

import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { Plan } from "@prisma/client";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PLAN_UI = {
  TRIAL: {
    color: "bg-blue",
    label: "TRIAL",
    tooltip: "Você está no período de teste",
    link: "/#planos",
  },
  BASIC: {
    color: "bg-red",
    label: "BASIC",
    tooltip: "Assinar PREMIUM",
    link: "/#planos",
  },
  PREMIUM: {
    color: "bg-green",
    label: "PREMIUM",
    tooltip: "Você é PREMIUM",
    link: null,
  },
} satisfies Record<Plan, {
  color: string;
  label: string;
  tooltip: string;
  link: string | null;
}>;


interface CompanyPlanBadgeProps {
  plan?: Plan;
}

const CompanyData = ({plan}: CompanyPlanBadgeProps) => {
  const { name } = useCompany();
  const ui = PLAN_UI[plan || Plan.TRIAL];
  return ( 
    <div>
      <p className="text-green text-sm">Plano</p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={ui.link || "/#planos"}>
              <Badge
              className={`${ui.color} text-white hover:bg-opacity/90 rounded-full font-light`}
              >
                {ui.label}
              </Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{ui.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
   );
}
 
export default CompanyData;