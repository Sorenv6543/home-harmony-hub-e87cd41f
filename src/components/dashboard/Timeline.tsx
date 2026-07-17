import { useState, useMemo } from "react";
import { Repeat } from "lucide-react";

type Status = "check-in" | "check-out" | "turn" | "urgent";

interface Booking {
  id: string;
  customer: string;
  address: string;
  city?: string;
  service: string;
  day: "today" | "tomorrow" | "wed" | "thu";
  startHour: number;
  endHour: number;
  status: Status;
  cleaningCompany?: string;
  label?: string; // e.g. "3:00 PM · Check-in"
  recurring?: boolean;
  cadence?: string; // e.g. "Weekly · Every Wednesday"
  seriesId?: string;
  occurrenceKey?: string;
  propertyId?: string;
  occurrenceDateISO?: string;
}

const HOURS = [8, 11, 14, 17, 20];
const START = 8;
const END = 20;
const NOW_HOUR = 17; // 5pm for the NOW marker demo

const statusStyles: Record<Status, { bar: string; dot: string; label: string; text: string }> = {
  "check-in": {
    bar: "bg-success-soft border-success/30",
    dot: "bg-success",
    text: "text-success",
    label: "Check-in",
  },
  "check-out": {
    bar: "bg-info-soft border-info/30",
    dot: "bg-info",
    text: "text-info",
    label: "Check-out",
  },
  turn: {
    bar: "bg-warning-soft border-warning/30",
    dot: "bg-warning",
    text: "text-warning",
    label: "Turn",
  },
  urgent: {
    bar: "bg-danger-soft border-danger/30",
    dot: "bg-danger",
    text: "text-danger",
    label: "Urgent",
  },
};

const dayLabels: Record<Booking["day"], string> = {
  today: "TODAY",
  tomorrow: "TOMORROW",
  wed: "WED",
  thu: "THU",
};

export function Timeline({
  bookings,
  onSelect,
  selectedId,
}: {
  bookings: Booking[];
  onSelect: (id: string) => void;
  selectedId?: string;
}) {
  const [zoom, setZoom] = useState<"Day" | "Week" | "Month">("Week");

  const pct = (h: number) => ((h - START) / (END - START)) * 100;

  const grouped = useMemo(() => {
    const list = zoom === "Day" ? bookings.filter((b) => b.day === "today") : bookings;
    const order: Booking["day"][] = ["today", "tomorrow", "wed", "thu"];
    return order
      .map((d) => ({ day: d, items: list.filter((b) => b.day === d) }))
      .filter((g) => g.items.length > 0);
  }, [bookings, zoom]);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarIcon />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Schedule</h3>
            <p className="text-xs text-muted-foreground">
              Next few days · tap a booking for details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border bg-surface-muted p-0.5">
            {(["Day", "Week", "Month"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  zoom === z
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        {/* Hour ruler */}
        <div className="relative ml-44 h-6 border-b border-border">
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute -translate-x-1/2 text-sm font-semibold text-muted-foreground"
              style={{ left: `${pct(h)}%` }}
            >
              {formatRuler(h)}
            </div>
          ))}
        </div>

        {/* Day groups */}
        <div className="mt-2">
          {grouped.map((group, gi) => (
            <div key={group.day} className={gi > 0 ? "mt-5 border-t border-border pt-4" : "pt-1"}>
              <p className="mb-3 text-xs font-bold tracking-[0.16em] text-foreground/70">
                {dayLabels[group.day]}
              </p>
              <div className="space-y-3">
                {group.items.map((b) => {
                  const s = statusStyles[b.status];
                  const selected = selectedId === b.id;
                  const isToday = b.day === "today";
                  return (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="w-44 shrink-0 pr-2">
                        <p className="text-[15px] font-semibold leading-tight text-foreground truncate">
                          {b.address}
                        </p>
                        <p className="mt-0.5 text-[13px] text-muted-foreground truncate">
                          {b.city ?? b.service}
                        </p>
                      </div>
                      <div className="relative h-12 flex-1 rounded-lg bg-surface-muted/50">
                        {/* Grid lines */}
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            className="absolute top-0 bottom-0 w-px bg-border/60"
                            style={{ left: `${pct(h)}%` }}
                          />
                        ))}
                        {/* NOW marker on today */}
                        {isToday && NOW_HOUR >= START && NOW_HOUR <= END && (
                          <div
                            className="absolute top-0 bottom-0 z-10 w-px bg-foreground"
                            style={{ left: `${pct(NOW_HOUR)}%` }}
                          >
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-bold text-background">
                              NOW
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => onSelect(b.id)}
                          className={`absolute top-1.5 bottom-1.5 flex items-center gap-2 overflow-hidden rounded-full border px-3.5 text-left transition-all ${s.bar} ${
                            selected
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                              : "hover:brightness-95"
                          }`}
                          style={{
                            left: `${pct(b.startHour)}%`,
                            minWidth: `${pct(b.endHour) - pct(b.startHour)}%`,
                            maxWidth: `calc(100% - ${pct(b.startHour)}%)`,
                          }}
                        >
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                          <span className={`min-w-0 truncate text-[13px] font-semibold ${s.text}`}>
                            {b.label ?? `${formatHour(b.startHour)} · ${s.label}`}
                          </span>
                          {b.recurring && (
                            <span
                              className="inline-flex items-center gap-0.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70"
                              title={b.cadence}
                            >
                              <Repeat className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {(Object.keys(statusStyles) as Status[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[k].dot}`} />
          {statusStyles[k].label}
        </div>
      ))}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function formatRuler(h: number) {
  const period = h < 12 ? "am" : "pm";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}

function formatHour(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "AM" : "PM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return m ? `${display}:${m.toString().padStart(2, "0")} ${period}` : `${display}:00 ${period}`;
}

export type { Booking, Status };
