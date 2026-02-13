import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  status?: "neutral" | "good" | "warning" | "danger";
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  status = "neutral",
}: Props) {
  const statusStyles = {
    neutral: "border-muted",
    good: "border-green-500/40 bg-green-500/5",
    warning: "border-yellow-500/40 bg-yellow-500/5",
    danger: "border-red-500/40 bg-red-500/5",
  };

  return (
    <Card className={`transition-all hover:shadow-lg ${statusStyles[status]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">{value}</div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
