import { Check, Sparkles, Home, MapPin, Bed, Bath, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Property } from "./AddPropertyModal";

export type ChecklistState = {
  property: boolean;
  booking: boolean;
  turn: boolean;
};

const STEPS = [
  {
    key: "property" as const,
    title: "Add your first property",
    subtitle: "Tell us about the place you rent: address, bedrooms, and a few details",
  },
  {
    key: "booking" as const,
    title: "Create a booking",
    subtitle: "Add a guest stay or import from your calendar",
  },
  {
    key: "turn" as const,
    title: "Assign a turn",
    subtitle: "Schedule a cleaning between stays",
  },
];

export function EmptyState({
  onAddProperty,
  onPreviewSample,
  completed,
  properties = [],
}: {
  onAddProperty: () => void;
  onPreviewSample: () => void;
  completed: ChecklistState;
  properties?: Property[];
}) {
  const done = Object.values(completed).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      {/* Checklist card */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7 md:p-9 shadow-lift">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 h-60 w-60 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-warning) 0%, transparent 70%)", opacity: 0.12 }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
            <Sparkles className="h-3 w-3" /> Welcome to Claro
          </span>
          <h2 className="mt-3 text-2xl md:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
            Get set up in 3 steps
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {done === 0
              ? "A quick guided setup — usually under 2 minutes."
              : `${done} of 3 complete — nice work.`}
          </p>

          <ol className="mt-6 space-y-3">
            {STEPS.map((step, i) => {
              const isDone = completed[step.key];
              return (
                <li
                  key={step.key}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                    isDone
                      ? "border-success/30 bg-success-soft/40"
                      : "border-border bg-surface-muted/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      isDone
                        ? "border-success bg-success text-primary-foreground"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[15px] font-semibold leading-tight ${
                        isDone ? "text-foreground/70 line-through" : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                      {step.subtitle}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              onClick={onAddProperty}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              Add your first property
            </button>
            <button
              onClick={onPreviewSample}
              className="text-sm font-semibold text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
            >
              Preview with sample data →
            </button>
          </div>
        </div>
      </section>

      {/* Right panel: properties list or illustration */}
      <section className="rounded-3xl border border-border bg-surface p-6 md:p-7 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Your properties</h3>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {properties.length} total
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="mt-5 flex h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/40 px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-foreground/70">
              <Home className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-foreground">
              No properties yet
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
              Add your first place and we'll bring its calendar to life right here.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {properties.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted/30 p-4"
              >
                <span
                  className="h-10 w-10 shrink-0 rounded-xl"
                  style={{ backgroundColor: p.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {p.address}
                    {p.unit ? `, ${p.unit}` : ""}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {p.city}, {p.state}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bed className="h-3 w-3" /> {p.bedrooms || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-3 w-3" /> {p.bathrooms || 0}
                    </span>
                  </p>
                </div>
                <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
                  {p.propertyType}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
