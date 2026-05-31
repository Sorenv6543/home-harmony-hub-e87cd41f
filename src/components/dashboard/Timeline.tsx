import { useState } from "react";

type Status = "confirmed" | "pending" | "completed" | "unassigned";

interface Booking {
  id: string;
  customer: string;
  address: string;
  service: string;
  startHour: number; // 0-24
  endHour: number;
  status: Status;
  cleaner?: string;
}

const HOURS = [8, 10, 12, 14, 16, 18];
const START = 8;
const END = 19;

const statusStyles: Record<Status, { bar: string; dot: string; label: string }> = {
  confirmed: {
    bar: "bg-success-soft border-success/30 text-success",
    dot: "bg-success",
    label: "Confirmed",
  },
  pending: {
    bar: "bg-warning-soft border-warning/30 text-warning",
    dot: "bg-warning",
    label: "Pending",
  },
  completed: {
    bar: "bg-surface-muted border-border text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Completed",
  },
  unassigned: {
    bar: "bg-danger-soft border-danger/30 text-danger",
    dot: "bg-danger",
    label: "Unassigned",
  },
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
  const [zoom, setZoom] = useState<"Day" | "Week" | "Month">("Day");

  const pct = (h: number) => ((h - START) / (END - START)) * 100;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Today's schedule</h3>
          <p className="text-xs text-muted-foreground">Tap a booking for details</p>
        </div>
        <div className="flex items-center gap-4">
          <Legend />
          <div className="flex rounded-lg border border-border bg-surface-muted p-0.5">
            {(["Day", "Week", "Month"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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

      <div className="px-6 py-6">
        {/* Hour ruler */}
        <div className="relative ml-32 h-5 border-b border-border">
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute -translate-x-1/2 text-[10px] font-medium text-muted-foreground"
              style={{ left: `${pct(h)}%` }}
            >
              {h % 12 === 0 ? 12 : h % 12}
              <span className="ml-0.5">{h < 12 ? "am" : "pm"}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="mt-3 space-y-3">
          {bookings.map((b) => {
            const s = statusStyles[b.status];
            const selected = selectedId === b.id;
            return (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <p className="text-xs font-medium text-foreground truncate">{b.address}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{b.service}</p>
                </div>
                <div className="relative h-11 flex-1 rounded-lg bg-surface-muted/60">
                  {/* Grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 w-px bg-border/60"
                      style={{ left: `${pct(h)}%` }}
                    />
                  ))}
                  <button
                    onClick={() => onSelect(b.id)}
                    className={`absolute top-1 bottom-1 rounded-md border px-2 text-left transition-all ${s.bar} ${
                      selected ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : "hover:brightness-95"
                    }`}
                    style={{
                      left: `${pct(b.startHour)}%`,
                      width: `${pct(b.endHour) - pct(b.startHour)}%`,
                    }}
                  >
                    <p className="text-[11px] font-semibold leading-tight truncate">
                      {b.customer}
                    </p>
                    <p className="text-[10px] opacity-80 truncate">
                      {formatHour(b.startHour)}–{formatHour(b.endHour)}
                      {b.cleaner ? ` · ${b.cleaner}` : ""}
                    </p>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
      {(Object.keys(statusStyles) as Status[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusStyles[k].dot}`} />
          {statusStyles[k].label}
        </div>
      ))}
    </div>
  );
}

function formatHour(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "am" : "pm";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return m ? `${display}:${m.toString().padStart(2, "0")}${period}` : `${display}${period}`;
}

export type { Booking };
