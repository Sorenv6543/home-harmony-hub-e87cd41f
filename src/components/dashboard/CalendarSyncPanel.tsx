import { useState } from "react";
import { Loader2, Plus, RefreshCw, Check, X } from "lucide-react";
import { store } from "@/lib/store";
import type { Property } from "./AddPropertyModal";

type PlatformKey = "airbnb" | "vrbo" | "google";

type PlatformDef = {
  key: PlatformKey;
  label: string;
  accentColor: string;
  initial: string;
  field: keyof Pick<Property, "airbnbIcs" | "vrboIcs" | "googleCalEmail">;
  helperText: string;
  inputType: "ics" | "oauth";
  placeholder: string;
};

const PLATFORMS: PlatformDef[] = [
  {
    key: "airbnb",
    label: "Airbnb",
    accentColor: "#ff5a5f",
    initial: "A",
    field: "airbnbIcs",
    helperText: "Airbnb → Listing → Availability → Sync calendars → Export.",
    inputType: "ics",
    placeholder: "https://www.airbnb.com/calendar/ical/…",
  },
  {
    key: "vrbo",
    label: "VRBO",
    accentColor: "#0d6efd",
    initial: "V",
    field: "vrboIcs",
    helperText: "VRBO → Calendar → Import/Export → Copy export link.",
    inputType: "ics",
    placeholder: "https://www.vrbo.com/icalendar/…",
  },
  {
    key: "google",
    label: "Google Calendar",
    accentColor: "#4285f4",
    initial: "G",
    field: "googleCalEmail",
    helperText: "We'll sync turns and check-ins to your Google Calendar.",
    inputType: "oauth",
    placeholder: "you@gmail.com",
  },
];

/**
 * Reusable calendar sync panel.
 * - Used in onboarding modal (ConnectCalendarsModal)
 * - Used on property detail page
 * - `variant="card"` wraps in a bordered surface card; `"plain"` is just the rows.
 */
export function CalendarSyncPanel({
  property,
  variant = "card",
  title = "Calendar sync",
}: {
  property: Property;
  variant?: "card" | "plain";
  title?: string;
}) {
  const Content = (
    <>
      <div className="space-y-3">
        {PLATFORMS.map((p) => (
          <PlatformRow key={p.key} property={property} platform={p} />
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Claro checks for new bookings every 6 hours. Tap Refresh to sync now.
      </p>
    </>
  );

  if (variant === "plain") return <div>{Content}</div>;

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        <RefreshCw className="h-4 w-4 text-primary" /> {title}
      </h3>
      <div className="mt-4">{Content}</div>
    </section>
  );
}

function PlatformRow({ property, platform }: { property: Property; platform: PlatformDef }) {
  const value = property[platform.field] as string | undefined;
  const [connecting, setConnecting] = useState(false);
  const [draft, setDraft] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(
    value ? Date.now() - 1000 * 60 * 60 * 2 : null,
  );

  const connected = !!value;

  const save = (override?: string) => {
    const next = (override ?? draft).trim();
    if (!next) return;
    store.updateProperty(property.id, { [platform.field]: next } as Partial<Property>);
    setLastSyncedAt(Date.now());
    setConnecting(false);
    setDraft("");
  };

  const disconnect = () => {
    store.updateProperty(property.id, { [platform.field]: undefined } as Partial<Property>);
    setLastSyncedAt(null);
  };

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastSyncedAt(Date.now());
      setRefreshing(false);
    }, 1200);
  };

  const fakeGoogleOAuth = () => {
    // Pretend popup flow then save a placeholder identifier.
    setConnecting(true);
    setTimeout(() => {
      save("you@gmail.com");
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-muted/30 p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ backgroundColor: platform.accentColor }}
        >
          {platform.initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">{platform.label}</p>
          {!connected && (
            <p className="truncate text-[11px] text-muted-foreground">{platform.helperText}</p>
          )}
          {connected && platform.inputType === "oauth" && (
            <p className="truncate text-[11px] text-muted-foreground">{value}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            connected
              ? "bg-success-soft text-success"
              : "border border-border bg-surface text-muted-foreground"
          }`}
        >
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>

      {connected && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pl-11">
          <p className="text-[11px] text-muted-foreground">
            Last synced: {refreshing ? "Syncing…" : formatRelative(lastSyncedAt)}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-surface-muted disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </button>
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <X className="h-3 w-3" /> Disconnect
            </button>
          </div>
        </div>
      )}

      {!connected && !connecting && (
        <div className="mt-2 pl-11">
          {platform.inputType === "oauth" ? (
            <button
              onClick={fakeGoogleOAuth}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-foreground hover:bg-surface-muted"
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-bold text-white"
                style={{ backgroundColor: platform.accentColor }}
              >
                G
              </span>
              Connect with Google
            </button>
          ) : (
            <button
              onClick={() => setConnecting(true)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> Paste iCal URL
            </button>
          )}
        </div>
      )}

      {!connected && connecting && platform.inputType === "ics" && (
        <div className="mt-2 flex items-center gap-2 pl-11">
          <input
            autoFocus
            className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-ring/40"
            placeholder={platform.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setConnecting(false);
                setDraft("");
              }
            }}
          />
          <button
            onClick={() => save()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
          >
            <Check className="h-3 w-3" /> Save
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelative(ts: number | null): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
