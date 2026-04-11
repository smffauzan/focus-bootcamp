import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}

export function StatCard({ title, value, icon: Icon, accent = "text-primary" }: StatCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-md bg-secondary ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-mono font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
