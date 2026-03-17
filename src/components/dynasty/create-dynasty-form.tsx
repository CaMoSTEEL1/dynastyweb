"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { FBS_TEAMS, getConferences, getTeamsByConference } from "@/lib/data/fbs-teams";
import { createDynasty } from "@/lib/dynasty/actions";

type PrestigeLevel = "blue_blood" | "rising_power" | "rebuild";

interface PrestigeOption {
  value: PrestigeLevel;
  label: string;
  description: string;
}

const prestigeOptions: PrestigeOption[] = [
  {
    value: "blue_blood",
    label: "Blue Blood",
    description:
      "The standard-bearer. National titles, five-star recruits, playoff expectations every year.",
  },
  {
    value: "rising_power",
    label: "Rising Power",
    description:
      "On the rise. Building something special. The spotlight is coming.",
  },
  {
    value: "rebuild",
    label: "Rebuild",
    description: "Rock bottom. But every dynasty starts somewhere.",
  },
];

const conferences = getConferences();

interface FormState {
  error: string;
}

async function formAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createDynasty(formData);
  if (result?.error) {
    return { error: result.error };
  }
  return { error: "" };
}

export default function CreateDynastyForm() {
  const [state, dispatch, isPending] = useActionState(formAction, {
    error: "",
  });

  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedPrestige, setSelectedPrestige] =
    useState<PrestigeLevel | "">("");

  const selectedTeam = FBS_TEAMS.find((t) => t.name === selectedSchool);

  return (
    <form action={dispatch} className={cn("space-y-8")}>
      {/* School Picker */}
      <div className={cn("space-y-2")}>
        <label
          htmlFor="school"
          className={cn(
            "font-sans text-xs uppercase tracking-wider text-ink2"
          )}
        >
          School
        </label>
        <select
          id="school"
          name="school"
          required
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className={cn(
            "w-full bg-paper3 border border-dw-border rounded-sm",
            "px-4 py-3 font-sans text-sm text-ink",
            "focus:outline-none focus:ring-1 focus:ring-dw-accent focus:border-dw-accent",
            "appearance-none cursor-pointer"
          )}
        >
          <option value="" disabled>
            Select a school...
          </option>
          {conferences.map((conf) => (
            <optgroup key={conf} label={conf}>
              {getTeamsByConference(conf).map((team) => (
                <option key={team.name} value={team.name}>
                  {team.name} {team.mascot}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {selectedTeam && (
          <div
            className={cn(
              "bg-paper3 border border-dw-border rounded-sm",
              "px-4 py-3 mt-2"
            )}
          >
            <p className={cn("font-headline text-ink text-lg tracking-wide")}>
              {selectedTeam.name} {selectedTeam.mascot}
            </p>
            <p className={cn("font-sans text-ink3 text-xs uppercase tracking-wider mt-1")}>
              {selectedTeam.conference}
            </p>
          </div>
        )}
      </div>

      {/* Coach Name */}
      <div className={cn("space-y-2")}>
        <label
          htmlFor="coachName"
          className={cn(
            "font-sans text-xs uppercase tracking-wider text-ink2"
          )}
        >
          Coach Name
        </label>
        <input
          id="coachName"
          name="coachName"
          type="text"
          required
          maxLength={50}
          placeholder="Enter your coach's name"
          className={cn(
            "w-full bg-paper3 border border-dw-border rounded-sm",
            "px-4 py-3 font-sans text-sm text-ink",
            "placeholder:text-ink3",
            "focus:outline-none focus:ring-1 focus:ring-dw-accent focus:border-dw-accent"
          )}
        />
      </div>

      {/* Prestige Selector */}
      <div className={cn("space-y-2")}>
        <span
          className={cn(
            "font-sans text-xs uppercase tracking-wider text-ink2 block"
          )}
        >
          Program Prestige
        </span>
        <input type="hidden" name="prestige" value={selectedPrestige} />
        <div className={cn("grid gap-3 sm:grid-cols-3")}>
          {prestigeOptions.map((option) => {
            const isSelected = selectedPrestige === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedPrestige(option.value)}
                className={cn(
                  "text-left bg-paper3 border rounded-sm p-4",
                  "transition-colors duration-150 cursor-pointer",
                  isSelected
                    ? "border-dw-accent ring-1 ring-dw-accent"
                    : "border-dw-border hover:border-ink3"
                )}
              >
                <p
                  className={cn(
                    "font-headline text-sm tracking-wide mb-1",
                    isSelected ? "text-dw-accent" : "text-ink"
                  )}
                >
                  {option.label}
                </p>
                <p className={cn("font-serif text-xs text-ink3 leading-relaxed")}>
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Season Year */}
      <div className={cn("space-y-2")}>
        <label
          htmlFor="seasonYear"
          className={cn(
            "font-sans text-xs uppercase tracking-wider text-ink2"
          )}
        >
          Starting Season Year
        </label>
        <input
          id="seasonYear"
          name="seasonYear"
          type="number"
          required
          defaultValue={2025}
          min={2020}
          max={2050}
          className={cn(
            "w-full bg-paper3 border border-dw-border rounded-sm",
            "px-4 py-3 font-sans text-sm text-ink",
            "focus:outline-none focus:ring-1 focus:ring-dw-accent focus:border-dw-accent"
          )}
        />
      </div>

      {/* Error Display */}
      {state.error && (
        <div
          className={cn(
            "bg-paper4 border border-red-500/50 rounded-sm",
            "px-4 py-3"
          )}
        >
          <p className={cn("font-sans text-sm text-red-400")}>{state.error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !selectedSchool || !selectedPrestige}
        className={cn(
          "w-full bg-dw-accent text-paper font-sans text-sm uppercase tracking-wider",
          "py-3 px-6 rounded-sm",
          "transition-opacity duration-150",
          "hover:bg-dw-accent2",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? "Creating Dynasty..." : "Establish Dynasty"}
      </button>
    </form>
  );
}
