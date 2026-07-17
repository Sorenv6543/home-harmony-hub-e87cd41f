import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Home as HomeIcon,
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AddPropertyModal } from "@/components/dashboard/AddPropertyModal";
import { useStore, store } from "@/lib/store";
import { getPropertySummary, STATUS_BADGE_STYLES, type PropertyStatus } from "@/lib/propertyStatus";
import type { Property } from "@/components/dashboard/AddPropertyModal";

export const Route = createFileRoute("/properties/")({
  head: () => ({
    meta: [
      { title: "Your Properties — Claro" },
      { name: "description", content: "Browse and manage all your rental properties." },
    ],
  }),
  component: PropertiesPage,
});

type View = "grid" | "list";
type Filter = "All" | PropertyStatus;
type Sort = "Name" | "Next Event" | "Recently Added";

function PropertiesPage() {
  const properties = useStore((s) => s.properties);
  const schedules = useStore((s) => s.schedules);
  const customBookings = useStore((s) => s.customBookings);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("Name");

  // Show demo events when sample properties are present so filters/badges are demonstrable.
  const includeDemo = properties.some((p) => p.id.startsWith("sample-"));

  const enriched = useMemo(() => {
    return properties.map((p) => ({
      property: p,
      summary: getPropertySummary(p, schedules, customBookings, includeDemo),
    }));
  }, [properties, schedules, customBookings, includeDemo]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = enriched;
    if (q) {
      rows = rows.filter((r) => {
        const hay =
          `${r.property.address} ${r.property.city} ${r.property.state} ${r.property.unit ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (filter !== "All") rows = rows.filter((r) => r.summary.status === filter);
    const sorted = [...rows];
    if (sort === "Name") {
      sorted.sort((a, b) => a.property.address.localeCompare(b.property.address));
    } else if (sort === "Next Event") {
      sorted.sort(
        (a, b) => (a.summary.nextEvent?.dayOffset ?? 99) - (b.summary.nextEvent?.dayOffset ?? 99),
      );
    } else {
      // Recently Added: keep insertion order, but reverse so newest first.
      sorted.reverse();
    }
    return sorted;
  }, [enriched, query, filter, sort]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 pl-16 pr-4 md:pr-8 lg:pl-8 backdrop-blur">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground truncate">
              Your properties
            </h1>
            <p className="text-xs text-muted-foreground">
              {properties.length} {properties.length === 1 ? "property" : "properties"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-lg border border-border bg-surface-muted p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                title="Grid view"
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                  view === "grid" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />{" "}
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                title="List view"
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                  view === "list" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <ListIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">List</span>
              </button>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              title="Add property"
              className="inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add property</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-5">
          {properties.length === 0 ? (
            <div className="flex h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-muted/40 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-foreground/70">
                <HomeIcon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">No properties yet</p>
              <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
                Add your first place to start managing turns and bookings.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" /> Add your first property
              </button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or address…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* Filters + sort */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["All", "Vacant", "Occupied", "Turn Today"] as Filter[]).map((f) => {
                    const active = filter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  Sort by
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-foreground outline-none"
                  >
                    <option>Name</option>
                    <option>Next Event</option>
                    <option>Recently Added</option>
                  </select>
                </label>
              </div>

              {visible.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
                  No properties match your filters.
                </div>
              ) : view === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map(({ property, summary }) => (
                    <GridCard
                      key={property.id}
                      property={property}
                      status={summary.status}
                      nextEventLabel={summary.nextEventLabel}
                      cleaner={summary.nextCleaner}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                  <div className="hidden grid-cols-[1.6fr_0.8fr_0.7fr_1fr_1.2fr_2rem] gap-3 border-b border-border bg-surface-muted/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                    <div>Property</div>
                    <div>Type</div>
                    <div>Beds / Baths</div>
                    <div>Status</div>
                    <div>Next event</div>
                    <div />
                  </div>
                  <ul className="divide-y divide-border">
                    {visible.map(({ property, summary }) => (
                      <ListRow
                        key={property.id}
                        property={property}
                        status={summary.status}
                        nextEventLabel={summary.nextEventLabel}
                        cleaner={summary.nextCleaner}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AddPropertyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={(p) => {
          store.addProperty(p);
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function GridCard({
  property: p,
  status,
  nextEventLabel,
  cleaner,
}: {
  property: Property;
  status: PropertyStatus;
  nextEventLabel: string | null;
  cleaner?: string;
}) {
  return (
    <Link
      to="/properties/$id"
      params={{ id: p.id }}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary/30"
    >
      <span
        className="mt-0.5 h-12 w-12 shrink-0 rounded-xl"
        style={{ backgroundColor: p.color }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {p.address}
            {p.unit ? `, ${p.unit}` : ""}
          </p>
          <StatusPill status={status} />
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {p.city}, {p.state} · {p.bedrooms} bd · {p.bathrooms} ba
        </p>
        <p className="mt-1 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
          {p.propertyType}
        </p>
        <p className="mt-2 truncate text-[12px] font-medium text-foreground/70">
          {nextEventLabel ?? "No upcoming events"}
        </p>
        {cleaner && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            Cleaner: <span className="font-medium text-foreground/70">{cleaner}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

function ListRow({
  property: p,
  status,
  nextEventLabel,
  cleaner,
}: {
  property: Property;
  status: PropertyStatus;
  nextEventLabel: string | null;
  cleaner?: string;
}) {
  return (
    <li>
      <Link
        to="/properties/$id"
        params={{ id: p.id }}
        className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-surface-muted/50 md:grid-cols-[1.6fr_0.8fr_0.7fr_1fr_1.2fr_2rem] md:items-center md:gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="h-8 w-8 shrink-0 rounded-lg"
            style={{ backgroundColor: p.color }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {p.address}
              {p.unit ? `, ${p.unit}` : ""}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {p.city}, {p.state}
            </p>
          </div>
        </div>
        <div className="truncate text-xs text-foreground/80">{p.propertyType}</div>
        <div className="text-xs text-foreground/80">
          {p.bedrooms} bd · {p.bathrooms} ba
        </div>
        <div>
          <StatusPill status={status} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-foreground/80">
            {nextEventLabel ?? "No upcoming events"}
          </p>
          {cleaner && <p className="truncate text-[11px] text-muted-foreground">{cleaner}</p>}
        </div>
        <div className="hidden justify-end text-muted-foreground md:flex">
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </li>
  );
}
