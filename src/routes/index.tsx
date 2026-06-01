import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Search, Plus, CalendarCheck, Clock, AlertCircle, UserX } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { Timeline, type Booking } from "@/components/dashboard/Timeline";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { BookingDetail } from "@/components/dashboard/BookingDetail";

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
    customer: "Sarah Jenkins",
    address: "402 Maple St",
    service: "Deep Clean · 3 bd",
    startHour: 8,
    endHour: 11.5,
    status: "unassigned",
  },
  {
    id: "2",
    customer: "Michael Chen",
    address: "12 Oak Rd",
    service: "Standard · 2 bd",
    startHour: 10,
    endHour: 12.5,
    status: "confirmed",
    cleaner: "Maria W.",
  },
  {
    id: "3",
    customer: "Priya Shah",
    address: "1600 Pennsylvania Ave",
    service: "Move-Out · 4 bd",
    startHour: 13,
    endHour: 16,
    status: "pending",
    cleaner: "Jordan S.",
  },
  {
    id: "4",
    customer: "Tomás Rivera",
    address: "88 Birch Ln",
    service: "Standard · 1 bd",
    startHour: 15,
    endHour: 17,
    status: "confirmed",
    cleaner: "Elena R.",
  },
];

function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selected = bookings.find((b) => b.id === selectedId);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/80 backdrop-blur px-4 md:px-8">
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold tracking-tight text-foreground truncate">
              Booking Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">Tuesday, October 24</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-sm w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search bookings, customers…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-surface px-1.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            <button className="relative rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> New booking
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              EF
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {/* Welcome */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Good morning, Elena
            </h2>
            <p className="text-sm text-muted-foreground">
              You have <span className="font-medium text-foreground">4 bookings</span> today
              and <span className="font-medium text-danger">1 unassigned</span> needing attention.
            </p>
          </section>

          {/* Quick stats */}
          <section className="grid grid-cols-2 gap-4">
            <StatCard label="Today's bookings" value="4" icon={CalendarCheck} />
            <StatCard label="This week" value="48" icon={Clock} />
          </section>

          {/* Timeline */}
          <Timeline bookings={bookings} onSelect={setSelectedId} selectedId={selectedId} />

          {/* Detail + Table */}
          {selected && (
            <BookingDetail booking={selected} onClose={() => setSelectedId(undefined)} />
          )}

          <BookingsTable bookings={bookings} />
        </main>
      </div>
    </div>
  );
}
