import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Home,
  Smartphone,
  Building2,
  MapPin,
  Tag,
  Building,
  Bed,
  Bath,
  Ruler,
  Grid3x3,
  FileText,
  Key,
  Clock,
  DollarSign,
  User,
  Phone,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export type Property = {
  id: string;
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  color: string;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  floorType?: string;
  cleaningInstructions?: string;
  accessNotes?: string;
  cleaningDuration: number;
  pricingTier: string;
  contactName?: string;
  contactPhone?: string;
  airbnbIcs?: string;
  vrboIcs?: string;
};

const COLORS = [
  { name: "purple", value: "#7c3aed" },
  { name: "green", value: "#16a34a" },
  { name: "violet", value: "#a855f7" },
  { name: "orange", value: "#ea580c" },
  { name: "red", value: "#dc2626" },
];

const PROPERTY_TYPES = [
  "Single Family",
  "Condo",
  "Apartment",
  "Townhouse",
  "Cabin",
  "Other",
];

const FLOOR_TYPES = ["Hardwood", "Carpet", "Tile", "Mixed"];
const PRICING_TIERS = ["Standard", "Premium", "Deep Clean"];

const STEP_LABELS = [
  { num: "01", title: "Property Details" },
  { num: "02", title: "Rooms & Amenities" },
  { num: "03", title: "Cleaning & Access" },
];

const ACCENT = "#6366f1"; // indigo-500

export function AddPropertyModal({
  open,
  onOpenChange,
  onCreate,
  initial,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (p: Property) => void;
  initial?: Property;
  onUpdate?: (p: Property) => void;
}) {
  const isEdit = !!initial;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Property>>(
    initial ?? {
      color: COLORS[0].value,
      propertyType: PROPERTY_TYPES[0],
      cleaningDuration: 120,
      pricingTier: "Standard",
    },
  );
  const [airbnbOn, setAirbnbOn] = useState(!!initial?.airbnbIcs);
  const [vrboOn, setVrboOn] = useState(!!initial?.vrboIcs);

  // Re-seed when opening with new initial data
  useEffect(() => {
    if (open && initial) {
      setData(initial);
      setAirbnbOn(!!initial.airbnbIcs);
      setVrboOn(!!initial.vrboIcs);
      setStep(0);
    }
  }, [open, initial]);

  const set = <K extends keyof Property>(key: K, value: Property[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const reset = () => {
    setStep(0);
    setData({
      color: COLORS[0].value,
      propertyType: PROPERTY_TYPES[0],
      cleaningDuration: 120,
      pricingTier: "Standard",
    });
    setAirbnbOn(false);
    setVrboOn(false);
  };

  const handleSubmit = () => {
    const property: Property = {
      id: initial?.id ?? crypto.randomUUID(),
      address: data.address || "Untitled property",
      unit: data.unit,
      city: data.city || "",
      state: data.state || "",
      zip: data.zip || "",
      propertyType: data.propertyType || "Single Family",
      color: data.color || COLORS[0].value,
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      sqft: data.sqft ? Number(data.sqft) : undefined,
      floorType: data.floorType,
      cleaningInstructions: data.cleaningInstructions,
      accessNotes: data.accessNotes,
      cleaningDuration: Number(data.cleaningDuration) || 120,
      pricingTier: data.pricingTier || "Standard",
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      airbnbIcs: airbnbOn ? data.airbnbIcs : undefined,
      vrboIcs: vrboOn ? data.vrboIcs : undefined,
    };
    if (isEdit) {
      onUpdate?.(property);
      toast.success("Property updated.");
    } else {
      onCreate?.(property);
      toast.success("Property added! You're all set.");
    }
    onOpenChange(false);
    if (!isEdit) reset();
  };


  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o && !isEdit) reset();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <div className="px-7 pt-7 pb-5 border-b border-border">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEdit ? "Edit property" : "Add a new property"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Step {step + 1} of 3 — {STEP_LABELS[step].title}
          </DialogDescription>

          {/* Step indicator */}
          <div className="mt-6 flex items-center">
            {STEP_LABELS.map((s, i) => {
              const isDone = i < step;
              const isActive = i === step;
              return (
                <div key={s.num} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-start gap-1.5 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors"
                        style={
                          isDone || isActive
                            ? { backgroundColor: ACCENT, color: "white" }
                            : {
                                backgroundColor: "transparent",
                                color: "var(--color-muted-foreground)",
                                boxShadow: "inset 0 0 0 1.5px var(--color-border)",
                              }
                        }
                      >
                        {isDone ? <Check className="h-4 w-4" /> : s.num}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Step {s.num}
                        </p>
                        <p
                          className={`text-[13px] font-semibold leading-tight ${
                            isActive || isDone ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {s.title}
                        </p>
                      </div>
                    </div>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="mx-3 h-[2px] flex-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: isDone ? "100%" : "0%",
                          backgroundColor: ACCENT,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-7 py-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={Home} label="Street Address">
                  <input
                    className={inputCls}
                    value={data.address || ""}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="123 Main St"
                  />
                </Field>
                <Field icon={Smartphone} label="Unit / Apt (optional)">
                  <input
                    className={inputCls}
                    value={data.unit || ""}
                    onChange={(e) => set("unit", e.target.value)}
                    placeholder="Apt 4B"
                  />
                </Field>
                <Field icon={Building2} label="City">
                  <input
                    className={inputCls}
                    value={data.city || ""}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
                <Field icon={MapPin} label="State">
                  <input
                    className={inputCls}
                    value={data.state || ""}
                    onChange={(e) => set("state", e.target.value)}
                  />
                </Field>
                <Field icon={Tag} label="ZIP Code">
                  <input
                    className={inputCls}
                    value={data.zip || ""}
                    onChange={(e) => set("zip", e.target.value)}
                  />
                </Field>
                <Field icon={Building} label="Property Type">
                  <select
                    className={inputCls}
                    value={data.propertyType}
                    onChange={(e) => set("propertyType", e.target.value)}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-foreground">
                  Property Color
                </label>
                <div className="mt-2 flex items-center gap-3">
                  {COLORS.map((c) => {
                    const selected = data.color === c.value;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => set("color", c.value)}
                        aria-label={c.name}
                        className="relative h-9 w-9 rounded-full transition-transform hover:scale-105"
                        style={{
                          backgroundColor: c.value,
                          boxShadow: selected
                            ? "0 0 0 2px var(--color-surface), 0 0 0 4px #000"
                            : "0 0 0 1px rgba(0,0,0,0.05)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Calendar Sync */}
              <div className="mt-2 rounded-2xl border border-border bg-warning-soft/40 p-5">
                <p className="text-[13px] font-semibold text-foreground">
                  Sync bookings from
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <CalendarToggle
                    label="Airbnb"
                    accentColor="#ff5a5f"
                    on={airbnbOn}
                    onToggle={setAirbnbOn}
                    icsValue={data.airbnbIcs || ""}
                    onIcs={(v) => set("airbnbIcs", v)}
                  />
                  <CalendarToggle
                    label="VRBO"
                    accentColor="#0d6efd"
                    on={vrboOn}
                    onToggle={setVrboOn}
                    icsValue={data.vrboIcs || ""}
                    onIcs={(v) => set("vrboIcs", v)}
                  />
                </div>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  You can always add calendar sync later in Settings
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={Bed} label="Bedrooms">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={data.bedrooms ?? ""}
                  onChange={(e) => set("bedrooms", Number(e.target.value))}
                />
              </Field>
              <Field icon={Bath} label="Bathrooms">
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  className={inputCls}
                  value={data.bathrooms ?? ""}
                  onChange={(e) => set("bathrooms", Number(e.target.value))}
                />
              </Field>
              <Field icon={Ruler} label="Square Feet">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={data.sqft ?? ""}
                  onChange={(e) => set("sqft", Number(e.target.value))}
                />
              </Field>
              <Field icon={Grid3x3} label="Floor Type">
                <select
                  className={inputCls}
                  value={data.floorType || ""}
                  onChange={(e) => set("floorType", e.target.value)}
                >
                  <option value="">Select…</option>
                  {FLOOR_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field icon={FileText} label="Cleaning Instructions" hint="Any special cleaning requirements or notes">
                <textarea
                  className={`${inputCls} min-h-[90px] py-2.5`}
                  value={data.cleaningInstructions || ""}
                  onChange={(e) => set("cleaningInstructions", e.target.value)}
                />
              </Field>
              <Field icon={Key} label="Access Notes" hint="Lockbox codes, key location, gate codes, etc.">
                <textarea
                  className={`${inputCls} min-h-[90px] py-2.5`}
                  value={data.accessNotes || ""}
                  onChange={(e) => set("accessNotes", e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={Clock} label="Cleaning Duration (min)" hint="Time required for standard cleaning">
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={data.cleaningDuration ?? 120}
                    onChange={(e) => set("cleaningDuration", Number(e.target.value))}
                  />
                </Field>
                <Field icon={DollarSign} label="Pricing Tier">
                  <select
                    className={inputCls}
                    value={data.pricingTier}
                    onChange={(e) => set("pricingTier", e.target.value)}
                  >
                    {PRICING_TIERS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field icon={User} label="Contact Name">
                  <input
                    className={inputCls}
                    value={data.contactName || ""}
                    onChange={(e) => set("contactName", e.target.value)}
                  />
                </Field>
                <Field icon={Phone} label="Contact Phone">
                  <input
                    className={inputCls}
                    value={data.contactPhone || ""}
                    onChange={(e) => set("contactPhone", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted/40 px-7 py-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: ACCENT }}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              {isEdit ? "Save changes" : "Create Property"} <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const inputCls =
  "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none";

function Field({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon: typeof Home;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-foreground/80">{label}</span>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 focus-within:ring-2 focus-within:ring-ring/40">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {children}
      </div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function CalendarToggle({
  label,
  accentColor,
  on,
  onToggle,
  icsValue,
  onIcs,
}: {
  label: string;
  accentColor: string;
  on: boolean;
  onToggle: (v: boolean) => void;
  icsValue: string;
  onIcs: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {label[0]}
          </span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onToggle(!on)}
          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
          style={{ backgroundColor: on ? ACCENT : "var(--color-border)" }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
          />
        </button>
      </div>
      {on && (
        <input
          className="mt-3 w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-ring/40"
          placeholder="Paste your .ics calendar URL"
          value={icsValue}
          onChange={(e) => onIcs(e.target.value)}
        />
      )}
    </div>
  );
}
