import { CalendarPlus, Sparkles, Users, ShieldCheck } from "lucide-react";

export function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 md:p-12 shadow-card"
      style={{ backgroundImage: "var(--gradient-warm)" }}
    >
      {/* Soft decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", opacity: 0.12 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-warning) 0%, transparent 70%)", opacity: 0.1 }}
      />

      <div className="relative grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome to Claro
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Your calendar is calm —
            <br />
            <span className="text-primary">let’s book your first job.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            When bookings come in, they’ll appear here on a clear, friendly
            timeline. Add your first one in under a minute — no setup required.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <CalendarPlus className="h-4 w-4" />
              Create your first booking
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted">
              Take a quick tour
            </button>
          </div>

          <ul className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <Reassurance icon={ShieldCheck} text="No card required" />
            <Reassurance icon={Users} text="Invite teammates anytime" />
            <Reassurance icon={Sparkles} text="Friendly support 7 days" />
          </ul>
        </div>

        {/* Preview illustration of an empty timeline */}
        <div className="relative">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </p>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Tue · Oct 24
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 shrink-0 text-[11px] font-semibold text-muted-foreground">
                    {9 + i * 3}:00
                  </div>
                  <div className="h-9 flex-1 rounded-lg border border-dashed border-border bg-surface-muted/60" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Your first booking will land here.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reassurance({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface/80 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="font-medium text-foreground/80">{text}</span>
    </li>
  );
}
