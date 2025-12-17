import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export function DashboardCard({
  title,
  value,
  icon,
}: DashboardCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">
            {title}
          </span>
          <strong className="text-2xl font-semibold">
            {value}
          </strong>
        </div>
      </CardContent>
    </Card>
  );
}
