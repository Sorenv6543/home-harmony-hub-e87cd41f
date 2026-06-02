import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Search, Plus, CalendarCheck, Clock, Sun } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { Timeline, Legend, type Booking } from "@/components/dashboard/Timeline";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { BookingDetail } from "@/components/dashboard/BookingDetail";
import { EmptyState, type ChecklistState } from "@/components/dashboard/EmptyState";
import { AddPropertyModal } from "@/components/dashboard/AddPropertyModal";
import { useStore, store, generateOccurrences } from "@/lib/store";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booking Dashboard — Claro" },
      { name: "description", content: "Manage today's cleaning bookings, your team, and upcoming schedule from one warm, intuitive dashboard." },
      { property: "og:title", content: "Booking Dashboard — Claro" },
      { property: "og:description", content: "Manage today's cleaning bookings, your team, and upcoming schedule from one warm, intuitive dashboard." },
    ],
  }),
  component: DashboardPage,
});

const bookings: Booking[] = [
  {
    id: "1",
    customer: "The Okafor Family",
    address: "1600 Pennsylvania Ave N…",
    city: "Washington, DC",
    service: "Deep Clean · 3 bd",
    day: "today",
    startHour: 11,
    endHour: 12.5,
    status: "check-out",
    label: "11:00 AM · Check-out",
  },
  {
    id: "2",
    customer: "Michael Chen",
    address: "123 Main Street",
    city: "Springfield, IL",
    service: "Standard · 2 bd",
    day: "today",
    startHour: 15,
    endHour: 16.5,
    status: "check-in",
    cleaningCompany: "Bright & Clean Co.",
    label: "3:00 PM · Check-in",
  },
  {
    id: "3",
    customer: "Sarah Jenkins",
    address: "402 Maple St",
    city: "Madison, WI",
    service: "Standard · 2 bd",
    day: "today",
    startHour: 8.5,
    endHour: 10,
    status: "check-in",
    cleaningCompany: "Sparkle Pros",
    label: "8:30 AM · Check-in",
  },
  {
    id: "4",
    customer: "Priya Shah",
    address: "123 Main Street",
    city: "Springfield, IL",
    service: "Turn · 2 bd",
    day: "tomorrow",
    startHour: 11,
    endHour: 13,
    status: "turn",
    label: "11:00 AM · Turn",
  },
  {
    id: "5",
    customer: "Tomás Rivera",
    address: "Lakeview Cottage",
    city: "Lake Geneva, WI",
    service: "Check-in · 4 bd",
    day: "tomorrow",
    startHour: 16,
    endHour: 17.5,
    status: "check-in",
    cleaningCompany: "Bright & Clean Co.",
    label: "4:00 PM · Check-in",
  },
  {
    id: "6",
    customer: "Anna Lee",
    address: "Lakeview Cottage",
    city: "Lake Geneva, WI",
    service: "Check-out · 4 bd",
    day: "wed",
    startHour: 10,
    endHour: 11.5,
    status: "check-out",
    label: "10:00 AM · Check-out",
  },
  {
    id: "7",
    customer: "Devon Park",
    address: "55 Cedar Ct",
    city: "Austin, TX",
    service: "Urgent fix · 1 bd",
    day: "wed",
    startHour: 14,
    endHour: 15,
    status: "urgent",
    label: "2:00 PM · Urgent",
  },
  {
    id: "8",
    customer: "Whitman Family",
    address: "8 Pinecrest Dr",
    city: "Boulder, CO",
    service: "Turn · 3 bd",
    day: "thu",
    startHour: 12,
    endHour: 13.5,
    status: "turn",
    label: "12:00 PM · Turn",
  },
  {
    id: "9",
    customer: "Rivera Group",
    address: "402 Maple St",
    city: "Madison, WI",
    service: "Check-in · 3 bd",
    day: "thu",
    startHour: 16,
    endHour: 17.5,
    status: "check-in",
    cleaningCompany: "Bright & Clean Co.",
    label: "4:00 PM · Check-in",
  },
  {
    id: "10",
    customer: "Bennett & Co.",
    address: "88 Birch Ln",
    city: "Portland, OR",
    service: "Check-out · 2 bd",
    day: "today",
    startHour: 18,
    endHour: 19.5,
    status: "check-out",
    label: "6:00 PM · Check-out",
  },
  {
    id: "11",
    customer: "Yamamoto Family",
    address: "27 Harbor View",
    city: "Seattle, WA",
    service: "Turn · 3 bd",
    day: "tomorrow",
    startHour: 9,
    endHour: 10.5,
    status: "turn",
    label: "9:00 AM · Turn",
  },
  {
    id: "12",
    customer: "Field Studios",
    address: "14 Studio Ln",
    city: "Brooklyn, NY",
    service: "Urgent · 1 bd",
    day: "tomorrow",
    startHour: 13,
    endHour: 14,
    status: "urgent",
    label: "1:00 PM · Urgent",
  },
  {
    id: "13",
    customer: "Patel Residence",
    address: "9 Sunset Blvd",
    city: "San Diego, CA",
    service: "Check-in · 2 bd",
    day: "wed",
    startHour: 8,
    endHour: 9.5,
    status: "check-in",
    cleaningCompany: "Sparkle Pros",
    label: "8:00 AM · Check-in",
  },
  {
    id: "14",
    customer: "Atlas Rentals",
    address: "300 River Rd",
    city: "Nashville, TN",
    service: "Turn · 4 bd",
    day: "wed",
    startHour: 17,
    endHour: 19,
    status: "turn",
    label: "5:00 PM · Turn",
  },
];


function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>("2");
  const [showEmpty, setShowEmpty] = useState(true);
  const properties = useStore((s) => s.properties);
  const schedules = useStore((s) => s.schedules);
  const skipped = useStore((s) => s.skipped);
  const occurrenceCleaners = useStore((s) => s.occurrenceCleaners);
  const customBookings = useStore((s) => s.customBookings);
  const [modalOpen, setModalOpen] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistState>({
    property: false,
    booking: false,
    turn: false,
  });

  // When a custom booking is added, exit empty mode so it shows on the timeline.
  useEffect(() => {
    if (customBookings.length > 0) setShowEmpty(false);
  }, [customBookings.length]);

  // Generate recurring turns and merge into the active timeline.
  const recurringBookings = useMemo<Booking[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: Booking[] = [];
    for (const schedule of schedules) {
      const property = properties.find((p) => p.id === schedule.propertyId);
      if (!property) continue;
      const occurrences = generateOccurrences(schedule, 8, today);
      for (const occ of occurrences) {
        if (skipped.includes(occ.key)) continue;
        const offset = Math.round((occ.date.getTime() - today.getTime()) / 86400000);
        const day =
          offset === 0
            ? "today"
            : offset === 1
              ? "tomorrow"
              : offset === 2
                ? "wed"
                : offset === 3
                  ? "thu"
                  : undefined;
        if (!day) continue; // outside the visible 4-day window
        const [hh, mm] = occ.time.split(":").map(Number);
        const startHour = hh + (mm || 0) / 60;
        const endHour = Math.min(20, startHour + occ.durationMin / 60);
        const cleaningCompany = occurrenceCleaners[occ.key] ?? occ.cleaningCompany;
        out.push({
          id: `rec-${occ.key}`,
          customer: property.address,
          address: property.address,
          city: `${property.city}, ${property.state}`,
          service: `Recurring Turn · ${property.propertyType}`,
          day,
          startHour,
          endHour,
          status: "turn",
          cleaningCompany,
          label: `${formatHourLabel(startHour)} · Recurring Turn`,
          recurring: true,
          cadence: occ.cadenceLabel,
          seriesId: occ.scheduleId,
          occurrenceKey: occ.key,
          propertyId: occ.propertyId,
          occurrenceDateISO: occ.date.toISOString().slice(0, 10),
        });
      }
    }
    return out;
  }, [schedules, properties, skipped, occurrenceCleaners]);


  // Convert user-created bookings (guest stay / owner block / maintenance) into timeline pills.
  const customTimelineBookings = useMemo<Booking[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayFor = (d: Date): Booking["day"] | undefined => {
      const offset = Math.round((d.getTime() - today.getTime()) / 86400000);
      return offset === 0 ? "today" : offset === 1 ? "tomorrow" : offset === 2 ? "wed" : offset === 3 ? "thu" : undefined;
    };
    const hourOf = (d: Date) => d.getHours() + d.getMinutes() / 60;
    const out: Booking[] = [];
    for (const cb of customBookings) {
      const property = properties.find((p) => p.id === cb.propertyId);
      if (!property) continue;
      const inDT = new Date(cb.checkInISO);
      const outDT = new Date(cb.checkOutISO);
      const city = `${property.city}, ${property.state}`;

      if (cb.type === "guest") {
        const inDay = dayFor(new Date(inDT.getFullYear(), inDT.getMonth(), inDT.getDate()));
        if (inDay) {
          const sh = Math.max(8, Math.min(20, hourOf(inDT)));
          out.push({
            id: `cb-${cb.id}-in`,
            customer: cb.guestName || "Guest",
            address: property.address,
            city,
            service: `Guest stay · ${property.propertyType}`,
            day: inDay,
            startHour: sh,
            endHour: Math.min(20, sh + 1.5),
            status: "check-in",
            label: `${formatHourLabel(sh)} · Check-in`,
          });
        }
        const outDay = dayFor(new Date(outDT.getFullYear(), outDT.getMonth(), outDT.getDate()));
        if (outDay) {
          const eh = Math.max(8, Math.min(20, hourOf(outDT)));
          out.push({
            id: `cb-${cb.id}-out`,
            customer: cb.guestName || "Guest",
            address: property.address,
            city,
            service: `Guest stay · ${property.propertyType}`,
            day: outDay,
            startHour: Math.max(8, eh - 1.5),
            endHour: eh,
            status: "check-out",
            label: `${formatHourLabel(eh)} · Check-out`,
          });
        }
      } else {
        // Owner block (turn / amber) or Maintenance (urgent / red): one pill per day in range.
        const status: Booking["status"] = cb.type === "owner" ? "turn" : "urgent";
        const labelTxt = cb.type === "owner" ? "Owner block" : "Maintenance";
        const cursor = new Date(inDT.getFullYear(), inDT.getMonth(), inDT.getDate());
        const lastDay = new Date(outDT.getFullYear(), outDT.getMonth(), outDT.getDate());
        let i = 0;
        while (cursor.getTime() <= lastDay.getTime() && i < 8) {
          const day = dayFor(cursor);
          if (day) {
            const sameAsIn = cursor.getTime() === new Date(inDT.getFullYear(), inDT.getMonth(), inDT.getDate()).getTime();
            const sameAsOut = cursor.getTime() === lastDay.getTime();
            const sh = sameAsIn ? Math.max(8, Math.min(20, hourOf(inDT))) : 8;
            const eh = sameAsOut ? Math.max(8, Math.min(20, hourOf(outDT))) : 20;
            if (eh > sh) {
              out.push({
                id: `cb-${cb.id}-${i}`,
                customer: labelTxt,
                address: property.address,
                city,
                service: `${labelTxt} · ${property.propertyType}`,
                day,
                startHour: sh,
                endHour: eh,
                status,
                label: `${labelTxt}`,
              });
            }
          }
          cursor.setDate(cursor.getDate() + 1);
          i++;
        }
      }
    }
    return out;
  }, [customBookings, properties]);

  const baseBookings = showEmpty ? [] : bookings;
  const activeBookings = useMemo(
    () => [...baseBookings, ...recurringBookings, ...customTimelineBookings],
    [baseBookings, recurringBookings, customTimelineBookings],
  );



  const selected = activeBookings.find((b) => b.id === selectedId);

  const urgentCount = baseBookings.filter((b) => b.status === "urgent").length;
  const attentionCount = urgentCount;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/85 backdrop-blur px-4 md:px-8">
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold tracking-tight text-foreground truncate">
              Overview
            </h1>
            <p className="text-xs text-muted-foreground">Tuesday, October 24</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search bookings, customers…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-surface px-1.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            {/* Demo toggle: empty vs populated */}
            <div className="hidden md:flex rounded-lg border border-border bg-surface-muted p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setShowEmpty(false)}
                className={`rounded-md px-2.5 py-1 transition-colors ${!showEmpty ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                With bookings
              </button>
              <button
                onClick={() => setShowEmpty(true)}
                className={`rounded-md px-2.5 py-1 transition-colors ${showEmpty ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                First-time
              </button>
            </div>
            <button className="relative rounded-xl border border-border bg-surface p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
            </button>
            <button
              onClick={() => store.openNewBooking()}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Plus className="h-3.5 w-3.5" /> New booking
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-surface">
              EF
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-7">
          {showEmpty ? (
            <EmptyState
              onAddProperty={() => setModalOpen(true)}
              onPreviewSample={() => {
                store.seedSampleProperties();
                setShowEmpty(false);
              }}
              completed={checklist}
              properties={properties}
            />
          ) : (
            <>
              {/* Hero greeting band */}
              <section
                className="relative overflow-hidden rounded-3xl border border-border px-6 py-6 md:px-8 md:py-7 shadow-card"
                style={{ backgroundImage: "var(--gradient-warm)" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full blur-3xl"
                  style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", opacity: 0.1 }}
                />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                      <Sun className="h-3 w-3" /> Today
                    </span>
                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                      Good morning, Elena
                    </h2>
                    <p className="mt-1.5 text-sm md:text-[15px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {baseBookings.filter((b) => b.day === "today").length} bookings
                      </span>{" "}
                      scheduled today ·{" "}
                      <span className={`font-semibold ${attentionCount > 0 ? "text-danger" : "text-foreground"}`}>
                        {attentionCount} {attentionCount === 1 ? "needs" : "need"} attention
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatCard
                      label="Today"
                      value={String(activeBookings.filter((b) => b.day === "today").length)}
                      icon={CalendarCheck}
                    />
                    <StatCard label="Week" value="48" icon={Clock} />
                  </div>
                </div>
              </section>


              {/* Section header for timeline */}
              {/* Section header for timeline */}
              <section id="bookings-timeline" className="space-y-4 scroll-mt-20">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
                      Bookings timeline
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tap any booking to see details, contact, and actions.
                    </p>
                  </div>
                  <Legend />
                </div>

                <Timeline bookings={activeBookings} onSelect={setSelectedId} selectedId={selectedId} />
              </section>

              {/* Upcoming list */}
              <BookingsTable bookings={activeBookings} />

              {properties.length > 0 && (
                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
                      Your properties
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tap a property to view details, sync calendars, and manage settings.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Detail (slide-in panel) */}
          {selected && !showEmpty && (
            <BookingDetail booking={selected} onClose={() => setSelectedId(undefined)} />
          )}
        </main>
      </div>

      <AddPropertyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={(p) => {
          store.addProperty(p);
          setChecklist((c) => ({ ...c, property: true }));
          setShowEmpty(true);
        }}
      />
    </div>
  );
}

function formatHourLabel(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "AM" : "PM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return m ? `${display}:${m.toString().padStart(2, "0")} ${period}` : `${display}:00 ${period}`;
}

function PropertyCard({ property: p }: { property: import("@/components/dashboard/AddPropertyModal").Property }) {
  const { Link } = require("@tanstack/react-router") as typeof import("@tanstack/react-router");
  return (
    <Link
      to="/properties/$id"
      params={{ id: p.id }}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary/30"
    >
      <span className="h-10 w-10 shrink-0 rounded-xl" style={{ backgroundColor: p.color }} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {p.address}{p.unit ? `, ${p.unit}` : ""}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {p.city}, {p.state} · {p.bedrooms} bd · {p.bathrooms} ba
        </p>
      </div>
      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
        {p.propertyType}
      </span>
    </Link>
  );
}

