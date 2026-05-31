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
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles}`}>
          <Icon className="h-4 w-4" />
        </div>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
              deltaDirection === "up"
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger"
            }`}
          >
            {deltaDirection === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
