import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  CalendarSync,
  ArrowLeft,
  Save,
  Clock,
  Building2,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  useStore,
  store,
  DOW_LABELS,
  type Cadence,
  type Dow,
  type RecurringSchedule,
} from "@/lib/store";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Service Settings — Claro" },
      {
        name: "description",
        content:
          "Configure cleaning cadence and recurring cleanings for each of your properties.",
      },
    ],
  }),
  component: ServiceSettingsPage,
});

function nextOccurrenceISO(daysOfWeek: Dow[]): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = ((d.getDay() + 6) % 7) as Dow;
    if (daysOfWeek.includes(dow)) {
      return d.toISOString().slice(0, 10);
    }
  }
  return today.toISOString().slice(0, 10);
}

function ServiceSettingsPage() {
  const properties = useStore((s) => s.properties);
  const schedules = useStore((s) => s.schedules);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(
    () => properties[0]?.id,
  );

  useEffect(() => {
    if (!selectedPropertyId && properties[0]) setSelectedPropertyId(properties[0].id);
  }, [properties, selectedPropertyId]);

  const property = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId),
    [properties, selectedPropertyId],
  );
  const existing = useMemo(
    () => schedules.find((s) => s.propertyId === selectedPropertyId),
    [schedules, selectedPropertyId],
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/85 backdrop-blur px-4 md:px-8">
          <div className="min-w-0 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base md:text-lg font-semibold tracking-tight text-foreground truncate">
                Service Settings
              </h1>
              <p className="text-xs text-muted-foreground">Property cleaning cadence</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
          {properties.length === 0 ? (
            <EmptyProperties />
          ) : (
            <>
              {properties.length > 1 && (
                <PropertyPicker
                  properties={properties}
                  value={selectedPropertyId}
                  onChange={setSelectedPropertyId}
                />
              )}

              {property && (
                <ScheduleCard
                  key={property.id}
                  propertyId={property.id}
                  propertyDuration={property.cleaningDuration}
                  existing={existing}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyProperties() {
  return (
    <section className="rounded-3xl border border-dashed border-border bg-surface-muted/40 px-8 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-foreground/70">
        <CalendarSync className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">No properties yet</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Add a property from the Overview to configure recurring cleanings.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      >
        Go to Overview
      </Link>
    </section>
  );
}

function PropertyPicker({
  properties,
  value,
  onChange,
}: {
  properties: { id: string; address: string; color: string }[];
  value?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Property
      </label>
      <div className="relative mt-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-surface-muted/40 px-4 py-3 pr-10 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/40"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              ● {p.address}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

const ACCENT = "#6366f1";

function ScheduleCard({
  propertyId,
  propertyDuration,
  existing,
}: {
  propertyId: string;
  propertyDuration: number;
  existing?: RecurringSchedule;
}) {
  const [enabled, setEnabled] = useState(existing?.enabled ?? false);
  const [cadence, setCadence] = useState<Cadence>(existing?.cadence ?? "Weekly");
  const [days, setDays] = useState<Dow[]>(existing?.daysOfWeek ?? [2]); // Wed default
  const [time, setTime] = useState(existing?.time ?? "10:00");
  const [duration, setDuration] = useState(existing?.durationMin ?? propertyDuration ?? 120);
  const [cleaningCompany, setCleaningCompany] = useState(existing?.cleaningCompany ?? "");
  const [startDate, setStartDate] = useState(
    existing?.startDate ?? nextOccurrenceISO(existing?.daysOfWeek ?? [2]),
  );
  const [noEnd, setNoEnd] = useState(!existing?.endDate);
  const [endDate, setEndDate] = useState(existing?.endDate ?? "");

  const toggleDay = (d: Dow) =>
    setDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d].sort()));

  const handleSave = () => {
    if (enabled && days.length === 0) {
      toast.error("Pick at least one day of the week.");
      return;
    }
    const schedule: RecurringSchedule = {
      id: existing?.id ?? crypto.randomUUID(),
      propertyId,
      enabled,
      cadence,
      daysOfWeek: days,
      time,
      durationMin: Number(duration) || 120,
      cleaningCompany: cleaningCompany.trim() || undefined,
      startDate,
      endDate: noEnd ? undefined : endDate || undefined,
    };
    store.upsertSchedule(schedule);
    toast.success(
      enabled ? "Recurring schedule saved — turns added to your timeline." : "Schedule saved.",
    );
  };

  const handleCancel = () => {
    if (existing) {
      setEnabled(existing.enabled);
      setCadence(existing.cadence);
      setDays(existing.daysOfWeek);
      setTime(existing.time);
      setDuration(existing.durationMin);
      setCleaningCompany(existing.cleaningCompany ?? "");
      setStartDate(existing.startDate);
      setNoEnd(!existing.endDate);
      setEndDate(existing.endDate ?? "");
    } else {
      setEnabled(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-surface shadow-card">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-soft text-foreground/70">
            <CalendarSync className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recurring Cleanings
            </h2>
            <p className="text-xs text-muted-foreground">
              Auto-schedule turns for this property
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Enable recurring cleanings</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: enabled ? ACCENT : "var(--color-border)" }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
            />
          </button>
        </label>
      </header>

      {enabled && (
        <div className="space-y-6 px-6 py-6">
          {/* Cadence */}
          <Group label="Cadence">
            <div className="flex flex-wrap gap-2">
              {(["Weekly", "Biweekly", "Monthly", "Custom"] as Cadence[]).map((c) => (
                <Pill key={c} active={cadence === c} onClick={() => setCadence(c)}>
                  {c}
                </Pill>
              ))}
            </div>
          </Group>

          {/* Days of week */}
          <Group label="Day of week">
            <div className="flex flex-wrap gap-2">
              {DOW_LABELS.map((d, i) => (
                <Pill
                  key={d}
                  active={days.includes(i as Dow)}
                  onClick={() => toggleDay(i as Dow)}
                >
                  {d}
                </Pill>
              ))}
            </div>
          </Group>

          <div className="grid gap-5 sm:grid-cols-2">
            <Group label="Preferred time" icon={Clock}>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputCls}
              />
            </Group>
            <Group label="Duration (minutes)" icon={Clock}>
              <input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputCls}
              />
            </Group>
            <Group label="Notify cleaning company" icon={Building2}>
              <input
                type="text"
                value={cleaningCompany}
                onChange={(e) => setCleaningCompany(e.target.value)}
                placeholder="e.g. Bright & Clean Co."
                className={inputCls}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Your cleaning company will be notified of each scheduled turn.
              </p>
            </Group>
            <Group label="Start date" icon={CalendarIcon}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </Group>
            <Group label="End date" icon={CalendarIcon}>
              <div className="space-y-2">
                <input
                  type="date"
                  value={endDate}
                  disabled={noEnd}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={noEnd}
                    onChange={(e) => setNoEnd(e.target.checked)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  No end date
                </label>
              </div>
            </Group>
          </div>
        </div>
      )}

      <footer className="flex items-center justify-end gap-3 border-t border-border bg-surface-muted/30 px-6 py-4">
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <Save className="h-4 w-4" />
          Save schedule
        </button>
      </footer>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40";

function Group({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
      style={
        active
          ? { backgroundColor: ACCENT, color: "white" }
          : {
              backgroundColor: "var(--color-surface-muted)",
              color: "var(--color-foreground)",
              boxShadow: "inset 0 0 0 1px var(--color-border)",
            }
      }
    >
      {children}
    </button>
  );
}
