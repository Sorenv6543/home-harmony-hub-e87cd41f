import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger";
}

export function StatCard({ label, value, icon: Icon, tone = "default" }: StatCardProps) {
  const toneStyles = {
    default: "bg-surface-muted text-foreground",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
  }[tone];

  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-lift">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneStyles}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}
