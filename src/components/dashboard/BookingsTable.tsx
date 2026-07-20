import type { Booking } from "./Timeline";
import { MoreHorizontal } from "lucide-react";

const statusPill: Record<Booking["status"], string> = {
  "check-in": "bg-success-soft text-success",
  "check-out": "bg-info-soft text-info",
  turn: "bg-warning-soft text-warning",
  urgent: "bg-danger-soft text-danger",
};

const statusLabel: Record<Booking["status"], string> = {
  "check-in": "Check-in",
  "check-out": "Check-out",
  turn: "Turn",
  urgent: "Urgent",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatHour(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "AM" : "PM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}:${m.toString().padStart(2, "0")} ${period}`;
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Upcoming bookings</h3>
          <p className="text-xs text-muted-foreground">
            You have {bookings.length} bookings this period
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">
          View all →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted/50 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Cleaning company</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-surface-muted/40">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {initials(b.customer)}
                    </div>
                    <span className="font-medium text-foreground">{b.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{b.address}</td>
                <td className="px-6 py-4 text-muted-foreground">{b.service}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {b.cleaningCompany ?? <span className="italic text-warning">Not linked</span>}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{formatHour(b.startHour)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusPill[b.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {statusLabel[b.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
