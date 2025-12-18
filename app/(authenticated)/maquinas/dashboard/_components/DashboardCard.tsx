import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion"

interface DashboardCardProps {
  title: string;
  value?: string;
  icon: ReactNode;
}

export function DashboardCard({
  title,
  value,
  icon,
}: DashboardCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-normal tracking-tight">
          {title}
        </CardTitle>
        <div className="p-2 rounded-xl bg-muted/40">
          {icon}
        </div>
      </CardHeader>        
      <CardContent>
        <div className="flex flex-col">
          <strong className="text-2xl font-semibold">
            {value}
          </strong>
        </div>
        {/* Indicador sutil de progresso */}
        <div className="mt-4 h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${30 * 20}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
