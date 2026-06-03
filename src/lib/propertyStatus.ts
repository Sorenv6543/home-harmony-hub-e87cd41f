// Derive a status badge + "next event" string for a property from booking data.
// Keeps Overview and /properties page in sync.

import type { Property } from "@/components/dashboard/AddPropertyModal";
import { generateOccurrences, type CustomBooking, type RecurringSchedule } from "@/lib/store";

export type PropertyStatus = "Vacant" | "Occupied" | "Turn Today" | "Check-out Today";

export type PropertyEvent = {
  // Days from today: 0=today, 1=tomorrow, etc.
  dayOffset: number;
  hour: number; // 0-23.99
  kind: "Check-in" | "Check-out" | "Turn" | "Maintenance" | "Owner block";
  cleaner?: string;
};

// Demo bookings used in the Overview demo mode. We re-declare here so both
// the Overview and the /properties page can derive matching status/next-event
// data without circular imports.
type DemoBooking = {
  address: string;
  day: "today" | "tomorrow" | "wed" | "thu";
  startHour: number;
  status: "check-in" | "check-out" | "turn" | "urgent";
  cleaningCompany?: string;
};

export const DEMO_BOOKINGS: DemoBooking[] = [
  { address: "1600 Pennsylvania Ave N", day: "today", startHour: 11, status: "check-out" },
  { address: "123 Main Street", day: "today", startHour: 15, status: "check-in", cleaningCompany: "Bright & Clean Co." },
  { address: "402 Maple St", day: "today", startHour: 8.5, status: "check-in", cleaningCompany: "Sparkle Pros" },
  { address: "123 Main Street", day: "tomorrow", startHour: 11, status: "turn" },
  { address: "Lakeview Cottage", day: "tomorrow", startHour: 16, status: "check-in", cleaningCompany: "Bright & Clean Co." },
  { address: "Lakeview Cottage", day: "wed", startHour: 10, status: "check-out" },
  { address: "88 Birch Ln", day: "today", startHour: 18, status: "check-out" },
];

const DAY_OFFSET: Record<DemoBooking["day"], number> = { today: 0, tomorrow: 1, wed: 2, thu: 3 };

function statusToKind(s: DemoBooking["status"]): PropertyEvent["kind"] {
  if (s === "check-in") return "Check-in";
  if (s === "check-out") return "Check-out";
  if (s === "turn") return "Turn";
  return "Maintenance";
}

export function gatherEventsForProperty(
  property: Property,
  schedules: RecurringSchedule[],
  customBookings: CustomBooking[],
  includeDemo: boolean,
): PropertyEvent[] {
  const events: PropertyEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (includeDemo) {
    for (const b of DEMO_BOOKINGS) {
      if (b.address !== property.address) continue;
      events.push({
        dayOffset: DAY_OFFSET[b.day],
        hour: b.startHour,
        kind: statusToKind(b.status),
        cleaner: b.cleaningCompany,
      });
    }
  }

  // Recurring schedules → property
  for (const s of schedules) {
    if (s.propertyId !== property.id) continue;
    const occs = generateOccurrences(s, 4, today);
    for (const occ of occs) {
      const offset = Math.round((occ.date.getTime() - today.getTime()) / 86400000);
      if (offset < 0 || offset > 30) continue;
      const [hh, mm] = occ.time.split(":").map(Number);
      events.push({
        dayOffset: offset,
        hour: hh + (mm || 0) / 60,
        kind: "Turn",
        cleaner: occ.cleaningCompany,
      });
    }
  }

  // Custom bookings
  for (const cb of customBookings) {
    if (cb.propertyId !== property.id) continue;
    const inDT = new Date(cb.checkInISO);
    const outDT = new Date(cb.checkOutISO);
    const inOffset = Math.round((new Date(inDT.getFullYear(), inDT.getMonth(), inDT.getDate()).getTime() - today.getTime()) / 86400000);
    const outOffset = Math.round((new Date(outDT.getFullYear(), outDT.getMonth(), outDT.getDate()).getTime() - today.getTime()) / 86400000);
    if (cb.type === "guest") {
      if (inOffset >= 0) events.push({ dayOffset: inOffset, hour: inDT.getHours() + inDT.getMinutes() / 60, kind: "Check-in" });
      if (outOffset >= 0) events.push({ dayOffset: outOffset, hour: outDT.getHours() + outDT.getMinutes() / 60, kind: "Check-out" });
    } else {
      const kind: PropertyEvent["kind"] = cb.type === "owner" ? "Owner block" : "Maintenance";
      if (inOffset >= 0) events.push({ dayOffset: inOffset, hour: inDT.getHours() + inDT.getMinutes() / 60, kind });
    }
  }

  events.sort((a, b) => a.dayOffset - b.dayOffset || a.hour - b.hour);
  return events;
}

export function deriveStatus(events: PropertyEvent[]): PropertyStatus {
  const today = events.filter((e) => e.dayOffset === 0);
  if (today.some((e) => e.kind === "Check-out")) return "Check-out Today";
  if (today.some((e) => e.kind === "Turn")) return "Turn Today";
  if (today.some((e) => e.kind === "Check-in" || e.kind === "Owner block")) return "Occupied";
  return "Vacant";
}

export function formatHour(h: number): string {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const period = hr < 12 ? "AM" : "PM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return m ? `${display}:${m.toString().padStart(2, "0")} ${period}` : `${display}:00 ${period}`;
}

export function formatNextEvent(events: PropertyEvent[]): string | null {
  const next = events[0];
  if (!next) return null;
  const when =
    next.dayOffset === 0
      ? "today"
      : next.dayOffset === 1
        ? "tomorrow"
        : next.dayOffset === 2
          ? "in 2 days"
          : next.dayOffset === 3
            ? "in 3 days"
            : `in ${next.dayOffset} days`;
  return `${next.kind} ${when} at ${formatHour(next.hour)}`;
}

export const STATUS_BADGE_STYLES: Record<PropertyStatus, string> = {
  Vacant: "bg-success-soft text-success border border-success/30",
  Occupied: "bg-info-soft text-info border border-info/30",
  "Turn Today": "bg-warning-soft text-warning-foreground border border-warning/30",
  "Check-out Today": "bg-danger-soft text-danger border border-danger/30",
};

export function getPropertySummary(
  property: Property,
  schedules: RecurringSchedule[],
  customBookings: CustomBooking[],
  includeDemo: boolean,
) {
  const events = gatherEventsForProperty(property, schedules, customBookings, includeDemo);
  return {
    events,
    status: deriveStatus(events),
    nextEvent: events[0] ?? null,
    nextEventLabel: formatNextEvent(events),
    nextCleaner: events[0]?.cleaner,
  };
}
