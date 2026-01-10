"use client"

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import AcquirePlanButton from "./AcquirePlanButton";
import { useEffect, useState } from "react";
import { Plan } from "@prisma/client";

type CompanyPlan = Plan

const SubscriptionCard = () => {
  const [plan, setPlan] = useState<CompanyPlan | null>(null)
  
  useEffect(() => {
    async function loadPlan() {
      const res = await fetch("/api/companies/me")
      const data = await res.json()
      setPlan(data.plan as CompanyPlan)
    }
  
    loadPlan()
  }, [])
  
  const hasPremiumPlan = plan === Plan.PREMIUM
  return ( 
    <div className="flex gap-6 max-md:flex-col">
          <Card className="w-[450px] max-md:w-full">
            <CardHeader className="border-b border-solid py-8">
              <h2 className="text-center text-2xl font-semibold">
                Plano Básico
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">0</span>
                <div className="text-2xl text-muted-foreground">/mês</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>
                  Apenas 10 cadastros gerais
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>
                  Apenas 10 operações
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>
                  Apenas 1 usuário
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="text-red" />
                <p>Relatórios de operações</p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[450px] max-md:w-full">
            <CardHeader className="relative border-b border-solid py-8">
              {hasPremiumPlan && (
                <Badge className="absolute left-6 top-12 bg-green text-white hover:bg-opacity/90 rounded-full font-light">
                  Ativo
                </Badge>
              )}
              <h2 className="text-center text-2xl font-semibold">
                Plano Premium
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">99</span>
                <div className="text-2xl text-muted-foreground">/mês</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>Cadastros ilimitados</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>Operações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>Usuários ilimitados</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green" />
                <p>Relatórios de operações</p>
              </div>
              <AcquirePlanButton />
            </CardContent>
          </Card>
        </div>
   );
}
 
export default SubscriptionCard;