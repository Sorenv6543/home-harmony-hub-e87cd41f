// Lightweight client-side store for properties & recurring schedules.
// Uses useSyncExternalStore + localStorage for persistence across routes.

import { useSyncExternalStore } from "react";
import type { Property } from "@/components/dashboard/AddPropertyModal";

export type Cadence = "Weekly" | "Biweekly" | "Monthly" | "Custom";

// Day-of-week index: 0=Mon ... 6=Sun
export type Dow = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type RecurringSchedule = {
  id: string;
  propertyId: string;
  enabled: boolean;
  cadence: Cadence;
  daysOfWeek: Dow[];
  time: string; // "HH:MM" 24h
  durationMin: number;
  cleaningCompany?: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd
};

type State = {
  properties: Property[];
  schedules: RecurringSchedule[];
  // overrides per generated occurrence (skipped, reassigned)
  skipped: string[]; // keys like "scheduleId:yyyy-mm-dd"
  occurrenceCleaners: Record<string, string>; // key -> cleaner override
};

const KEY = "claro.store.v1";
const empty: State = { properties: [], schedules: [], skipped: [], occurrenceCleaners: {} };

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

export const store = {
  getState: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addProperty(p: Property) {
    set({ properties: [...state.properties, p] });
  },
  upsertSchedule(schedule: RecurringSchedule) {
    const others = state.schedules.filter((s) => s.propertyId !== schedule.propertyId);
    set({ schedules: [...others, schedule] });
  },
  deleteSchedule(propertyId: string) {
    set({ schedules: state.schedules.filter((s) => s.propertyId !== propertyId) });
  },
  skipOccurrence(key: string) {
    if (state.skipped.includes(key)) return;
    set({ skipped: [...state.skipped, key] });
  },
  setOccurrenceCleaner(key: string, cleaner: string) {
    set({ occurrenceCleaners: { ...state.occurrenceCleaners, [key]: cleaner } });
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(empty),
  );
}

// ---------- Recurring occurrence generation ----------

export type Occurrence = {
  key: string; // scheduleId:yyyy-mm-dd
  scheduleId: string;
  propertyId: string;
  date: Date;
  time: string;
  durationMin: number;
  cleaner?: string;
  cadenceLabel: string;
};

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 0=Mon..6=Sun
function dowOf(d: Date): Dow {
  return ((d.getDay() + 6) % 7) as Dow;
}

export function cadenceLabel(s: RecurringSchedule): string {
  const days = s.daysOfWeek.map((d) => DOW_LABELS[d]).join(", ");
  if (s.cadence === "Weekly") return `Weekly · Every ${days || "—"}`;
  if (s.cadence === "Biweekly") return `Biweekly · ${days || "—"}`;
  if (s.cadence === "Monthly") return `Monthly · ${days || "—"}`;
  return `Custom · ${days || "—"}`;
}

export function generateOccurrences(
  schedule: RecurringSchedule,
  weeks = 8,
  fromDate = new Date(),
): Occurrence[] {
  if (!schedule.enabled || schedule.daysOfWeek.length === 0) return [];

  const start = new Date(schedule.startDate);
  const begin = start > fromDate ? start : fromDate;
  begin.setHours(0, 0, 0, 0);

  const horizon = new Date(begin);
  horizon.setDate(horizon.getDate() + weeks * 7);
  const end = schedule.endDate ? new Date(schedule.endDate) : horizon;
  const stop = end < horizon ? end : horizon;

  const interval = schedule.cadence === "Biweekly" ? 14 : schedule.cadence === "Monthly" ? 28 : 7;
  const startWeekAnchor = new Date(start);
  startWeekAnchor.setHours(0, 0, 0, 0);

  const occurrences: Occurrence[] = [];
  const cursor = new Date(begin);

  while (cursor <= stop) {
    const dow = dowOf(cursor);
    if (schedule.daysOfWeek.includes(dow)) {
      const daysSinceStart = Math.floor(
        (cursor.getTime() - startWeekAnchor.getTime()) / 86400000,
      );
      const weekIdx = Math.floor(daysSinceStart / 7);
      const intervalWeeks = interval / 7;
      if (weekIdx % intervalWeeks === 0) {
        const key = `${schedule.id}:${isoDate(cursor)}`;
        occurrences.push({
          key,
          scheduleId: schedule.id,
          propertyId: schedule.propertyId,
          date: new Date(cursor),
          time: schedule.time,
          durationMin: schedule.durationMin,
          cleaner: schedule.cleaner,
          cadenceLabel: cadenceLabel(schedule),
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return occurrences;
}
