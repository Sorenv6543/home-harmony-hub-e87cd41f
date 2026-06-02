import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Search, Plus, CalendarCheck, Clock, Sun } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { Timeline, Legend, type Booking } from "@/components/dashboard/Timeline";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { BookingDetail } from "@/components/dashboard/BookingDetail";
import { EmptyState, type ChecklistState } from "@/components/dashboard/EmptyState";
import { AddPropertyModal, type Property } from "@/components/dashboard/AddPropertyModal";



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
    cleaner: "Maria W.",
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
    cleaner: "Jordan S.",
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
    cleaner: "Elena R.",
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
    cleaner: "Maria W.",
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
    cleaner: "Jordan S.",
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistState>({
    property: false,
    booking: false,
    turn: false,
  });
  const selected = bookings.find((b) => b.id === selectedId);
  const activeBookings = showEmpty ? [] : bookings;

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
              onClick={() => setModalOpen(true)}
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
              onPreviewSample={() => setShowEmpty(false)}
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
                      <span className="font-semibold text-foreground">4 bookings</span> scheduled today ·{" "}
                      <span className="font-semibold text-danger">1 needs attention</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatCard label="Today" value="4" icon={CalendarCheck} />
                    <StatCard label="Week" value="48" icon={Clock} />
                  </div>
                </div>
              </section>

              {/* Section header for timeline */}
              <section className="space-y-4">
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
            </>
          )}

          {/* Detail (slide-in panel) */}
          {selected && !showEmpty && (
            <BookingDetail booking={selected} onClose={() => setSelectedId(undefined)} />
          )}
        </main>
      </div>
    </div>
  );
}

