import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Home as HomeIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { CalendarSyncPanel } from "./CalendarSyncPanel";

/**
 * Onboarding-style modal that wraps the reusable CalendarSyncPanel.
 * Lets the user pick which property to sync when they have more than one.
 */
export function ConnectCalendarsModal({
  open,
  onOpenChange,
  initialPropertyId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialPropertyId?: string;
}) {
  const properties = useStore((s) => s.properties);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialPropertyId);

  useEffect(() => {
    if (!open) return;
    if (selectedId && properties.some((p) => p.id === selectedId)) return;
    setSelectedId(initialPropertyId ?? properties[0]?.id);
  }, [open, properties, initialPropertyId, selectedId]);

  const selected = properties.find((p) => p.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-lg">Sync your calendars</DialogTitle>
            <DialogDescription className="text-sm">
              Connect Airbnb, VRBO, and Google Calendar so Claro can keep bookings up to date.
            </DialogDescription>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-muted/40 p-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-soft text-foreground/70">
              <HomeIcon className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-foreground">Add a property first</p>
            <p className="max-w-xs text-[13px] text-muted-foreground">
              Calendars sync per property — create one to connect Airbnb, VRBO, or Google.
            </p>
          </div>
        ) : (
          <>
            {properties.length > 1 && (
              <div className="mt-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Property
                </label>
                <select
                  value={selectedId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}
                      {p.unit ? `, ${p.unit}` : ""} — {p.city}, {p.state}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selected && (
              <div className="mt-4">
                <CalendarSyncPanel property={selected} variant="plain" />
              </div>
            )}
          </>
        )}

        <div className="mt-2 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
