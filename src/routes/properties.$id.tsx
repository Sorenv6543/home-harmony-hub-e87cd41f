import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  CalendarDays,
  Clock,
  RefreshCw,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AddPropertyModal } from "@/components/dashboard/AddPropertyModal";
import { useStore, store, generateOccurrences } from "@/lib/store";
import type { Property } from "@/components/dashboard/AddPropertyModal";

export const Route = createFileRoute("/properties/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Property — Claro` },
      { name: "description", content: `Property detail for ${params.id}` },
    ],
  }),
  component: PropertyDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg font-semibold">Property not found</p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary underline">
          Back to Overview
        </Link>
      </div>
    </div>
  ),
});

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const property = useStore((s) => s.properties.find((p) => p.id === id));
  const schedules = useStore((s) => s.schedules);
  const customBookings = useStore((s) => s.customBookings);
  const [editOpen, setEditOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyDraft, setCompanyDraft] = useState("");
  const [accessDraft, setAccessDraft] = useState<string | null>(null);

  if (!property) {
    throw notFound();
  }

  const upcomingTurns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const schedule = schedules.find((s) => s.propertyId === property.id);
    if (!schedule) return [];
    return generateOccurrences(schedule, 8, today).slice(0, 10);
  }, [schedules, property.id]);

  const pastBookings = useMemo(() => {
    const now = Date.now();
    return customBookings
      .filter((b) => b.propertyId === property.id && b.type === "guest")
      .filter((b) => new Date(b.checkOutISO).getTime() < now)
      .sort((a, b) => new Date(b.checkOutISO).getTime() - new Date(a.checkOutISO).getTime())
      .slice(0, 5);
  }, [customBookings, property.id]);

  const startNameEdit = () => {
    setNameDraft(property.address);
    setEditingName(true);
  };
  const saveName = () => {
    if (nameDraft.trim() && nameDraft !== property.address) {
      store.updateProperty(property.id, { address: nameDraft.trim() });
    }
    setEditingName(false);
  };

  const startCompanyEdit = () => {
    // store cleaning company on the schedule if exists, else on a custom field
    const sched = schedules.find((s) => s.propertyId === property.id);
    setCompanyDraft(sched?.cleaningCompany ?? "");
    setEditingCompany(true);
  };
  const saveCompany = () => {
    const sched = schedules.find((s) => s.propertyId === property.id);
    if (sched) {
      store.upsertSchedule({ ...sched, cleaningCompany: companyDraft.trim() || undefined });
    }
    setEditingCompany(false);
  };
  const currentCompany =
    schedules.find((s) => s.propertyId === property.id)?.cleaningCompany ?? "";

  const accessNotes = accessDraft ?? property.accessNotes ?? "";
  const accessDirty = accessDraft !== null && accessDraft !== (property.accessNotes ?? "");

  const saveAccess = () => {
    if (accessDraft !== null) {
      store.updateProperty(property.id, { accessNotes: accessDraft });
      setAccessDraft(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-surface/85 backdrop-blur px-4 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-foreground/70 hover:bg-surface-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base md:text-lg font-semibold tracking-tight text-foreground">
              Property detail
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Hero header */}
              <section className="relative rounded-3xl border border-border bg-surface p-6 md:p-7 shadow-card">
                <button
                  onClick={() => setEditOpen(true)}
                  className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-surface-muted hover:text-foreground"
                  aria-label="Edit property"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <div className="flex items-start gap-4 pr-20">
                  <span
                    className="mt-1 h-10 w-10 shrink-0 rounded-2xl"
                    style={{ backgroundColor: property.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    {editingName ? (
                      <input
                        autoFocus
                        className="w-full rounded-lg border border-border bg-surface-muted/40 px-2 py-1 text-2xl md:text-3xl font-semibold tracking-tight text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onBlur={saveName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") setEditingName(false);
                        }}
                      />
                    ) : (
                      <button
                        onClick={startNameEdit}
                        className="text-left text-2xl md:text-3xl font-semibold tracking-tight text-foreground hover:underline decoration-dotted underline-offset-4"
                        title="Click to edit"
                      >
                        {property.address}
                        {property.unit ? `, ${property.unit}` : ""}
                      </button>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
                        {property.propertyType}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {[property.address, property.city, property.state, property.zip]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </section>

              {/* Upcoming turns */}
              <section className="rounded-3xl border border-border bg-surface p-6 md:p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" /> Upcoming turns
                  </h2>
                  <Link
                    to="/"
                    hash="bookings-timeline"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View all on timeline →
                  </Link>
                </div>

                {upcomingTurns.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface-muted/30 p-6 text-center text-sm text-muted-foreground">
                    No upcoming turns — add a booking to generate turns
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-border/60">
                    {upcomingTurns.map((occ) => (
                      <li
                        key={occ.key}
                        className="flex flex-wrap items-center gap-3 py-3 text-sm"
                      >
                        <div className="min-w-[170px] font-medium text-foreground">
                          {occ.date.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {occ.time}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-[11px] font-semibold text-foreground/80">
                          ↺ Recurring Turn
                        </span>
                        <span className="text-[12px] font-semibold text-success">Scheduled</span>
                        <span className="ml-auto text-[13px] text-muted-foreground">
                          {occ.cleaningCompany || "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Past bookings */}
              <section className="rounded-3xl border border-border bg-surface p-6 md:p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-primary" /> Past bookings
                  </h2>
                  {pastBookings.length > 0 && (
                    <button className="text-xs font-semibold text-primary hover:underline">
                      View all →
                    </button>
                  )}
                </div>
                {pastBookings.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface-muted/30 p-6 text-center text-sm text-muted-foreground">
                    No past bookings yet
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-border/60">
                    {pastBookings.map((b) => (
                      <li
                        key={b.id}
                        className="flex flex-wrap items-center gap-3 py-3 text-sm"
                      >
                        <div className="min-w-[140px] font-medium text-foreground">
                          {b.guestName || "Guest"}
                        </div>
                        <span className="text-[13px] text-muted-foreground">
                          {new Date(b.checkInISO).toLocaleDateString()} →{" "}
                          {new Date(b.checkOutISO).toLocaleDateString()}
                        </span>
                        <span className="ml-auto rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground/70">
                          Guest stay
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Cleaning Company */}
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Cleaning company</h3>
                  {!editingCompany && (
                    <button
                      onClick={startCompanyEdit}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      aria-label="Edit cleaning company"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {editingCompany ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      autoFocus
                      className="flex-1 rounded-lg border border-border bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                      value={companyDraft}
                      onChange={(e) => setCompanyDraft(e.target.value)}
                      placeholder="Bright & Clean Co."
                    />
                    <button
                      onClick={saveCompany}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p
                    className={`mt-2 text-sm ${currentCompany ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {currentCompany || "Not set"}
                  </p>
                )}
                <Link
                  to="/services"
                  className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  Manage in Service Settings →
                </Link>
              </section>

              {/* Access Notes */}
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">Access notes</h3>
                <textarea
                  value={accessNotes}
                  onChange={(e) => setAccessDraft(e.target.value)}
                  placeholder="Lockbox codes, key location, gate codes, parking instructions…"
                  className="mt-2 min-h-[110px] w-full rounded-xl border border-border bg-surface-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                {accessDirty && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={saveAccess}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                  </div>
                )}
              </section>

              {/* Calendar Sync */}
              <CalendarSyncCard property={property} />
            </div>
          </div>
        </main>
      </div>

      <AddPropertyModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={property}
        onUpdate={(p) => store.updateProperty(p.id, p)}
      />
    </div>
  );
}

function CalendarSyncCard({ property }: { property: Property }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        <RefreshCw className="h-4 w-4 text-primary" /> Calendar sync
      </h3>
      <div className="mt-4 space-y-3">
        <PlatformRow
          property={property}
          platform="airbnb"
          label="Airbnb"
          accentColor="#ff5a5f"
          icsValue={property.airbnbIcs}
        />
        <PlatformRow
          property={property}
          platform="vrbo"
          label="VRBO"
          accentColor="#0d6efd"
          icsValue={property.vrboIcs}
        />
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Claro checks for new bookings every 6 hours. Tap Refresh to sync now.
      </p>
    </section>
  );
}

function PlatformRow({
  property,
  platform,
  label,
  accentColor,
  icsValue,
}: {
  property: Property;
  platform: "airbnb" | "vrbo";
  label: string;
  accentColor: string;
  icsValue?: string;
}) {
  const [connecting, setConnecting] = useState(false);
  const [draftIcs, setDraftIcs] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(icsValue ? Date.now() - 1000 * 60 * 60 * 2 : null);

  const connected = !!icsValue;

  const save = () => {
    if (!draftIcs.trim()) return;
    const key = platform === "airbnb" ? "airbnbIcs" : "vrboIcs";
    store.updateProperty(property.id, { [key]: draftIcs.trim() } as Partial<Property>);
    setLastSyncedAt(Date.now());
    setConnecting(false);
    setDraftIcs("");
  };

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastSyncedAt(Date.now());
      setRefreshing(false);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-muted/30 p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {label[0]}
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            connected ? "bg-success-soft text-success" : "bg-surface text-muted-foreground border border-border"
          }`}
        >
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>

      {connected && (
        <div className="mt-2 flex items-center justify-between gap-2 pl-11">
          <p className="text-[11px] text-muted-foreground">
            Last synced: {refreshing ? "Syncing…" : formatRelative(lastSyncedAt)}
          </p>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-surface-muted disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Refresh now
          </button>
        </div>
      )}

      {!connected && !connecting && (
        <div className="mt-2 pl-11">
          <button
            onClick={() => setConnecting(true)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Connect
          </button>
        </div>
      )}

      {!connected && connecting && (
        <div className="mt-2 flex items-center gap-2 pl-11">
          <input
            autoFocus
            className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="Paste your .ics calendar URL"
            value={draftIcs}
            onChange={(e) => setDraftIcs(e.target.value)}
          />
          <button
            onClick={save}
            className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelative(ts: number | null): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
