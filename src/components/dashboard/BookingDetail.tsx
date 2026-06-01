import { useEffect, useState } from "react";
import type { Booking } from "./Timeline";
import { Calendar, User, MapPin, FileText, X, Phone, MessageCircle } from "lucide-react";

export function BookingDetail({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // trigger enter transition on mount
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ensure re-trigger when booking changes
  useEffect(() => {
    setOpen(true);
  }, [booking.id]);

  const handleClose = () => {
    setOpen(false);
    window.setTimeout(onClose, 280);
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Slide-in panel (Vuetify-style navigation drawer) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Booking details for ${booking.customer}`}
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-lift border-l border-border flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-border bg-surface-muted/40 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Booking details
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{booking.customer}</h3>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-5 px-6 py-5">
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
