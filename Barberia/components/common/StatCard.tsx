import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  accent = "brand",
}: {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  hint?: string;
  accent?: "brand" | "emerald" | "rose" | "blue" | "amber";
}) {
  const accents: Record<string, string> = {
    brand: "bg-brand/15 text-brand",
    emerald: "bg-emerald-500/15 text-emerald-600",
    rose: "bg-rose-500/15 text-rose-600",
    blue: "bg-blue-500/15 text-blue-600",
    amber: "bg-amber-500/15 text-amber-600",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
