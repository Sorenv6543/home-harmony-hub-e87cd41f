import { useRouterState, Link } from "@tanstack/react-router";
import {
  LayoutGrid,
  CalendarPlus,
  Users,
  Sparkles,
  MapPin,
  Tags,
  CalendarSync,
  UserCheck,
  Bell,
  ClipboardList,
  Sparkle,
} from "lucide-react";
import { store } from "@/lib/store";

const dashboardItems = [
  { label: "Booking Dashboard", to: "/", icon: LayoutGrid },
  { label: "New Booking", to: "/new", icon: CalendarPlus },
  { label: "Booking Management", to: "/bookings", icon: ClipboardList },
];

const settingsItems = [
  { label: "Service Settings", to: "/services", icon: Sparkles },
  { label: "Coverage Area", to: "/coverage", icon: MapPin },
  { label: "Pricing Rules", to: "/pricing", icon: Tags },
  { label: "Calendar Sync", to: "/calendar-sync", icon: CalendarSync },
  { label: "Notification Preferences", to: "/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkle className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          claro<span className="text-primary">.</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <NavGroup label="Dashboard" items={dashboardItems} pathname={pathname} />
        <div className="mt-6">
          <NavGroup label="Settings" items={settingsItems} pathname={pathname} />
        </div>
      </nav>

      <div className="m-3 rounded-xl border border-border bg-surface-muted p-4">
        <p className="text-xs font-semibold text-foreground">Upgrade to Pro</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlock recurring bookings & SMS reminders.
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">12 of 20 bookings used</p>
        <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Upgrade plan
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { label: string; to: string; icon: typeof LayoutGrid }[];
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          const routable = item.to === "/" || item.to === "/services";
          const className = `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            active
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          }`;
          const inner = (
            <>
              <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
              <span>{item.label}</span>
              {item.label === "New Booking" && (
                <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  New
                </span>
              )}
            </>
          );
          return (
            <li key={item.to}>
              {routable ? (
                <Link to={item.to} className={className}>
                  {inner}
                </Link>
              ) : (
                <a href="#" className={className}>
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
