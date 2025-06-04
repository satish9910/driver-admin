
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className={cn(
          "text-xs mt-1",
          changeType === "positive" && "text-green-600",
          changeType === "negative" && "text-red-600",
          changeType === "neutral" && "text-gray-600"
        )}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
