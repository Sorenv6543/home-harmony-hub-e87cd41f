import type { Booking } from "./Timeline";
import { useEffect } from "react";
import { Calendar, User, MapPin, FileText, X, Phone, MessageCircle, StickyNote } from "lucide-react";

export function BookingDetail({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] animate-fade-in"
      />

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-lift animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Booking details
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold text-foreground">
              {booking.customer}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body – vertical list */}
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-border">
            <DetailRow icon={Calendar} label="Date & time">
              Today · {formatHour(booking.startHour)} – {formatHour(booking.endHour)}
            </DetailRow>
            <DetailRow icon={User} label="Cleaner">
              {booking.cleaner ?? (
                <button className="font-medium text-primary hover:underline">
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
            <DetailRow icon={StickyNote} label="Notes">
              Gate code 4821. Two friendly golden retrievers in the backyard. Please pay
              extra attention to the master bathroom mirrors.
            </DetailRow>
          </ul>
        </div>

        {/* Footer actions */}
        <div className="space-y-3 border-t border-border bg-surface-muted/40 px-6 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted">
              <Phone className="h-3.5 w-3.5" /> Call
            </button>
            <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted">
              <MessageCircle className="h-3.5 w-3.5" /> Message
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              Reschedule
            </button>
            <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
              Confirm booking
            </button>
          </div>
        </div>
      </aside>
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
    <li className="flex items-start gap-3 px-6 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm leading-relaxed text-foreground">{children}</div>
      </div>
    </li>
  );
}

function formatHour(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "AM" : "PM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}:${m.toString().padStart(2, "0")} ${period}`;
}
