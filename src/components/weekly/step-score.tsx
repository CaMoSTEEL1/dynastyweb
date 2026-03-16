"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FBS_TEAMS } from "@/lib/data/fbs-teams";
import type { WeeklyInputForm } from "@/lib/weekly/validation";

interface StepScoreProps {
  form: WeeklyInputForm;
  onChange: (updates: Partial<WeeklyInputForm>) => void;
  errors: Record<string, string>;
}

export default function StepScore({ form, onChange, errors }: StepScoreProps) {
  const [teamSearch, setTeamSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [rankedChecked, setRankedChecked] = useState(
    form.opponentRanking !== null
  );

  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) return FBS_TEAMS;
    const query = teamSearch.toLowerCase();
    return FBS_TEAMS.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.mascot.toLowerCase().includes(query) ||
        t.conference.toLowerCase().includes(query)
    );
  }, [teamSearch]);

  function handleTeamSelect(name: string) {
    onChange({ opponent: name });
    setTeamSearch(name);
    setShowDropdown(false);
  }

  function handleRankedToggle(checked: boolean) {
    setRankedChecked(checked);
    if (!checked) {
      onChange({ opponentRanking: null });
    }
  }

  return (
    <div className="space-y-6">
      {/* Opponent Picker */}
      <div>
        <label className="block font-sans text-sm font-medium text-ink2 mb-1">
          Opponent
        </label>
        <div className="relative">
          <input
            type="text"
            value={teamSearch || form.opponent}
            onChange={(e) => {
              setTeamSearch(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) {
                onChange({ opponent: "" });
              }
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for a team..."
            className={cn(
              "w-full rounded border bg-paper3 px-3 py-2 text-ink placeholder:text-ink3",
              "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
              errors.opponent && "border-dw-red"
            )}
          />
          {showDropdown && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-dw-border bg-paper2 shadow-lg">
              {filteredTeams.length === 0 ? (
                <div className="px-3 py-2 text-sm text-ink3">
                  No teams found
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <button
                    key={team.name}
                    type="button"
                    onClick={() => handleTeamSelect(team.name)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-paper3 transition-colors",
                      form.opponent === team.name
                        ? "bg-paper3 text-dw-accent font-medium"
                        : "text-ink"
                    )}
                  >
                    <span className="font-medium">{team.name}</span>
                    <span className="ml-2 text-ink3">
                      {team.mascot} &middot; {team.conference}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {errors.opponent && (
          <p className="mt-1 text-sm text-dw-red">{errors.opponent}</p>
        )}
      </div>

      {/* Home / Away Toggle */}
      <div>
        <label className="block font-sans text-sm font-medium text-ink2 mb-1">
          Home or Away
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ homeAway: "home" })}
            className={cn(
              "flex-1 rounded border px-4 py-2 text-sm font-sans font-medium transition-colors",
              form.homeAway === "home"
                ? "border-dw-accent bg-dw-accent/10 text-dw-accent"
                : "border-dw-border bg-paper3 text-ink2 hover:bg-paper4"
            )}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onChange({ homeAway: "away" })}
            className={cn(
              "flex-1 rounded border px-4 py-2 text-sm font-sans font-medium transition-colors",
              form.homeAway === "away"
                ? "border-dw-accent bg-dw-accent/10 text-dw-accent"
                : "border-dw-border bg-paper3 text-ink2 hover:bg-paper4"
            )}
          >
            Away
          </button>
        </div>
      </div>

      {/* Final Score */}
      <div>
        <label className="block font-sans text-sm font-medium text-ink2 mb-1">
          Final Score
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-ink3 mb-1">Your Score</label>
            <input
              type="number"
              min={0}
              value={form.userScore}
              onChange={(e) =>
                onChange({ userScore: Math.max(0, parseInt(e.target.value) || 0) })
              }
              className={cn(
                "w-full rounded border bg-paper3 px-3 py-2 text-ink text-center",
                "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                errors.userScore && "border-dw-red"
              )}
            />
            {errors.userScore && (
              <p className="mt-1 text-sm text-dw-red">{errors.userScore}</p>
            )}
          </div>
          <span className="text-ink3 font-headline text-lg mt-4">&ndash;</span>
          <div className="flex-1">
            <label className="block text-xs text-ink3 mb-1">
              Opponent Score
            </label>
            <input
              type="number"
              min={0}
              value={form.opponentScore}
              onChange={(e) =>
                onChange({
                  opponentScore: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className={cn(
                "w-full rounded border bg-paper3 px-3 py-2 text-ink text-center",
                "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                errors.opponentScore && "border-dw-red"
              )}
            />
            {errors.opponentScore && (
              <p className="mt-1 text-sm text-dw-red">
                {errors.opponentScore}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Opponent Ranking */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="ranked-check"
            checked={rankedChecked}
            onChange={(e) => handleRankedToggle(e.target.checked)}
            className="h-4 w-4 rounded border-dw-border bg-paper3 text-dw-accent focus:ring-dw-accent"
          />
          <label
            htmlFor="ranked-check"
            className="font-sans text-sm text-ink2"
          >
            Opponent was ranked
          </label>
        </div>
        {rankedChecked && (
          <input
            type="number"
            min={1}
            max={25}
            value={form.opponentRanking ?? ""}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onChange({
                opponentRanking: isNaN(val)
                  ? null
                  : Math.min(25, Math.max(1, val)),
              });
            }}
            placeholder="Ranking (1-25)"
            className={cn(
              "w-32 rounded border bg-paper3 px-3 py-2 text-ink placeholder:text-ink3",
              "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
              errors.opponentRanking && "border-dw-red"
            )}
          />
        )}
        {errors.opponentRanking && (
          <p className="mt-1 text-sm text-dw-red">{errors.opponentRanking}</p>
        )}
      </div>
    </div>
  );
}
