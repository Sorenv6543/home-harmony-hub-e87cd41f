import { useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Home,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { store } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

const dashboardItems = [
  { label: "Booking Dashboard", to: "/", icon: LayoutGrid },
  { label: "Properties", to: "/properties", icon: Home },
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
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {/* Mobile nav toggle: the sidebar below is desktop-only (lg:flex), so
          without this, Properties/Settings are unreachable under 1024px. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-lift">
            <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkle className="h-4 w-4" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  claro<span className="text-primary">.</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarBody
              pathname={pathname}
              email={email}
              onSignOut={signOut}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkle className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            claro<span className="text-primary">.</span>
          </span>
        </div>
        <SidebarBody pathname={pathname} email={email} onSignOut={signOut} />
      </aside>
    </>
  );
}

function SidebarBody({
  pathname,
  email,
  onSignOut,
  onNavigate,
}: {
  pathname: string;
  email: string | null;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <NavGroup
          label="Dashboard"
          items={dashboardItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <div className="mt-6">
          <NavGroup
            label="Settings"
            items={settingsItems}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        </div>
      </nav>

      <div className="mx-3 mb-2 rounded-xl border border-border bg-surface-muted p-3">
        {email ? (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signed in
              </p>
              <p className="truncate text-xs text-foreground" title={email}>
                {email}
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            search={{ next: undefined }}
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign in</span>
            <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              MCP
            </span>
          </Link>
        )}
      </div>

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
    </>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: { label: string; to: string; icon: typeof LayoutGrid }[];
  pathname: string;
  onNavigate?: () => void;
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
          const routable = item.to === "/" || item.to === "/services" || item.to === "/properties";
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
              {item.label === "New Booking" ? (
                <button
                  type="button"
                  onClick={() => {
                    store.openNewBooking();
                    onNavigate?.();
                  }}
                  className={`${className} w-full text-left`}
                >
                  {inner}
                </button>
              ) : routable ? (
                <Link to={item.to} onClick={onNavigate} className={className}>
                  {inner}
                </Link>
              ) : (
                <a href="#" onClick={onNavigate} className={className}>
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
