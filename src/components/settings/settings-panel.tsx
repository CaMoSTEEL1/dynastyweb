"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  School,
  Calendar,
  Sparkles,
  Monitor,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "./settings-context";
import NewSeasonFlow from "./new-season-flow";

/* ── Collapsible Section ─────────────────────────────── */

function Section({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-dw-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-paper2"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-ink3" />
          <span className="font-headline text-xs uppercase tracking-wider text-ink">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink3" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink3" />
        )}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

/* ── Read-only Row ────────────────────────────────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-serif text-sm text-ink2">{label}</span>
      <span className="font-sans text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

/* ── Toggle Switch ────────────────────────────────────── */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="font-sans text-sm text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 font-serif text-xs text-ink3">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-dw-accent" : "bg-paper3"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
      </button>
    </div>
  );
}

/* ── Select ───────────────────────────────────────────── */

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="font-sans text-sm text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rounded border border-dw-border bg-paper2 px-3 py-1.5",
          "font-sans text-xs text-ink",
          "outline-none focus:border-dw-accent"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Local storage helpers for preferences ────────────── */

function getPrefs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("dynastywire-settings");
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function setPref(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    const prefs = getPrefs();
    prefs[key] = value;
    localStorage.setItem("dynastywire-settings", JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

/* ── Main Panel ───────────────────────────────────────── */

export default function SettingsPanel() {
  const { dynasty, season, close } = useSettings();
  const router = useRouter();
  const [showNewSeason, setShowNewSeason] = useState(false);

  // Preferences state (persisted to localStorage)
  const prefs = getPrefs();
  const [generateSocial, setGenerateSocial] = useState(
    prefs.generateSocial !== "false"
  );
  const [generateShows, setGenerateShows] = useState(
    prefs.generateShows !== "false"
  );
  const [generateRecruiting, setGenerateRecruiting] = useState(
    prefs.generateRecruiting !== "false"
  );
  const [contentTone, setContentTone] = useState(
    prefs.contentTone ?? "balanced"
  );
  const [analystPersona, setAnalystPersona] = useState(
    prefs.analystPersona ?? "neutral"
  );
  const [autoExpand, setAutoExpand] = useState(prefs.autoExpand !== "false");
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    close();
    router.push("/login");
    // Sign out via server action fetch
    await fetch("/api/auth/signout", { method: "POST" });
  };

  const prestiageLabels: Record<string, string> = {
    blue_blood: "Blue Blood",
    rising_power: "Rising Power",
    rebuild: "Rebuild",
  };

  // New Season sub-flow
  if (showNewSeason) {
    return (
      <div className="p-6">
        <h3 className="mb-4 font-headline text-xs uppercase tracking-wider text-ink3">
          Start New Season
        </h3>
        <NewSeasonFlow onCancel={() => setShowNewSeason(false)} />
      </div>
    );
  }

  return (
    <div>
      {/* Dynasty Info */}
      <Section icon={School} title="Dynasty Info" defaultOpen>
        <div className="space-y-1">
          <InfoRow label="School" value={dynasty.school} />
          <InfoRow label="Conference" value={dynasty.conference} />
          <InfoRow label="Coach" value={dynasty.coachName} />
          <InfoRow
            label="Prestige"
            value={prestiageLabels[dynasty.prestige] ?? dynasty.prestige}
          />
        </div>
      </Section>

      {/* Season Management */}
      <Section icon={Calendar} title="Season Management" defaultOpen>
        <div className="space-y-3">
          {season ? (
            <>
              <div className="space-y-1">
                <InfoRow label="Year" value={String(season.year)} />
                <InfoRow label="Week" value={String(season.currentWeek)} />
                <InfoRow
                  label="Record"
                  value={`${season.record.wins}-${season.record.losses}`}
                />
              </div>
              <div className="h-px bg-dw-border" />
              <button
                type="button"
                onClick={() => setShowNewSeason(true)}
                className={cn(
                  "w-full rounded border border-dw-accent/40 bg-dw-accent/10 px-4 py-2.5",
                  "font-sans text-xs font-semibold uppercase tracking-wider text-dw-accent",
                  "transition-colors hover:bg-dw-accent/20"
                )}
              >
                Start New Season
              </button>
              <p className="font-serif text-[11px] italic text-ink3">
                Archives current season and starts fresh at Week 1.
              </p>
            </>
          ) : (
            <p className="font-serif text-sm text-ink3">
              No active season found.
            </p>
          )}
        </div>
      </Section>

      {/* AI Generation Settings */}
      <Section icon={Sparkles} title="AI Generation">
        <div className="space-y-1">
          <Toggle
            label="Social Reactions"
            description="Generate fan & analyst social media posts"
            checked={generateSocial}
            onChange={(v) => {
              setGenerateSocial(v);
              setPref("generateSocial", String(v));
            }}
          />
          <Toggle
            label="Broadcast Shows"
            description="Generate studio analyst segments"
            checked={generateShows}
            onChange={(v) => {
              setGenerateShows(v);
              setPref("generateShows", String(v));
            }}
          />
          <Toggle
            label="Recruiting Notes"
            description="Generate recruiting storylines"
            checked={generateRecruiting}
            onChange={(v) => {
              setGenerateRecruiting(v);
              setPref("generateRecruiting", String(v));
            }}
          />
          <div className="h-px bg-dw-border" />
          <SelectRow
            label="Content Tone"
            value={contentTone}
            options={[
              { value: "hype", label: "Hype (ESPN)" },
              { value: "balanced", label: "Balanced" },
              { value: "critical", label: "Critical (Hot Takes)" },
              { value: "comedic", label: "Comedic" },
            ]}
            onChange={(v) => {
              setContentTone(v);
              setPref("contentTone", v);
            }}
          />
          <SelectRow
            label="Analyst Persona"
            value={analystPersona}
            options={[
              { value: "neutral", label: "Neutral Reporter" },
              { value: "homer", label: "Homer (Your Fan)" },
              { value: "skeptic", label: "Skeptic" },
              { value: "old_school", label: "Old School Coach" },
              { value: "stats_nerd", label: "Analytics Nerd" },
            ]}
            onChange={(v) => {
              setAnalystPersona(v);
              setPref("analystPersona", v);
            }}
          />
        </div>
      </Section>

      {/* Display Preferences */}
      <Section icon={Monitor} title="Display">
        <div className="space-y-1">
          <Toggle
            label="Auto-expand stories"
            description="Show full article content by default"
            checked={autoExpand}
            onChange={(v) => {
              setAutoExpand(v);
              setPref("autoExpand", String(v));
            }}
          />
        </div>
      </Section>

      {/* Data & Privacy */}
      <Section icon={Shield} title="Data & Privacy">
        <div className="space-y-3">
          <p className="font-serif text-xs leading-relaxed text-ink3">
            Your dynasty data is stored securely and never shared. All
            AI-generated content is created on-demand and tied to your account.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("dynastywire-settings");
                window.location.reload();
              }
            }}
            className={cn(
              "rounded border border-dw-border bg-paper2 px-4 py-2",
              "font-sans text-xs font-medium uppercase tracking-wider text-ink2",
              "transition-colors hover:bg-paper3"
            )}
          >
            Reset Preferences
          </button>
        </div>
      </Section>

      {/* Sign Out */}
      <div className="border-b border-dw-border">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-paper2"
        >
          <LogOut className="h-4 w-4 text-dw-red" />
          <span className="font-headline text-xs uppercase tracking-wider text-dw-red">
            {signingOut ? "Signing out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </div>
  );
}
