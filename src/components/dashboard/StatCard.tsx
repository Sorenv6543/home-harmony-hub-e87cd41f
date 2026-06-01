import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger";
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  const toneStyles = {
    default: "bg-surface-muted text-foreground",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
