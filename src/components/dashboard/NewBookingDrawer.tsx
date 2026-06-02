import { useEffect, useMemo, useState } from "react";
import { Home, Calendar as CalendarIcon, Clock, User, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useStore, store, type CustomBookingType } from "@/lib/store";

const TYPES: { value: CustomBookingType; label: string; color: string; soft: string }[] = [
  { value: "guest", label: "Guest stay", color: "var(--color-success)", soft: "var(--color-success-soft)" },
  { value: "owner", label: "Owner block", color: "var(--color-info)", soft: "var(--color-info-soft)" },
  { value: "maintenance", label: "Maintenance", color: "var(--color-warning)", soft: "var(--color-warning-soft)" },
];

const TIMES = (() => {
  const arr: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      arr.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return arr;
})();

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function addDaysISO(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function NewBookingDrawer() {
  const open = useStore((s) => s.newBookingOpen);
  const properties = useStore((s) => s.properties);

  const [propertyId, setPropertyId] = useState<string>("");
  const [type, setType] = useState<CustomBookingType>("guest");
  const [guestName, setGuestName] = useState("");
  const [checkInDate, setCheckInDate] = useState(todayISO());
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutDate, setCheckOutDate] = useState(addDaysISO(todayISO(), 2));
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [notes, setNotes] = useState("");

  // Reset form when drawer reopens
  useEffect(() => {
    if (open) {
      setPropertyId(properties[0]?.id ?? "");
      setType("guest");
      setGuestName("");
      setCheckInDate(todayISO());
      setCheckInTime("15:00");
      setCheckOutDate(addDaysISO(todayISO(), 2));
      setCheckOutTime("11:00");
      setNotes("");
    }
  }, [open, properties]);

  const checkInDT = new Date(`${checkInDate}T${checkInTime}`);
  const checkOutDT = new Date(`${checkOutDate}T${checkOutTime}`);
  const dateInvalid = checkOutDT <= checkInDT;

  const canSubmit = useMemo(
    () => Boolean(propertyId && checkInDate && checkOutDate && !dateInvalid),
    [propertyId, checkInDate, checkOutDate, dateInvalid],
  );

  const activeType = TYPES.find((t) => t.value === type)!;
  const property = properties.find((p) => p.id === propertyId);

  const handleSubmit = () => {
    if (!canSubmit) return;
    store.addCustomBooking({
      id: crypto.randomUUID(),
      propertyId,
      type,
      guestName: type === "guest" ? guestName.trim() || undefined : undefined,
      checkInISO: `${checkInDate}T${checkInTime}`,
      checkOutISO: `${checkOutDate}T${checkOutTime}`,
      notes: notes.trim() || undefined,
    });
    toast.success(`Booking added to ${property?.address ?? "property"}`);
    store.closeNewBooking();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? store.openNewBooking() : store.closeNewBooking())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[440px] p-0 flex flex-col gap-0 bg-surface"
      >
        {/* Accent strip */}
        <div
          className="h-1 w-full transition-colors"
          style={{ backgroundColor: activeType.color }}
        />

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-border">
          <SheetTitle className="text-lg font-semibold tracking-tight text-foreground">
            New Booking
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground mt-0.5">
            Add a guest stay, owner block, or hold
          </SheetDescription>
        </div>

        {/* Form (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Property */}
          <div>
            <Label icon={Home}>Property</Label>
            {properties.length === 0 ? (
              <p className="mt-1.5 rounded-xl border border-dashed border-border bg-surface-muted/60 px-3 py-3 text-[13px] text-muted-foreground">
                Add a property first to create a booking.
              </p>
            ) : (
              <div className="mt-1.5 relative">
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-surface px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="">Select a property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}
                      {p.unit ? ` · ${p.unit}` : ""}
                    </option>
                  ))}
                </select>
                {property && (
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: property.color }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Booking type */}
          <div>
            <Label>Booking type</Label>
            <div className="mt-1.5 flex gap-2">
              {TYPES.map((t) => {
                const selected = t.value === type;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className="flex-1 rounded-full border px-3 py-2 text-[12.5px] font-semibold transition-all"
                    style={
                      selected
                        ? {
                            backgroundColor: t.soft,
                            borderColor: t.color,
                            color: t.color,
                          }
                        : {
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-muted-foreground)",
                          }
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest name */}
          {type === "guest" && (
            <div>
              <Label icon={User}>Guest name</Label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Guest name (optional)"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Leave blank to show as "Guest"
              </p>
            </div>
          )}

          {/* Check-in */}
          <div>
            <Label icon={CalendarIcon}>Check-in</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              />
              <TimeSelect value={checkInTime} onChange={setCheckInTime} />
            </div>
          </div>

          {/* Check-out */}
          <div>
            <Label icon={Clock}>Check-out</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40 ${
                  dateInvalid ? "border-danger" : "border-border"
                }`}
              />
              <TimeSelect value={checkOutTime} onChange={setCheckOutTime} invalid={dateInvalid} />
            </div>
            {dateInvalid && (
              <p className="mt-1.5 text-[12px] font-medium text-danger">
                Check-out must be after check-in
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label icon={FileText}>Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Access instructions, special requests, internal notes…"
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-surface px-6 py-4">
          <button
            type="button"
            onClick={() => store.closeNewBooking()}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Add booking
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Label({
  icon: Icon,
  children,
}: {
  icon?: typeof Home;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground/80">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      {children}
    </span>
  );
}

function TimeSelect({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40 ${
        invalid ? "border-danger" : "border-border"
      }`}
    >
      {TIMES.map((t) => (
        <option key={t} value={t}>
          {formatTime(t)}
        </option>
      ))}
    </select>
  );
}
