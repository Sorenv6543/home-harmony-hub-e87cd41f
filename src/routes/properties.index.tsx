import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Home as HomeIcon } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AddPropertyModal } from "@/components/dashboard/AddPropertyModal";
import { useStore, store } from "@/lib/store";

export const Route = createFileRoute("/properties/")({
  head: () => ({
    meta: [
      { title: "Your Properties — Claro" },
      { name: "description", content: "Browse and manage all your rental properties." },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const properties = useStore((s) => s.properties);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 md:px-8 backdrop-blur">
          <div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              Your properties
            </h1>
            <p className="text-xs text-muted-foreground">
              {properties.length} {properties.length === 1 ? "property" : "properties"}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" /> Add property
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  to="/properties/$id"
                  params={{ id: p.id }}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary/30"
                >
                  <span
                    className="h-12 w-12 shrink-0 rounded-xl"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {p.address}{p.unit ? `, ${p.unit}` : ""}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {p.city}, {p.state} · {p.bedrooms} bd · {p.bathrooms} ba
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
                      {p.propertyType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <AddPropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(p) => {
          store.addProperty(p);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
