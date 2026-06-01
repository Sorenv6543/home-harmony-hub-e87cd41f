import type { Booking } from "./Timeline";
import { Calendar, User, MapPin, FileText, X, Phone, MessageCircle } from "lucide-react";

export function BookingDetail({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="flex items-start justify-between border-b border-border bg-surface-muted/40 px-6 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Booking details
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{booking.customer}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 px-6 py-5 md:grid-cols-2">
        <DetailRow icon={Calendar} label="Date & time">
          Today · {formatHour(booking.startHour)} – {formatHour(booking.endHour)}
        </DetailRow>
        <DetailRow icon={User} label="Cleaner">
          {booking.cleaner ?? (
            <button className="text-primary font-medium hover:underline">
              + Assign cleaner
            </button>
          )}
        </DetailRow>
        <DetailRow icon={MapPin} label="Address">
          {booking.address}
        </DetailRow>
        <DetailRow icon={FileText} label="Service">
          {booking.service}
        </DetailRow>
      </div>

      <div className="border-t border-border bg-surface-muted/30 px-6 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Notes: </span>
        Gate code 4821. Two friendly golden retrievers in the backyard. Please pay extra
        attention to the master bathroom mirrors.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4">
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted">
            <Phone className="h-3.5 w-3.5" /> Call
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted">
            <MessageCircle className="h-3.5 w-3.5" /> Message
          </button>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            Reschedule
          </button>
          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
            Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-foreground">{children}</p>
      </div>
    </div>
  );
}

function formatHour(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "AM" : "PM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}:${m.toString().padStart(2, "0")} ${period}`;
}
